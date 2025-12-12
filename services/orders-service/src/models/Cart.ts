import { db } from '../database/db';

export interface Cart {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: Date;
  updated_at: Date;
}

export interface CartWithItems extends Cart {
  items: CartItem[];
}

export class CartModel {
  static async findOrCreateByUserId(userId: string): Promise<Cart> {
    let cart = await db('carts').where({ user_id: userId }).first();

    if (!cart) {
      const [newCart] = await db('carts')
        .insert({ user_id: userId })
        .returning('*');
      cart = newCart;
    }

    return cart;
  }

  static async findByUserId(userId: string): Promise<Cart | undefined> {
    return db('carts').where({ user_id: userId }).first();
  }

  static async getCartWithItems(userId: string): Promise<CartWithItems | null> {
    const cart = await this.findByUserId(userId);
    if (!cart) {
      return null;
    }

    const items = await db('cart_items')
      .where({ cart_id: cart.id })
      .orderBy('created_at', 'asc');

    return {
      ...cart,
      items,
    };
  }

  static async addItem(cartId: string, productId: string, quantity: number, price: number): Promise<CartItem> {
    const existing = await db('cart_items')
      .where({ cart_id: cartId, product_id: productId })
      .first();

    if (existing) {
      const [updated] = await db('cart_items')
        .where({ id: existing.id })
        .update({
          quantity: existing.quantity + quantity,
          price,
          updated_at: db.fn.now(),
        })
        .returning('*');
      return updated;
    }

    const [item] = await db('cart_items')
      .insert({
        cart_id: cartId,
        product_id: productId,
        quantity,
        price,
      })
      .returning('*');

    // Update cart timestamp
    await db('carts')
      .where({ id: cartId })
      .update({ updated_at: db.fn.now() });

    return item;
  }

  static async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    const [item] = await db('cart_items')
      .where({ id: itemId })
      .update({
        quantity,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return item;
  }

  static async removeItem(itemId: string): Promise<void> {
    await db('cart_items').where({ id: itemId }).delete();
  }

  static async clearCart(cartId: string): Promise<void> {
    await db('cart_items').where({ cart_id: cartId }).delete();
    await db('carts')
      .where({ id: cartId })
      .update({ updated_at: db.fn.now() });
  }

  static async calculateTotal(cartId: string): Promise<number> {
    const result = await db('cart_items')
      .where({ cart_id: cartId })
      .sum(db.raw('quantity * price as total'))
      .first() as { total: string } | undefined;

    return result?.total ? parseFloat(result.total) : 0;
  }
}

