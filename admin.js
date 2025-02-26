const WORKERS_URL = 'https://puaurl.irvv.workers.dev';

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

// 自动登录
window.onload = () => {
  const adminUsername = getCookie('adminUsername');
  const adminPassword = getCookie('adminPassword');
  if (adminUsername && adminPassword) {
    document.getElementById('admin-username').value = adminUsername;
    document.getElementById('admin-password').value = adminPassword;
    adminLogin();
  }
};

async function adminLogin() {
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;
  const response = await fetch(`${WORKERS_URL}/api/admin/login`, {
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
    alert('登录失败');
  }
}

async function loadUsers() {
  const response = await fetch(`${WORKERS_URL}/api/admin/users`, {
    headers: { 'Authorization': `${document.getElementById('admin-username').value}:${document.getElementById('admin-password').value}` },
  });
  const users = await response.json();
  const formResponse = await fetch(`${WORKERS_URL}/api/form`);
  const { form } = await formResponse.json();
  const labelMap = Object.fromEntries(form.fields.map(f => [f.name, f.label]));
  const list = document.getElementById('user-list');
  list.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    const infoStr = Object.entries(user.info)
      .map(([key, value]) => `${labelMap[key] || key}: ${value}`)
      .join(', ');
    li.textContent = `${user.username}: ${infoStr || '无信息'}`;
    list.appendChild(li);
  });
}

async function createUser() {
  const username = document.getElementById('new-username').value;
  const password = document.getElementById('new-password').value;
  const response = await fetch(`${WORKERS_URL}/api/admin/create-user`, {
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
    alert('用户生成失败');
  }
}

async function loadForm() {
  const response = await fetch(`${WORKERS_URL}/api/form`);
  const formStructure = await response.json();
  document.getElementById('form-structure').value = JSON.stringify(formStructure, null, 2);
}

async function saveForm() {
  const formStructure = JSON.parse(document.getElementById('form-structure').value);
  const response = await fetch(`${WORKERS_URL}/api/admin/set-form`, {
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
    alert('保存失败');
  }
}

async function loadAnnouncements() {
  const response = await fetch(`${WORKERS_URL}/api/announcements`);
  const announcements = await response.json();
  document.getElementById('announcements').value = JSON.stringify(announcements, null, 2);
}

async function saveAnnouncements() {
  const announcements = JSON.parse(document.getElementById('announcements').value);
  const response = await fetch(`${WORKERS_URL}/api/admin/update-announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${document.getElementById('admin-username').value}:${document.getElementById('admin-password').value}`,
    },
    body: JSON.stringify(announcements),
  });
  if (response.ok) {
    alert('公告已保存');
    loadAnnouncements(); // 刷新显示
  } else {
    alert('公告保存失败');
  }
}
