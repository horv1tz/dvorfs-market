import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserModel } from '../models/User';
import { UnauthorizedError } from '../../shared/utils/errors';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    // Verify user still exists
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new UnauthorizedError('Admin access required'));
  }
  next();
};

