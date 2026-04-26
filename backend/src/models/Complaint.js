// Complaint Model - Students can submit complaints about mess

const mongoose = require('mongoose');

// Create a Schema for Complaint
const complaintSchema = new mongoose.Schema({
  
  // Which student submitted this complaint
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Complaint category
  category: {
    type: String,
    required: true,
    enum: ['food_quality', 'hygiene', 'service', 'quantity', 'other']  // Predefined categories
  },
  
  // Subject/Title of complaint
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  // Detailed description
  description: {
    type: String,
    required: true,
    maxlength: 1000      // Maximum 1000 characters
  },
  
  // Status of complaint
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'   // New complaints start as pending
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Admin's response (Optional)
  adminResponse: {
    type: String,
    default: ""
  },
  
  // Which admin resolved it (Optional)
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // When was it resolved (Optional)
  resolvedAt: {
    type: Date
  }
  
}, {
  timestamps: true       // Adds createdAt and updatedAt
});

// Create and export the Complaint model
const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
