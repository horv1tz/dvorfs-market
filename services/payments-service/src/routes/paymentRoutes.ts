import { Router } from 'express';
import {
  createPayment,
  getPayment,
  handleStripeWebhook,
  handleYooKassaWebhook,
  createRefund,
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import express from 'express';

const router = Router();

// Webhooks (no auth required, verified by signature)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);
router.post('/webhook/yookassa', express.json(), handleYooKassaWebhook);

// Regular routes (auth required)
router.post('/create', authenticate, createPayment);
router.get('/:id', authenticate, getPayment);
router.post('/:id/refund', authenticate, createRefund);

export default router;



