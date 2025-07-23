// createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = new Admin({
    email: 'admin@gmail.com',
    password: hashedPassword,
  });

  await admin.save();
  console.log('Admin created successfully');
  mongoose.disconnect();
}

createAdmin().catch(console.error);
