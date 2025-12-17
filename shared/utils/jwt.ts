import * as jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Generate access token (short-lived)
export const generateAccessToken = (payload: JWTPayload, secret: string, expiresIn: string | number = '15m'): string => {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

// Generate refresh token (long-lived)
export const generateRefreshToken = (payload: JWTPayload, secret: string, expiresIn: string | number = '30d'): string => {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

// Verify token
export const verifyToken = (token: string, secret: string): JWTPayload => {
  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
