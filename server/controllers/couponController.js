import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import CouponUsage from '../models/CouponUsage.js';
import AdminActivityLog from '../models/AdminActivityLog.js';

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res, next) => {
  const { code, total } = req.body;

  try {
    if (!code || !code.trim()) {
      res.status(400);
      throw new Error('Please enter a coupon code');
    }

    const uppercaseCode = code.trim().toUpperCase();

    // 1. Check if standard coupon exists
    let coupon = await Coupon.findOne({ code: uppercaseCode });

    if (!coupon) {
      // 2. Check if it's a referral code
      const referrer = await User.findOne({ referralCode: uppercaseCode });
      
      if (!referrer) {
        res.status(404);
        throw new Error('Invalid coupon or referral code');
      }

      // Check if trying to use own referral code
      if (referrer._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('You cannot use your own referral code');
      }

      // Check if user has already used this referral code
      const usageCount = await CouponUsage.countDocuments({
        user: req.user._id,
        coupon: referrer._id,
        couponModel: 'User'
      });

      if (usageCount > 0) {
        res.status(400);
        throw new Error('Referral code already used');
      }

      // Minimum purchase amount for referral
      const referralMinPurchase = 250;
      if (total < referralMinPurchase) {
        res.status(400);
        throw new Error(`Minimum purchase of ₹${referralMinPurchase} required to use referral code`);
      }

      // Calculate discount amount (flat ₹100 off)
      const discount = Math.min(100, total);

      return res.json({
        success: true,
        message: `Referral discount applied: ₹${discount.toFixed(2)} off!`,
        data: {
          code: referrer.referralCode,
          discountType: 'flat',
          discountValue: 100,
          discountAmount: Math.round(discount * 100) / 100,
          isReferral: true,
          referrerId: referrer._id
        }
      });
    }

    // 3. Validate standard coupon
    if (!coupon.isActive) {
      res.status(400);
      throw new Error('This coupon is no longer active');
    }

    // Check expiry
    if (new Date(coupon.expiryDate) < new Date()) {
      res.status(400);
      throw new Error('This coupon has expired');
    }

    // Check usage count for this user
    const usageCount = await CouponUsage.countDocuments({
      user: req.user._id,
      coupon: coupon._id,
      couponModel: 'Coupon'
    });

    if (usageCount >= coupon.usageLimitPerUser) {
      res.status(400);
      throw new Error('Coupon already used');
    }

    // Check minimum purchase amount
    if (total < coupon.minPurchase) {
      res.status(400);
      throw new Error(`Minimum purchase of ₹${coupon.minPurchase} required to use this coupon`);
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (coupon.discountValue / 100) * total;
    } else {
      discount = coupon.discountValue;
    }

    // Make sure discount doesn't exceed total
    discount = Math.min(discount, total);

    res.json({
      success: true,
      message: `Coupon applied: ₹${discount.toFixed(2)} off!`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discount * 100) / 100,
        isReferral: false,
        couponId: coupon._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res, next) => {
  const { code, discountType, discountValue, expiryDate, minPurchase, usageLimitPerUser, isActive } = req.body;

  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

    if (couponExists) {
      res.status(400);
      throw new Error('Coupon code already exists');
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiryDate: new Date(expiryDate),
      minPurchase: minPurchase || 0,
      usageLimitPerUser: usageLimitPerUser !== undefined ? usageLimitPerUser : 1,
      isActive: isActive !== undefined ? isActive : true
    });

    // Log admin activity
    await AdminActivityLog.create({
      admin: req.user._id,
      action: 'CREATE_COUPON',
      details: `Created coupon ${coupon.code} (${coupon.discountType}: ${coupon.discountValue})`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });

    res.status(201).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active and non-expired coupons for homepage
// @route   GET /api/coupons/active
// @access  Public
export const getActiveCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle coupon active status
// @route   PUT /api/coupons/:id/toggle
// @access  Private/Admin
export const toggleCouponActive = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    // Log admin activity
    await AdminActivityLog.create({
      admin: req.user._id,
      action: 'TOGGLE_COUPON',
      details: `Toggled coupon ${coupon.code} active status to ${coupon.isActive}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }

    const code = coupon.code;
    await Coupon.findByIdAndDelete(req.params.id);

    // Log admin activity
    await AdminActivityLog.create({
      admin: req.user._id,
      action: 'DELETE_COUPON',
      details: `Deleted coupon ${code}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
