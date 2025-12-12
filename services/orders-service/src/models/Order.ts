import { db } from '../database/db';
import { OrderStatus } from '../../shared/types';

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name: string;
  created_at: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CreateOrderData {
  user_id: string;
  shipping_address: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    product_name: string;
  }>;
}

export class OrderModel {
  static async create(data: CreateOrderData): Promise<Order> {
    const totalAmount = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [order] = await db('orders')
      .insert({
        user_id: data.user_id,
        status: OrderStatus.PENDING,
        total_amount: totalAmount,
        shipping_address: data.shipping_address,
      })
      .returning('*');

    // Create order items
    await db('order_items').insert(
      data.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        product_name: item.product_name,
      }))
    );

    return order;
  }

  static async findById(id: string): Promise<Order | undefined> {
    return db('orders').where({ id }).first();
  }

  static async findByUserId(userId: string): Promise<Order[]> {
    return db('orders')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
  }

  static async getOrderWithItems(id: string): Promise<OrderWithItems | null> {
    const order = await this.findById(id);
    if (!order) {
      return null;
    }

    const items = await db('order_items')
      .where({ order_id: id })
      .orderBy('created_at', 'asc');

    return {
      ...order,
      items,
    };
  }

  static async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const [order] = await db('orders')
      .where({ id })
      .update({
        status,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return order;
  }

  static async findAll(filters: { status?: OrderStatus; page?: number; limit?: number } = {}): Promise<{ orders: Order[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let query = db('orders');

    if (filters.status) {
      query = query.where({ status: filters.status });
    }

    const total = await query.clone().count('* as count').first();
    const orders = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      orders,
      total: parseInt(total?.count as string) || 0,
    };
  }
}

