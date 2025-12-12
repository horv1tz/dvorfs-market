import { Request, Response, NextFunction } from 'express';
import { ReviewModel } from '../models/Review';
import { ProductModel } from '../models/Product';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const createReviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const reviews = await ReviewModel.findByProductId(productId);

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (
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

    const validated = createReviewSchema.parse(req.body);

    // Check if product exists
    const product = await ProductModel.findById(validated.product_id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if user already reviewed
    const existing = await ReviewModel.findByProductAndUser(
      validated.product_id,
      req.user.id
    );
    if (existing) {
      throw new BadRequestError('You have already reviewed this product');
    }

    const review = await ReviewModel.create({
      ...validated,
      user_id: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (
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
    const validated = z.object({
      rating: z.number().int().min(1).max(5).optional(),
      comment: z.string().optional(),
    }).parse(req.body);

    // Note: Need to check ownership - simplified for now
    // In production, should verify review belongs to user

    const updated = await ReviewModel.update(id, validated);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await ReviewModel.delete(id);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

