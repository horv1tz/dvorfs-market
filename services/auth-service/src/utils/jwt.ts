import { generateAccessToken as genAccessToken, generateRefreshToken as genRefreshToken, verifyToken as verifyJWT, JWTPayload } from '../../shared/utils/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export { JWTPayload };

export const generateAccessToken = (payload: JWTPayload): string => {
  return genAccessToken(payload, JWT_SECRET, JWT_ACCESS_EXPIRES_IN);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return genRefreshToken(payload, JWT_SECRET, JWT_REFRESH_EXPIRES_IN);
};

export const verifyToken = (token: string): JWTPayload => {
  return verifyJWT(token, JWT_SECRET);
};

