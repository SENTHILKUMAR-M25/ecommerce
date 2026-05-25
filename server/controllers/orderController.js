import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import CouponUsage from '../models/CouponUsage.js';
import sendWhatsAppMessage  from "../utils/sendWhatsApp.js"
// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
    couponCode
  } = req.body;

  try {
    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items provided');
    }

    // 1. Verify and update stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.name}`);
      }

      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for ${item.name}. Only ${product.stock} left.`);
      }

      // Decrement product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // 2. Recalculate Prices on the Backend (Prevent API Manipulation)
    const itemsPriceBackend = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingPriceBackend = itemsPriceBackend > 150 || itemsPriceBackend === 0 ? 0 : 15;
    const taxPriceBackend = Math.round((itemsPriceBackend * 0.08) * 100) / 100;

    let discountPriceBackend = 0;
    let couponAppliedId = undefined;
    let couponModel = 'Coupon';

    if (couponCode) {
      const uppercaseCode = couponCode.trim().toUpperCase();

      // Find standard coupon
      let coupon = await Coupon.findOne({ code: uppercaseCode });

      if (coupon) {
        // Validate standard coupon
        if (!coupon.isActive) {
          res.status(400);
          throw new Error('This coupon is no longer active');
        }

        if (new Date(coupon.expiryDate) < new Date()) {
          res.status(400);
          throw new Error('This coupon has expired');
        }

        const usageCount = await CouponUsage.countDocuments({
          user: req.user._id,
          coupon: coupon._id,
          couponModel: 'Coupon'
        });

        if (usageCount >= coupon.usageLimitPerUser) {
          res.status(400);
          throw new Error('Coupon already used');
        }

        if (itemsPriceBackend < coupon.minPurchase) {
          res.status(400);
          throw new Error(`Minimum purchase of ₹${coupon.minPurchase} required to use this coupon`);
        }

        if (coupon.discountType === 'percentage') {
          discountPriceBackend = Math.round(((coupon.discountValue / 100) * itemsPriceBackend) * 100) / 100;
        } else {
          discountPriceBackend = coupon.discountValue;
        }
        discountPriceBackend = Math.min(discountPriceBackend, itemsPriceBackend);
        couponAppliedId = coupon._id;
        couponModel = 'Coupon';
      } else {
        // Find referral code
        const referrer = await User.findOne({ referralCode: uppercaseCode });
        if (!referrer) {
          res.status(404);
          throw new Error('Invalid coupon or referral code');
        }

        if (referrer._id.toString() === req.user._id.toString()) {
          res.status(400);
          throw new Error('You cannot use your own referral code');
        }

        const usageCount = await CouponUsage.countDocuments({
          user: req.user._id,
          coupon: referrer._id,
          couponModel: 'User'
        });

        if (usageCount > 0) {
          res.status(400);
          throw new Error('Referral code already used');
        }

        const referralMinPurchase = 250;
        if (itemsPriceBackend < referralMinPurchase) {
          res.status(400);
          throw new Error(`Minimum purchase of ₹${referralMinPurchase} required to use referral code`);
        }

        discountPriceBackend = Math.min(100, itemsPriceBackend);
        couponAppliedId = referrer._id;
        couponModel = 'User';
      }
    }

    const totalPriceBackend = Math.round((itemsPriceBackend + shippingPriceBackend + taxPriceBackend - discountPriceBackend) * 100) / 100;

    // 3. Create the order in database using backend recalculated prices
    // const order = await Order.create({
    //   user: req.user._id,
    //   orderItems,
    //   shippingAddress,
    //   paymentMethod,
    //   paymentInfo: paymentMethod === 'Card'
    //     ? { status: 'Succeeded', transactionId: paymentInfo?.transactionId || 'ch_mock_' + Math.random().toString(36).substr(2, 9) }
    //     : { status: 'Pending' },
    //   itemsPrice: itemsPriceBackend,
    //   taxPrice: taxPriceBackend,
    //   shippingPrice: shippingPriceBackend,
    //   discountPrice: discountPriceBackend,
    //   totalPrice: totalPriceBackend,
    //   couponApplied: couponModel === 'Coupon' ? couponAppliedId : undefined
    // });


    // 3. Create the order in database using backend recalculated prices
const order = await Order.create({
  user: req.user._id,
  orderItems,
  shippingAddress,
  paymentMethod,
  paymentInfo: paymentMethod === 'Card'
    ? {
        status: 'Succeeded',
        transactionId:
          paymentInfo?.transactionId ||
          'ch_mock_' + Math.random().toString(36).substr(2, 9)
      }
    : { status: 'Pending' },

  itemsPrice: itemsPriceBackend,
  taxPrice: taxPriceBackend,
  shippingPrice: shippingPriceBackend,
  discountPrice: discountPriceBackend,
  totalPrice: totalPriceBackend,
  couponApplied: couponModel === 'Coupon'
    ? couponAppliedId
    : undefined
});

// SEND WHATSAPP MESSAGE
await sendWhatsAppMessage({
  customerName: req.user.name,
  orderId: order._id,
  paymentMethod: order.paymentMethod,
  totalPrice: order.totalPrice,
  shippingAddress: order.shippingAddress,
  orderItems: order.orderItems
});

// 4. Record Coupon/Referral Usage
if (couponAppliedId) {
  await CouponUsage.create({
    user: req.user._id,
    coupon: couponAppliedId,
    couponModel,
    order: order._id
  });
}

    // 4. Record Coupon/Referral Usage
    if (couponAppliedId) {
      await CouponUsage.create({
        user: req.user._id,
        coupon: couponAppliedId,
        couponModel,
        order: order._id
      });
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('couponApplied');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Authorize: Only Admin or the order owner can view it
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Access denied. This order belongs to another customer.');
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Only let order owner cancel it
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    if (order.orderStatus === 'Delivered' || order.orderStatus === 'Shipped') {
      res.status(400);
      throw new Error(`Order cannot be cancelled. It has already been ${order.orderStatus.toLowerCase()}.`);
    }

    if (order.orderStatus === 'Cancelled') {
      res.status(400);
      throw new Error('Order is already cancelled.');
    }

    // Return inventory stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};
