import { db } from '../database/db';
import crypto from 'crypto';

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export class RefreshTokenModel {
  static async create(userId: string, expiresInDays: number = 30): Promise<RefreshToken> {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const [refreshToken] = await db('refresh_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt,
      })
      .returning('*');

    return refreshToken;
  }

  static async findByToken(token: string): Promise<RefreshToken | undefined> {
    return db('refresh_tokens')
      .where({ token })
      .where('expires_at', '>', db.fn.now())
      .first();
  }

  static async deleteByToken(token: string): Promise<void> {
    await db('refresh_tokens').where({ token }).delete();
  }

  static async deleteByUserId(userId: string): Promise<void> {
    await db('refresh_tokens').where({ user_id: userId }).delete();
  }

  static async deleteExpired(): Promise<void> {
    await db('refresh_tokens')
      .where('expires_at', '<', db.fn.now())
      .delete();
  }
}


