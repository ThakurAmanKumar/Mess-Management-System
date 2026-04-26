const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Rating } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'smartmess_fallback_secret';

const verifyToken = (req) => {
  const auth = req.headers.authorization;
  if (!auth) return null;
  try { return jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET); } catch { return null; }
};

// Create or update rating
router.post('/', async (req, res) => {
  try {
    const decoded = verifyToken(req);
    if (!decoded) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { menu_id, meal_type, rating, comment } = req.body;
    if (!menu_id || !meal_type || !rating) return res.status(400).json({ success: false, message: 'menu_id, meal_type and rating required' });

    const existing = await Rating.findOneAndUpdate({ student: decoded.id, menu: menu_id, mealType: meal_type }, { rating, comment: comment || '' }, { new: true });
    if (existing) return res.json({ success: true, rating: existing });

    const created = await Rating.create({ student: decoded.id, menu: menu_id, mealType: meal_type, rating, comment: comment || '' });
    res.status(201).json({ success: true, rating: created });
  } catch (err) {
    console.error('Error creating rating:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get my ratings
router.get('/my-ratings', async (req, res) => {
  try {
    const decoded = verifyToken(req);
    if (!decoded) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const list = await Rating.find({ student: decoded.id }).populate('menu', 'date').lean();
    res.json({ success: true, ratings: list });
  } catch (err) {
    console.error('Error fetching my ratings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all ratings (admin)
router.get('/all', async (req, res) => {
  try {
    const list = await Rating.find().limit(100).populate('student', 'name rollNumber').populate('menu', 'date').lean();
    res.json({ success: true, ratings: list });
  } catch (err) {
    console.error('Error fetching all ratings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get meal ratings
router.get('/meal/:menuId/:mealType', async (req, res) => {
  try {
    const { menuId, mealType } = req.params;
    const list = await Rating.find({ menu: menuId, mealType }).populate('student', 'name').lean();
    const avg = list.length ? list.reduce((s,r)=>s+r.rating,0)/list.length : 0;
    res.json({ success: true, ratings: list, averageRating: avg, totalRatings: list.length });
  } catch (err) {
    console.error('Error fetching meal ratings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a rating
router.delete('/:id', async (req, res) => {
  try {
    const decoded = verifyToken(req);
    if (!decoded) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;
    const existing = await Rating.findById(id);
    if (!existing || String(existing.student) !== String(decoded.id)) return res.status(404).json({ success: false, message: 'Rating not found or unauthorized' });
    await Rating.findByIdAndDelete(id);
    res.json({ success: true, message: 'Rating deleted successfully' });
  } catch (err) {
    console.error('Error deleting rating:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update a rating
router.put('/:id', async (req, res) => {
  try {
    const decoded = verifyToken(req);
    if (!decoded) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params; const { rating, comment } = req.body;
    const existing = await Rating.findById(id);
    if (!existing || String(existing.student) !== String(decoded.id)) return res.status(404).json({ success: false, message: 'Rating not found or unauthorized' });
    existing.rating = rating; existing.comment = comment || existing.comment; existing.updatedAt = new Date();
    await existing.save();
    res.json({ success: true, rating: existing });
  } catch (err) {
    console.error('Error updating rating:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
