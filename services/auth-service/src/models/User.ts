import { db } from '../database/db';
import bcrypt from 'bcrypt';
import { UserRole } from '../../shared/types';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  role?: UserRole;
}

export interface UserPublic {
  id: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async create(data: CreateUserData): Promise<User> {
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    const [user] = await db('users')
      .insert({
        email: data.email,
        password_hash: passwordHash,
        role: data.role || UserRole.USER,
      })
      .returning('*');
    
    return user;
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    return db('users').where({ email }).first();
  }

  static async findById(id: string): Promise<User | undefined> {
    return db('users').where({ id }).first();
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  static async updatePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db('users')
      .where({ id: userId })
      .update({
        password_hash: passwordHash,
        updated_at: db.fn.now(),
      });
  }

  static toPublic(user: User): UserPublic {
    const { password_hash, ...publicUser } = user;
    return publicUser;
  }
}

