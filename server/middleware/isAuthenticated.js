import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    // Check token from multiple sources:
    // 1. Query string (?token=...)
    // 2. Cookies
    // 3. Authorization header (Bearer token)
    
    let token = req.query?.token || req.cookies?.token;
    
    // If no token in query/cookies, check Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.json({ success: false, message: "Unauthorized - Token required" });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.userId = tokenDecode.id;
      req.userRole = tokenDecode.role;
      next();
    } else {
      return res.json({ success: false, message: "Unauthorized - Invalid token" });
    }
  } catch (err) {
    console.log("Auth error:", err.message);
    return res.json({ success: false, message: "Invalid or expired token" });
  }
};

export default isAuthenticated;
