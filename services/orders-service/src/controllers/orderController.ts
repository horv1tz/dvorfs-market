import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/Order';
import { CartModel } from '../models/Cart';
import { ProductService } from '../services/productService';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';
import { OrderStatus } from '../../shared/types';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const createOrderSchema = z.object({
  shipping_address: z.string().min(1, 'Shipping address is required'),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const createOrder = async (
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

    const validated = createOrderSchema.parse(req.body);

    // Get cart
    const cart = await CartModel.getCartWithItems(req.user.id);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const hasStock = await ProductService.checkStock(item.product_id, item.quantity);
      if (!hasStock) {
        throw new BadRequestError(`Insufficient stock for product ${item.product_id}`);
      }
    }

    // Get product names
    const itemsWithNames = await Promise.all(
      cart.items.map(async (item) => {
        const product = await ProductService.getProduct(item.product_id);
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          product_name: product?.name || 'Unknown Product',
        };
      })
    );

    // Create order
    const order = await OrderModel.create({
      user_id: req.user.id,
      shipping_address: validated.shipping_address,
      items: itemsWithNames,
    });

    // Clear cart
    await CartModel.clearCart(cart.id);

    const orderWithItems = await OrderModel.getOrderWithItems(order.id);

    res.status(201).json({
      success: true,
      data: orderWithItems,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
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

    // Admin can see all orders, users only their own
    if (req.user.role === 'admin') {
      const status = req.query.status as OrderStatus | undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const { orders, total } = await OrderModel.findAll({ status, page, limit });

      res.json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } else {
      const orders = await OrderModel.findByUserId(req.user.id);
      res.json({
        success: true,
        data: orders,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (
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

    const { id } = req.params;
    const order = await OrderModel.getOrderWithItems(id);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check ownership or admin
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
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
    const validated = updateStatusSchema.parse(req.body);

    const order = await OrderModel.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const updated = await OrderModel.updateStatus(id, validated.status);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

