const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  await connectDB();

  const deleted = await User.deleteMany({ role: 'admin' });
  console.log(`Removed ${deleted.deletedCount} existing admin account(s)`);

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  const admin = await User.create({
    name: 'Super Admin',
    email,
    password,
    role: 'admin',
  });

  console.log('New admin created:', admin.email);
  process.exit(0);
})();