import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDb } from './config/db.js';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blogs.js';
import slotRoutes from './routes/slots.js';
import bookingRoutes from './routes/bookings.js';
import contentRoutes from './routes/content.js';
import homepageRoutes from './routes/homepage.js';
import { seedDefaults } from './utils/seed.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const mongoUri =
  process.env.MONGO_URI ||
  'mongodb+srv://dhruv:123@cluster0.us4e5ih.mongodb.net/Up01';

// Required for Vercel / proxies
app.set('trust proxy', true);

/* =====================================================
   🔥 UNIVERSAL CORS — ALLOW EVERYTHING
   ===================================================== */

app.use(
  cors({
    origin: true,                 // ✅ allow ALL origins
    credentials: true,             // ✅ allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['set-cookie']
  })
);

// ✅ Handle ALL preflight requests
app.options('*', cors());

/* =====================================================
   Middleware
   ===================================================== */

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Debug logger (optional but helpful)
app.use((req, res, next) => {
  console.log(`\n➡️ ${req.method} ${req.originalUrl}`);
  console.log('Origin:', req.headers.origin);
  next();
});

/* =====================================================
   Routes
   ===================================================== */

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', message: 'API is healthy' })
);

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/homepage', homepageRoutes);

/* =====================================================
   Error Handler
   ===================================================== */

app.use((err, _req, res, _next) => {
  console.error('❌ ERROR:', err);
  res.status(500).json({
    message: 'Server error',
    error: err.message
  });
});

/* =====================================================
   Start Server
   ===================================================== */

const start = async () => {
  await connectDb(mongoUri);
  await seedDefaults();
  app.listen(port, () => {
    console.log(`🚀 API running on port ${port}`);
  });
};

start();
