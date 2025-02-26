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
  const adminPassword = getCookie('adminPassword');
  if (adminPassword) {
    document.getElementById('admin-password').value = adminPassword;
    adminLogin();
  }
};

async function adminLogin() {
  const password = document.getElementById('admin-password').value;
  const response = await fetch(`${WORKERS_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (response.ok) {
    setCookie('adminPassword', password, 30);
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadUsers();
  } else {
    alert('密码错误');
  }
}

async function loadUsers() {
  const response = await fetch(`${WORKERS_URL}/api/admin/users`, {
    headers: { 'Authorization': document.getElementById('admin-password').value },
  });
  const users = await response.json();
  const list = document.getElementById('user-list');
  list.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = `${user.username}: ${JSON.stringify(user.info)}`;
    list.appendChild(li);
  });
}

async function createUser() {
  const username = document.getElementById('new-username').value;
  const password = document.getElementById('new-password').value;
  await fetch(`${WORKERS_URL}/api/admin/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': document.getElementById('admin-password').value,
    },
    body: JSON.stringify({ username, password }),
  });
  loadUsers();
}

async function setForm() {
  const name = document.getElementById('form-name').value;
  const fields = JSON.parse(document.getElementById('form-fields').value);
  const response = await fetch(`${WORKERS_URL}/api/admin/set-form`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': document.getElementById('admin-password').value,
    },
    body: JSON.stringify({ name, fields }),
  });
  if (response.ok) {
    alert('表格已更新');
  } else {
    alert('更新失败');
  }
}

async function addAnnouncement() {
  const content = document.getElementById('announcement-content').value;
  const response = await fetch(`${WORKERS_URL}/api/admin/add-announcement`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': document.getElementById('admin-password').value,
    },
    body: JSON.stringify({ content }),
  });
  if (response.ok) {
    alert('公告已发布');
    document.getElementById('announcement-content').value = '';
  }
}
