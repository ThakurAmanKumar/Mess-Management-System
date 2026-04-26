require('dotenv').config();
const { connectDB } = require('../config/db');
const { Admin } = require('../models');

const run = async () => {
  try {
    await connectDB();
    const email = 'er.thakuramankumar@gmail.com';
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('NOT FOUND');
    } else {
      console.log('FOUND');
      console.log('Email:', admin.email);
      console.log('Name:', admin.name);
      console.log('Role:', admin.role);
      console.log('CreatedAt:', admin.createdAt);
    }
    process.exit(0);
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
};

run();
