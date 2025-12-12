import { Request, Response, NextFunction } from 'express';
import { CartModel } from '../models/Cart';
import { ProductService } from '../services/productService';
import { BadRequestError } from '../../shared/utils/errors';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const addItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const updateItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export const getCart = async (
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

    const cart = await CartModel.getCartWithItems(req.user.id);
    if (!cart) {
      // Create empty cart
      await CartModel.findOrCreateByUserId(req.user.id);
      const newCart = await CartModel.getCartWithItems(req.user.id);
      res.json({
        success: true,
        data: newCart,
      });
      return;
    }

    const total = await CartModel.calculateTotal(cart.id);

    res.json({
      success: true,
      data: {
        ...cart,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addItem = async (
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

    const validated = addItemSchema.parse(req.body);

    // Check product exists and stock
    const product = await ProductService.getProduct(validated.product_id);
    if (!product) {
      throw new BadRequestError('Product not found');
    }

    const hasStock = await ProductService.checkStock(validated.product_id, validated.quantity);
    if (!hasStock) {
      throw new BadRequestError('Insufficient stock');
    }

    const cart = await CartModel.findOrCreateByUserId(req.user.id);
    const item = await CartModel.addItem(
      cart.id,
      validated.product_id,
      validated.quantity,
      product.price
    );

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (
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

    const { itemId } = req.params;
    const validated = updateItemSchema.parse(req.body);

    // Get item to check product
    const cart = await CartModel.findOrCreateByUserId(req.user.id);
    const items = await CartModel.getCartWithItems(req.user.id);
    const item = items?.items.find((i) => i.id === itemId);

    if (!item) {
      throw new BadRequestError('Cart item not found');
    }

    // Check stock
    const hasStock = await ProductService.checkStock(item.product_id, validated.quantity);
    if (!hasStock) {
      throw new BadRequestError('Insufficient stock');
    }

    const updated = await CartModel.updateItemQuantity(itemId, validated.quantity);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (
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

    const { itemId } = req.params;
    await CartModel.removeItem(itemId);

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
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

    const cart = await CartModel.findOrCreateByUserId(req.user.id);
    await CartModel.clearCart(cart.id);

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    next(error);
  }
};

