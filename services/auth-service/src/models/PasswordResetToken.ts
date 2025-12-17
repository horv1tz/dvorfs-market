import { db } from '../database/db';
import crypto from 'crypto';

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export class PasswordResetTokenModel {
  static async create(userId: string): Promise<PasswordResetToken> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

    // Invalidate previous tokens
    await db('password_reset_tokens')
      .where({ user_id: userId, used: false })
      .update({ used: true });

    const [resetToken] = await db('password_reset_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt,
      })
      .returning('*');

    return resetToken;
  }

  static async findByToken(token: string): Promise<PasswordResetToken | undefined> {
    return db('password_reset_tokens')
      .where({ token, used: false })
      .where('expires_at', '>', db.fn.now())
      .first();
  }

  static async markAsUsed(token: string): Promise<void> {
    await db('password_reset_tokens')
      .where({ token })
      .update({ used: true });
  }
}



