require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');
const { Admin } = require('../models');

const createAdmin = async () => {
  try {
    await connectDB();
    const adminData = { name: process.env.ADMIN_NAME, email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, phoneNumber: process.env.ADMIN_PHONE, role: process.env.ADMIN_ROLE || 'admin' };
    const existing = await Admin.findOne({ email: adminData.email });
    if (existing) {
      console.log('⚠️  Admin already exists!');
      console.log('📧 Email:', adminData.email);
      process.exit(0);
    }
    const hashed = await bcrypt.hash(adminData.password, 10);
    await Admin.create({ name: adminData.name, email: adminData.email, password: hashed, role: adminData.role });
    console.log('✅ Admin created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('\n⚠️  Change this password after first login!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

createAdmin();
