const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Student, Admin } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'smartmess_fallback_secret';
const JWT_EXPIRES_IN = '7d';

const generateToken = (userId, email, role) => jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
const getExpiresAt = () => { const d = new Date(); d.setDate(d.getDate()+7); return d.toISOString(); };

// REGISTER
router.post("/register", async (req, res) => {
  try {
    console.log("📝 Register:", req.body);
    const {
      name,
      email,
      password,
      rollNumber,
      hostelName,
      roomNumber,
      phoneNumber,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !rollNumber ||
      !hostelName ||
      !roomNumber ||
      !phoneNumber
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existing = await Student.findOne({ $or: [{ email }, { rollNumber }] });
    if (existing) return res.status(400).json({ success: false, message: 'Email or Roll Number already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({ name, email, password: hashedPassword, rollNumber, hostelName, roomNumber, phoneNumber, isVerified: false, isActive: true });
    res.status(201).json({ success: true, message: 'Registration successful! Please wait for admin approval to access the portal.', requiresApproval: true, user: { id: student._id, name: student.name, email: student.email, rollNumber: student.rollNumber } });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    console.log("🔐 Login:", req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const student = await Student.findOne({ email });
    if (!student) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, student.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!student.isVerified) return res.status(403).json({ success: false, message: 'Your account is pending approval. Please wait for admin to approve your access.', pendingApproval: true, user: { name: student.name, email: student.email } });
    if (!student.isActive) return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact admin.' });
    const token = generateToken(String(student._id), student.email, 'student');
    res.json({ success: true, message: 'Login successful!', token, expiresAt: getExpiresAt(), user: { id: student._id, name: student.name, email: student.email, rollNumber: student.rollNumber, role: 'student' } });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN LOGIN
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    const validAdmin = await bcrypt.compare(password, admin.password);
    if (!validAdmin) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    const token = generateToken(String(admin._id), admin.email, 'admin');
    res.json({ success: true, token, expiresAt: getExpiresAt(), user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' } });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET ME
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'No token' });
    try {
      const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
      const tableModel = decoded.role === 'admin' ? Admin : Student;
      const user = await tableModel.findById(decoded.id).lean();
      if (!user) return res.status(401).json({ success: false, message: 'User not found' });
      res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, rollNumber: user.rollNumber, role: decoded.role } });
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // This endpoint just confirms the logout action
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// GET PROFILE (alias for /me)
router.get("/profile", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'No token' });
    try {
      const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
      const tableModel = decoded.role === 'admin' ? Admin : Student;
      const user = await tableModel.findById(decoded.id).lean();
      if (!user) return res.status(401).json({ success: false, message: 'User not found' });
      res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, rollNumber: user.rollNumber, hostelName: user.hostelName, roomNumber: user.roomNumber, phoneNumber: user.phoneNumber, role: decoded.role } });
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// UPDATE PROFILE
router.put("/profile", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ success: false, message: 'No token' });
    try {
      const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
      const tableModel = decoded.role === 'admin' ? Admin : Student;
      const user = await tableModel.findById(decoded.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const { name, email, hostelName, roomNumber, phoneNumber, rollNumber } = req.body;

      // If email is changing, ensure uniqueness
      if (email && String(email).toLowerCase() !== String(user.email).toLowerCase()) {
        const exists = await tableModel.findOne({ email: email.toLowerCase(), _id: { $ne: decoded.id } });
        if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });
        user.email = email.toLowerCase();
      }

      if (name) user.name = name;
      if (hostelName) user.hostelName = hostelName;
      if (roomNumber) user.roomNumber = roomNumber;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (rollNumber) user.rollNumber = rollNumber;

      await user.save();
      res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, rollNumber: user.rollNumber, hostelName: user.hostelName, roomNumber: user.roomNumber, phoneNumber: user.phoneNumber } });
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
