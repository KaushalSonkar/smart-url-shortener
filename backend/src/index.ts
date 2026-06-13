import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import authRoutes from './routes/authRoutes';
import linkRoutes from './routes/linkRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { redirectUrl } from './controllers/redirectController';
import { rateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Set up security headers. Allow inline styles and script images for QR codes and UI transitions if required.
app.use(
  helmet({
    contentSecurityPolicy: false, // Turned off for easy local integration/development or configure custom as needed
  })
);

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Express parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply API rate limiting (100 reqs/min) to all /api/ endpoints to prevent abuse.
// Note: We bypass this limiter on redirects (/:shortCode) to maximize routing performance.
app.use('/api', rateLimiter);

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Wildcard redirection endpoint - intercepts non-API paths (e.g. /my-alias)
// Must be registered LAST so it doesn't intercept API routes
app.get('/:shortCode', redirectUrl);

// Global exception handling
app.use(errorHandler);

const startServer = async () => {
  // 1. Establish database connections
  await connectDB();

  // 2. Connect to caching server
  await connectRedis();

  // 3. Bind port
  app.listen(PORT, () => {
    console.log(`[Server]: Prime Links backend is running on http://localhost:${PORT}`);
  });
};

startServer();
