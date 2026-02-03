// server/index.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import multer from "multer";

import Medicine from "./models/medicines.js";
import LabAppointment from "./models/lab.js";
import CheckupAppointment from "./models/checkup.js";
import Surgery from "./models/surgery.js";

import authRoutes from "./routes/authRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import isAuthenticated from "./middleware/isAuthenticated.js";
import doctorViewerOnly from "./middleware/doctorViewerOnly.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "midcity_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});

// API Documentation
app.get("/docs", (req, res) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hospital Management API Documentation</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
          padding: 20px;
          min-height: 100vh;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 10px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 {
          color: #667eea;
          margin-bottom: 10px;
          text-align: center;
        }
        .subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 30px;
          font-size: 14px;
        }
        .url-box {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 30px;
          border-left: 4px solid #667eea;
        }
        .url-box code {
          background: #fff;
          padding: 10px;
          border-radius: 3px;
          display: block;
          overflow-x: auto;
          font-size: 14px;
          color: #667eea;
        }
        .api-section {
          margin-bottom: 30px;
        }
        .api-item {
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          padding: 20px;
          margin-bottom: 15px;
          transition: all 0.3s ease;
        }
        .api-item:hover {
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }
        .method {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 3px;
          font-weight: bold;
          font-size: 12px;
          margin-right: 10px;
        }
        .get { background: #61affe; color: white; }
        .post { background: #49cc90; color: white; }
        .put { background: #fca130; color: white; }
        .delete { background: #f93e3e; color: white; }
        .endpoint {
          font-family: 'Courier New', monospace;
          background: white;
          padding: 8px 12px;
          border-radius: 3px;
          margin: 10px 0;
          color: #667eea;
          font-weight: bold;
          word-break: break-all;
        }
        .auth {
          display: inline-block;
          padding: 3px 8px;
          background: #fff3cd;
          color: #856404;
          border-radius: 3px;
          font-size: 12px;
          margin-left: 10px;
        }
        .public {
          display: inline-block;
          padding: 3px 8px;
          background: #d4edda;
          color: #155724;
          border-radius: 3px;
          font-size: 12px;
          margin-left: 10px;
        }
        .description {
          color: #666;
          margin-top: 10px;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          color: #999;
          font-size: 12px;
        }
        .copy-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
        }
        .copy-btn:hover { background: #764ba2; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏥 Hospital Management API</h1>
        <p class="subtitle">Base URL: <strong>${process.env.BASE_URL || req.protocol + '://' + req.get('host')}</strong></p>
        
        <div class="url-box">
          <strong>Base URL for requests:</strong>
          <code>${process.env.BASE_URL || req.protocol + '://' + req.get('host')}</code>
        </div>

        <div class="api-section">
          <h2>📋 Public Endpoints (No Auth Required)</h2>

          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">/</span>
            <span class="public">PUBLIC</span>
            <p class="description">Health check - Backend status</p>
          </div>

          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">/api/contact</span>
            <span class="public">PUBLIC</span>
            <p class="description">Send contact message</p>
            <p class="description"><strong>Body:</strong> { "name": "...", "email": "...", "message": "..." }</p>
          </div>

          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">/api/auth/register</span>
            <span class="public">PUBLIC</span>
            <p class="description">User registration</p>
            <p class="description"><strong>Body:</strong> { "email": "...", "password": "...", "name": "..." }</p>
          </div>

          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">/api/auth/login</span>
            <span class="public">PUBLIC</span>
            <p class="description">User login</p>
            <p class="description"><strong>Body:</strong> { "email": "...", "password": "..." }</p>
            <p class="description"><strong>Returns:</strong> JWT token</p>
          </div>

          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">/api/doctors</span>
            <span class="public">PUBLIC</span>
            <p class="description">Get all doctors (basic info)</p>
          </div>

          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">/api/doctors/export</span>
            <span class="public">PUBLIC</span>
            <p class="description">Export all doctors as JSON</p>
          </div>

          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">/api/labs/book</span>
            <span class="public">PUBLIC</span>
            <p class="description">Book a lab appointment</p>
          </div>

          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">/api/checkup/book</span>
            <span class="public">PUBLIC</span>
            <p class="description">Book a checkup appointment</p>
          </div>

          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">/api/surgery/book</span>
            <span class="public">PUBLIC</span>
            <p class="description">Book a surgery appointment (multipart form with file)</p>
          </div>
        </div>

        <div class="api-section">
          <h2>🔒 Protected Endpoints (Require JWT Token)</h2>
          <p style="margin-bottom: 15px; color: #666;">Send token in Authorization header: <code>Authorization: Bearer YOUR_TOKEN</code></p>

          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">/api/doctors/by-department?department=Cardiology</span>
            <span class="auth">AUTH REQUIRED</span>
            <p class="description">Get doctors by department</p>
          </div>

          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">/api/admin/appointments</span>
            <span class="auth">AUTH REQUIRED</span>
            <p class="description">Get all appointments (admin only)</p>
          </div>

          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">/api/admin/medicines</span>
            <span class="auth">AUTH REQUIRED</span>
            <p class="description">Manage medicines (admin only)</p>
          </div>

          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">/api/auth/send-verify-otp</span>
            <span class="auth">AUTH REQUIRED</span>
            <p class="description">Send OTP verification email</p>
          </div>

          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">/api/auth/logout</span>
            <span class="auth">AUTH REQUIRED</span>
            <p class="description">User logout</p>
          </div>
        </div>

        <div class="api-section">
          <h2>🔑 Getting Started</h2>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; line-height: 1.8;">
            <strong>Step 1:</strong> Register a new account<br>
            <code style="display: block; background: white; padding: 10px; border-radius: 3px; margin: 10px 0; overflow-x: auto;">
              POST /api/auth/register<br>
              { "email": "user@example.com", "password": "password123", "name": "John Doe" }
            </code>
            <strong>Step 2:</strong> Login to get JWT token<br>
            <code style="display: block; background: white; padding: 10px; border-radius: 3px; margin: 10px 0; overflow-x: auto;">
              POST /api/auth/login<br>
              { "email": "user@example.com", "password": "password123" }
            </code>
            <strong>Step 3:</strong> Use token for protected endpoints<br>
            <code style="display: block; background: white; padding: 10px; border-radius: 3px; margin: 10px 0; overflow-x: auto;">
              Authorization: Bearer YOUR_JWT_TOKEN
            </code>
          </div>
        </div>

        <div class="footer">
          <p>✨ Hospital Management System - API Documentation</p>
          <p>Deploy on Render | Last Updated: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  res.send(htmlContent);
});

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
console.log("Connecting to MongoDB URI:", mongoURI);

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(" MongoDB Error:", err));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/medicines", isAuthenticated, doctorViewerOnly, medicineRoutes);
app.use("/api/admin", isAuthenticated, doctorViewerOnly, adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api", isAuthenticated, doctorViewerOnly, emergencyRoutes);
app.use("/api", doctorRoutes);

// Doctors route moved to routes/doctorRoutes.js (public)

// Lab booking
app.post("/api/labs/book", async (req, res) => {
  try {
    console.log("Booking data:", req.body);
    const newAppointment = new LabAppointment(req.body);
    await newAppointment.save();
    res.status(201).json({ message: "Appointment booked successfully!" });
  } catch (err) {
    console.error("Error saving appointment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Checkup booking
app.post("/api/checkup/book", async (req, res) => {
  try {
    const newAppointment = new CheckupAppointment(req.body);
    await newAppointment.save();
    res.status(201).json({ message: "Appointment booked successfully!" });
  } catch (err) {
    console.error("Error booking checkup appointment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Surgery booking
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

app.post("/api/surgery/book", upload.single("prescription"), async (req, res) => {
  try {
    const { name, email, phone, doctor, surgeryType, date } = req.body;
    const prescriptionFileName = req.file?.filename || null;

    const newSurgery = new Surgery({
      name,
      email,
      phone,
      doctor,
      surgeryType,
      date,
      prescriptionFileName,
    });

    await newSurgery.save();
    res.status(201).json({ message: "Surgery appointment booked successfully" });
  } catch (err) {
    console.error("Error booking surgery:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
