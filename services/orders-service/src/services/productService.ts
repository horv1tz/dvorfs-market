import axios from 'axios';

const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3002';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  type: string;
}

export class ProductService {
  static async getProduct(productId: string): Promise<Product | null> {
    try {
      const response = await axios.get(`${PRODUCTS_SERVICE_URL}/products/${productId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  static async checkStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const product = await this.getProduct(productId);
      if (!product) {
        return false;
      }
      return product.stock >= quantity;
    } catch (error) {
      console.error('Error checking stock:', error);
      return false;
    }
  }
}



