import express from 'express';
import {
  addReview,
  deleteReview,
  getProductReviews,
  getUserReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/user/my', protect, getUserReviews);

router.route('/:productId')
  .get(getProductReviews)
  .post(protect, addReview);

router.delete('/delete/:reviewId', protect, deleteReview);

export default router;
