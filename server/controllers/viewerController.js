// server/controllers/viewerController.js
// Tạo user "viewer" - chỉ được đọc

import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const createViewerUser = async (req, res) => {
  console.log("📝 [CREATE VIEWER] Request received");
  console.log("Body:", req.body);
  
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    console.log("❌ [CREATE VIEWER] Missing fields");
    return res.json({ 
      success: false, 
      message: "All fields are required" 
    });
  }

  try {
    console.log("🔍 [CREATE VIEWER] Checking existing user:", email);
    
    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ [CREATE VIEWER] User already exists");
      return res.json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    console.log("➕ [CREATE VIEWER] Creating new viewer user");
    
    // Tạo user mới với role = "viewer"
    const newUser = new User({
      name,
      email,
      password,
      role: "viewer"  // ← Role là "viewer"
    });
    
    console.log("💾 [CREATE VIEWER] Saving to database...");
    await newUser.save();
    console.log("✅ [CREATE VIEWER] User saved successfully!");

    // Tạo token
    const token = jwt.sign(
      { 
        id: newUser._id, 
        role: "viewer"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, { httpOnly: true });
    
    console.log("🎉 [CREATE VIEWER] Sending success response");
    return res.json({
      success: true,
      message: "Viewer account created successfully",
      token,
      role: "viewer",
      permissions: {
        doctors: "READ ONLY - Cannot modify",
        medicine: "No access",
        checkup: "No access",
        surgery: "No access"
      }
    });

  } catch (err) {
    console.error("❌ [CREATE VIEWER] ERROR:", err.message);
    console.error("Stack:", err.stack);
    return res.json({ 
      success: false, 
      message: "Error: " + err.message 
    });
  }
};

// Tạo endpoint để tạo viewer
// POST /api/auth/create-viewer
// Body: {name, email, password}
