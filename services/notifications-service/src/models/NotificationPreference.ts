import { db } from '../database/db';

export interface NotificationPreference {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  email_preferences: any;
  created_at: Date;
  updated_at: Date;
}

export class NotificationPreferenceModel {
  static async findOrCreate(userId: string): Promise<NotificationPreference> {
    let preference = await db('notification_preferences')
      .where({ user_id: userId })
      .first();

    if (!preference) {
      const [newPreference] = await db('notification_preferences')
        .insert({
          user_id: userId,
          email_enabled: true,
          push_enabled: true,
          email_preferences: {},
        })
        .returning('*');
      preference = newPreference;
    }

    return preference;
  }

  static async update(userId: string, data: {
    email_enabled?: boolean;
    push_enabled?: boolean;
    email_preferences?: any;
  }): Promise<NotificationPreference> {
    const [preference] = await db('notification_preferences')
      .where({ user_id: userId })
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return preference;
  }
}



