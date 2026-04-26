// Admin Controller - Handles all admin-related operations (MongoDB / Mongoose)

const bcrypt = require('bcryptjs');
const { Student, Admin, Menu, Rating, Complaint, Attendance, Notification } = require('../models');

// ============================================
// HELPER: Get local date string (YYYY-MM-DD format)
// This avoids UTC timezone issues
// ============================================
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ============================================
// DASHBOARD STATS
// ============================================
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const verifiedStudents = await Student.countDocuments({ isVerified: true });
    const totalRatings = await Rating.countDocuments();
    const ratingAgg = await Rating.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]);
    const avgRating = ratingAgg[0] ? ratingAgg[0].avg : 0;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const todayRatings = await Rating.countDocuments({ createdAt: { $gte: new Date(`${todayStr}T00:00:00Z`), $lt: new Date(`${todayStr}T23:59:59Z`) } });
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const totalMenus = await Menu.countDocuments();

    res.json({ success: true, data: { totalStudents, verifiedStudents, totalRatings, avgRating: Number(avgRating).toFixed(1), todayRatings, pendingComplaints, totalMenus } });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

// ============================================
// STUDENT MANAGEMENT
// ============================================
const addStudent = async (req, res) => {
  try {
    const { name, email, rollNumber, password, hostelName, roomNumber, phoneNumber } = req.body;
    if (!name || !email || !rollNumber || !password || !hostelName || !roomNumber || !phoneNumber) return res.status(400).json({ success: false, message: 'All fields are required' });

    const exists = await Student.findOne({ $or: [ { email }, { rollNumber } ] });
    if (exists) return res.status(400).json({ success: false, message: 'Student with this email or roll number already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await Student.create({ name, email, rollNumber, password: hashedPassword, hostelName, roomNumber, phoneNumber, isVerified: false, isActive: true });
    res.status(201).json({ success: true, message: 'Student added successfully', data: { id: created._id, name: created.name, email: created.email, rollNumber: created.rollNumber, isVerified: created.isVerified } });
  } catch (error) {
    console.error("Error in addStudent:", error);
    res.status(500).json({
      success: false,
      message: "Error adding student",
      error: error.message,
    });
  }
};

const verifyStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (student.isVerified) return res.status(400).json({ success: false, message: 'Student already verified' });
    student.isVerified = true;
    await student.save();
    res.json({ success: true, message: 'Student verified successfully', data: { id: student._id, name: student.name, email: student.email, isVerified: student.isVerified } });
  } catch (error) {
    console.error("Error in verifyStudent:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying student",
      error: error.message,
    });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const { verified } = req.query;
    const filter = {};
    if (verified !== undefined) filter.isVerified = verified === 'true';
    const students = await Student.find(filter).sort({ createdAt: -1 }).lean();
    const studentsWithRatings = await Promise.all(students.map(async s => {
      const count = await Rating.countDocuments({ student: s._id });
      return { ...s, ratingsCount: count };
    }));
    res.json({ success: true, count: students.length, data: studentsWithRatings });
  } catch (error) {
    console.error("Error in getAllStudents:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message,
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    await Student.findByIdAndDelete(studentId);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error("Error in deleteStudent:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting student",
      error: error.message,
    });
  }
};

const toggleStudentStatus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    student.isActive = !student.isActive;
    await student.save();
    res.json({ success: true, message: `Student ${student.isActive ? 'activated' : 'deactivated'} successfully`, data: student });
  } catch (error) {
    console.error("Error in toggleStudentStatus:", error);
    res.status(500).json({
      success: false,
      message: "Error updating student status",
      error: error.message,
    });
  }
};

// ============================================
// MENU MANAGEMENT
// ============================================
const addMenu = async (req, res) => {
  try {
    const { date, day, breakfast, lunch, snacks, dinner, specialNote } = req.body;
    if (!date || !day) return res.status(400).json({ success: false, message: 'Date and day are required' });
    const menuData = { date, day, breakfast: Array.isArray(breakfast) ? breakfast : [], lunch: Array.isArray(lunch) ? lunch : [], snacks: Array.isArray(snacks) ? snacks : [], dinner: Array.isArray(dinner) ? dinner : [], specialNote: specialNote || '' };
    if (req.user && req.user.id) menuData.addedBy = req.user.id;

    const existing = await Menu.findOne({ date });
    if (existing) {
      Object.assign(existing, { ...menuData, updatedAt: new Date() });
      await existing.save();
      return res.json({ success: true, message: 'Menu updated successfully', data: existing });
    }

    const created = await Menu.create(menuData);
    res.status(201).json({ success: true, message: 'Menu added successfully', data: created });
  } catch (error) {
    console.error("Error in addMenu:", error);
    res.status(500).json({
      success: false,
      message: "Error adding menu",
      error: error.message,
    });
  }
};

const updateMenu = async (req, res) => {
  try {
    const { menuId } = req.params;
    const { breakfast, lunch, snacks, dinner, specialNote } = req.body;
    const menu = await Menu.findById(menuId);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    menu.breakfast = breakfast || menu.breakfast;
    menu.lunch = lunch || menu.lunch;
    menu.snacks = snacks || menu.snacks;
    menu.dinner = dinner || menu.dinner;
    menu.specialNote = specialNote || menu.specialNote;
    await menu.save();
    res.json({ success: true, message: 'Menu updated successfully', data: menu });
  } catch (error) {
    console.error("Error in updateMenu:", error);
    res.status(500).json({
      success: false,
      message: "Error updating menu",
      error: error.message,
    });
  }
};

const deleteMenu = async (req, res) => {
  try {
    const { menuId } = req.params;
    await Menu.findByIdAndDelete(menuId);
    res.json({ success: true, message: 'Menu deleted successfully' });
  } catch (error) {
    console.error("Error in deleteMenu:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting menu",
      error: error.message,
    });
  }
};

// ============================================
// RATINGS MANAGEMENT
// ============================================
const getAllRatings = async (req, res) => {
  try {
    const { mealType, startDate, endDate, limit = 50 } = req.query;
    const filter = {};
    if (mealType) filter.mealType = mealType;
    if (startDate || endDate) filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);

    const ratings = await Rating.find(filter).limit(parseInt(limit)).sort({ createdAt: -1 }).populate('student', 'name email rollNumber').populate('menu', 'date day').lean();
    res.json({ success: true, count: ratings.length, data: ratings });
  } catch (error) {
    console.error("Error in getAllRatings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ratings",
      error: error.message,
    });
  }
};

const getRatingStats = async (req, res) => {
  try {
    const mealTypes = ['breakfast','lunch','snacks','dinner'];
    const stats = {};
    for (const type of mealTypes) {
      const list = await Rating.find({ mealType: type }).lean();
      const avg = list.length ? (list.reduce((s,r)=>s+r.rating,0)/list.length) : 0;
      stats[type] = { count: list.length, average: Number(avg).toFixed(1), distribution: { 1: list.filter(r=>r.rating===1).length, 2: list.filter(r=>r.rating===2).length, 3: list.filter(r=>r.rating===3).length, 4: list.filter(r=>r.rating===4).length, 5: list.filter(r=>r.rating===5).length } };
    }
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error in getRatingStats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rating stats",
      error: error.message,
    });
  }
};

// ============================================
// COMPLAINTS MANAGEMENT
// ============================================
const getAllComplaints = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).populate('student', 'name email rollNumber hostelName roomNumber').lean();
    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    console.error("Error in getAllComplaints:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching complaints",
      error: error.message,
    });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, adminResponse } = req.body;
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (status) complaint.status = status;
    if (adminResponse) complaint.adminResponse = adminResponse;
    if (status === 'resolved') complaint.resolvedAt = new Date();
    await complaint.save();
    res.json({ success: true, message: 'Complaint updated successfully', data: complaint });
  } catch (error) {
    console.error("Error in updateComplaintStatus:", error);
    res.status(500).json({
      success: false,
      message: "Error updating complaint",
      error: error.message,
    });
  }
};

// ============================================
// NOTIFICATIONS (Database implementation)
// ============================================

const sendNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message are required' });
    const notification = await Notification.create({ title, message, type: type || 'info', targetAudience: 'all', isActive: true });
    res.status(201).json({ success: true, message: 'Notification sent successfully', data: notification });
  } catch (error) {
    console.error("Error in sendNotification:", error);
    res.status(500).json({
      success: false,
      message: "Error sending notification",
      error: error.message,
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    console.error("Error in getNotifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndDelete(notificationId);
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

// ============================================
// MEAL ATTENDANCE
// ============================================
const getMealAttendance = async (req, res) => {
  try {
    const { date, mealType } = req.query;
    const queryDate = date || (new Date()).toISOString().split('T')[0];

    // Get all active and verified students
    const students = await Student.find({ isActive: true, isVerified: true }).select('name rollNumber hostelName roomNumber').lean();

    // Get attendance records for this date
    const filter = { date: queryDate };
    if (mealType) filter.mealType = mealType;
    const attendanceRecords = await Attendance.find(filter).lean();

    // Create attendance map keyed by studentId and mealType
    const attendanceMap = {};
    (attendanceRecords || []).forEach(record => {
      const key = `${String(record.student)}_${record.mealType}`;
      attendanceMap[key] = record.status;
    });

    // Map students with their attendance
    const mealTypes = mealType ? [mealType] : ['breakfast','lunch','snacks','dinner'];
    const attendanceData = (students || []).map(student => {
      const mealStatus = {};
      mealTypes.forEach(type => {
        const key = `${String(student._id)}_${type}`;
        mealStatus[type] = attendanceMap[key] || 'not-marked';
      });
      return { ...student, attendance: mealStatus };
    });

    // Calculate stats
    const totalStudents = students?.length || 0;
    const stats = {};
    for (const type of mealTypes) {
      const present = (attendanceRecords || []).filter(r => r.mealType === type && r.status === 'present').length;
      const absent = (attendanceRecords || []).filter(r => r.mealType === type && r.status === 'absent').length;
      stats[type] = { present, absent, notMarked: totalStudents - present - absent, attendanceRate: totalStudents > 0 ? ((present / totalStudents) * 100).toFixed(1) : 0 };
    }

    res.json({ success: true, data: { date: queryDate, totalStudents, stats, students: attendanceData } });
  } catch (error) {
    console.error("Error in getMealAttendance:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching attendance",
      error: error.message,
    });
  }
};

const getAttendanceStats = async (req, res) => {
  try {
    const stats = [];
    const today = new Date();

    const totalStudents = await Student.countDocuments({ isActive: true, isVerified: true });

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = getLocalDateString(date);

      const records = await Attendance.find({ date: dateStr }).lean();

      const mealStats = {};
      ['breakfast','lunch','snacks','dinner'].forEach(type => {
        const present = (records || []).filter(r => r.mealType === type && r.status === 'present').length;
        mealStats[type] = present;
      });

      stats.push({ date: dateStr, dayName: date.toLocaleDateString('en-US', { weekday: 'short' }), totalStudents, ...mealStats });
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error in getAttendanceStats:', error);
    res.status(500).json({ success: false, message: 'Error fetching attendance stats', error: error.message });
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
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
};
