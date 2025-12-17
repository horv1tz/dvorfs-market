import { db } from '../database/db';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateReviewData {
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
}

export interface ReviewWithUser extends Review {
  user_email?: string;
}

export class ReviewModel {
  static async create(data: CreateReviewData): Promise<Review> {
    const [review] = await db('reviews')
      .insert({
        product_id: data.product_id,
        user_id: data.user_id,
        rating: data.rating,
        comment: data.comment || null,
      })
      .returning('*');

    return review;
  }

  static async findByProductId(productId: string): Promise<ReviewWithUser[]> {
    return db('reviews')
      .where({ product_id: productId })
      .orderBy('created_at', 'desc');
  }

  static async findByUserId(userId: string): Promise<Review[]> {
    return db('reviews')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
  }

  static async findByProductAndUser(productId: string, userId: string): Promise<Review | undefined> {
    return db('reviews')
      .where({ product_id: productId, user_id: userId })
      .first();
  }

  static async getAverageRating(productId: string): Promise<number> {
    const result = await db('reviews')
      .where({ product_id: productId })
      .avg('rating as avg_rating')
      .first();

    return result?.avg_rating ? parseFloat(result.avg_rating) : 0;
  }

  static async getRatingCount(productId: string): Promise<number> {
    const result = await db('reviews')
      .where({ product_id: productId })
      .count('* as count')
      .first();

    return parseInt(result?.count as string) || 0;
  }

  static async update(id: string, data: { rating?: number; comment?: string }): Promise<Review> {
    const [review] = await db('reviews')
      .where({ id })
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return review;
  }

  static async delete(id: string): Promise<void> {
    await db('reviews').where({ id }).delete();
  }
}



