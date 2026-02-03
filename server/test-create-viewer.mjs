// TEST: Simple create viewer
import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config({ path: "./ok.env" });

const testCreateViewer = async () => {
  try {
    // Connect to MongoDB first
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected!");
    
    console.log("Creating viewer...");
    
    const newUser = new User({
      name: "Test Viewer",
      email: "testviewer123@example.com",
      password: "password123",
      role: "viewer"
    });
    
    console.log("User object:", newUser);
    await newUser.save();
    console.log("✅ Viewer created successfully!");
    
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error("Full error:", err);
  }
  
  process.exit();
};

testCreateViewer();
