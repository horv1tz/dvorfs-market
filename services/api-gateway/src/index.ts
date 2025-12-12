import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Service URLs
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  products: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3002',
  orders: process.env.ORDERS_SERVICE_URL || 'http://localhost:3003',
  payments: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3004',
  notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3005',
};

// Proxy middleware configuration
const proxyOptions = {
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix when forwarding
  },
  onProxyReq: (proxyReq: any, req: express.Request) => {
    // Forward original headers
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    if (req.headers['x-user-id']) {
      proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
    }
  },
  onError: (err: Error, req: express.Request, res: express.Response) => {
    logger.error('Proxy error', { error: err.message, path: req.path });
    res.status(503).json({
      success: false,
      error: 'Service unavailable',
      message: 'The requested service is temporarily unavailable',
    });
  },
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth Service routes
app.use('/api/auth', createProxyMiddleware({
  ...proxyOptions,
  target: SERVICES.auth,
}));

// Products Service routes
app.use('/api/products', createProxyMiddleware({
  ...proxyOptions,
  target: SERVICES.products,
}));

app.use('/api/categories', createProxyMiddleware({
  ...proxyOptions,
  target: SERVICES.products,
}));

app.use('/api/wishlist', createProxyMiddleware({
  ...proxyOptions,
  target: SERVICES.products,
}));

// Orders Service routes
app.use('/api/cart', createProxyMiddleware({
  ...proxyOptions,
  target: SERVICES.orders,
}));

app.use('/api/orders', createProxyMiddleware({
  ...proxyOptions,
  target: SERVICES.orders,
}));

// Payments Service routes
app.use('/api/payments', createProxyMiddleware({
  ...proxyOptions,
  target: SERVICES.payments,
}));

// Notifications Service routes
app.use('/api/notifications', createProxyMiddleware({
  ...proxyOptions,
  target: SERVICES.notifications,
}));

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
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info('Proxying to services:', SERVICES);
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

