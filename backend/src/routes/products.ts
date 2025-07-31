import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts
} from '../controllers/productController.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductFilters,
  validateBulkUpdate,
  validateUuidParam
} from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/products
router.get('/', validateProductFilters, getProducts);

// GET /api/products/:id
router.get('/:id', validateUuidParam, getProduct);

// POST /api/products (admin/manager only)
router.post('/', authorize('admin', 'manager'), validateCreateProduct, createProduct);

// PUT /api/products/:id (admin/manager only)
router.put('/:id', authorize('admin', 'manager'), validateUuidParam, validateUpdateProduct, updateProduct);

// DELETE /api/products/:id (admin only)
router.delete('/:id', authorize('admin'), validateUuidParam, deleteProduct);

// POST /api/products/bulk (admin/manager only)
router.post('/bulk', authorize('admin', 'manager'), validateBulkUpdate, bulkUpdateProducts);

export default router;