import { db } from '../database/db';
import { PaymentStatus, PaymentMethod } from '../../shared/types';

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  transaction_id: string | null;
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentData {
  order_id: string;
  amount: number;
  currency?: string;
  payment_method: PaymentMethod;
  transaction_id?: string;
  metadata?: any;
}

export class PaymentModel {
  static async create(data: CreatePaymentData): Promise<Payment> {
    const [payment] = await db('payments')
      .insert({
        order_id: data.order_id,
        amount: data.amount,
        currency: data.currency || 'USD',
        status: PaymentStatus.PENDING,
        payment_method: data.payment_method,
        transaction_id: data.transaction_id || null,
        metadata: data.metadata || null,
      })
      .returning('*');

    return payment;
  }

  static async findById(id: string): Promise<Payment | undefined> {
    return db('payments').where({ id }).first();
  }

  static async findByOrderId(orderId: string): Promise<Payment | undefined> {
    return db('payments').where({ order_id: orderId }).first();
  }

  static async findByTransactionId(transactionId: string): Promise<Payment | undefined> {
    return db('payments').where({ transaction_id: transactionId }).first();
  }

  static async updateStatus(id: string, status: PaymentStatus, transactionId?: string): Promise<Payment> {
    const updateData: any = {
      status,
      updated_at: db.fn.now(),
    };

    if (transactionId) {
      updateData.transaction_id = transactionId;
    }

    const [payment] = await db('payments')
      .where({ id })
      .update(updateData)
      .returning('*');

    return payment;
  }

  static async updateMetadata(id: string, metadata: any): Promise<Payment> {
    const [payment] = await db('payments')
      .where({ id })
      .update({
        metadata,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return payment;
  }
}

