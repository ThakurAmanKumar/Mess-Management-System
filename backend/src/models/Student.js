// Student Model - Defines the structure of student data in database

const mongoose = require('mongoose');

// Create a Schema (blueprint) for Student
const studentSchema = new mongoose.Schema({
  
  // Basic Information
  name: {
    type: String,           // Data type is text
    required: true,         // This field is mandatory
    trim: true             // Remove extra spaces
  },
  
  email: {
    type: String,
    required: true,
    unique: true,          // No two students can have same email
    lowercase: true        // Store email in lowercase
  },
  
  rollNumber: {
    type: String,
    required: true,
    unique: true          // Roll number must be unique
  },
  
  password: {
    type: String,
    required: true        // For login (will hash it later in Phase 7)
  },
  
  hostelName: {
    type: String,
    required: true        // Which hostel the student belongs to
  },
  
  roomNumber: {
    type: String,
    required: true
  },
  
  phoneNumber: {
    type: String,
    required: true
  },
  
  // Verification Status
  isVerified: {
    type: Boolean,        // true or false
    default: false        // New students start as unverified
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true        // Can admin disable student account
  }
  
}, {
  timestamps: true      // Automatically adds createdAt and updatedAt fields
});

// Create and export the Student model
const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
