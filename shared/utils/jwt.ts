import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const verifyToken = (token: string, secret: string): JWTPayload => {
  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
