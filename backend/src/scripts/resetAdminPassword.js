require('dotenv').config();
const { connectDB } = require('../config/db');
const { Admin } = require('../models');

const run = async () => {
  try {
    await connectDB();
    const email = process.env.ADMIN_EMAIL;
    const newPassword = process.env.ADMIN_PASSWORD;
    if (!email || !newPassword) {
      console.error('Usage: set ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
      process.exit(1);
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.error('Admin not found:', email);
      process.exit(1);
    }
    // Set plain password and save so pre-save hook hashes it once
    admin.password = newPassword;
    await admin.save();
    console.log('✅ Admin password reset for', email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error resetting admin password:', err);
    process.exit(1);
  }
};

run();
