import express from "express";
import {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyOtp,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
  googleLogin,
} from "../controllers/authController.js";
import { createViewerUser } from "../controllers/viewerController.js";
import userAuth from "../middleware/isAuthenticated.js";
import passport from "passport";

const authRouter = express.Router();

// Auth routes
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/create-viewer", createViewerUser);  // ← Tạo viewer user
authRouter.get("/test-viewer", (req, res) => {  // ← Test endpoint
  res.json({ success: true, message: "Viewer route works!" });
});
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-otp", userAuth, verifyOtp);
authRouter.get("/is-auth", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/google-login", googleLogin);

// Google OAuth routes
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

export default authRouter;
