// Menu Model - Defines the structure of daily mess menu

const mongoose = require('mongoose');

// Create a Schema for Menu
const menuSchema = new mongoose.Schema({
  
  // Date for this menu
  date: {
    type: Date,
    required: true
  },
  
  // Day of the week (Monday, Tuesday, etc.)
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  
  // Breakfast Menu
  breakfast: [{ type: String }],
  
  // Lunch Menu
  lunch: [{ type: String }],
  
  // Snacks Menu (Optional)
  snacks: [{ type: String }],
  
  // Dinner Menu
  dinner: [{ type: String }],
  
  // Who added this menu
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to Admin model
    ref: 'Admin',                          // Links to Admin collection
    required: false
  },
  
  // Special notes (Optional)
  specialNote: {
    type: String,
    default: ""          // "Today's special: Gulab Jamun"
  }
  
}, {
  timestamps: true       // Adds createdAt and updatedAt
});

// Create and export the Menu model
const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;
