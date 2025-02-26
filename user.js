const WORKERS_URL = 'https://puaurl.irvv.workers.dev'; // 替换为你的 Workers URL
let currentUsername;

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
    const input = document.createElement('input');
    input.type = field.type;
    input.name = field.name;
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(document.createElement('br'));
  });
  // 加载已有数据
  const userData = await fetch(`${WORKERS_URL}/api/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUsername, data: {} }),
  }).then(() => kv.get(`user:${currentUsername}`));
  const info = JSON.parse(userData).info;
  for (const input of form.getElementsByTagName('input')) {
    input.value = info[input.name] || '';
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