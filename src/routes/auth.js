import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  console.log('Login attempt:', { email: req.body.email });
  
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('Admin not found:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      console.log('Invalid password for admin:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    console.log('Login successful for admin:', admin.email);

    // Set secure cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send success response
    return res.json({ 
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/me', authMiddleware, async (req, res) => {
  const admin = await Admin.findById(req.adminId).select('email createdAt');
  res.json({ admin });
});

export default router;

