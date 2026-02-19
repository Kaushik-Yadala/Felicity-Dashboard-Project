require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const admin = require('../models/admin'); // Import the model you just made

// 1. Connect to MongoDB (Copying logic from your server.js)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const  createAdmin = async () => {
  await connectDB();

  try {
    // 2. Check if Admin already exists
    const existingAdmin = await admin.findOne({ username: "admin1" });
    if (existingAdmin) {
      console.log('Admin account already exists.');
      process.exit();
    }

    // 3. Create the Admin Payload
    // You can store these credentials in .env or hardcode them here since only you run this script.
    const adminUsername = "admin1";
    const plainPassword = "Password123"; 

    // 4. Hash the Password (CRITICAL)
    // Even admins need hashed passwords!
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 5. Save to Database
    const newAdmin = await admin.create({
      username: adminUsername,
      password: hashedPassword
    });

    console.log('Success: Admin account created!');
    console.log(`Login with: ${adminUsername} / ${plainPassword}`);
    
    process.exit();

  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

createAdmin();