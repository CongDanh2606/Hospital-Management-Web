# 👀 **DOCTOR VIEWER ROLE** - Hướng Dẫn Sử Dụng

## 🎯 **Mục tiêu**
Tạo một user role có quyền **chỉ xem danh sách bác sĩ** mà không được:
- ❌ Chỉnh sửa/thêm/xóa bác sĩ
- ❌ Xem danh sách thuốc
- ❌ Xem lịch hẹn
- ❌ Xem phòng lab
- ❌ Xem phòng phẫu thuật
- ❌ Truy cập bất kỳ table nào khác

---

## 📋 **DOCTOR VIEWER - THÔNG TIN ĐĂNG NHẬP**

```
📧 Email: doctorviewer@example.com
🔐 Password: password123
👤 Role: doctor_viewer
✅ Verified: Yes
```

---

## ✅ **CÓ THỂ LÀM GÌ?**

### 1. **Đăng nhập (Login)**
```
POST http://localhost:5000/api/auth/login

Body:
{
  "email": "doctorviewer@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "doctor_viewer"
}
```

### 2. **Xem Danh Sách Bác Sĩ**
```
✅ GET /api/doctors/export?token=DOCTOR_VIEWER_TOKEN
✅ GET /api/doctors?token=DOCTOR_VIEWER_TOKEN
✅ GET /api/doctors/by-department?token=DOCTOR_VIEWER_TOKEN&department=Cardiology
✅ GET /api/doctors/by-specialization?token=DOCTOR_VIEWER_TOKEN&specialization=Cardiologist
```

---

## ❌ **KHÔNG THỂ LÀM GÌ?**

### 1. **Chỉnh sửa Bác Sĩ**
```
❌ POST /api/doctors/create?token=DOCTOR_VIEWER_TOKEN
Response Code: 4 - No permission
```

### 2. **Xem Danh Sách Thuốc**
```
❌ GET /api/admin/medicines?token=DOCTOR_VIEWER_TOKEN
Response Code: 4 - Access denied
```

### 3. **Xem Lịch Hẹn**
```
❌ GET /api/checkup?token=DOCTOR_VIEWER_TOKEN
Response Code: 4 - Access denied
```

### 4. **Xem Lab/Phòng Phẫu Thuật**
```
❌ GET /api/lab?token=DOCTOR_VIEWER_TOKEN
❌ GET /api/surgery?token=DOCTOR_VIEWER_TOKEN
Response Code: 4 - Access denied
```

---

## 🧪 **TEST DOCTOR VIEWER**

### **Step 1: Đăng nhập Doctor Viewer**

```powershell
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Body (@{
    email="doctorviewer@example.com"
    password="password123"
  } | ConvertTo-Json) `
  -ContentType "application/json"

$doctorViewerToken = $loginResponse.token
Write-Host "✅ Doctor Viewer Token: $($doctorViewerToken.Substring(0,50))..." -ForegroundColor Green
```

### **Step 2: Xem Danh Sách Bác Sĩ (✅ ĐƯỢC)**

```powershell
$doctorResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/doctors?token=$doctorViewerToken" `
  -Method GET

Write-Host "✅ Doctor List (ALLOWED):" -ForegroundColor Green
$doctorResponse | ConvertTo-Json
```

**Expected Response:**
```json
{
  "code": 0,
  "message": "Doctors retrieved successfully",
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dr. Rahul Mishra",
      "specialization": "Cardiologist",
      "department": "Cardiology"
    },
    ...
  ]
}
```

### **Step 3: Cố Tạo Doctor Mới (❌ BỊ CHẶN)**

```powershell
$createData = @{
  name = "Dr. Test"
  specialization = "Test"
  department = "Test"
} | ConvertTo-Json

try {
  $createResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/doctors/create?token=$doctorViewerToken" `
    -Method POST `
    -Body $createData `
    -ContentType "application/json"
} catch {
  Write-Host "❌ Doctor Viewer Cannot Create (BLOCKED):" -ForegroundColor Red
  $error = $_.Exception.Response.Content | ConvertFrom-Json
  $error | ConvertTo-Json
}
```

**Expected Response:**
```json
{
  "code": 4,
  "message": "Access denied - Doctor Viewer can only read doctor list",
  "success": false
}
```

### **Step 4: Cố Xem Medicines (❌ BỊ CHẶN)**

```powershell
try {
  $medicineResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/medicines?token=$doctorViewerToken" `
    -Method GET
} catch {
  Write-Host "❌ Doctor Viewer Cannot See Medicines (BLOCKED):" -ForegroundColor Red
  $error = $_.Exception.Response.Content | ConvertFrom-Json
  $error | ConvertTo-Json
}
```

**Expected Response:**
```json
{
  "code": 4,
  "message": "Access denied - Doctor Viewer can only read doctor list",
  "success": false
}
```

---

## 📊 **PERMISSION MATRIX**

| Endpoint | Admin | User | Viewer | Doctor Viewer |
|----------|-------|------|--------|---------------|
| **GET /api/doctors** | ✅ | ✅ | ✅ | ✅ |
| **GET /api/doctors/by-department** | ✅ | ✅ | ✅ | ✅ |
| **GET /api/doctors/by-specialization** | ✅ | ✅ | ✅ | ✅ |
| **GET /api/doctors/export** | ✅ | ✅ | ✅ | ✅ |
| **POST /api/doctors/create** | ✅ | ❌ | ❌ | ❌ |
| **GET /api/admin/medicines** | ✅ | ❌ | ❌ | ❌ |
| **POST /api/admin/medicines** | ✅ | ❌ | ❌ | ❌ |
| **GET /api/checkup** | ✅ | ✅ | ✅ | ❌ |
| **POST /api/labs/book** | ✅ | ✅ | ✅ | ❌ |
| **POST /api/surgery/book** | ✅ | ✅ | ✅ | ❌ |

---

## 🔐 **PERMISSION RULES**

**Doctor Viewer Role:**
- ✅ **Allowed**: GET requests to `/api/doctors/*`
- ❌ **Blocked**: All POST/PUT/DELETE requests
- ❌ **Blocked**: Access to non-doctor endpoints

---

## 🛠️ **IMPLEMENTATION DETAILS**

### Files Changed:

**1. server/models/User.js**
```javascript
role: { type: String, enum: ["user", "admin", "viewer", "doctor_viewer"], default: "user" }
```

**2. server/middleware/doctorViewerOnly.js** (NEW)
```javascript
// Restricts doctor_viewer to:
// - GET /api/doctors/* only
// - Blocks POST/PUT/DELETE
// - Blocks access to other tables
```

**3. server/index.js**
```javascript
// Apply middleware to protect other routes
app.use(isAuthenticated, doctorViewerOnly);
```

**4. server/create-doctor-viewer.js** (NEW)
```javascript
// Script to create doctor_viewer user
// Usage: node create-doctor-viewer.js
```

---

## 📌 **SO SÁNH ROLES**

| Feature | Admin | User | Viewer | Doctor Viewer |
|---------|-------|------|--------|---------------|
| **Login** | ✅ | ✅ | ✅ | ✅ |
| **Read Doctors** | ✅ | ✅ | ✅ | ✅ |
| **Create Doctor** | ✅ | ❌ | ❌ | ❌ |
| **Modify Doctor** | ✅ | ❌ | ❌ | ❌ |
| **Delete Doctor** | ✅ | ❌ | ❌ | ❌ |
| **See Medicines** | ✅ | ❌ | ❌ | ❌ |
| **See Appointments** | ✅ | ✅ | ✅ | ❌ |
| **See Lab/Surgery** | ✅ | ✅ | ✅ | ❌ |

---

## 🚀 **USE CASES**

### 1. **Receptionist View**
- Chỉ cần xem danh sách bác sĩ để hướng dẫn bệnh nhân
- Không cần chỉnh sửa bất kỳ thông tin gì
- Không cần thấy thuốc hoặc chi tiết phòng

**Solution:** Use `doctor_viewer` role!

### 2. **Public Kiosk**
- Hiển thị danh sách bác sĩ với chuyên khoa
- Bệnh nhân có thể tìm kiếm và chọn bác sĩ
- Không thể truy cập các thông tin nhạy cảm

**Solution:** Use `doctor_viewer` role!

### 3. **Mobile App - Doctor List Feature**
- Ứng dụng mobile chỉ hiển thị danh sách bác sĩ
- Bảo mật - không lộ thông tin khác

**Solution:** Use `doctor_viewer` role!

---

## 💻 **CURL COMMANDS**

### Login Doctor Viewer:
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctorviewer@example.com",
    "password": "password123"
  }'
```

### Get Doctor List (✅ ALLOWED):
```bash
curl -X GET "http://localhost:5000/api/doctors?token=DOCTOR_VIEWER_TOKEN"
```

### Try Create Doctor (❌ BLOCKED):
```bash
curl -X POST "http://localhost:5000/api/doctors/create?token=DOCTOR_VIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test",
    "specialization": "Test",
    "department": "Test"
  }'
```

Response:
```json
{
  "code": 4,
  "message": "Access denied - Doctor Viewer can only read doctor list",
  "success": false
}
```

---

## ✨ **SECURITY FEATURES**

✅ Role-based access control  
✅ Token validation required  
✅ Clear error messages  
✅ Non-admin routes blocked  
✅ Modification operations blocked  
✅ Database operations protected  

**Doctor Viewer - Chỉ xem danh sách bác sĩ thôi! 👀**
