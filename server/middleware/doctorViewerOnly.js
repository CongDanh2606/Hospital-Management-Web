// Middleware to restrict doctor_viewer role to only doctor endpoints
// doctor_viewer can:
// - Read doctor data (GET /api/doctors/*)
// - Cannot modify anything (no POST/PUT/DELETE)
// - Cannot access other tables (medicines, appointments, etc.)

export const doctorViewerOnly = (req, res, next) => {
  try {
    const userRole = req.userRole;

    // If user is not doctor_viewer, pass through
    if (!userRole || userRole !== "doctor_viewer") {
      return next();
    }

    // Doctor viewer role rules
    const isAllowedPath = req.path.startsWith("/api/doctors");
    const isGetRequest = req.method === "GET";

    // Allow: GET requests to /api/doctors/* paths
    if (isAllowedPath && isGetRequest) {
      return next();
    }

    // Block: Everything else
    return res.status(403).json({
      code: 4,
      message: "Access denied - Doctor Viewer can only read doctor list",
      success: false,
    });
  } catch (error) {
    console.error("❌ Doctor Viewer Middleware Error:", error);
    return res.status(500).json({
      code: 5,
      message: "Server error in access control",
      success: false,
    });
  }
};

export default doctorViewerOnly;
