<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>后台管理</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-size: cover;
      background-position: center;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    input, textarea, button {
      display: block;
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
    textarea {
      height: 100px;
    }
    button {
      background: #28A745;
      color: white;
      border: none;
      cursor: pointer;
    }
    button:hover {
      background: #218838;
    }
    h2 {
      text-align: center;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      padding: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container" id="admin-login">
    <input type="password" id="admin-password" placeholder="后台密码">
    <button onclick="adminLogin()">登录</button>
  </div>
  <div class="container" id="admin-panel" style="display: none;">
    <h2>用户信息</h2>
    <ul id="user-list"></ul>
    <h2>生成用户</h2>
    <input type="text" id="new-username" placeholder="新用户名">
    <input type="password" id="new-password" placeholder="密码">
    <button onclick="createUser()">生成</button>
    <h2>设置表格</h2>
    <input type="text" id="form-name" placeholder="表格名称">
    <textarea id="form-fields" placeholder='[{"name": "field1", "type": "text", "label": "字段1"}]'></textarea>
    <button onclick="setForm()">更新表格</button>
  </div>
  <script src="/admin.js"></script>
</body>
</html>
