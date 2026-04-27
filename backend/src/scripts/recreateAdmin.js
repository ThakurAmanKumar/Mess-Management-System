require('dotenv').config();
const { connectDB } = require('../config/db');
const { Admin } = require('../models');

const run = async () => {
  try {
    await connectDB();
    const email = process.env.ADMIN_EMAIL || 'admin@local.test';
    console.log('Removing existing admin with email:', email);
    await Admin.deleteMany({ email });
    console.log('Creating admin with plaintext password (will be hashed by pre-save)...');
    const admin = await Admin.create({ name: process.env.ADMIN_NAME || 'Test Admin', email, password: process.env.ADMIN_PASSWORD || 'AdminPass123', role: process.env.ADMIN_ROLE || 'admin' });
    console.log('✅ Recreated admin:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error recreating admin:', err);
    process.exit(1);
  }
};

run();
