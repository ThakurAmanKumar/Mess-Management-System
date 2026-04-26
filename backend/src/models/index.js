// Index file - Exports all models from one place
// This makes importing models easier in other files

const Student = require('./Student');
const Admin = require('./Admin');
const Menu = require('./Menu');
const Rating = require('./Rating');
const Complaint = require('./Complaint');
const Attendance = require('./Attendance');
const Notification = require('./Notification');

// Export all models
module.exports = {
  Student,
  Admin,
  Menu,
  Rating,
  Complaint
  ,Attendance
  ,Notification
};
