// Student Controller - Handles all student-related operations (MongoDB / Mongoose)

const { Student, Menu, Rating, Complaint, Attendance, Notification } = require('../models');

// Helper: Get local date string YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ============================================
// 1. GET TODAY'S MENU
// ============================================
// This function fetches the menu for today's date
const getTodaysMenu = async (req, res) => {
  try {
    const today = getLocalDateString();
    const menu = await Menu.findOne({ date: today }).lean();

    if (!menu) {
      return res.status(404).json({ success: false, message: 'No menu available for today' });
    }

    res.status(200).json({ success: true, message: "Today's menu fetched successfully", data: menu });
    
  } catch (error) {
    console.error('Error in getTodaysMenu:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu',
      error: error.message
    });
  }
};

// ============================================
// 2. GET MENU BY DATE
// ============================================
// This function fetches menu for a specific date
const getMenuByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date parameter is required' });

    const menu = await Menu.findOne({ date }).lean();
    if (!menu) return res.status(404).json({ success: false, message: `No menu available for ${date}` });

    res.status(200).json({ success: true, message: 'Menu fetched successfully', data: menu });
    
  } catch (error) {
    console.error('Error in getMenuByDate:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu',
      error: error.message
    });
  }
};

// ============================================
// 3. GET WEEKLY MENU
// ============================================
// Get menu for next 7 days
const getWeeklyMenu = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const todayStr = getLocalDateString(today);
    const nextWeekStr = getLocalDateString(nextWeek);

    const menus = await Menu.find({ date: { $gte: todayStr, $lte: nextWeekStr } }).sort({ date: 1 }).lean();

    res.status(200).json({ success: true, message: 'Weekly menu fetched successfully', count: menus.length, data: menus });
    
  } catch (error) {
    console.error('Error in getWeeklyMenu:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weekly menu',
      error: error.message
    });
  }
};

// ============================================
// 4. SUBMIT RATING
// ============================================
// Student rates a meal (breakfast/lunch/dinner)
const submitRating = async (req, res) => {
  try {
    const { studentId, menuId, mealType, rating, comment } = req.body;
    if (!studentId || !menuId || !mealType || !rating) return res.status(400).json({ success: false, message: 'studentId, menuId, mealType, and rating are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    const validMealTypes = ['breakfast','lunch','snacks','dinner'];
    if (!validMealTypes.includes(mealType)) return res.status(400).json({ success: false, message: 'Invalid meal type' });

    const existing = await Rating.findOne({ student: studentId, menu: menuId, mealType });
    if (existing) return res.status(400).json({ success: false, message: 'You have already rated this meal' });

    const newRating = await Rating.create({ student: studentId, menu: menuId, mealType, rating, comment: comment || '' });
    res.status(201).json({ success: true, message: 'Rating submitted successfully', data: newRating });
    
  } catch (error) {
    console.error('Error in submitRating:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting rating',
      error: error.message
    });
  }
};

// ============================================
// 5. SUBMIT COMPLAINT
// ============================================
// Student submits a complaint about mess
const submitComplaint = async (req, res) => {
  try {
    const { studentId, category, subject, description, priority } = req.body;
    if (!studentId || !category || !subject || !description) return res.status(400).json({ success: false, message: 'studentId, category, subject, and description are required' });
    const validCategories = ['food_quality','hygiene','service','quantity','other'];
    if (!validCategories.includes(category)) return res.status(400).json({ success: false, message: 'Invalid category' });
    if (priority && !['low','medium','high'].includes(priority)) return res.status(400).json({ success: false, message: 'Invalid priority' });

    const newComplaint = await Complaint.create({ student: studentId, category, subject, description, priority: priority || 'medium', status: 'pending' });
    res.status(201).json({ success: true, message: 'Complaint submitted successfully', data: newComplaint });
    
  } catch (error) {
    console.error('Error in submitComplaint:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting complaint',
      error: error.message
    });
  }
};

// ============================================
// 6. GET STUDENT'S COMPLAINTS
// ============================================
// Get all complaints submitted by a student
const getMyComplaints = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) return res.status(400).json({ success: false, message: 'Student ID is required' });
    const complaints = await Complaint.find({ student: studentId }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: complaints.length, data: complaints });
    
  } catch (error) {
    console.error('Error in getMyComplaints:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

// ============================================
// 7. MEAL ATTENDANCE FUNCTIONS
// ============================================

// Mark attendance for a meal
const markMealAttendance = async (req, res) => {
  try {
    const { studentId, date, mealType, status } = req.body;
    if (!studentId || !date || !mealType || !status) return res.status(400).json({ success: false, message: 'studentId, date, mealType, and status are required' });
    const validMealTypes = ['breakfast','lunch','snacks','dinner'];
    if (!validMealTypes.includes(mealType)) return res.status(400).json({ success: false, message: 'Invalid meal type' });
    if (!['present','absent'].includes(status)) return res.status(400).json({ success: false, message: 'Status must be present or absent' });

    const existing = await Attendance.findOneAndUpdate(
      { student: studentId, date, mealType },
      { status, markedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: `Attendance marked as ${status} for ${mealType}`, data: existing });

  } catch (error) {
    console.error('Error in markMealAttendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
};

// Get my attendance history
const getMyAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    if (!studentId) return res.status(400).json({ success: false, message: 'Student ID required' });

    const filter = { student: studentId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const attendance = await Attendance.find(filter).sort({ date: -1 }).lean();
    res.status(200).json({ success: true, count: attendance.length, data: attendance });

  } catch (error) {
    console.error('Error in getMyAttendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
};

// Get today's attendance status for a student
const getTodayAttendanceStatus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const today = getLocalDateString();
    if (!studentId) return res.status(400).json({ success: false, message: 'Student ID required' });

    const attendance = await Attendance.find({ student: studentId, date: today }).lean();
    const mealTypes = ['breakfast','lunch','snacks','dinner'];
    const statusMap = {};
    mealTypes.forEach(type => {
      const rec = (attendance || []).find(a => a.mealType === type);
      statusMap[type] = rec ? rec.status : null;
    });

    res.status(200).json({ success: true, date: today, data: statusMap });

  } catch (error) {
    console.error('Error in getTodayAttendanceStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance status',
      error: error.message
    });
  }
};

// ============================================
// 8. NOTIFICATION FUNCTIONS
// ============================================

// Get all notifications for students
const getNotifications = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const notifications = await Notification.find({ isActive: true }).sort({ createdAt: -1 }).lean();

    // Note: we don't track per-student reads in this migration; return notifications as-is
    res.status(200).json({ success: true, count: notifications.length, data: notifications });

  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Mark notification as read
const markNotificationRead = async (req, res) => {
  try {
    // In this migration we don't implement per-student read-tracking; respond with success
    res.status(200).json({ success: true, message: 'Notification marked as read (no-op in migration)' });

  } catch (error) {
    console.error('Error in markNotificationRead:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    // Simplified unread count: return total active notifications
    const total = await Notification.countDocuments({ isActive: true });
    res.status(200).json({ success: true, data: { total, read: 0, unread: total } });

  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
  getTodaysMenu,
  getMenuByDate,
  getWeeklyMenu,
  submitRating,
  submitComplaint,
  getMyComplaints,
  // Meal Attendance
  markMealAttendance,
  getMyAttendance,
  getTodayAttendanceStatus,
  // Notifications
  getNotifications,
  markNotificationRead,
  getUnreadCount
};
