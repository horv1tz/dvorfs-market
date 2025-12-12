import { Request, Response, NextFunction } from 'express';
import { PaymentModel } from '../models/Payment';
import { StripeService } from '../services/stripeService';
import { YooKassaService } from '../services/yookassaService';
import { OrderService } from '../services/orderService';
import { PaymentMethod, PaymentStatus } from '../../shared/types';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const createPaymentSchema = z.object({
  order_id: z.string().uuid(),
  payment_method: z.nativeEnum(PaymentMethod),
});

export const createPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const validated = createPaymentSchema.parse(req.body);

    // Get order
    const order = await OrderService.getOrder(validated.order_id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check ownership
    if (order.user_id !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
      return;
    }

    // Check if payment already exists
    const existingPayment = await PaymentModel.findByOrderId(validated.order_id);
    if (existingPayment) {
      res.json({
        success: true,
        data: existingPayment,
      });
      return;
    }

    let paymentIntent: any;
    let transactionId: string | undefined;

    // Create payment based on method
    if (validated.payment_method === PaymentMethod.STRIPE) {
      const stripePayment = await StripeService.createPaymentIntent(
        order.total_amount,
        'usd',
        { order_id: validated.order_id, user_id: req.user.id }
      );
      paymentIntent = stripePayment;
      transactionId = stripePayment.id;
    } else if (validated.payment_method === PaymentMethod.YOOKASSA) {
      const yookassaPayment = await YooKassaService.createPayment(
        order.total_amount,
        'RUB',
        `Order ${validated.order_id}`,
        { order_id: validated.order_id, user_id: req.user.id }
      );
      paymentIntent = yookassaPayment;
      transactionId = yookassaPayment.id;
    } else {
      throw new BadRequestError('Invalid payment method');
    }

    // Create payment record
    const payment = await PaymentModel.create({
      order_id: validated.order_id,
      amount: order.total_amount,
      currency: validated.payment_method === PaymentMethod.STRIPE ? 'USD' : 'RUB',
      payment_method: validated.payment_method,
      transaction_id: transactionId,
      metadata: paymentIntent,
    });

    res.status(201).json({
      success: true,
      data: {
        ...payment,
        payment_intent: paymentIntent,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await PaymentModel.findById(id);

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const handleStripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const event = StripeService.verifyWebhookSignature(req.body, signature);

    const paymentIntent = event.data.object as any;

    // Find payment by transaction_id
    const payment = await PaymentModel.findByTransactionId(paymentIntent.id);
    if (!payment) {
      res.status(404).json({ received: true });
      return;
    }

    // Update payment status based on event
    let status: PaymentStatus = payment.status;
    if (event.type === 'payment_intent.succeeded') {
      status = PaymentStatus.COMPLETED;
      await OrderService.updateOrderStatus(payment.order_id, 'processing');
    } else if (event.type === 'payment_intent.payment_failed') {
      status = PaymentStatus.FAILED;
    }

    await PaymentModel.updateStatus(payment.id, status, paymentIntent.id);

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

export const handleYooKassaWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const event = req.body;

    // Verify webhook (simplified)
    if (!YooKassaService.verifyWebhookSignature(event, '')) {
      res.status(400).json({ received: false });
      return;
    }

    const paymentId = event.object?.id;
    if (!paymentId) {
      res.status(400).json({ received: false });
      return;
    }

    // Find payment
    const payment = await PaymentModel.findByTransactionId(paymentId);
    if (!payment) {
      res.status(404).json({ received: true });
      return;
    }

    // Get payment status from YooKassa
    const yookassaPayment = await YooKassaService.getPayment(paymentId);

    // Update payment status
    let status: PaymentStatus = payment.status;
    if (yookassaPayment.status === 'succeeded') {
      status = PaymentStatus.COMPLETED;
      await OrderService.updateOrderStatus(payment.order_id, 'processing');
    } else if (yookassaPayment.status === 'canceled') {
      status = PaymentStatus.FAILED;
    }

    await PaymentModel.updateStatus(payment.id, status, paymentId);

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

export const createRefund = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
      return;
    }

    const { id } = req.params;
    const { amount } = req.body;

    const payment = await PaymentModel.findById(id);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestError('Only completed payments can be refunded');
    }

    // Process refund based on payment method
    if (payment.payment_method === PaymentMethod.STRIPE && payment.transaction_id) {
      await StripeService.createRefund(payment.transaction_id, amount);
    } else if (payment.payment_method === PaymentMethod.YOOKASSA && payment.transaction_id) {
      await YooKassaService.createRefund(payment.transaction_id, amount);
    }

    // Update payment status
    await PaymentModel.updateStatus(payment.id, PaymentStatus.REFUNDED);

    res.json({
      success: true,
      message: 'Refund processed successfully',
    });
  } catch (error) {
    next(error);
  }
};

