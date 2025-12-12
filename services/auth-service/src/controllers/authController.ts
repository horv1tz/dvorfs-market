import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { RefreshTokenModel } from '../models/RefreshToken';
import { PasswordResetTokenModel } from '../models/PasswordResetToken';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { sendPasswordResetEmail } from '../utils/email';
import { ConflictError, BadRequestError, NotFoundError, UnauthorizedError } from '../../shared/utils/errors';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

const changePasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = registerSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await UserModel.findByEmail(validated.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user
    const user = await UserModel.create({
      email: validated.email,
      password: validated.password,
    });

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    await RefreshTokenModel.create(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: UserModel.toPublic(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = loginSchema.parse(req.body);

    // Find user
    const user = await UserModel.findByEmail(validated.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isValid = await UserModel.verifyPassword(user, validated.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    await RefreshTokenModel.create(user.id);

    res.json({
      success: true,
      data: {
        user: UserModel.toPublic(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new BadRequestError('Refresh token is required');
    }

    // Verify token
    const payload = verifyToken(token);

    // Check if refresh token exists in DB
    const refreshTokenRecord = await RefreshTokenModel.findByToken(token);
    if (!refreshTokenRecord || refreshTokenRecord.user_id !== payload.userId) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Get user
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Generate new tokens
    const newPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    // Update refresh token in DB
    await RefreshTokenModel.deleteByToken(token);
    await RefreshTokenModel.create(user.id);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      await RefreshTokenModel.deleteByToken(token);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: {
        user: UserModel.toPublic(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = resetPasswordSchema.parse(req.body);

    const user = await UserModel.findByEmail(validated.email);
    if (!user) {
      // Don't reveal if user exists
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
      return;
    }

    // Create reset token
    const resetToken = await PasswordResetTokenModel.create(user.id);

    // Send email
    await sendPasswordResetEmail(user.email, resetToken.token);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = changePasswordSchema.parse(req.body);

    // Find token
    const resetToken = await PasswordResetTokenModel.findByToken(validated.token);
    if (!resetToken) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Update password
    await UserModel.updatePassword(resetToken.user_id, validated.password);

    // Mark token as used
    await PasswordResetTokenModel.markAsUsed(validated.token);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

