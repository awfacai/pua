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
  const response = await fetch(`${WORKERS_URL}/api/form`);
  const formStructure = await response.json();
  document.getElementById('form-title').textContent = formStructure.name;
  const form = document.getElementById('user-form');
  form.innerHTML = '';
  formStructure.fields.forEach(field => {
    const label = document.createElement('label');
    label.textContent = field.label;
    label.style.display = 'block';
    const input = document.createElement('input');
    input.type = field.type;
    input.name = field.name;
    form.appendChild(label);
    form.appendChild(input);
  });
  // 加载已有数据
  const storedUser = await kv.get(`user:${currentUsername}`);
  if (storedUser) {
    const info = JSON.parse(storedUser).info;
    for (const input of form.getElementsByTagName('input')) {
      input.value = info[input.name] || '';
    }
  }
}

async function saveForm() {
  const form = document.getElementById('user-form');
  const data = {};
  for (const input of form.getElementsByTagName('input')) {
    data[input.name] = input.value;
  }
  const response = await fetch(`${WORKERS_URL}/api/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUsername, data }),
  });
  if (response.ok) {
    alert('保存成功');
  }
}
