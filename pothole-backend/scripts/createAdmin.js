const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const adminData = {
    username: 'admin',
    email: 'admin@pothole.com',
    password: 'admin123',
    role: 'admin'
  };

  // Check if admin already exists
  const existingAdmin = await User.findOne({ 
    $or: [
      { email: adminData.email },
      { username: adminData.username }
    ] 
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    process.exit(0);
  }

  // Create admin user
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminData.password, salt);

  const admin = new User({
    username: adminData.username,
    email: adminData.email,
    password: hashedPassword,
    role: adminData.role
  });

  await admin.save();
  console.log('✅ Admin user created successfully');
  console.log('Email: admin@pothole.com');
  console.log('Password: admin123');
  
  process.exit(0);
};

createAdmin();