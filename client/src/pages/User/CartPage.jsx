import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  removeFromCart, 
  updateCartQuantity, 
  applyCartCoupon, 
  removeCartCoupon 
} from '../../redux/slices/cartSlice';
import { useToast } from '../../components/common/ToastContext';
import { Trash2, Plus, Minus, ArrowRight, Ticket, X, ShoppingBag } from 'lucide-react';
import API from '../../services/api';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { cartItems, coupon, itemsPrice, shippingPrice, taxPrice, discountPrice, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleQtyChange = (item, direction) => {
    let newQty = item.quantity;
    if (direction === 'plus') {
      newQty = Math.min(item.quantity + 1, item.stock);
    } else {
      newQty = Math.max(item.quantity - 1, 1);
    }

    dispatch(updateCartQuantity({
      product: item.product,
      variant: item.variant,
      quantity: newQty
    }));
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart({ product: item.product, variant: item.variant }));
    toast('Item removed from cart.', 'info');
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast('Please enter a coupon code.', 'error');
      return;
    }

    try {
      setCouponLoading(true);
      const res = await API.post('/coupons/validate', {
        code: couponCode,
        total: itemsPrice
      });
      
      dispatch(applyCartCoupon(res.data.data));
      toast(res.data.message, 'success');
      setCouponCode('');
    } catch (err) {
      toast(err || 'Invalid coupon code', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCartCoupon());
    toast('Coupon discount removed.', 'info');
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      toast('Please log in or register to complete your order!', 'info');
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="text-5xl">🛒</div>
        <h2 className="text-2xl font-extrabold tracking-tight">Your Shopping Cart is Empty</h2>
        <p className="text-slate-500 text-sm">
          Before you proceed to checkout, you must add some premium items to your shopping cart.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold transition-all shadow-md active:scale-95"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Shop Collection</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Shopping Cart</h1>
      <p className="text-sm text-slate-500">Review your premium selections and discount options before placing your order.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Items Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden shadow-lg p-6 space-y-6">
            {cartItems.map((item, idx) => (
              <div 
                key={idx}
                className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/85 last:border-b-0 last:pb-0"
              >
                {/* Item image & details */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base hover:text-cyan-500 transition-colors">
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </h3>
                    {item.variant && (
                      <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5">{item.variant}</p>
                    )}
                    <span className="text-xs text-slate-450 mt-1 block">In Stock: {item.stock} left</span>
                  </div>
                </div>

                {/* Pricing & Quantities */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-white/10 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 rounded-xl overflow-hidden w-24">
                    <button
                      onClick={() => handleQtyChange(item, 'minus')}
                      className="p-1.5 hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-500 w-8 flex justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center font-bold text-xs select-none">{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(item, 'plus')}
                      className="p-1.5 hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-500 w-8 flex justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-extrabold text-cyan-650 dark:text-cyan-400">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">₹{item.price.toFixed(2)} each</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item)}
                    className="p-2 rounded-full border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Order summary & coupon */}
        <div className="space-y-6">
          {/* Coupon Form */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-lg space-y-4">
            <h3 className="font-bold text-sm tracking-wider uppercase text-slate-400 flex items-center gap-2">
              <Ticket className="w-4.5 h-4.5 text-indigo-500" />
              <span>Discount Coupon</span>
            </h3>

            {coupon ? (
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase">{coupon.code} Applied</p>
                  <p className="text-[10px] text-emerald-500/90 font-medium">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`} subtotal
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="p-1 rounded-full hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. SAVE20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-cyan-500 dark:hover:bg-cyan-400 hover:text-white font-bold px-5 rounded-xl text-xs transition-all disabled:opacity-55"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Pricing calculations */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-lg space-y-4">
            <h3 className="font-bold text-sm tracking-wider uppercase text-slate-400">Order Summary</h3>
            
            <div className="space-y-2.5 text-sm border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Items Subtotal</span>
                <span className="font-semibold">₹{itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping Charges</span>
                <span className="font-semibold">
                  {shippingPrice === 0 ? <span className="text-emerald-500 font-bold uppercase">Free</span> : `₹${shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Taxes (8%)</span>
                <span className="font-semibold">₹{taxPrice.toFixed(2)}</span>
              </div>
              {discountPrice > 0 && (
                <div className="flex justify-between text-emerald-500 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountPrice.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-base">Grand Total</span>
              <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">₹{totalPrice.toFixed(2)}</span>
            </div>

            {itemsPrice < 150 && (
              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Add <span className="font-bold text-slate-700 dark:text-slate-200">₹{(150 - itemsPrice).toFixed(2)}</span> more to unlock <span className="text-emerald-500 font-bold uppercase">Free Shipping</span>!
              </p>
            )}

            <button
              onClick={handleCheckoutRedirect}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold hover:shadow-lg shadow-md active:scale-98 transition-all pt-3.5"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
