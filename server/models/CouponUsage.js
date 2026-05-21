import mongoose from 'mongoose';

const couponUsageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    required: true // We make it required. It can reference a Coupon or a User (for referral)
  },
  couponModel: {
    type: String,
    required: true,
    enum: ['Coupon', 'User'] // Points to either a standard Coupon or a referrer User
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const CouponUsage = mongoose.model('CouponUsage', couponUsageSchema);
export default CouponUsage;
