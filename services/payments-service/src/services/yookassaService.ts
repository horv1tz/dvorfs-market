import axios from 'axios';
import crypto from 'crypto';

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID || '';
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || '';
const YOOKASSA_API_URL = process.env.YOOKASSA_API_URL || 'https://api.yookassa.ru/v3';

export interface YooKassaPayment {
  id: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  description?: string;
  metadata?: any;
}

export class YooKassaService {
  private static getAuthHeader(): string {
    const credentials = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
    return `Basic ${credentials}`;
  }

  static async createPayment(
    amount: number,
    currency: string = 'RUB',
    description?: string,
    metadata?: any
  ): Promise<YooKassaPayment> {
    const response = await axios.post(
      `${YOOKASSA_API_URL}/payments`,
      {
        amount: {
          value: amount.toFixed(2),
          currency: currency.toUpperCase(),
        },
        description,
        metadata,
        confirmation: {
          type: 'redirect',
          return_url: process.env.YOOKASSA_RETURN_URL || 'http://localhost:3001/payment-success',
        },
      },
      {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
          'Idempotence-Key': crypto.randomUUID(),
        },
      }
    );

    return response.data;
  }

  static async getPayment(paymentId: string): Promise<YooKassaPayment> {
    const response = await axios.get(
      `${YOOKASSA_API_URL}/payments/${paymentId}`,
      {
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      }
    );

    return response.data;
  }

  static async createRefund(paymentId: string, amount?: number): Promise<any> {
    const refundData: any = {
      payment_id: paymentId,
    };

    if (amount) {
      refundData.amount = {
        value: amount.toFixed(2),
        currency: 'RUB',
      };
    }

    const response = await axios.post(
      `${YOOKASSA_API_URL}/refunds`,
      refundData,
      {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
          'Idempotence-Key': crypto.randomUUID(),
        },
      }
    );

    return response.data;
  }

  static verifyWebhookSignature(payload: any, signature: string): boolean {
    // YooKassa webhook verification
    // In production, verify the signature using YooKassa's method
    return true; // Simplified for now
  }
}


