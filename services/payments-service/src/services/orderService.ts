import axios from 'axios';

const ORDERS_SERVICE_URL = process.env.ORDERS_SERVICE_URL || 'http://localhost:3003';

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
}

export class OrderService {
  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const response = await axios.get(`${ORDERS_SERVICE_URL}/orders/${orderId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const response = await axios.put(
        `${ORDERS_SERVICE_URL}/orders/${orderId}/status`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${process.env.INTERNAL_SERVICE_TOKEN || ''}`,
          },
        }
      );
      return response.data.success;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }
}

