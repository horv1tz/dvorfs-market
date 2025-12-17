import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController';
import { authenticate, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireAuth, getWishlist);
router.post('/', authenticate, requireAuth, addToWishlist);
router.delete('/:productId', authenticate, requireAuth, removeFromWishlist);

export default router;



