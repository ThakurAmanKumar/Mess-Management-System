const jwt = require('jsonwebtoken');
const { Student, Admin } = require('../models');

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const Model = decoded.role === 'admin' ? Admin : Student;
    const user = await Model.findById(decoded.id).lean();
    if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
    req.user = { id: user._id, name: user.name, email: user.email, role: decoded.role };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  next();
};
