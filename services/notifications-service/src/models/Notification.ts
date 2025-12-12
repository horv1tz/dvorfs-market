import { db } from '../database/db';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: Date;
}

export interface CreateNotificationData {
  user_id: string;
  type: string;
  title: string;
  message: string;
}

export class NotificationModel {
  static async create(data: CreateNotificationData): Promise<Notification> {
    const [notification] = await db('notifications')
      .insert({
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
      })
      .returning('*');

    return notification;
  }

  static async findByUserId(userId: string, filters: { read?: boolean; limit?: number } = {}): Promise<Notification[]> {
    let query = db('notifications')
      .where({ user_id: userId });

    if (filters.read !== undefined) {
      query = query.where({ read: filters.read });
    }

    query = query.orderBy('created_at', 'desc');

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    return query;
  }

  static async markAsRead(id: string, userId: string): Promise<Notification> {
    const [notification] = await db('notifications')
      .where({ id, user_id: userId })
      .update({ read: true })
      .returning('*');

    return notification;
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await db('notifications')
      .where({ user_id: userId, read: false })
      .update({ read: true });
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const result = await db('notifications')
      .where({ user_id: userId, read: false })
      .count('* as count')
      .first();

    return parseInt(result?.count as string) || 0;
  }
}

