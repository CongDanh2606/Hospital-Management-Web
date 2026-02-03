# Multi-Database Viewer

Web application để xem dữ liệu từ 2 databases:
- **Hospital Database**: Xem danh sách doctors
- **Ecommerce Database**: Xem danh sách products

## 🚀 Cách chạy

### 1. Cài đặt dependencies
```bash
cd database-viewer
npm install
```

### 2. Chạy server
```bash
npm start
```

### 3. Mở trình duyệt
```
http://localhost:3000
```

## 📁 Cấu trúc

```
database-viewer/
├── server.js           # Backend Express server
├── package.json        # Dependencies
├── .env               # Database connection strings
└── public/
    ├── index.html     # Frontend UI
    ├── style.css      # Styling
    └── app.js         # JavaScript logic
```

## 🔌 API Endpoints

- `GET /api/health` - Kiểm tra kết nối database
- `GET /api/doctors` - Lấy danh sách doctors từ Hospital DB
- `GET /api/products` - Lấy danh sách products từ Ecommerce DB

## 🔒 Databases

### Hospital Database (Read-only)
- User: readonly_user
- Database: hospital
- Collection: doctors

### Ecommerce Database (Read-only)
- User: viewer_produucts
- Database: ecommerce
- Collection: products

## ✨ Features

- ✅ Kết nối đồng thời 2 MongoDB databases
- ✅ Giao diện web đẹp, responsive
- ✅ Real-time connection status
- ✅ Tab switching giữa Doctors và Products
- ✅ Auto-refresh data
- ✅ Error handling

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB (2 connections)
- **Frontend**: HTML + CSS + Vanilla JavaScript
- **ORM**: Mongoose
