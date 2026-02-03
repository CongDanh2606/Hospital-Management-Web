# 👤 Hướng dẫn tạo Viewer User (Chỉ đọc)

## 1️⃣ **Khái niệm**

**Viewer User** = Người dùng chỉ được **ĐỌC** data, không được **SỬA/XÓA**

---

## 2️⃣ **Cách 1: Tạo Viewer User (Ứng dụng)**

### Bước 1: POST request để tạo viewer

```bash
POST http://localhost:5000/api/auth/create-viewer

Body JSON:
{
  "name": "Viewer Demo",
  "email": "viewer@example.com",
  "password": "viewer123456"
}
```

### Bước 2: Response nhận được

```json
{
  "success": true,
  "message": "Viewer account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "viewer",
  "permissions": {
    "doctors": "READ ONLY - Cannot modify",
    "medicine": "No access",
    "checkup": "No access",
    "surgery": "No access"
  }
}
```

### Bước 3: Sử dụng token

```bash
# ✅ ĐƯỢC - Đọc data
GET http://localhost:5000/api/doctors/by-department?token=YOUR_TOKEN&department=Cardiology

# ❌ KHÔNG ĐƯỢC - Sửa/Xóa
POST http://localhost:5000/api/doctors
DELETE http://localhost:5000/api/doctors/:id
PUT http://localhost:5000/api/doctors/:id
```

---

## 3️⃣ **Cách 2: MongoDB Read-Only User** (Nếu dùng Atlas)

### Bước 1: Vào MongoDB Compass hoặc mongosh

```bash
mongosh "mongodb+srv://cluster0.xxx.mongodb.net/" --username nhathuyphan21_db_user --password 123
```

### Bước 2: Tạo user chỉ đọc

```javascript
use admin;

db.createUser({
  user: "viewer_user",
  pwd: "viewer123456",
  roles: [
    {
      role: "read",
      db: "hospital"
    }
  ]
});
```

### Bước 3: Connection string cho viewer

```
mongodb+srv://viewer_user:viewer123456@cluster0.tke6n1k.mongodb.net/hospital
```

---

## 4️⃣ **Permissions của Viewer**

| Action | User | Admin | Viewer |
|--------|------|-------|--------|
| **GET /doctors** | ✅ | ✅ | ✅ |
| **GET /doctors/:id** | ✅ | ✅ | ✅ |
| **POST /doctors** (tạo) | ❌ | ✅ | ❌ |
| **PUT /doctors/:id** (sửa) | ❌ | ✅ | ❌ |
| **DELETE /doctors/:id** | ❌ | ✅ | ❌ |

---

## 5️⃣ **Code Architecture**

### File: `middleware/roleBasedAccess.js`

```javascript
export const canReadDoctors = (req, res, next) => {
  // User, Admin, Viewer đều được đọc
  const allowedRoles = ["user", "admin", "viewer"];
  if (allowedRoles.includes(req.userRole)) {
    next();
  } else {
    res.json({ success: false, message: "No permission to read" });
  }
};

export const viewerReadOnly = (req, res, next) => {
  // Viewer chỉ được GET (đọc), không được POST/PUT/DELETE
  if (req.userRole === "viewer") {
    if (req.method !== "GET") {
      return res.json({ 
        success: false, 
        message: "Viewer can only read (GET), not modify" 
      });
    }
  }
  next();
};
```

### File: `routes/doctorRoutes.js`

```javascript
// Cũ (không kiểm tra quyền):
router.get("/doctors/by-department", isAuthenticated, async (req, res) => {...});

// Mới (có kiểm tra quyền):
router.get(
  "/doctors/by-department", 
  isAuthenticated,           // ← Kiểm tra token
  canReadDoctors,            // ← Kiểm tra có quyền đọc?
  viewerReadOnly,            // ← Viewer chỉ được GET?
  async (req, res) => {...}
);
```

---

## 6️⃣ **Test bằng Postman**

### Tạo Viewer:
```
POST /api/auth/create-viewer
Body: {"name":"Viewer","email":"viewer@test.com","password":"123456"}
```

### Test Đọc ✅:
```
GET /api/doctors/by-department?token=VIEWER_TOKEN&department=Cardiology
Response: [list of doctors]
```

### Test Sửa ❌:
```
POST /api/doctors?token=VIEWER_TOKEN
Response: "Viewer can only read (GET), not modify"
```

---

## 7️⃣ **Các role có sẵn**

| Role | Permissions |
|------|-------------|
| **user** | Đọc doctors, tạo appointment, sửa profile |
| **admin** | Toàn quyền - đọc, tạo, sửa, xóa |
| **viewer** | Chỉ đọc doctors - không sửa/xóa |

---

## 8️⃣ **Mở rộng - Thêm quyền Viewer khác**

```javascript
// Nếu muốn viewer chỉ đọc medicines
export const viewerReadMedicines = (req, res, next) => {
  if (req.userRole === "viewer" && req.method !== "GET") {
    return res.json({ 
      success: false, 
      message: "Viewer cannot modify medicines" 
    });
  }
  next();
};

// Hoặc viewer hoàn toàn không được truy cập admin routes
export const adminOnly = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.json({ 
      success: false, 
      message: "Only admin can access this" 
    });
  }
  next();
};
```

---

## ✅ **Tóm tắt**

```
✅ Viewer user tạo thành công
✅ Chỉ được đọc bảng doctors
✅ Không được sửa (POST), xóa (DELETE), cập nhật (PUT)
✅ Middleware tự động kiểm tra quyền
✅ Hiển thị error rõ ràng nếu vượt quyền
```

Bây giờ thầy có thể kiểm tra quyền hạn của user! 🔐
