# 📝 API CREATE DOCTOR - HƯỚNG DẪN SỬ DỤNG

## 🎯 **Mục tiêu**
Tạo REST API để insert bác sĩ mới vào database qua URL với token và input parameters

---

## 📋 **API ENDPOINT**

### URL:
```
POST http://localhost:5000/api/doctors/create?token=YOUR_TOKEN
```

### Headers:
```
Content-Type: application/json
```

### Request Body (JSON):
```json
{
  "name": "Dr. Nguyễn Văn A",
  "specialization": "Cardiologist",
  "department": "Cardiology",
  "Experience": "15 years",
  "availability": "Mon-Fri, 8AM-5PM",
  "photoUrl": "https://example.com/photo.jpg"
}
```

---

## 📊 **ERROR CODES**

| Code | Message | Nguyên nhân |
|------|---------|-----------|
| **0** | Success | Doctor created successfully ✅ |
| **1** | Missing data | Thiếu required fields (name, specialization, department) |
| **2** | Duplicate | Bác sĩ với tên này đã tồn tại |
| **3** | Invalid token | Token hết hạn hoặc sai |
| **4** | No permission | Không phải admin (viewer/user không được tạo) |
| **5** | Database error | Lỗi database |

---

## 📌 **RESPONSE FORMAT**

### Success (Code 0):
```json
{
  "code": 0,
  "message": "Doctor created successfully",
  "success": true,
  "data": {
    "id": 5,
    "name": "Dr. Nguyễn Văn A",
    "specialization": "Cardiologist",
    "department": "Cardiology",
    "Experience": "15 years",
    "availability": "Mon-Fri, 8AM-5PM"
  }
}
```

### Error (Code 1 - Missing Data):
```json
{
  "code": 1,
  "message": "Missing required data: name, specialization, department",
  "success": false
}
```

### Error (Code 4 - No Permission):
```json
{
  "code": 4,
  "message": "No permission - Only admin can create doctors",
  "success": false
}
```

### Error (Code 5 - Database Error):
```json
{
  "code": 5,
  "message": "Database error: ...",
  "success": false
}
```

---

## 🚀 **CÁCH SỬ DỤNG - STEP BY STEP**

### **Step 1: Lấy Admin Token**

```
POST http://localhost:5000/api/auth/login

Body:
{
  "email": "admin@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "admin"
}
```

Copy token từ response.

### **Step 2: Tạo Doctor Mới**

**Trong Postman:**

1. **Method:** POST
2. **URL:** `http://localhost:5000/api/doctors/create?token=YOUR_TOKEN`
3. **Headers:** 
   ```
   Content-Type: application/json
   ```
4. **Body (raw JSON):**
   ```json
   {
     "name": "Dr. Nguyễn Văn B",
     "specialization": "Pediatrician",
     "department": "Pediatrics",
     "Experience": "12 years",
     "availability": "Mon-Thu, 9AM-6PM",
     "photoUrl": "https://via.placeholder.com/150"
   }
   ```
5. **Click Send**

### **Step 3: Xem Response**

Nếu thành công:
```json
{
  "code": 0,
  "message": "Doctor created successfully",
  "success": true,
  "data": {
    "id": 5,
    "name": "Dr. Nguyễn Văn B",
    ...
  }
}
```

---

## 💻 **CURL COMMAND**

```bash
curl -X POST "http://localhost:5000/api/doctors/create?token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Nguyễn Văn C",
    "specialization": "Neurologist",
    "department": "Neurology",
    "Experience": "10 years",
    "availability": "Tue-Fri",
    "photoUrl": "https://via.placeholder.com/150"
  }'
```

---

## 🧪 **POWERSHELL SCRIPT TEST**

```powershell
# 1. Login Admin
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Body (@{email="admin@example.com"; password="password123"} | ConvertTo-Json) `
  -ContentType "application/json"

$adminToken = $loginResponse.token
Write-Host "✅ Admin token: $($adminToken.Substring(0,50))..." -ForegroundColor Green

# 2. Tạo doctor mới
$doctorData = @{
  name = "Dr. Nguyễn Văn D"
  specialization = "Urologist"
  department = "Urology"
  Experience = "14 years"
  availability = "Mon-Wed-Fri"
  photoUrl = "https://via.placeholder.com/150"
} | ConvertTo-Json

$createResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/doctors/create?token=$adminToken" `
  -Method POST `
  -Body $doctorData `
  -ContentType "application/json"

Write-Host "`n📊 Response:" -ForegroundColor Cyan
$createResponse | ConvertTo-Json

if ($createResponse.code -eq 0) {
  Write-Host "✅ Doctor created successfully!" -ForegroundColor Green
  Write-Host "Doctor ID: $($createResponse.data.id)" -ForegroundColor Yellow
} else {
  Write-Host "❌ Error Code: $($createResponse.code)" -ForegroundColor Red
  Write-Host "Message: $($createResponse.message)" -ForegroundColor Red
}
```

---

## ✅ **PERMISSION RULES**

| Role | Can Create Doctor |
|------|------------------|
| **Admin** | ✅ YES |
| **User** | ❌ NO - Code 4 error |
| **Viewer** | ❌ NO - Code 4 error |

---

## 🔒 **SECURITY FEATURES**

1. **Token Required** - Phải gửi token valid
2. **Role-Based** - Chỉ admin được tạo
3. **Input Validation** - Kiểm tra required fields
4. **Duplicate Check** - Không cho tạo doctor trùng tên
5. **Error Messages** - Rõ ràng, dễ debug

---

## 📋 **FIELD REQUIREMENTS**

| Field | Required | Type | Example |
|-------|----------|------|---------|
| **name** | ✅ YES | String | "Dr. John Doe" |
| **specialization** | ✅ YES | String | "Cardiologist" |
| **department** | ✅ YES | String | "Cardiology" |
| **Experience** | ❌ NO | String | "15 years" |
| **availability** | ❌ NO | String | "Mon-Fri" |
| **photoUrl** | ❌ NO | String | "https://..." |

---

## 🧪 **TEST SCENARIOS**

### Test 1: Success (Code 0)
```json
{
  "name": "Dr. New Doctor",
  "specialization": "Cardiologist",
  "department": "Cardiology"
}
→ Success! Code: 0
```

### Test 2: Missing Data (Code 1)
```json
{
  "name": "Dr. Another Doctor"
  // Missing specialization and department
}
→ Error! Code: 1 - Missing required data
```

### Test 3: Duplicate Doctor (Code 2)
```json
{
  "name": "Dr. Rahul Mishra",  // Already exists!
  "specialization": "Cardiologist",
  "department": "Cardiology"
}
→ Error! Code: 2 - Doctor with this name already exists
```

### Test 4: Invalid Token (Code 3)
```
Token: invalid_token_here
→ Error! Code: 3 - Invalid or expired token
```

### Test 5: No Permission (Code 4)
```
Login with viewer user
Try to create doctor
→ Error! Code: 4 - No permission
```

---

## 📝 **RESPONSE CODE HANDLING**

```javascript
if (response.code === 0) {
  // Success - Doctor created
  console.log("New doctor ID:", response.data.id);
} else if (response.code === 1) {
  // Missing data - Show validation error
  console.log("Please fill all required fields");
} else if (response.code === 2) {
  // Duplicate - Try different name
  console.log("This doctor already exists");
} else if (response.code === 4) {
  // No permission - Need admin
  console.log("Only admin can create doctors");
}
```

---

## ✨ **EXAMPLE: COMPLETE FLOW**

```
1. Admin login
   POST /api/auth/login
   → Get token

2. Create doctor via API
   POST /api/doctors/create?token=ADMIN_TOKEN
   Body: {name, specialization, department}
   → Response with code 0-5

3. Check if successful
   if (code === 0) doctor created!
   else handle error based on code
```

---

## 🎓 **READY FOR PRODUCTION!**

✅ Input validation
✅ Error codes + messages
✅ Token authentication
✅ Role-based access
✅ Database error handling
✅ Response format standardized

**API siêu rõ ràng và dễ sử dụng! 🚀**
