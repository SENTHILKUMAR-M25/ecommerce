import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';

import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
// Load Environment Variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Ignore unwanted socket.io polling requests
app.use((req, res, next) => {
  if (req.originalUrl.includes('socket.io')) {
    return res.status(404).end();
  }
  next();
});

// Speed & Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Allows images from any origin in dev
}));
app.use(compression());

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(
  cors({
    origin:[
      "https://ecommerce-eight-virid-50.vercel.app",
      // "https://ecommerce-eight-virid-50.vercel.app",
    
  ],
  credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logger Middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many requests from this IP, please try again after 15 minutes.',
  },
});

// Apply Rate Limiter to API Routes
app.use('/api', limiter);

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Aura E-commerce API Running Successfully 🚀',
  });
});

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'E-commerce API is fully operational',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/offers', offerRoutes);
// Static Uploads Folder
const __dirname = path.resolve();

app.use(
  '/uploads',
  express.static(path.join(__dirname, '/uploads'))
);

// 404 Middleware
app.use(notFound);

// Error Handler Middleware
app.use(errorHandler);

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(
    `[Server] running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  );
});
