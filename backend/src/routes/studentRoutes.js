// Student Routes - Define URL endpoints for student operations

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "smartmess_fallback_secret";

// Import controller functions
const {
  getTodaysMenu,
  getMenuByDate,
  getWeeklyMenu,
  submitRating,
  submitComplaint,
  getMyComplaints,
  markMealAttendance,
  getMyAttendance,
  getTodayAttendanceStatus,
  getNotifications,
  markNotificationRead,
  getUnreadCount
} = require('../controllers/studentController');

// Auth middleware to get user from token
const authMiddleware = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ============================================
// MENU ROUTES
// ============================================

// GET /api/student/menu/today - Get today's menu
// No parameters needed
router.get('/menu/today', getTodaysMenu);

// GET /api/student/menu?date=2026-02-03 - Get menu by specific date
// Query parameter: date (YYYY-MM-DD format)
router.get('/menu', getMenuByDate);

// GET /api/student/menu/weekly - Get menu for next 7 days
// No parameters needed
router.get('/menu/weekly', getWeeklyMenu);

// ============================================
// RATING ROUTES
// ============================================

// POST /api/student/rating - Submit a rating for a meal
// Request body:
// {
//   "studentId": "uuid-here",
//   "menuId": "uuid-here",
//   "mealType": "breakfast",  // or lunch, snacks, dinner
//   "rating": 4,              // 1 to 5
//   "comment": "Good food"    // optional
// }
router.post('/rating', submitRating);

// ============================================
// COMPLAINT ROUTES (for /api/student/...)
// ============================================

// POST /api/student/complaint - Submit a complaint (legacy)
router.post('/complaint', authMiddleware, submitComplaint);

// GET /api/student/complaints/:studentId - Get all complaints by a student (legacy)
router.get('/complaints/:studentId', getMyComplaints);

// ============================================
// NOTIFICATION ROUTES (must be before /:id catch-all)
// ============================================

// GET /api/student/notifications/unread-count - Get unread count (must be before :notificationId)
router.get('/notifications/unread-count', authMiddleware, getUnreadCount);

// GET /api/student/notifications - Get all notifications
router.get('/notifications', authMiddleware, getNotifications);

// PUT /api/student/notifications/:notificationId/read - Mark as read
router.put('/notifications/:notificationId/read', authMiddleware, markNotificationRead);

// ============================================
// MEAL ATTENDANCE ROUTES
// ============================================

// POST /api/student/attendance - Mark attendance for a meal
router.post('/attendance', authMiddleware, markMealAttendance);

// GET /api/student/attendance/today/:studentId - Get today's attendance status (MUST be before /:studentId)
router.get('/attendance/today/:studentId', authMiddleware, getTodayAttendanceStatus);

// GET /api/student/attendance/:studentId - Get attendance history (catch-all, must be last)
router.get('/attendance/:studentId', authMiddleware, getMyAttendance);

// ============================================
// COMPLAINT ROUTES (for /api/complaints/... alias)
// ============================================

// POST /api/complaints - Submit a new complaint (frontend expects this)
router.post('/', authMiddleware, submitComplaint);

// GET /api/complaints/my-complaints - Get logged-in user's complaints
router.get('/my-complaints', authMiddleware, async (req, res) => {
  // Call getMyComplaints with the user id from token
  req.params.studentId = req.user.id;
  return getMyComplaints(req, res);
});

// GET /api/complaints/:id - Get a specific complaint (MUST be last - catches all single-segment routes)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { Complaint } = require('../models');
    const complaint = await Complaint.findById(req.params.id).lean();
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export the router
module.exports = router;
