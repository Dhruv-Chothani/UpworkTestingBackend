import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: admin._id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

  // Use secure cookies in production so auth works on Vercel (cross-site)
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.json({ token });
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

