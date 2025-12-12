import { Request, Response, NextFunction } from 'express';

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
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const token = authHeader.substring(7);
    const { verifyToken } = await import('../../shared/utils/jwt');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const payload = verifyToken(token, JWT_SECRET);

    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
    return;
  }
  next();
};

