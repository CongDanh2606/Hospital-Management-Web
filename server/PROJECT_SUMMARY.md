# 📚 TỔNG HỢP DỰ ÁN - HOSPITAL MANAGEMENT APIs

## 🎯 **MỤC TIÊU ĐÃ HOÀN THÀNH**

Tạo hệ thống REST APIs quản lý bác sĩ với:
1. ✅ **Authentication** - JWT token qua URL (query string)
2. ✅ **Role-based Access** - Admin, User, Viewer, Doctor_Viewer
3. ✅ **CRUD Operations** - Create, Read, Update, Delete
4. ✅ **Error Codes** - Mã lỗi chuẩn hóa (0-5)
5. ✅ **Security** - Token validation, permission checks

---

## 📋 **DANH SÁCH APIs ĐÃ TẠO**

### **1. Authentication APIs**
- **POST /api/auth/login** - Đăng nhập (trả về JWT token)
- **POST /api/auth/register** - Đăng ký user mới

### **2. Doctor APIs - READ (4 APIs)**
- **GET /api/doctors/export** - Export JSON (không cần auth)
- **GET /api/doctors/by-department?token=X&department=Y** - Lọc theo khoa
- **GET /api/doctors/by-specialization?token=X&specialization=Y** - Lọc theo chuyên khoa
- **GET /api/doctors?token=X** - Multi-filter (name, dept, spec)

### **3. Doctor APIs - CREATE (1 API)**
- **POST /api/doctors/create?token=X** - Tạo bác sĩ mới (chỉ admin)
  - Error codes: 0 (success), 1 (missing data), 2 (duplicate), 3 (invalid token), 4 (no permission), 5 (database error)

---

## 👥 **USER ROLES**

### **1. Admin**
```
Email: admin@example.com
Password: password123
Quyền: ✅ Tất cả (read, create, update, delete)
```

### **2. Viewer** (Read-only tất cả tables)
```
Email: testviewer123@example.com
Password: password123
Quyền: 
  ✅ Read doctors, medicines, appointments
  ❌ Không modify gì cả
```

### **3. Doctor_Viewer** (ONLY doctors table)
```
Email: doctorviewer@example.com
Password: password123
Quyền:
  ✅ CHẠY đọc danh sách bác sĩ
  ❌ Không tạo/sửa/xóa bác sĩ
  ❌ Không xem medicines
  ❌ Không xem appointments
  ❌ Không xem bất kỳ table nào khác
```

---

## 🔢 **MÃ LỖI CHUẨN HÓA**

| Code | Message | Ý nghĩa |
|------|---------|---------|
| **0** | Success | ✅ Thành công |
| **1** | Missing required data | ❌ Thiếu dữ liệu bắt buộc |
| **2** | Duplicate record | ❌ Dữ liệu đã tồn tại |
| **3** | Invalid token | ❌ Token sai hoặc hết hạn |
| **4** | No permission | ❌ Không có quyền |
| **5** | Database error | ❌ Lỗi database |

---

## 📂 **CẤU TRÚC FILES**

### **Backend Files Created/Modified:**

#### **Models:**
- `server/models/User.js` - User schema (roles: user, admin, viewer, doctor_viewer)
- `server/models/doctor.js` - Doctor schema (id, name, specialization, department, etc.)

#### **Middleware:**
- `server/middleware/isAuthenticated.js` - JWT validation (query string, cookies, header)
- `server/middleware/roleBasedAccess.js` - Role-based permissions
- `server/middleware/doctorViewerOnly.js` - Restrict doctor_viewer to doctors only

#### **Routes:**
- `server/routes/authRoutes.js` - Login, register
- `server/routes/doctorRoutes.js` - 5 doctor endpoints (4 read + 1 create)

#### **Controllers:**
- `server/controllers/authController.js` - Login/register logic
- `server/controllers/viewerController.js` - Create viewer user

#### **Scripts:**
- `server/create-doctor-viewer.js` - Script to create doctor_viewer user
- `server/test-doctor-viewer.mjs` - Node.js test script
- `server/test-doctorviewer.ps1` - PowerShell test script
- `server/TEST_ALL_APIS.ps1` - Comprehensive test script (12 tests)

#### **Documentation:**
- `server/CREATE_DOCTOR_API_GUIDE.md` - Hướng dẫn API create doctor
- `server/DOCTOR_VIEWER_GUIDE.md` - Hướng dẫn doctor_viewer role
- `server/TESTING_GUIDE.md` - Hướng dẫn test manual (Postman/PowerShell)
- `server/PRESENTATION.html` - Interactive HTML slides
- `server/CODE_EXPLANATION.md` - Giải thích code chi tiết
- `server/VIEWER_USER_GUIDE.md` - Hướng dẫn viewer user
- `server/DEMO_SCRIPT.md` - Script demo 10 phút
- `server/Postman_Viewer_Collection.json` - Postman collection

---

## 🚀 **CÁCH CHẠY SERVER**

### **1. Start Server:**
```bash
cd server
node index.js
```

Server sẽ chạy trên: `http://localhost:5000`

### **2. Test APIs:**

#### **Cách 1: PowerShell Test Script**
```powershell
cd server
.\TEST_ALL_APIS.ps1
```

#### **Cách 2: Manual với Postman**
- Xem hướng dẫn trong: `TESTING_GUIDE.md`
- Import: `Postman_Viewer_Collection.json`

#### **Cách 3: PowerShell Quick Test**
```powershell
# Login
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Body '{"email":"admin@example.com","password":"password123"}' `
  -ContentType "application/json"

$token = $login.token

# Get doctors
Invoke-RestMethod -Uri "http://localhost:5000/api/doctors?token=$token"

# Create doctor
$newDoc = '{"name":"Dr. Test","specialization":"Surgeon","department":"Surgery"}'
Invoke-RestMethod -Uri "http://localhost:5000/api/doctors/create?token=$token" `
  -Method POST `
  -Body $newDoc `
  -ContentType "application/json"
```

---

## ✅ **CHỨC NĂNG ĐÃ KIỂM THỬ**

### **Authentication:**
- [x] Admin login
- [x] Viewer login
- [x] Doctor_Viewer login
- [x] Token generation (JWT, 7-day expiration)
- [x] Token validation (query string, cookies, header)

### **Doctor APIs - Read:**
- [x] Get all doctors
- [x] Filter by department
- [x] Filter by specialization
- [x] Multi-filter (name + dept + spec)
- [x] Export JSON (no auth)

### **Doctor APIs - Create:**
- [x] Success case (Code 0)
- [x] Missing data validation (Code 1)
- [x] Duplicate detection (Code 2)
- [x] Invalid token handling (Code 3)
- [x] Permission check (Code 4)
- [x] Database error handling (Code 5)

### **Access Control:**
- [x] Admin - full access
- [x] Viewer - read-only all tables
- [x] Doctor_Viewer - read ONLY doctors
- [x] Doctor_Viewer blocked from medicines
- [x] Doctor_Viewer blocked from modify operations

---

## 🔐 **BẢO MẬT**

### **Implemented:**
1. ✅ JWT Authentication
2. ✅ Role-based Access Control (RBAC)
3. ✅ Token validation middleware
4. ✅ Password hashing (bcrypt)
5. ✅ Input validation
6. ✅ Duplicate checking
7. ✅ Error handling

### **Token Placement:**
- ✅ Query string: `?token=XXX`
- ✅ Cookies: `token=XXX`
- ✅ Header: `Authorization: Bearer XXX`

---

## 📊 **DATABASE SCHEMA**

### **Users Collection:**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: user, admin, viewer, doctor_viewer),
  isAccountVerified: Boolean
}
```

### **Doctors Collection:**
```javascript
{
  id: Number (auto-increment),
  name: String (required),
  specialization: String (required),
  department: String (required),
  Experience: String,
  availability: String,
  photoUrl: String
}
```

---

## 🎓 **DEMO CHO GIÁO VIÊN**

### **Scenario 1: Admin tạo bác sĩ mới**
1. Login admin → get token
2. POST /api/doctors/create với token
3. Kết quả: Code 0 - Success

### **Scenario 2: Viewer thử tạo bác sĩ (bị chặn)**
1. Login viewer → get token
2. POST /api/doctors/create với viewer token
3. Kết quả: Code 4 - No permission

### **Scenario 3: Doctor_Viewer chỉ xem doctors**
1. Login doctor_viewer → get token
2. GET /api/doctors → Success ✅
3. GET /api/admin/medicines → Blocked ❌
4. POST /api/doctors/create → Blocked ❌

### **Scenario 4: Test Error Codes**
1. Missing data → Code 1
2. Duplicate doctor → Code 2
3. Invalid token → Code 3
4. No permission → Code 4

---

## 📝 **GHI CHÚ KỸ THUẬT**

### **Technology Stack:**
- **Backend:** Node.js + Express.js v5.1.0
- **Database:** MongoDB + Mongoose v8.16.1
- **Authentication:** JWT (jsonwebtoken v9.0.2)
- **Password:** bcrypt
- **Environment:** dotenv

### **API Design:**
- **REST principles**
- **Standardized error codes**
- **Consistent response format**
- **Token in URL (query string)**

### **Best Practices:**
- ✅ Middleware architecture
- ✅ Error handling với try-catch
- ✅ Input validation
- ✅ Role-based permissions
- ✅ Code documentation

---

## 🎯 **KẾT LUẬN**

### **Đã hoàn thành:**
1. ✅ 5 Doctor APIs (4 read + 1 create)
2. ✅ 4 User roles với quyền khác nhau
3. ✅ JWT authentication qua URL
4. ✅ Error codes chuẩn hóa (0-5)
5. ✅ Role-based access control
6. ✅ Comprehensive documentation
7. ✅ Test scripts (PowerShell + Node.js)
8. ✅ Postman collection

### **Ready for:**
- ✅ Presentation
- ✅ Demo
- ✅ Production deployment
- ✅ Further development (UPDATE, DELETE APIs)

---

## 📞 **SUPPORT**

### **Files to Reference:**
- `TESTING_GUIDE.md` - Hướng dẫn test
- `CREATE_DOCTOR_API_GUIDE.md` - API create doctor
- `DOCTOR_VIEWER_GUIDE.md` - Doctor viewer role
- `CODE_EXPLANATION.md` - Giải thích code

### **Test Scripts:**
- `TEST_ALL_APIS.ps1` - Test tất cả (12 tests)
- `test-doctorviewer.ps1` - Test doctor viewer
- `create-doctor-viewer.js` - Tạo doctor viewer user

**HỆ THỐNG ĐÃ SẴN SÀNG! 🚀**
