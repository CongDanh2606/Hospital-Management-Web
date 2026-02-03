// MongoDB - Tạo user chỉ đọc
// Chạy trong MongoDB Compass hoặc mongosh

// Bước 1: Switch sang admin database
use admin;

// Bước 2: Tạo user read-only cho hospital database
db.createUser({
  user: "viewer_user",
  pwd: "viewer123456",
  roles: [
    {
      role: "read",
      db: "hospital"  // ← Chỉ đọc database hospital
    }
  ]
});

// Kiểm tra user vừa tạo
db.getUser("viewer_user");

// Connection string cho user này:
// mongodb+srv://viewer_user:viewer123456@cluster0.tke6n1k.mongodb.net/hospital

/*
GIẢI THÍCH:
- role: "read" → Chỉ được đọc, không được INSERT, UPDATE, DELETE
- db: "hospital" → Chỉ cho phép trên database hospital
- Nếu muốn giới hạn trên collection: dùng "role: readAnyDatabase" hoặc custom role
*/
