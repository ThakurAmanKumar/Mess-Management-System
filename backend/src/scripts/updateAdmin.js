require('dotenv').config();
const { connectDB } = require('../config/db');
const { Admin } = require('../models');

const [,, newEmail, newPassword] = process.argv;

if (!newEmail || !newPassword) {
  console.error('Usage: node updateAdmin.js <email> <password>');
  process.exit(1);
}

const run = async () => {
  try {
    await connectDB();

    // Find an existing admin (any). If none exists, we'll create one.
    let admin = await Admin.findOne({ role: 'admin' });

    if (!admin) {
      console.log('No admin found — creating a new admin...');
      admin = new Admin({ name: 'Admin', email: newEmail.toLowerCase(), password: newPassword, role: 'admin' });
      await admin.save();
      console.log('✅ Admin created:', admin.email);
      process.exit(0);
    }

    console.log('Updating admin:', admin.email, '->', newEmail.toLowerCase());
    admin.email = newEmail.toLowerCase();
    admin.password = newPassword; // will be hashed by pre-save hook
    await admin.save();

    console.log('✅ Admin updated to:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating admin:', err);
    process.exit(1);
  }
};

run();
