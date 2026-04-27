import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Routes
import aiRouter from './routes/ai.js';
import authRouter from './routes/auth.js';
import roomRouter from './routes/rooms.js';
import bookingRouter from './routes/bookings.js';
import requestRouter from './routes/booking-requests.js';

// Import Database Configuration
import connectDB from './config/db.js';

// Import Middleware
import { requestLogger, rateLimitMiddleware, errorHandler } from './middleware/index.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map(url => url.trim()) || FRONTEND_URL,
    credentials: true,
  })
);

// Apply custom logging and rate limiting
app.use(requestLogger);
app.use(rateLimitMiddleware(100, 60000)); // 100 requests per minute

// Health and Status endpoints
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'UniLodge API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/status', (_req: Request, res: Response) => {
  const status = {
    api: 'running',
    database: MONGODB_URI ? 'configured' : 'not configured',
    aiEngine: process.env.OPENROUTER_API_KEY ? 'configured' : 'not configured',
    environment: NODE_ENV,
    port: PORT,
  };
  res.status(200).json(status);
});

// API Routes
app.use('/api/ai', aiRouter);
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/booking-requests', requestRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.path,
  });
});

// Global Error Handler
app.use(errorHandler);

// Start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   UniLodge API Server                  ║
╠════════════════════════════════════════╣
║ Server:     http://localhost:${PORT}         ║
║ Environment: ${NODE_ENV.padEnd(28)}║
║ AI Service: ${process.env.OPENROUTER_API_KEY ? 'Ready' : 'Not configured'}${' '.repeat(26)}║
║ Routes Mounted:                        ║
║   - /api/auth                          ║
║   - /api/rooms                         ║
║   - /api/bookings                      ║║   - /api/booking-requests              ║║   - /api/ai                            ║
╚════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

export default app;
