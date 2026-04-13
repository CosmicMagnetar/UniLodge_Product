import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRouter from './routes/ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  })
);

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'UniLodge API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API status endpoint
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

// API version endpoint
app.get('/api/version', (_req: Request, res: Response) => {
  res.status(200).json({
    version: '1.0.0',
    name: 'UniLodge API',
    description: 'Accommodation booking platform',
  });
});

// AI Engine routes
app.use('/api/ai', aiRouter);

// Test AI endpoint
app.post('/api/test-ai', async (_req: Request, res: Response) => {
  try {
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      return res.status(400).json({ error: 'AI service not configured' });
    }

    // Simple test message
    res.status(200).json({
      message: 'AI service is configured',
      chatbot: process.env.AI_CHATBOT_ENABLED === 'true',
    });
  } catch (error) {
    res.status(500).json({ error: 'AI test failed' });
  }
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: _req.path,
  });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   UniLodge API Server                  ║
╠════════════════════════════════════════╣
║ Server:     http://localhost:${PORT}         ║
║ Environment: ${NODE_ENV.padEnd(30)}║
║ Database:   ${MONGODB_URI ? 'Connected' : 'Not configured'}${' '.repeat(24)}║
║ AI Service: ${process.env.OPENROUTER_API_KEY ? 'Ready' : 'Not configured'}${' '.repeat(26)}║
║ Chatbot:    ${process.env.AI_CHATBOT_ENABLED === 'true' ? 'Enabled' : 'Disabled'}${' '.repeat(27)}║
║ Routes:     /api/ai/* (AI features)   ║
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

export default app;
