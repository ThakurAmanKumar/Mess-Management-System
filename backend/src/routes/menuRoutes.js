const express = require('express');
const router = express.Router();
const { Menu } = require('../models');

// Get today's menu
router.get('/today', async (req, res) => {
  try {
    // Try UTC day first
    const utcToday = new Date().toISOString().split('T')[0];
    const utcStart = new Date(`${utcToday}T00:00:00.000Z`);
    const utcEnd = new Date(`${utcToday}T23:59:59.999Z`);
    let menu = await Menu.findOne({ date: { $gte: utcStart, $lte: utcEnd } }).lean();
    // If not found, try server-local day
    if (!menu) {
      const d = new Date();
      const localToday = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const localStart = new Date(`${localToday}T00:00:00.000Z`);
      const localEnd = new Date(`${localToday}T23:59:59.999Z`);
      menu = await Menu.findOne({ date: { $gte: localStart, $lte: localEnd } }).lean();
    }
    // Fallback: some dates may be stored with timezone offsets; try matching by ISO date prefix
    if (!menu) {
      // Fallback: try matching by ISO prefix for UTC today
      try {
        menu = await Menu.findOne({ $where: `this.date && this.date.toISOString().startsWith("${utcToday}")` }).lean();
      } catch (e) {
        console.warn('Fallback date match error:', e.message);
      }
    }
    if (!menu) return res.status(404).json({ success: false, message: 'No menu available for today' });
    res.json({ success: true, menu });
  } catch (err) {
    console.error('Error fetching today menu:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get weekly menus
router.get('/weekly', async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const menus = await Menu.find({ date: { $gte: today.toISOString().split('T')[0], $lte: nextWeek.toISOString().split('T')[0] } }).sort({ date: 1 }).lean();
    res.json({ success: true, menus });
  } catch (err) {
    console.error('Error fetching weekly menus:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get menu by date
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    // Accept either a plain YYYY-MM-DD or a full ISO timestamp. Normalize to YYYY-MM-DD.
    let dateOnly;
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      dateOnly = parsed.toISOString().split('T')[0];
    } else {
      // Fallback: take first 10 chars which should be YYYY-MM-DD when provided as ISO-like string
      dateOnly = String(date).slice(0, 10);
    }
    const start = new Date(`${dateOnly}T00:00:00.000Z`);
    const end = new Date(`${dateOnly}T23:59:59.999Z`);
    const menu = await Menu.findOne({ date: { $gte: start, $lte: end } }).lean();
    if (!menu) return res.status(404).json({ success: false, message: 'No menu found for this date' });
    res.json({ success: true, menu });
  } catch (err) {
    console.error('Error fetching menu by date:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create or upsert menu
router.post('/', async (req, res) => {
  try {
    const { date, day, breakfast, lunch, snacks, dinner, specialNote } = req.body;
    if (!date || !day) return res.status(400).json({ success: false, message: 'date and day required' });
    const update = { day, breakfast: breakfast || [], lunch: lunch || [], snacks: snacks || [], dinner: dinner || [], specialNote: specialNote || '' };
    const menu = await Menu.findOneAndUpdate({ date }, update, { upsert: true, new: true });
    res.json({ success: true, menu });
  } catch (err) {
    console.error('Error creating/updating menu:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all menus
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.find().sort({ date: -1 }).limit(30).lean();
    res.json({ success: true, menus });
  } catch (err) {
    console.error('Error fetching menus:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update menu
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const menu = await Menu.findByIdAndUpdate(id, update, { new: true });
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    res.json({ success: true, menu });
  } catch (err) {
    console.error('Error updating menu:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete menu
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Menu.findByIdAndDelete(id);
    res.json({ success: true, message: 'Menu deleted successfully' });
  } catch (err) {
    console.error('Error deleting menu:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
