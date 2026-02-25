import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { initializeWebSocket } from './services/websocket';
import healthRouter from './routes/health';
import statusRouter from './routes/status';
import usersRouter from './routes/users';
import signalsRouter from './routes/signals';
import positionsRouter from './routes/positions';
import oracleRouter from './routes/oracle';

// Load environment variables
dotenv.config({ path: '../.env' });

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/health', healthRouter);
app.use('/api/status', statusRouter);
app.use('/api/users', usersRouter);
app.use('/api/signals', signalsRouter);
app.use('/api/positions', positionsRouter);
app.use('/api/oracle', oracleRouter);

// Root health check for Railway/monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Create HTTP server and initialize WebSocket
const httpServer = createServer(app);
const _wsService = initializeWebSocket(httpServer); // Will be used for future WebSocket management

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 ChuloBots API server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3000'}`);
  console.log(`🔌 WebSocket server ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
