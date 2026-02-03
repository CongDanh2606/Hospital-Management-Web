// server/middleware/roleBasedAccess.js
// Kiểm tra quyền hạn dựa trên role

export const canReadDoctors = (req, res, next) => {
  // Cho phép: user, admin, viewer
  const allowedRoles = ["user", "admin", "viewer"];
  if (allowedRoles.includes(req.userRole)) {
    next();
  } else {
    res.json({ success: false, message: "No permission to read" });
  }
};

export const canModifyDoctors = (req, res, next) => {
  // Chỉ admin được sửa/xóa
  if (req.userRole === "admin") {
    next();
  } else {
    res.json({ success: false, message: "Only admin can modify doctors" });
  }
};

export const canReadUsers = (req, res, next) => {
  // Chỉ admin được đọc user list
  if (req.userRole === "admin") {
    next();
  } else {
    res.json({ success: false, message: "No permission to read users" });
  }
};

export const viewerReadOnly = (req, res, next) => {
  // Viewer chỉ được read
  if (req.userRole === "viewer") {
    // Kiểm tra method - nếu không phải GET thì reject
    if (req.method !== "GET") {
      return res.json({ 
        success: false, 
        message: "Viewer can only read (GET), not modify" 
      });
    }
  }
  next();
};
