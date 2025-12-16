import { Router } from 'express';
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getCart);
router.post('/items', authenticate, addItem);
router.put('/items/:itemId', authenticate, updateItem);
router.delete('/items/:itemId', authenticate, removeItem);
router.delete('/', authenticate, clearCart);

export default router;


