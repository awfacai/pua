const WORKERS_URL = 'https://puaurl.irvv.workers.dev';
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

// 自动调整文本框高度
function adjustTextareaHeight(textarea) {
  textarea.style.height = '3.8em'; // 默认高度 3.8em
  textarea.style.height = `${textarea.scrollHeight}px`;
}

// 自动登录
window.onload = () => {
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
  const response = await fetch(`${WORKERS_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (response.ok) {
    currentUsername = username;
    setCookie('username', username, 30);
    setCookie('password', password, 30);
    document.getElementById('login').style.display = 'none';
    document.getElementById('form').style.display = 'block';
    loadForm();
  } else {
    alert('登录失败');
  }
}

async function loadForm() {
  const response = await fetch(`${WORKERS_URL}/api/form?username=${currentUsername}`);
  const { form, info } = await response.json();
  document.getElementById('form-title').textContent = form.name;
  const formEl = document.getElementById('user-form');
  formEl.innerHTML = '';
  form.fields.forEach(field => {
    const label = document.createElement('label');
    label.textContent = field.label;
    label.style.display = 'block';
    const textarea = document.createElement('textarea');
    textarea.name = field.name;
    textarea.placeholder = '请输入您的' + field.label; // 添加占位符说明
    textarea.value = info[field.name] || '';
    textarea.oninput = () => adjustTextareaHeight(textarea);
    adjustTextareaHeight(textarea); // 初始化高度
    formEl.appendChild(label);
    formEl.appendChild(textarea);
  });
  loadAnnouncements();
}

async function submitForm() {
  const form = document.getElementById('user-form');
  const data = {};
  for (const textarea of form.getElementsByTagName('textarea')) {
    data[textarea.name] = textarea.value;
  }
  const response = await fetch(`${WORKERS_URL}/api/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUsername, data }),
  });
  if (response.ok) {
    alert('提交成功！请耐心等待...\n通常3小时内完成。完成后激活会通过咸鱼通知您激活。\n激活教学见公告内容，仔细阅读公告，有问题咸鱼联系我。');
  }
}

async function loadAnnouncements() {
  const response = await fetch(`${WORKERS_URL}/api/announcements`);
  const announcements = await response.json();
  const container = document.getElementById('announcements');
  container.innerHTML = '<h3>公告</h3>';
  announcements.forEach(ann => {
    const div = document.createElement('div');
    div.className = 'announcement';
    div.innerHTML = `<strong>${ann.date}</strong><p>${ann.content}</p>`;
    container.appendChild(div);
  });
}
