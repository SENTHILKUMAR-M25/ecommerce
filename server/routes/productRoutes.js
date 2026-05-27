import express from 'express';
import {
  getProducts,
  getProductBySlug,
  addProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, addProduct);

// ✅ Put slug route BEFORE :id
router.get('/slug/:slug', getProductBySlug);

router.route('/:id')
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

export default router;