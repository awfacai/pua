const WORKERS_URL = 'https://puaurl.irvv.workers.dev';
let announcements = [];
let formStructure = { name: '个人信息', fields: [] };

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

// 复制到剪贴板
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('已复制到剪贴板');
  });
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
    loadAnnouncements();
    loadForm();
  } else {
    alert('密码错误');
  }
}

async function loadUsers() {
  const response = await fetch(`${WORKERS_URL}/api/admin/users`, {
    headers: { 'Authorization': document.getElementById('admin-password').value },
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
    li.innerHTML = `
      <div class="user-info">
        <span>${user.username}: ${infoStr || '无信息'}</span>
        <button class="copy-btn" onclick="copyToClipboard('${user.username}: ${infoStr}')">复制</button>
      </div>
    `;
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

async function loadForm() {
  const response = await fetch(`${WORKERS_URL}/api/form`);
  formStructure = await response.json();
  document.getElementById('form-name').value = formStructure.name;
  const container = document.getElementById('form-fields-list');
  container.innerHTML = '';
  formStructure.fields.forEach((field, index) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <textarea id="field-${index}" placeholder="字段 JSON">${JSON.stringify(field)}</textarea>
      <button onclick="deleteField(${index})">删除</button>
    `;
    container.appendChild(div);
  });
}

async function addField() {
  const newField = document.getElementById('new-field').value;
  if (newField) {
    formStructure.fields.push(JSON.parse(newField));
    document.getElementById('new-field').value = '';
    loadForm();
  }
}

function deleteField(index) {
  formStructure.fields.splice(index, 1);
  loadForm();
}

async function saveForm() {
  const name = document.getElementById('form-name').value;
  const updatedFields = formStructure.fields.map((_, index) => {
    return JSON.parse(document.getElementById(`field-${index}`).value);
  });
  const response = await fetch(`${WORKERS_URL}/api/admin/set-form`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': document.getElementById('admin-password').value,
    },
    body: JSON.stringify({ name, fields: updatedFields }),
  });
  if (response.ok) {
    alert('表格已保存');
    loadForm();
  } else {
    alert('保存失败');
  }
}

async function loadAnnouncements() {
  const response = await fetch(`${WORKERS_URL}/api/announcements`);
  announcements = await response.json();
  const container = document.getElementById('announcements-list');
  container.innerHTML = '';
  announcements.forEach((ann, index) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <textarea id="ann-${ann.id}" placeholder="公告内容">${ann.content}</textarea>
      <button onclick="deleteAnnouncement(${index})">删除</button>
    `;
    container.appendChild(div);
  });
}

async function addAnnouncement() {
  const content = document.getElementById('new-announcement').value;
  if (content) {
    announcements.push({ id: Date.now(), content, date: new Date().toISOString() });
    document.getElementById('new-announcement').value = '';
    loadAnnouncements();
  }
}

function deleteAnnouncement(index) {
  announcements.splice(index, 1);
  loadAnnouncements();
}

async function saveAnnouncements() {
  const updatedAnnouncements = announcements.map(ann => {
    const content = document.getElementById(`ann-${ann.id}`).value;
    return { ...ann, content };
  });
  const response = await fetch(`${WORKERS_URL}/api/admin/update-announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': document.getElementById('admin-password').value,
    },
    body: JSON.stringify(updatedAnnouncements),
  });
  if (response.ok) {
    alert('公告已保存');
    loadAnnouncements();
  }
}
