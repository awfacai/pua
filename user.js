const WORKERS_URL = 'https://puaurl.pages.dev';
let currentUsername;

// 设置背景图
fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1')
  .then(res => res.json())
  .then(data => {
    document.body.style.backgroundImage = `url('https://www.bing.com${data.images[0].url}')`;
  });

// Cookie 操作
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// 解析文本中的 URL 为可点击链接
function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(/\n/g, '<br>').replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

// 动态调整文本框高度
function adjustTextareaHeight(textarea) {
  textarea.style.height = 'auto'; // 先重置高度
  textarea.style.height = `${textarea.scrollHeight}px`; // 设置为内容高度
}

// 加载公告的通用函数
async function loadAnnouncements(containerId) {
  try {
    const response = await fetch(`${WORKERS_URL}/announcements`);
    if (!response.ok) throw new Error(`无法加载公告：${response.status} ${await response.text()}`);
    const announcements = await response.json();
    const container = document.getElementById(containerId);
    container.innerHTML = '<h3>公告</h3>';
    if (announcements.length > 0) {
      announcements.forEach(ann => {
        const div = document.createElement('div');
        div.className = 'announcement';
        div.innerHTML = `<strong>${ann.date}</strong><p>${linkify(ann.content)}</p>`;
        container.appendChild(div);
      });
    } else {
      container.innerHTML += '<p>暂无公告</p>';
    }
  } catch (error) {
    console.error('加载公告失败:', error);
    document.getElementById(containerId).innerHTML = '<p>加载公告失败：' + error.message + '</p>';
  }
}

// 自动登录并加载未登录页面公告
window.onload = () => {
  loadAnnouncements('login-announcements');
  const username = getCookie('username');
  const password = getCookie('password');
  if (username && password) {
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
    login();
  }
};

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  try {
    const response = await fetch(`${WORKERS_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error(`登录失败：${response.status} ${await response.text()}`);
    currentUsername = username;
    setCookie('username', username, 30);
    setCookie('password', password, 30);
    document.getElementById('login').style.display = 'none';
    document.getElementById('form').style.display = 'block';
    loadForm();
  } catch (error) {
    alert('登录失败：' + error.message);
  }
}

async function loadForm() {
  try {
    const response = await fetch(`${WORKERS_URL}/form?username=${currentUsername}`);
    if (!response.ok) throw new Error(`无法加载表格数据：${response.status} ${await response.text()}`);
    const { form, info } = await response.json();
    document.getElementById('form-title').textContent = form.name || '未设置表格名称';
    const formEl = document.getElementById('user-form');
    formEl.innerHTML = '';
    if (form && form.fields && Array.isArray(form.fields)) {
      form.fields.forEach(field => {
        const label = document.createElement('label');
        label.textContent = field.label || field.name || '未命名字段';
        label.style.display = 'block';
        const textarea = document.createElement('textarea');
        textarea.name = field.name;
        textarea.placeholder = field.placeholder || `请输入${field.label || field.name}`;
        textarea.value = info[field.name] || '';
        textarea.oninput = () => adjustTextareaHeight(textarea); // 输入时调整高度
        adjustTextareaHeight(textarea); // 初始化高度
        formEl.appendChild(label);
        formEl.appendChild(textarea);
      });
    } else {
      formEl.innerHTML = '<p>暂无表格字段</p>';
    }
    loadAnnouncements('announcements');
  } catch (error) {
    console.error('加载表格失败:', error);
    document.getElementById('user-form').innerHTML = '<p>加载表格失败：' + error.message + '</p>';
  }
}

async function submitForm() {
  const form = document.getElementById('user-form');
  const data = {};
  for (const textarea of form.getElementsByTagName('textarea')) {
    data[textarea.name] = textarea.value;
  }
  try {
    const response = await fetch(`${WORKERS_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUsername, data }),
    });
    if (!response.ok) throw new Error(`提交失败：${response.status} ${await response.text()}`);
    alert('提交成功！请耐心等待...\n通常3小时内完成。完成后激活会通过咸鱼通知您激活。\n激活教学见公告内容，仔细阅读公告，有问题咸鱼联系我。');
  } catch (error) {
    alert('提交失败：' + error.message);
  }
}
