// Run with: npm run seed:admin
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || 'adminbachbuddy@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }

  const admin = await User.create({
    name: 'Super Admin',
    email,
    password,
    role: 'admin',
  });

  console.log('Admin created:', admin.email);
  process.exit(0);
})();
