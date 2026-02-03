# 📚 GIẢI THÍCH CODE: Kết nối Server, Token, Database

---

## 1️⃣ KẾT NỐI SERVER (Server Connection)

### File: `server/index.js`

```javascript
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load biến môi trường từ .env file

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - cho phép client từ frontend kết nối
app.use(cors());
app.use(express.json());

// Express Session - lưu user session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "midcity_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

**Giải thích:**
- `express()` - Tạo ứng dụng Express
- `cors()` - Cho phép request từ origin khác (localhost:3000 → localhost:5000)
- `PORT = 5000` - Server chạy trên cổng 5000
- `dotenv.config()` - Load biến từ `.env` file (MONGO_URI, JWT_SECRET)

**URL Server:** `http://localhost:5000`

---

## 2️⃣ KẾT NỐI DATABASE (Database Connection)

### File: `server/index.js`

```javascript
import mongoose from "mongoose";

// Lấy MongoDB URI từ file .env
const mongoURI = process.env.MONGO_URI;
console.log("Connecting to MongoDB URI:", mongoURI);

// Kết nối MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));
```

### File `.env`:
```
MONGO_URI=mongodb+srv://nhathuyphan21_db_user:123@cluster0.tke6n1k.mongodb.net/hospital?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=anything_secret
PORT=5000
```

**Giải thích:**
- `mongoose.connect()` - Kết nối đến MongoDB Atlas
- Connection string: `mongodb+srv://user:password@cluster.mongodb.net/database`
- `.then()` - Nếu kết nối thành công
- `.catch()` - Nếu kết nối thất bại

**Database:** Hospital Management System (4 bác sĩ, người dùng, lịch hẹn...)

---

## 3️⃣ TOKEN & AUTHENTICATION (JWT)

### A. TẠO TOKEN - Khi Login

**File:** `server/controllers/authController.js`

```javascript
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// ========== LOGIN ==========
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Tìm user trong database
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    // 2️⃣ Kiểm tra password (so sánh với hash)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // 3️⃣ TẠO JWT TOKEN
    const token = jwt.sign(
      {
        id: user._id,        // User ID
        role: user.role      // Role (user, admin)
      },
      process.env.JWT_SECRET,  // Secret key
      { expiresIn: "7d" }      // Hết hạn sau 7 ngày
    );

    // 4️⃣ Lưu token vào cookie
    res.cookie("token", token, { httpOnly: true });

    // 5️⃣ Gửi token cho client
    return res.json({
      success: true,
      token,           // ← Client nhận token này
      role: user.role,
      message: "Login successfully"
    });

  } catch (err) {
    return res.json({ success: false, message: "Something went wrong" });
  }
};
```

**JWT Token Structure:**
```
Header.Payload.Signature

Payload chứa:
{
  "id": "64f3a7b2c1d2e3f4a5b6c7d8",
  "role": "user",
  "iat": 1737538800,
  "exp": 1738143600
}
```

---

### B. KIỂM TRA TOKEN - Middleware

**File:** `server/middleware/isAuthenticated.js`

```javascript
import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    // 🔍 Lấy token từ 3 nguồn:
    let token = req.query?.token ||          // ← Query string: ?token=xyz
                req.cookies?.token ||         // ← Cookie
                null;

    // Nếu không có ở query/cookies, kiểm tra Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);     // Lấy token sau "Bearer "
      }
    }

    // ❌ Không có token
    if (!token) {
      return res.json({ 
        success: false, 
        message: "Unauthorized - Token required" 
      });
    }

    // ✅ Xác minh token bằng JWT_SECRET
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    
    if (tokenDecode.id) {
      // Lưu user info vào request object
      req.userId = tokenDecode.id;      // Để dùng trong route handler
      req.userRole = tokenDecode.role;

      next();  // ✅ Đi tiếp đến route handler
    } else {
      return res.json({ 
        success: false, 
        message: "Unauthorized - Invalid token" 
      });
    }

  } catch (err) {
    console.log("Auth error:", err.message);
    return res.json({ 
      success: false, 
      message: "Invalid or expired token"  // ← Token hết hạn hoặc bị sai
    });
  }
};

export default isAuthenticated;
```

**Token Flow:**
```
1. Client login → Nhận token
   POST /api/auth/login

2. Client gửi token trong request
   GET /api/doctors/by-department?token=eyJhbGc...

3. Middleware kiểm tra token
   - Xác minh signature
   - Kiểm tra expiration date
   - Extract user ID

4. Nếu valid → Cho phép truy cập
   Nếu invalid/expired → Reject
```

---

## 4️⃣ SỬ DỤNG TOKEN - Trong Routes

### File: `server/routes/doctorRoutes.js`

```javascript
import express from "express";
import Doctor from "../models/doctor.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// ❌ PUBLIC - Không cần token
router.get("/doctors/export", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PROTECTED - Cần token (Middleware check)
router.get("/doctors/by-department", isAuthenticated, async (req, res) => {
  try {
    const { department } = req.query;

    // req.userId có sẵn từ middleware!
    console.log(`User ${req.userId} searching doctors in ${department}`);

    const doctors = await Doctor.find({ 
      department: { $regex: department, $options: 'i' } 
    });

    res.json(doctors);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PROTECTED - Cần token
router.get("/doctors/by-specialization", isAuthenticated, async (req, res) => {
  try {
    const { specialization } = req.query;

    const doctors = await Doctor.find({ 
      specialization: { $regex: specialization, $options: 'i' } 
    });

    res.json(doctors);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PROTECTED - Cần token, Multiple filters
router.get("/doctors", isAuthenticated, async (req, res) => {
  try {
    const { name, specialization, department } = req.query;

    // Xây dựng filter object
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
    if (department) filter.department = { $regex: department, $options: 'i' };

    const doctors = await Doctor.find(filter);
    res.json(doctors);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

---

## 5️⃣ FLOW ĐỦ ĐAY (End-to-End)

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT (Frontend)                         │
│                                                                 │
│  1. User nhập email/password                                   │
│     ↓                                                            │
│  2. POST /api/auth/login                                        │
│     {email: "user@example.com", password: "pass123"}           │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (index.js)                            │
│                    Port 5000                                    │
│                                                                 │
│  3. authController.js → login()                                │
│     ├─ Tìm user trong MongoDB                                  │
│     ├─ Kiểm tra password                                       │
│     ├─ TẠO TOKEN: jwt.sign(                                    │
│     │   {id, role},                                            │
│     │   JWT_SECRET,                                            │
│     │   {expiresIn: "7d"}                                      │
│     │ )                                                        │
│     └─ Response: {token: "eyJhbGc..."}                         │
│                                                                 │
│  4. Client nhận token → Lưu vào localStorage/cookie            │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ↓
             ┌───────────────────┐
             │  Client gửi:      │
             │  /api/doctors/... │
             │  ?token=xyz       │
             └─────────┬─────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│           MIDDLEWARE (isAuthenticated.js)                       │
│                                                                 │
│  5. Lấy token từ req.query.token                               │
│                                                                 │
│  6. jwt.verify(token, JWT_SECRET)                              │
│     ├─ Kiểm tra signature ✅                                   │
│     ├─ Kiểm tra expiration ✅                                  │
│     └─ Extract: {id, role}                                     │
│                                                                 │
│  7. ✅ Valid → req.userId = id, next()                         │
│     ❌ Invalid → Return error                                  │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│            ROUTE HANDLER (doctorRoutes.js)                      │
│                                                                 │
│  8. Xử lý request                                              │
│     ├─ Lấy filter từ query params                              │
│     ├─ Query MongoDB: Doctor.find(filter)                      │
│     └─ Response: [list of doctors]                             │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│              MONGODB (Database)                                 │
│                                                                 │
│  9. Trả về dữ liệu bác sĩ từ collection                         │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ↓
             ┌───────────────────┐
             │  Response JSON:   │
             │  [doctors data]   │
             └───────────────────┘
```

---

## 6️⃣ CÁC API VỢI TOKEN

### API 1: Export (Không cần token)
```
GET http://localhost:5000/api/doctors/export
```

### API 2: By Department (Cần token)
```
GET http://localhost:5000/api/doctors/by-department?token=YOUR_TOKEN&department=Cardiology
```

### API 3: By Specialization (Cần token)
```
GET http://localhost:5000/api/doctors/by-specialization?token=YOUR_TOKEN&specialization=Cardiologist
```

### API 4: Advanced Filters (Cần token)
```
GET http://localhost:5000/api/doctors?token=YOUR_TOKEN&name=Dr&specialization=Cardiologist&department=Cardiology
```

---

## 7️⃣ SECURITY FEATURES

| Feature | Mô tả |
|---------|-------|
| **JWT Expiration** | Token hết hạn sau 7 ngày |
| **Secret Key** | JWT_SECRET dùng để sign/verify token |
| **Middleware Check** | Kiểm tra token trước khi truy cập API |
| **Bcrypt Password** | Password được hash trước khi lưu |
| **HttpOnly Cookie** | Token lưu an toàn trong cookie |
| **CORS** | Chỉ cho phép origin được phép |

---

## 📝 TÓM TẮT

```
✅ Server: Express.js running on port 5000
✅ Database: MongoDB Atlas (hospital collection)
✅ Authentication: JWT token (7 days expiration)
✅ Token Delivery: Query string (?token=...)
✅ Security: Middleware validation + Bcrypt password
✅ APIs: 4 endpoints (1 public, 3 protected)
```

**Đây là kiến trúc RESTful API hoàn chỉnh với authentication! 🚀**
