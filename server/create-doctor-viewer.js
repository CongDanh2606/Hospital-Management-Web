import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config({ path: "./ok.env" });

const createDoctorViewerUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hospital");
    console.log("✅ Connected to MongoDB");

    // Check if user exists
    const existingUser = await User.findOne({
      email: "doctorviewer@example.com",
    });

    if (existingUser) {
      console.log("⚠️ Doctor Viewer user already exists!");
      console.log(`📧 Email: ${existingUser.email}`);
      console.log(`👤 Role: ${existingUser.role}`);
      await mongoose.disconnect();
      return;
    }

    // Create new doctor_viewer user
    const newUser = new User({
      name: "Doctor List Viewer",
      email: "doctorviewer@example.com",
      password: "password123",
      role: "doctor_viewer",
      isAccountVerified: true,
    });

    await newUser.save();
    console.log("✅ Doctor Viewer user created successfully!");
    console.log("\n📋 Doctor Viewer User Details:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email: ${newUser.email}`);
    console.log(`🔐 Password: password123`);
    console.log(`👤 Role: ${newUser.role}`);
    console.log(`✅ Verified: ${newUser.isAccountVerified}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("\n🎯 Permissions:");
    console.log("✅ Can READ doctor list");
    console.log("❌ Cannot modify doctors");
    console.log("❌ Cannot see medicines");
    console.log("❌ Cannot see appointments");
    console.log("❌ Cannot see lab/surgery");
    console.log("❌ Cannot see other tables");

    console.log("\n📝 Test login:");
    console.log("POST /api/auth/login");
    console.log('Body: {"email":"doctorviewer@example.com","password":"password123"}');

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createDoctorViewerUser();
