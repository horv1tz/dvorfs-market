import { Request, Response, NextFunction } from 'express';
import { WishlistModel } from '../models/Wishlist';
import { ProductModel } from '../models/Product';
import { NotFoundError } from '../../shared/utils/errors';
import { AuthRequest } from '../middleware/auth';

export const getWishlist = async (
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

    const items = await WishlistModel.findByUserId(req.user.id);

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (
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

    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({
        success: false,
        error: 'Product ID is required',
      });
      return;
    }

    // Check if product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const wishlist = await WishlistModel.add(req.user.id, productId);

    res.status(201).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (
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

    const { productId } = req.params;

    await WishlistModel.remove(req.user.id, productId);

    res.json({
      success: true,
      message: 'Item removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
};

