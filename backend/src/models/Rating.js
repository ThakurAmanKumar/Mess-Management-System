// Rating Model - Students can rate their meals

const mongoose = require('mongoose');

// Create a Schema for Rating
const ratingSchema = new mongoose.Schema({
  
  // Which student gave this rating
  student: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to Student model
    ref: 'Student',                        // Links to Student collection
    required: true
  },
  
  // Which menu is being rated
  menu: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to Menu model
    ref: 'Menu',
    required: true
  },
  
  // Which meal type (breakfast, lunch, or dinner)
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'snacks', 'dinner']  // Only these values allowed
  },
  
  // Rating value (1 to 5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,              // Minimum rating is 1
    max: 5               // Maximum rating is 5
  },
  
  // Optional comment/feedback
  comment: {
    type: String,
    maxlength: 500,      // Maximum 500 characters
    default: ""
  },
  
  // Date when rating was given
  ratingDate: {
    type: Date,
    default: Date.now    // Automatically set to current date
  }
  
}, {
  timestamps: true       // Adds createdAt and updatedAt
});

// Create index to prevent duplicate ratings
// One student can rate same meal type of same menu only once
ratingSchema.index({ student: 1, menu: 1, mealType: 1 }, { unique: true });

// Create and export the Rating model
const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;
