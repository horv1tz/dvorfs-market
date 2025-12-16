import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getPopularProducts,
} from '../controllers/productController';
import { authenticate, requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/popular', getPopularProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, requireAuth, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAuth, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAuth, requireAdmin, deleteProduct);

export default router;


