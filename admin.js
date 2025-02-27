const WORKERS_URL = 'https://puaurl.pages.dev'; // Pages Functions 的 API 路径

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

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 已加载，正在检查自动登录...');
  const adminUsername = getCookie('adminUsername');
  const adminPassword = getCookie('adminPassword');
  const usernameInput = document.getElementById('admin-username');
  const passwordInput = document.getElementById('admin-password');
  if (!usernameInput || !passwordInput) {
    console.error('未找到登录输入框，可能页面未正确加载');
    return;
  }
  if (adminUsername && adminPassword) {
    usernameInput.value = adminUsername;
    passwordInput.value = adminPassword;
    adminLogin();
  }
});

async function adminLogin() {
  const usernameInput = document.getElementById('admin-username');
  const passwordInput = document.getElementById('admin-password');
  if (!usernameInput || !passwordInput) {
    alert('页面加载错误，未找到登录输入框');
    return;
  }
  const username = usernameInput.value;
  const password = passwordInput.value;
  try {
    const response = await fetch(`${WORKERS_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      setCookie('adminUsername', username, 30);
      setCookie('adminPassword', password, 30);
      document.getElementById('admin-login').style.display = 'none';
      document.getElementById('admin-panel').style.display = 'block';
      loadUsers();
      loadForm();
      loadAnnouncements();
    } else {
      alert('登录失败：' + (await response.text()));
    }
  } catch (error) {
    alert('登录失败，网络错误：' + error.message);
  }
}

async function loadUsers() {
  try {
    const response = await fetch(`${WORKERS_URL}/admin/users`, {
      headers: { 'Authorization': `${document.getElementById('admin-username').value}:${document.getElementById('admin-password').value}` },
    });
    if (!response.ok) throw new Error('无法加载用户信息：' + (await response.text()));
    const users = await response.json();
    const formResponse = await fetch(`${WORKERS_URL}/form`);
    const { form } = await formResponse.json();
    const labelMap = Object.fromEntries(form.fields.map(f => [f.name, f.label]));
    const list = document.getElementById('user-list');
    list.innerHTML = '';
    users.forEach(user => {
      const li = document.createElement('li');
      const infoStr = Object.entries(user.info)
        .map(([key, value]) => `${labelMap[key] || key}: ${value}`)
        .join(', ');
      li.textContent = `${user.username}: ${infoStr || '无信息'} (最后更新: ${user.lastUpdated || '未更新'})`;
      list.appendChild(li);
    });
  } catch (error) {
    console.error('加载用户信息失败:', error);
    document.getElementById('user-list').innerHTML = '<p>加载用户信息失败：' + error.message + '</p>';
  }
}

async function createUser() {
  const username = document.getElementById('new-username').value;
  const password = document.getElementById('new-password').value;
  try {
    const response = await fetch(`${WORKERS_URL}/admin/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${document.getElementById('admin-username').value}:${document.getElementById('admin-password').value}`,
      },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      alert('用户生成成功');
      document.getElementById('new-username').value = '';
      document.getElementById('new-password').value = '';
      loadUsers();
    } else {
      alert('用户生成失败：' + (await response.text()));
    }
  } catch (error) {
    alert('用户生成失败，网络错误：' + error.message);
  }
}

async function loadForm() {
  const formTextarea = document.getElementById('form-structure');
  if (!formTextarea) {
    console.error('未找到 form-structure 元素');
    alert('未找到表格输入框，请检查页面');
    return;
  }
  try {
    const response = await fetch(`${WORKERS_URL}/form`);
    if (!response.ok) throw new Error('无法加载表格：' + (await response.text()));
    const formStructure = await response.json();
    formTextarea.value = JSON.stringify(formStructure, null, 2);
  } catch (error) {
    console.error('加载表格失败:', error);
    formTextarea.value = '加载失败：' + error.message;
  }
}

async function saveForm() {
  const formTextarea = document.getElementById('form-structure');
  if (!formTextarea) {
    console.error('未找到 form-structure 元素');
    alert('未找到表格输入框，请检查页面');
    return;
  }
  try {
    const formStructure = JSON.parse(formTextarea.value);
    const response = await fetch(`${WORKERS_URL}/admin/set-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${document.getElementById('admin-username').value}:${document.getElementById('admin-password').value}`,
      },
      body: JSON.stringify(formStructure),
    });
    if (response.ok) {
      alert('表格已保存');
    } else {
      alert('保存失败：' + (await response.text()));
    }
  } catch (error) {
    alert('表格格式错误或网络问题，请检查 JSON：' + error.message);
  }
}

async function loadAnnouncements() {
  const annTextarea = document.getElementById('announcements');
  if (!annTextarea) {
    console.error('未找到 announcements 元素');
    alert('未找到公告输入框，请检查页面');
    return;
  }
  try {
    const response = await fetch(`${WORKERS_URL}/announcements`);
    if (!response.ok) throw new Error('无法加载公告：' + (await response.text()));
    const announcements = await response.json();
    annTextarea.value = JSON.stringify(announcements, null, 2);
  } catch (error) {
    console.error('加载公告失败:', error);
    annTextarea.value = '加载失败：' + error.message;
  }
}

async function saveAnnouncements() {
  const annTextarea = document.getElementById('announcements');
  if (!annTextarea) {
    console.error('未找到 announcements 元素');
    alert('未找到公告输入框，请检查页面');
    return;
  }
  try {
    const announcements = JSON.parse(annTextarea.value);
    const response = await fetch(`${WORKERS_URL}/admin/update-announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${document.getElementById('admin-username').value}:${document.getElementById('admin-password').value}`,
      },
      body: JSON.stringify(announcements),
    });
    if (response.ok) {
      alert('公告已保存');
      loadAnnouncements();
    } else {
      alert('公告保存失败：' + (await response.text()));
    }
  } catch (error) {
    alert('公告格式错误或网络问题，请检查 JSON：' + error.message);
  }
}
