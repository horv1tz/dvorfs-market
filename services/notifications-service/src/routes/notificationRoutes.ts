import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getPreferences,
  updatePreferences,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.get('/unread/count', authenticate, getUnreadCount);
router.get('/preferences', authenticate, getPreferences);
router.put('/preferences', authenticate, updatePreferences);

export default router;

