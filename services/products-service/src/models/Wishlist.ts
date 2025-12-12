import { db } from '../database/db';

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: Date;
}

export interface WishlistWithProduct extends Wishlist {
  product?: any;
}

export class WishlistModel {
  static async add(userId: string, productId: string): Promise<Wishlist> {
    const [wishlist] = await db('wishlists')
      .insert({
        user_id: userId,
        product_id: productId,
      })
      .onConflict(['user_id', 'product_id'])
      .ignore()
      .returning('*');

    if (!wishlist) {
      // Already exists, return existing
      return db('wishlists')
        .where({ user_id: userId, product_id: productId })
        .first();
    }

    return wishlist;
  }

  static async remove(userId: string, productId: string): Promise<void> {
    await db('wishlists')
      .where({ user_id: userId, product_id: productId })
      .delete();
  }

  static async findByUserId(userId: string): Promise<WishlistWithProduct[]> {
    return db('wishlists')
      .where({ user_id: userId })
      .join('products', 'wishlists.product_id', 'products.id')
      .select('wishlists.*', 'products.*')
      .orderBy('wishlists.created_at', 'desc');
  }

  static async exists(userId: string, productId: string): Promise<boolean> {
    const result = await db('wishlists')
      .where({ user_id: userId, product_id: productId })
      .first();

    return !!result;
  }
}

