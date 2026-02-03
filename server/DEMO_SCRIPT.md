# 🎬 DEMO SCRIPT - POSTMAN VIEWER TEST

## 📋 **CHUẨN BỊ TRƯỚC DEMO**

### 1. Start Server
```bash
cd server
npm start
```
✅ Chờ thấy: "Server is running on port 5000" và "✅ MongoDB Connected"

### 2. Tạo Viewer User
```bash
node test-create-viewer.mjs
```
✅ Credentials: testviewer123@example.com / password123

### 3. Import Postman Collection
- Mở Postman
- File → Import
- Chọn file: `Postman_Viewer_Collection.json`
- Click Import

---

## 🎯 **DEMO FLOW (10 PHÚT)**

### **PART 1: Login Viewer (2 phút)**

**Step 1:**
- Mở folder **"1. Authentication"**
- Click **"Login Viewer"**
- Xem Body:
  ```json
  {
    "email": "testviewer123@example.com",
    "password": "password123"
  }
  ```

**Step 2:**
- Click **Send** 
- Giải thích: "Đây là viewer user - chỉ được đọc"

**Step 3:**
- Xem Response:
  ```json
  {
    "success": true,
    "token": "eyJhbGc...",
    "role": "viewer",  ← Chú ý role!
    "message": "Logged in successfully"
  }
  ```

**Step 4:**
- Mở tab **Tests**
- Giải thích: "Script tự động lưu token vào biến viewerToken"
- Xem Console: "✅ Viewer token saved!"

---

### **PART 2: Viewer Đọc Doctors (3 phút)**

**Test 1: Get All Doctors**
- Mở folder **"2. Viewer Tests - READ"**
- Click **"✅ Get All Doctors (Viewer)"**
- Xem URL: 
  ```
  http://localhost:5000/api/doctors?token={{viewerToken}}
  ```
- Giải thích: "Token được truyền qua query string"
- Click **Send**
- Xem Response:
  ```json
  {
    "success": true,
    "count": 4,
    "data": [
      {
        "name": "Dr. Rahul Mishra",
        "specialization": "Cardiologist",
        ...
      },
      ...
    ]
  }
  ```
- ✅ SUCCESS!

**Test 2: Get by Department**
- Click **"✅ Get Doctors by Department (Viewer)"**
- Xem query params: `department=General`
- Click **Send**
- ✅ Thành công - Hiển thị doctors trong General department

**Test 3: Get by Specialization**
- Click **"✅ Get Doctors by Specialization (Viewer)"**
- Xem query params: `specialization=Cardiologist`
- Click **Send**
- ✅ Thành công - Hiển thị Cardiologist

---

### **PART 3: Viewer Không Thể Sửa (3 phút) - QUAN TRỌNG!**

**Test 1: Thử Tạo Doctor**
- Mở folder **"3. Viewer Tests - MODIFY"**
- Click **"❌ Create Doctor (Viewer - Should Fail)"**
- Xem method: **POST** (không phải GET)
- Xem Body:
  ```json
  {
    "name": "Dr. Test Doctor",
    "specialization": "Neurologist",
    "department": "Neurology"
  }
  ```
- Giải thích: "Viewer đang thử TẠO bác sĩ mới - điều này KHÔNG được phép"
- Click **Send**
- Xem Response:
  ```json
  {
    "success": false,
    "message": "Viewer can only read (GET), not modify"
  }
  ```
- ❌ BỊ CHẶN! Đúng như mong đợi!

**Test 2: Thử Sửa Doctor**
- Click **"❌ Update Doctor (Viewer - Should Fail)"**
- Method: **PUT**
- Click **Send**
- ❌ Bị chặn: "Viewer can only read (GET), not modify"

**Test 3: Thử Xóa Doctor**
- Click **"❌ Delete Doctor (Viewer - Should Fail)"**
- Method: **DELETE**
- Click **Send**
- ❌ Bị chặn: "Viewer can only read (GET), not modify"

---

### **PART 4: So Sánh với Admin (2 phút)**

**Step 1: Login Admin**
- Quay lại folder **"1. Authentication"**
- Click **"Login Admin (for comparison)"**
- Click **Send**
- Xem Response:
  ```json
  {
    "success": true,
    "role": "admin",  ← Admin role!
    ...
  }
  ```

**Step 2: Admin Đọc Doctors**
- Mở folder **"4. Admin Tests - For Comparison"**
- Click **"✅ Get All Doctors (Admin)"**
- Click **Send**
- ✅ Thành công - Admin cũng đọc được

**Step 3: Giải thích sự khác biệt**
"Viewer và Admin đều ĐỌC được, nhưng:"
- ✅ Admin có thể: Tạo (POST), Sửa (PUT), Xóa (DELETE)
- ❌ Viewer chỉ có thể: Đọc (GET)

---

## 📊 **TEST RESULTS SUMMARY**

| Test | Viewer | Admin |
|------|--------|-------|
| **GET /doctors** | ✅ Pass | ✅ Pass |
| **GET /by-department** | ✅ Pass | ✅ Pass |
| **GET /by-specialization** | ✅ Pass | ✅ Pass |
| **POST /doctors** | ❌ Blocked | ✅ Pass |
| **PUT /doctors/:id** | ❌ Blocked | ✅ Pass |
| **DELETE /doctors/:id** | ❌ Blocked | ✅ Pass |

---

## 🎓 **KẾT LUẬN DEMO**

### Điểm nhấn:

1. **Role-Based Access Control (RBAC)**
   - 3 roles: User, Admin, Viewer
   - Mỗi role có permissions khác nhau

2. **Viewer User**
   - ✅ Có thể đọc toàn bộ doctors
   - ❌ Không thể tạo/sửa/xóa
   - Middleware tự động kiểm tra quyền

3. **Security**
   - JWT token xác thực user
   - Token chứa role information
   - Middleware check method (GET only for viewer)

4. **Implementation**
   - User model: enum roles ["user", "admin", "viewer"]
   - Middleware: roleBasedAccess.js
   - Routes: Protected với isAuthenticated + viewerReadOnly

---

## 💡 **CÂU HỎI THẦY CÓ THỂ HỎI**

### Q1: "Làm sao viewer không thể sửa/xóa?"
**A:** Middleware `viewerReadOnly` kiểm tra:
```javascript
if (req.userRole === "viewer" && req.method !== "GET") {
    return res.json({ 
        message: "Viewer can only read (GET), not modify" 
    });
}
```

### Q2: "Token được lưu ở đâu?"
**A:** Token được trả về từ `/api/auth/login` và client lưu:
- Trong localStorage (frontend)
- Trong Postman environment variable
- Gửi lại qua query string `?token=...`

### Q3: "Có cách nào bypass viewer restrictions không?"
**A:** Không! Vì:
- Token có role="viewer" được mã hóa trong JWT
- Server verify token và extract role
- Middleware check role trước khi cho phép action

### Q4: "Nếu muốn viewer đọc được bảng khác thì sao?"
**A:** Thêm middleware `canReadMedicines` tương tự:
```javascript
export const canReadMedicines = (req, res, next) => {
    if (["admin", "viewer"].includes(req.userRole)) {
        next();
    } else {
        res.json({ message: "No permission" });
    }
};
```

---

## ✅ **CHECKLIST HOÀN THÀNH**

- [x] Tạo viewer user
- [x] Login viewer thành công
- [x] Viewer đọc được doctors
- [x] Viewer bị chặn khi tạo/sửa/xóa
- [x] So sánh với admin
- [x] Import Postman collection
- [x] Test tất cả endpoints
- [x] Giải thích architecture

**SẴN SÀNG TRÌNH BÀY! 🎉**
