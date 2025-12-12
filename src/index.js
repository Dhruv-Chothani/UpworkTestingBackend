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
import { seedDefaults } from './utils/seed.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri =
  process.env.MONGO_URI ||
  'mongodb+srv://dhruv:123@cluster0.us4e5ih.mongodb.net/Up01';

// Trust proxy for Vercel (must be first)
app.set('trust proxy', true);

// CORS configuration - MUST be before any routes
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:8080', 'http://localhost:5173', 'https://upwork-testing.vercel.app'];

// Handle preflight requests FIRST - before any other middleware
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  const isAllowed = !origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*');
  
  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    res.sendStatus(204);
  } else {
    res.sendStatus(403);
  }
});

// CORS middleware for all other requests
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list or wildcard
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}. Allowed:`, allowedOrigins);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/content', contentRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const start = async () => {
  await connectDb(mongoUri);
  await seedDefaults();
  app.listen(port, () => console.log(`API running on ${port}`));
};

start();

