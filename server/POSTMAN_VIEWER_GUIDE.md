# 📮 HƯỚNG DẪN TEST VIEWER USER TRÊN POSTMAN

## 🎯 **Mục tiêu**
- Tạo viewer user (chỉ đọc)
- Login lấy viewer token
- Test viewer có thể đọc doctors
- Verify viewer không thể sửa/xóa

---

## **BƯỚC 1: Tạo Viewer User**

### ✅ Dùng script Node.js (KHUYÊN DÙNG - ĐÃ TEST THÀNH CÔNG)

1. Mở Terminal trong VS Code
2. Chạy lệnh:
```bash
cd server
node test-create-viewer.mjs
```

3. Kết quả:
```
✅ Connected!
Creating viewer...
✅ Viewer created successfully!

Credentials:
Email: testviewer123@example.com
Password: password123
Role: viewer
```

**✅ Viewer user đã sẵn sàng để test!**

---

## **BƯỚC 2: Login với Viewer User**

### Trong Postman:

1. **Tạo request mới:**
   - Method: `POST`
   - URL: `http://localhost:5000/api/auth/login`

2. **Headers:**
   ```
   Content-Type: application/json
   ```

3. **Body (raw JSON):**
   ```json
   {
     "email": "testviewer123@example.com",
     "password": "password123"
   }
   ```

4. **Click Send**

5. **Response sẽ trả về:**
   ```json
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NzIwZGNmMjUwNzY2MWU5MjA0MmRjZCIsInJvbGUiOiJ2aWV3ZXIiLCJpYXQiOjE3NjkwODIzMzAsImV4cCI6MTc2OTY4NzEzMH0.YtW4cSyyhB9sule35xZkL2TezBIiaH-kpZ1Ru_hkAnE",
     "role": "viewer",
     "message": "Logged in successfully"
   }
   ```

6. **Copy token** (phần `token` trong response)

---

## **BƯỚC 3: Lưu Token vào Postman Environment**

### Option 1: Manual Save

1. Click tab **Environment** (góc trên bên phải)
2. Click **+** tạo environment mới tên "Hospital API"
3. Thêm biến:
   - Variable: `viewerToken`
   - Initial Value: (paste token vừa copy)
   - Current Value: (paste token vừa copy)
4. Click **Save**
5. Chọn environment "Hospital API" từ dropdown

### Option 2: Auto Save (Dùng Test Script)

Trong tab **Tests** của Login request, thêm:
```javascript
// Auto save viewer token
if (pm.response.json().success) {
    pm.environment.set("viewerToken", pm.response.json().token);
    console.log("✅ Viewer token saved!");
}
```

Sau đó click **Send** lại → Token tự động lưu vào environment

---

## **BƯỚC 4: Test Viewer Đọc Doctors (✅ Nên thành công)**

### API 1: Get All Doctors with Filters

**Request:**
```
GET http://localhost:5000/api/doctors?token={{viewerToken}}
```

**Hoặc với filters:**
```
GET http://localhost:5000/api/doctors?token={{viewerToken}}&name=Dr&specialization=Cardiologist
```

**Headers:** (không cần)

**Expected Response:**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": 1,
      "name": "Dr. Rahul Mishra",
      "specialization": "Cardiologist",
      "department": "General",
      "Experience": "10 years",
      "availability": "Mon-Fri"
    },
    ...
  ]
}
```

### API 2: Get Doctors by Department

**Request:**
```
GET http://localhost:5000/api/doctors/by-department?token={{viewerToken}}&department=General
```

**Expected Response:**
```json
{
  "success": true,
  "count": 4,
  "department": "General",
  "data": [...]
}
```

### API 3: Get Doctors by Specialization

**Request:**
```
GET http://localhost:5000/api/doctors/by-specialization?token={{viewerToken}}&specialization=Cardiologist
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "specialization": "Cardiologist",
  "data": [
    {
      "name": "Dr. Rahul Mishra",
      "specialization": "Cardiologist",
      ...
    }
  ]
}
```

---

## **BƯỚC 5: Test Viewer Không Thể Sửa/Xóa (❌ Nên bị reject)**

### Test 1: POST (Tạo Doctor) - Nên bị chặn

**Request:**
```
POST http://localhost:5000/api/doctors?token={{viewerToken}}
```

**Body (raw JSON):**
```json
{
  "name": "Dr. New Doctor",
  "specialization": "Neurologist",
  "department": "Neurology"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Viewer can only read (GET), not modify"
}
```

### Test 2: PUT (Sửa Doctor) - Nên bị chặn

**Request:**
```
PUT http://localhost:5000/api/doctors/1?token={{viewerToken}}
```

**Body:**
```json
{
  "name": "Updated Name"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Viewer can only read (GET), not modify"
}
```

### Test 3: DELETE (Xóa Doctor) - Nên bị chặn

**Request:**
```
DELETE http://localhost:5000/api/doctors/1?token={{viewerToken}}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Viewer can only read (GET), not modify"
}
```

---

## **BƯỚC 6: So Sánh với Admin/User Token**

### Tạo collection để so sánh:

**Folder 1: Viewer Tests** (dùng viewerToken)
- ✅ GET /api/doctors
- ✅ GET /api/doctors/by-department
- ✅ GET /api/doctors/by-specialization
- ❌ POST /api/doctors
- ❌ PUT /api/doctors/:id
- ❌ DELETE /api/doctors/:id

**Folder 2: Admin Tests** (dùng adminToken)
- ✅ GET /api/doctors
- ✅ POST /api/doctors
- ✅ PUT /api/doctors/:id
- ✅ DELETE /api/doctors/:id

---

## **📊 DEMO SCRIPT CHO POSTMAN**

### Collection Structure:

```
Hospital Management API
│
├── 📁 1. Authentication
│   ├── Login (Admin)
│   ├── Login (User)
│   └── Login (Viewer) ← Thêm cái này
│
├── 📁 2. Doctor APIs - Viewer Tests
│   ├── ✅ Get All Doctors (Viewer)
│   ├── ✅ Get by Department (Viewer)
│   ├── ✅ Get by Specialization (Viewer)
│   ├── ❌ Create Doctor (Viewer - Should Fail)
│   └── ❌ Delete Doctor (Viewer - Should Fail)
│
└── 📁 3. Doctor APIs - Admin Tests
    ├── ✅ Get All Doctors (Admin)
    ├── ✅ Create Doctor (Admin)
    └── ✅ Delete Doctor (Admin)
```

---

## **🎯 CHECKLIST DEMO CHO THẦY**

### Pre-Demo:
- [ ] Server đang chạy (npm start)
- [ ] Đã tạo viewer user (email: testviewer123@example.com)
- [ ] Đã import Postman collection
- [ ] Đã setup environment variables (baseUrl, viewerToken, adminToken)

### Demo Flow:

**1. Login Viewer** ✅
```
POST /api/auth/login
Body: {"email":"testviewer123@example.com","password":"password123"}
→ Copy token
```

**2. Viewer Đọc Doctors** ✅
```
GET /api/doctors?token=VIEWER_TOKEN
→ Success! Hiển thị 4 doctors
```

**3. Viewer Đọc by Department** ✅
```
GET /api/doctors/by-department?token=VIEWER_TOKEN&department=General
→ Success! Hiển thị doctors trong General
```

**4. Viewer Thử Tạo Doctor** ❌
```
POST /api/doctors?token=VIEWER_TOKEN
Body: {"name":"New Doctor",...}
→ FAIL! "Viewer can only read (GET), not modify"
```

**5. Login Admin để so sánh** ✅
```
POST /api/auth/login
Body: {"email":"admin@example.com","password":"password123"}
```

**6. Admin Tạo Doctor** ✅
```
POST /api/doctors?token=ADMIN_TOKEN
Body: {"name":"New Doctor",...}
→ Success! Doctor created
```

---

## **💡 TIPS**

### 1. Tự động thay đổi token:
Trong tab **Tests** của mỗi Login request:
```javascript
if (pm.response.json().role === "viewer") {
    pm.environment.set("viewerToken", pm.response.json().token);
} else if (pm.response.json().role === "admin") {
    pm.environment.set("adminToken", pm.response.json().token);
}
```

### 2. Highlight response trong Postman:
- Success (2xx): Màu xanh
- Error (4xx/5xx): Màu đỏ
- Viewer blocked: Màu vàng warning

### 3. Collection Runner:
1. Click **Runner**
2. Chọn "Doctor APIs - Viewer Tests"
3. Click **Run**
4. Xem kết quả: 3 passed (GET), 3 failed (POST/PUT/DELETE)

---

## **📋 CREDENTIALS SUMMARY**

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@example.com | password123 | Full access |
| **User** | user@example.com | password | Read + Create appointments |
| **Viewer** | testviewer123@example.com | password123 | **Read ONLY** |

---

## **🚀 QUICK START**

```bash
# 1. Tạo viewer user
cd server
node test-create-viewer.mjs

# 2. Start server (nếu chưa chạy)
npm start

# 3. Mở Postman
# 4. Login viewer: POST /api/auth/login với email: testviewer123@example.com
# 5. Copy token
# 6. Test: GET /api/doctors?token=YOUR_TOKEN
```

**Sẵn sàng demo cho thầy! 🎓**
