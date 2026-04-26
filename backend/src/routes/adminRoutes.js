// Admin Routes - Define URL endpoints for admin operations

const express = require("express");
const router = express.Router();

// Import controller functions
const {
  getDashboardStats,
  addStudent,
  verifyStudent,
  getAllStudents,
  deleteStudent,
  toggleStudentStatus,
  addMenu,
  updateMenu,
  deleteMenu,
  getAllRatings,
  getRatingStats,
  getAllComplaints,
  updateComplaintStatus,
  sendNotification,
  getNotifications,
  deleteNotification,
  getMealAttendance,
  getAttendanceStats,
} = require("../controllers/adminController");

// ============================================
// DASHBOARD ROUTES
// ============================================

// GET /api/admin/stats - Get dashboard statistics
router.get("/stats", getDashboardStats);

// ============================================
// STUDENT MANAGEMENT ROUTES
// ============================================

// POST /api/admin/students - Add new student
router.post("/students", addStudent);

// GET /api/admin/students - Get all students
router.get("/students", getAllStudents);

// PUT /api/admin/students/:studentId/verify - Verify a student
router.put("/students/:studentId/verify", verifyStudent);

// PUT /api/admin/students/:studentId/toggle-status - Toggle student active status
router.put("/students/:studentId/toggle-status", toggleStudentStatus);

// DELETE /api/admin/students/:studentId - Delete a student
router.delete("/students/:studentId", deleteStudent);

// ============================================
// MENU MANAGEMENT ROUTES
// ============================================

// POST /api/admin/menu - Add menu for a date
router.post("/menu", addMenu);

// PUT /api/admin/menu/:menuId - Update a menu
router.put("/menu/:menuId", updateMenu);

// DELETE /api/admin/menu/:menuId - Delete a menu
router.delete("/menu/:menuId", deleteMenu);

// ============================================
// RATINGS ROUTES
// ============================================

// GET /api/admin/ratings - Get all ratings
router.get("/ratings", getAllRatings);

// GET /api/admin/ratings/stats - Get rating statistics
router.get("/ratings/stats", getRatingStats);

// ============================================
// COMPLAINTS ROUTES
// ============================================

// GET /api/admin/complaints - Get all complaints
router.get("/complaints", getAllComplaints);

// PUT /api/admin/complaints/:complaintId - Update complaint status
router.put("/complaints/:complaintId", updateComplaintStatus);

// ============================================
// NOTIFICATIONS ROUTES
// ============================================

// POST /api/admin/notifications - Send notification
router.post("/notifications", sendNotification);

// GET /api/admin/notifications - Get all notifications
router.get("/notifications", getNotifications);

// DELETE /api/admin/notifications/:notificationId - Delete notification
router.delete("/notifications/:notificationId", deleteNotification);

// ============================================
// ATTENDANCE ROUTES
// ============================================

// GET /api/admin/attendance - Get meal attendance
router.get("/attendance", getMealAttendance);

// GET /api/admin/attendance/stats - Get attendance statistics
router.get("/attendance/stats", getAttendanceStats);

// Export the router
module.exports = router;
