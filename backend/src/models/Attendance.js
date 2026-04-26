const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: String, required: true }, // stored as YYYY-MM-DD
  mealType: { type: String, enum: ['breakfast','lunch','snacks','dinner'], required: true },
  status: { type: String, enum: ['present','absent'], required: true },
  markedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
