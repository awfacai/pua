const WORKERS_URL = 'https://puaurl.irvv.workers.dev'; // 替换为你的 Workers URL

async function adminLogin() {
  const password = document.getElementById('admin-password').value;
  const response = await fetch(`${WORKERS_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (response.ok) {
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
  await fetch(`${WORKERS_URL}/api/admin/set-form`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': document.getElementById('admin-password').value,
    },
    body: JSON.stringify({ name, fields }),
  });
  alert('表格已更新');
}