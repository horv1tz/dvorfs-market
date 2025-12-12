import { Request, Response, NextFunction } from 'express';
import { NotificationModel } from '../models/Notification';
import { NotificationPreferenceModel } from '../models/NotificationPreference';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const updatePreferencesSchema = z.object({
  email_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  email_preferences: z.any().optional(),
});

export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const read = req.query.read === 'true' ? true : req.query.read === 'false' ? false : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const notifications = await NotificationModel.findByUserId(req.user.id, { read, limit });

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const { id } = req.params;
    const notification = await NotificationModel.markAsRead(id, req.user.id);

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    await NotificationModel.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const count = await NotificationModel.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

export const getPreferences = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const preferences = await NotificationPreferenceModel.findOrCreate(req.user.id);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const validated = updatePreferencesSchema.parse(req.body);
    const preferences = await NotificationPreferenceModel.update(req.user.id, validated);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};

