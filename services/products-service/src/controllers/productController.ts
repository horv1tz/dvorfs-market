import { Request, Response, NextFunction } from 'express';
import { ProductModel, ProductFilters } from '../models/Product';
import { ReviewModel } from '../models/Review';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { ProductType } from '../../shared/types';

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0).optional(),
  type: z.nativeEnum(ProductType),
  category_id: z.string().uuid().optional(),
  images: z.array(z.string()).optional(),
});

const updateProductSchema = createProductSchema.partial();

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters: ProductFilters = {
      category_id: req.query.category_id as string,
      type: req.query.type as ProductType,
      min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
      max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const { products, total } = await ProductModel.findMany(filters);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        totalPages: Math.ceil(total / (filters.limit || 20)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Product ID is required',
      });
      return;
    }
    
    const product = await ProductModel.findById(id);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Get reviews and rating
    const reviews = await ReviewModel.findByProductId(id);
    const avgRating = await ReviewModel.getAverageRating(id);
    const ratingCount = await ReviewModel.getRatingCount(id);

    res.json({
      success: true,
      data: {
        ...product,
        reviews,
        avgRating,
        ratingCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = createProductSchema.parse(req.body) as z.infer<typeof createProductSchema>;
    
    // Check if slug exists
    const existing = await ProductModel.findBySlug(validated.slug);
    if (existing) {
      throw new BadRequestError('Product with this slug already exists');
    }

    const product = await ProductModel.create({
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      price: validated.price,
      stock: validated.stock,
      type: validated.type,
      category_id: validated.category_id,
      images: validated.images,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Product ID is required',
      });
      return;
    }
    
    const validated = updateProductSchema.parse(req.body) as Partial<z.infer<typeof createProductSchema>>;

    const product = await ProductModel.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check slug uniqueness if updating
    if (validated.slug && validated.slug !== product.slug) {
      const existing = await ProductModel.findBySlug(validated.slug);
      if (existing) {
        throw new BadRequestError('Product with this slug already exists');
      }
    }

    const updateData: any = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.slug !== undefined) updateData.slug = validated.slug;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.price !== undefined) updateData.price = validated.price;
    if (validated.stock !== undefined) updateData.stock = validated.stock;
    if (validated.type !== undefined) updateData.type = validated.type;
    if (validated.category_id !== undefined) updateData.category_id = validated.category_id;
    if (validated.images !== undefined) updateData.images = validated.images;

    const updated = await ProductModel.update(id, updateData);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await ProductModel.delete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getPopularProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const products = await ProductModel.getPopular(limit);

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

