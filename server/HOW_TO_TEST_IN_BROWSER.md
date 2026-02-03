# 🌐 CÁCH TEST API TRÊN WEB

## ❌ **TẠI SAO BROWSER BÁO LỖI?**

Khi bạn gõ URL trong browser:
```
http://localhost:5000/api/doctors/create?token=XXX
```

Browser tự động gửi **GET request**.

Nhưng API này yêu cầu **POST request** → ❌ Lỗi!

```
Browser:        GET /api/doctors/create
API endpoint:   POST /api/doctors/create
                ^^^^ Không khớp!
```

---

## ✅ **3 CÁCH TEST API ĐÚNG:**

### **1. POSTMAN (Đơn giản nhất)**

#### Bước 1: Tải Postman
- Download: https://www.postman.com/downloads/
- Cài đặt và mở

#### Bước 2: Login Admin
```
Method: POST
URL: http://localhost:5000/api/auth/login

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "email": "admin@example.com",
  "password": "password123"
}

→ Click Send
→ Copy token từ response
```

#### Bước 3: Create Doctor
```
Method: POST  ← QUAN TRỌNG: Phải chọn POST!
URL: http://localhost:5000/api/doctors/create?token=PASTE_TOKEN_HERE

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "name": "Dr. Nguyen Van A",
  "specialization": "Cardiologist",
  "department": "Cardiology",
  "Experience": "10 years"
}

→ Click Send
→ Xem response Code 0 = Success!
```

---

### **2. THUNDER CLIENT (Extension trong VS Code)**

#### Bước 1: Cài Extension
- Vào VS Code
- Extensions → Tìm "Thunder Client"
- Install

#### Bước 2: Tạo Request
- Mở Thunder Client
- New Request
- Method: POST
- URL: http://localhost:5000/api/doctors/create?token=YOUR_TOKEN
- Body → JSON:
```json
{
  "name": "Dr. Test",
  "specialization": "Surgeon",
  "department": "Surgery"
}
```
- Send

---

### **3. HTML FORM (Tạo trang web test)**

Tạo file `test-api.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Create Doctor API</title>
  <style>
    body { font-family: Arial; max-width: 600px; margin: 50px auto; }
    input, button { margin: 10px 0; padding: 10px; width: 100%; }
    button { background: #4CAF50; color: white; border: none; cursor: pointer; }
    #result { margin-top: 20px; padding: 10px; background: #f0f0f0; }
  </style>
</head>
<body>
  <h2>🏥 Create Doctor API Test</h2>
  
  <!-- Step 1: Login -->
  <h3>Step 1: Login Admin</h3>
  <button onclick="loginAdmin()">Login Admin</button>
  <div id="token-result"></div>
  
  <!-- Step 2: Create Doctor -->
  <h3>Step 2: Create Doctor</h3>
  <input type="text" id="name" placeholder="Doctor Name" value="Dr. Test Web">
  <input type="text" id="specialization" placeholder="Specialization" value="Cardiologist">
  <input type="text" id="department" placeholder="Department" value="Cardiology">
  <button onclick="createDoctor()">Create Doctor</button>
  
  <div id="result"></div>

  <script>
    let token = '';

    // Function: Login Admin
    async function loginAdmin() {
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@example.com',
            password: 'password123'
          })
        });
        
        const data = await response.json();
        token = data.token;
        
        document.getElementById('token-result').innerHTML = 
          `<div style="background: #d4edda; padding: 10px; color: #155724;">
            ✅ Login Success!<br>
            Token: ${token.substring(0, 50)}...<br>
            Role: ${data.role}
          </div>`;
      } catch (error) {
        document.getElementById('token-result').innerHTML = 
          `<div style="background: #f8d7da; padding: 10px; color: #721c24;">
            ❌ Error: ${error.message}
          </div>`;
      }
    }

    // Function: Create Doctor
    async function createDoctor() {
      if (!token) {
        alert('Please login first!');
        return;
      }

      const name = document.getElementById('name').value;
      const specialization = document.getElementById('specialization').value;
      const department = document.getElementById('department').value;

      try {
        const response = await fetch(`http://localhost:5000/api/doctors/create?token=${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, specialization, department })
        });
        
        const data = await response.json();
        
        let resultHTML = '';
        if (data.code === 0) {
          resultHTML = `
            <div style="background: #d4edda; padding: 15px; color: #155724;">
              <h3>✅ Success! Code: ${data.code}</h3>
              <p>${data.message}</p>
              <pre>${JSON.stringify(data.data, null, 2)}</pre>
            </div>`;
        } else {
          resultHTML = `
            <div style="background: #f8d7da; padding: 15px; color: #721c24;">
              <h3>❌ Error! Code: ${data.code}</h3>
              <p>${data.message}</p>
            </div>`;
        }
        
        document.getElementById('result').innerHTML = resultHTML;
      } catch (error) {
        document.getElementById('result').innerHTML = 
          `<div style="background: #f8d7da; padding: 10px; color: #721c24;">
            ❌ Error: ${error.message}
          </div>`;
      }
    }
  </script>
</body>
</html>
```

**Cách dùng:**
1. Lưu file `test-api.html`
2. Mở file bằng browser (double-click)
3. Click "Login Admin"
4. Nhập thông tin doctor
5. Click "Create Doctor"
6. Xem kết quả!

---

## 🌐 **NẾU MUỐN ĐƯA LÊN INTERNET (DEPLOY)**

### **Cách 1: Deploy Backend lên Heroku/Railway**

#### **Heroku (Free tier):**

1. **Cài Heroku CLI:**
```bash
# Download: https://devcenter.heroku.com/articles/heroku-cli
```

2. **Deploy:**
```bash
cd server
heroku login
heroku create your-app-name
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

3. **URL:**
```
https://your-app-name.herokuapp.com/api/doctors/create
```

#### **Railway.app (Dễ hơn):**

1. Vào https://railway.app/
2. Login với GitHub
3. New Project → Deploy from GitHub repo
4. Chọn repository
5. Tự động deploy!

---

### **Cách 2: Deploy lên VPS (Server riêng)**

#### **DigitalOcean, AWS, Azure:**

1. **Tạo VPS** (Ubuntu 20.04)
2. **SSH vào server:**
```bash
ssh root@your-server-ip
```

3. **Cài Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y npm
```

4. **Upload code:**
```bash
git clone your-repo
cd server
npm install
```

5. **Chạy với PM2 (keep alive):**
```bash
npm install -g pm2
pm2 start index.js
pm2 save
pm2 startup
```

6. **Cấu hình Nginx:**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
```

Thêm:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart:
```bash
sudo systemctl restart nginx
```

7. **URL:**
```
http://your-domain.com/api/doctors/create
```

---

### **Cách 3: Vercel (Front-end + API)**

#### **Chỉ cho Next.js/Node.js serverless:**

1. Cài Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd server
vercel
```

3. URL:
```
https://your-app.vercel.app/api/doctors/create
```

---

## 📱 **TẠO FRONT-END ĐƠN GIẢN:**

### **React App đơn giản:**

```jsx
// App.js
import { useState } from 'react';

function App() {
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('');
  const [result, setResult] = useState('');

  const login = async () => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    const data = await res.json();
    setToken(data.token);
    setResult(`Logged in as ${data.role}`);
  };

  const createDoctor = async () => {
    const res = await fetch(`http://localhost:5000/api/doctors/create?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, specialization, department })
    });
    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Hospital Management</h1>
      
      <button onClick={login}>Login Admin</button>
      <p>Token: {token.substring(0, 30)}...</p>
      
      <h2>Create Doctor</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
      <input value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="Specialization" />
      <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Department" />
      <button onClick={createDoctor}>Create</button>
      
      <pre>{result}</pre>
    </div>
  );
}

export default App;
```

---

## 📊 **TÓM TẮT:**

### **Để test API:**
1. ✅ **Postman** - Dễ nhất, chuyên nghiệp
2. ✅ **Thunder Client** - Trong VS Code
3. ✅ **HTML file** - Tự tạo form test
4. ❌ **Browser URL** - KHÔNG hoạt động với POST!

### **Để deploy lên web:**
1. **Free:** Railway.app, Heroku, Vercel
2. **VPS:** DigitalOcean, AWS, Azure
3. **Domain:** Namecheap, GoDaddy

### **Hiện tại (localhost):**
- Backend: http://localhost:5000
- Chỉ truy cập được từ máy bạn
- Dùng Postman để test

**Bạn muốn tôi hướng dẫn deploy lên Railway.app (miễn phí, dễ nhất)? 🚀**
