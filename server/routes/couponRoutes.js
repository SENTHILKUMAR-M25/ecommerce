import express from 'express';
import {
  validateCoupon,
  createCoupon,
  getCoupons,
  getActiveCoupons,
  toggleCouponActive,
  deleteCoupon
} from '../controllers/couponController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/active', getActiveCoupons);
router.post('/validate', protect, validateCoupon);

router.route('/')
  .post(protect, adminOnly, createCoupon)
  .get(protect, adminOnly, getCoupons);

router.route('/:id')
  .delete(protect, adminOnly, deleteCoupon);

router.put('/:id/toggle', protect, adminOnly, toggleCouponActive);

export default router;
