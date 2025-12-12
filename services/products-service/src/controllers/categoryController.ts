import { Request, Response, NextFunction } from 'express';
import { CategoryModel } from '../models/Category';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  parent_id: z.string().uuid().optional(),
  image_url: z.string().url().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await CategoryModel.findAll();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = createCategorySchema.parse(req.body);

    // Check if slug exists
    const existing = await CategoryModel.findBySlug(validated.slug);
    if (existing) {
      throw new BadRequestError('Category with this slug already exists');
    }

    // Validate parent if provided
    if (validated.parent_id) {
      const parent = await CategoryModel.findById(validated.parent_id);
      if (!parent) {
        throw new NotFoundError('Parent category not found');
      }
    }

    const category = await CategoryModel.create(validated);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const validated = updateCategorySchema.parse(req.body);

    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Check slug uniqueness if updating
    if (validated.slug && validated.slug !== category.slug) {
      const existing = await CategoryModel.findBySlug(validated.slug);
      if (existing) {
        throw new BadRequestError('Category with this slug already exists');
      }
    }

    // Validate parent if provided
    if (validated.parent_id && validated.parent_id !== category.parent_id) {
      if (validated.parent_id === id) {
        throw new BadRequestError('Category cannot be its own parent');
      }
      const parent = await CategoryModel.findById(validated.parent_id);
      if (!parent) {
        throw new NotFoundError('Parent category not found');
      }
    }

    const updated = await CategoryModel.update(id, validated);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    await CategoryModel.delete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

