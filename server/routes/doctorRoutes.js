import express from "express";
import Doctor from "../models/doctor.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { canReadDoctors, canModifyDoctors, viewerReadOnly } from "../middleware/roleBasedAccess.js";

const router = express.Router();

// ==================== API 1: Export doctors as JSON file ====================
// No authentication required
// GET /api/doctors/export
// Returns: JSON file download
router.get("/doctors/export", async (req, res) => {
	try {
		const doctors = await Doctor.find({});
		
		// Set response headers for file download
		res.setHeader("Content-Type", "application/json");
		res.setHeader("Content-Disposition", "attachment; filename=doctors.json");
		
		res.json(doctors);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ==================== API 2: Get doctors by department ====================
// Protected: Requires authentication token in query string
// GET /api/doctors/by-department?token=xxx&department=Cardiology
// Query parameters:
//   - token: JWT token (required)
//   - department: Department name (required)
// Returns: List of doctors in that department
router.get("/doctors/by-department", isAuthenticated, canReadDoctors, viewerReadOnly, async (req, res) => {
	try {
		const { department } = req.query;
		
		if (!department) {
			return res.status(400).json({ 
				success: false, 
				message: "Department parameter is required" 
			});
		}

		const doctors = await Doctor.find({ department: department });
		res.status(200).json({
			success: true,
			count: doctors.length,
			department: department,
			data: doctors
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ==================== API 3: Get doctors by specialization ====================
// Protected: Requires authentication token in query string
// GET /api/doctors/by-specialization?token=xxx&specialization=Cardiology
// Query parameters:
//   - token: JWT token (required)
//   - specialization: Specialization name (required)
// Returns: List of doctors with that specialization
router.get("/doctors/by-specialization", isAuthenticated, canReadDoctors, viewerReadOnly, async (req, res) => {
	try {
		const { specialization } = req.query;
		
		if (!specialization) {
			return res.status(400).json({ 
				success: false, 
				message: "Specialization parameter is required" 
			});
		}

		const doctors = await Doctor.find({ specialization: specialization });
		res.status(200).json({
			success: true,
			count: doctors.length,
			specialization: specialization,
			data: doctors
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ==================== API 4: Get all doctors with filters ====================
// Protected: Get list of doctors (requires authentication token in query string)
// Query parameters:
//   - token: JWT token (required)
//   - specialization: Filter by specialization (optional)
//   - name: Filter by doctor name (optional)
//   - department: Filter by department (optional)
// 
// Example: GET /api/doctors?token=abc123&specialization=Cardiology&name=John
router.get("/doctors", isAuthenticated, canReadDoctors, viewerReadOnly, async (req, res) => {
	try {
		const { specialization, name, department } = req.query;
		const filter = {};

		if (specialization) filter.specialization = specialization;
		if (name) filter.name = { $regex: name, $options: "i" };
		if (department) filter.department = department;

		const doctors = await Doctor.find(filter);
		res.status(200).json({
			success: true,
			count: doctors.length,
			data: doctors
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ==================== API 5: CREATE NEW DOCTOR ====================
// Protected: Admin only
// POST /api/doctors/create?token=xxx
// Body: {name, specialization, department, Experience, availability, photoUrl}
// Returns: {code: 0-5, message, data}
router.post("/doctors/create", isAuthenticated, async (req, res) => {
	try {
		// Kiểm tra quyền - chỉ admin được tạo
		if (req.userRole !== "admin") {
			return res.json({
				code: 4,
				message: "No permission - Only admin can create doctors",
				success: false
			});
		}

		const { name, specialization, department, Experience, availability, photoUrl } = req.body;

		// Kiểm tra dữ liệu bắt buộc
		if (!name || !specialization || !department) {
			return res.json({
				code: 1,
				message: "Missing required data: name, specialization, department",
				success: false
			});
		}

		// Kiểm tra xem bác sĩ đã tồn tại chưa (theo tên)
		const existingDoctor = await Doctor.findOne({ name });
		if (existingDoctor) {
			return res.json({
				code: 2,
				message: "Doctor with this name already exists",
				success: false
			});
		}

		// Tìm ID lớn nhất hiện có
		const lastDoctor = await Doctor.findOne().sort({ id: -1 });
		const newId = lastDoctor ? lastDoctor.id + 1 : 1;

		// Tạo bác sĩ mới
		const newDoctor = new Doctor({
			id: newId,
			name,
			specialization,
			department,
			Experience: Experience || "N/A",
			availability: availability || "Mon-Fri",
			photoUrl: photoUrl || "https://via.placeholder.com/150"
		});

		await newDoctor.save();

		return res.json({
			code: 0,
			message: "Doctor created successfully",
			success: true,
			data: {
				id: newDoctor.id,
				name: newDoctor.name,
				specialization: newDoctor.specialization,
				department: newDoctor.department,
				Experience: newDoctor.Experience,
				availability: newDoctor.availability
			}
		});

	} catch (err) {
		console.error("Create doctor error:", err);
		res.json({
			code: 5,
			message: "Database error: " + err.message,
			success: false
		});
	}
});

export default router;

