import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Admin } from '../src/models/Admin.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://dhruv:123@cluster0.us4e5ih.mongodb.net/Up01';
const ADMIN_EMAIL = 'manuhomeopathy@gmail.com';
const ADMIN_PASSWORD = 'manuhomeopathy@123';

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create admin
    const admin = new Admin({
      email: ADMIN_EMAIL,
      passwordHash
    });

    await admin.save();
    console.log('Admin created successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
