import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController';
import { authenticate, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/products/:productId', getProductReviews);
router.post('/', authenticate, requireAuth, createReview);
router.put('/:id', authenticate, requireAuth, updateReview);
router.delete('/:id', authenticate, requireAuth, deleteReview);

export default router;

