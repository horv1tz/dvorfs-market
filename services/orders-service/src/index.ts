import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'orders-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

app.listen(PORT, () => {
  logger.info(`Orders Service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

