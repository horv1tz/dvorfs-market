import { Router } from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticate, requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', authenticate, requireAuth, requireAdmin, createCategory);
router.put('/:id', authenticate, requireAuth, requireAdmin, updateCategory);
router.delete('/:id', authenticate, requireAuth, requireAdmin, deleteCategory);

export default router;



