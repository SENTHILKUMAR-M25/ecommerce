import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import {
  removeFromCart,
  updateCartQuantity,
  applyCartCoupon,
  removeCartCoupon,
} from "../../redux/slices/cartSlice";

import { useToast } from "../../components/common/ToastContext";

import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Ticket,
  X,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  PackageCheck,
} from "lucide-react";

import { motion } from "framer-motion";

import API from "../../services/api";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { toast } = useToast();

  const {
    cartItems,
    coupon,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountPrice,
    totalPrice,
  } = useSelector((state) => state.cart);

  const { user } = useSelector((state) => state.auth);

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleQtyChange = (item, direction) => {
    let newQty = item.quantity;

    if (direction === "plus") {
      newQty = Math.min(item.quantity + 1, item.stock);
    } else {
      newQty = Math.max(item.quantity - 1, 1);
    }

    dispatch(
      updateCartQuantity({
        product: item.product,
        variant: item.variant,
        quantity: newQty,
      })
    );
  };

  const handleRemove = (item) => {
    dispatch(
      removeFromCart({
        product: item.product,
        variant: item.variant,
      })
    );

    toast("Item removed from cart.", "info");
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      toast("Please enter a coupon code.", "error");
      return;
    }

    try {
      setCouponLoading(true);

      const res = await API.post("/coupons/validate", {
        code: couponCode,
        total: itemsPrice,
      });

      dispatch(applyCartCoupon(res.data.data));

      toast(res.data.message, "success");

      setCouponCode("");
    } catch (err) {
      toast(
        err?.response?.data?.message || "Invalid coupon code",
        "error"
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCartCoupon());

    toast("Coupon removed successfully.", "info");
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      toast(
        "Please login before proceeding to checkout.",
        "info"
      );

      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full text-center rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-10 relative overflow-hidden"
        >
          {/* glow */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="w-28 h-28 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/20">
              <ShoppingCart className="w-14 h-14 text-white" />
            </div>

            <h2 className="mt-8 text-3xl font-black tracking-tight">
              Your Cart is Empty
            </h2>

            <p className="text-slate-400 mt-3 text-sm leading-relaxed">
              Looks like you haven't added any premium products yet.
              Start exploring the latest collections now.
            </p>

            <Link
              to="/products"
              className="inline-flex items-center gap-3 mt-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-xl shadow-cyan-500/20 hover:scale-[1.03] transition-all"
            >
              <ShoppingBag className="w-5 h-5" />

              <span>Explore Products</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
      >
        <div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>

            <div>
              <h1 className="text-4xl font-black tracking-tight">
                Shopping Cart
              </h1>

              <p className="text-sm text-slate-400 mt-1">
                Review your premium products before checkout.
              </p>
            </div>
          </div>
        </div>

        {/* top stats */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="px-5 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              Cart Items
            </p>

            <h2 className="text-2xl font-black mt-1">
              {cartItems.length}
            </h2>
          </div>

          <div className="px-5 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              Total
            </p>

            <h2 className="text-2xl font-black text-cyan-400 mt-1">
              ₹{totalPrice.toFixed(2)}
            </h2>
          </div>
        </div>
      </motion.div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* CART ITEMS */}
        <div className="xl:col-span-2 space-y-5">
          {cartItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-5 md:p-6 relative overflow-hidden"
            >
              {/* glow */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                {/* LEFT */}
                <div className="flex items-center gap-5">
                  <div className="w-28 h-28 rounded-3xl overflow-hidden border border-white/10 bg-black/20">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <Link
                      to={`/product/${item.product}`}
                      className="text-lg font-black hover:text-cyan-400 transition-colors"
                    >
                      {item.name}
                    </Link>

                    {item.variant && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        {item.variant}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <PackageCheck className="w-4 h-4 text-emerald-400" />

                      <span>{item.stock} items available</span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-cyan-400">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </h3>

                      <p className="text-xs text-slate-500">
                        ₹{item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-5">
                  {/* qty */}
                  <div className="flex items-center rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                    <button
                      onClick={() =>
                        handleQtyChange(item, "minus")
                      }
                      className="w-12 h-12 flex items-center justify-center hover:bg-white/5 transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="w-12 text-center font-black">
                      {item.quantity}
                    </div>

                    <button
                      onClick={() =>
                        handleQtyChange(item, "plus")
                      }
                      className="w-12 h-12 flex items-center justify-center hover:bg-white/5 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* remove */}
                  <button
                    onClick={() => handleRemove(item)}
                    className="w-12 h-12 rounded-2xl border border-rose-500/20 bg-rose-500/10 flex items-center justify-center text-rose-400 hover:scale-105 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="space-y-6 sticky top-24">
          {/* coupon */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-indigo-400" />
              </div>

              <div>
                <h2 className="font-black text-lg">
                  Discount Coupon
                </h2>

                <p className="text-xs text-slate-400">
                  Apply premium discount codes
                </p>
              </div>
            </div>

            {coupon ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 flex items-start justify-between">
                <div>
                  <h3 className="font-black text-emerald-400 uppercase">
                    {coupon.code}
                  </h3>

                  <p className="text-xs text-emerald-300 mt-1">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} OFF`}
                  </p>
                </div>

                <button
                  onClick={handleRemoveCoupon}
                  className="w-8 h-8 rounded-full hover:bg-emerald-500/20 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleApplyCoupon}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) =>
                    setCouponCode(e.target.value)
                  }
                  className="w-full h-14 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500/40 uppercase"
                />

                <button
                  type="submit"
                  disabled={couponLoading}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black hover:scale-[1.02] transition-all disabled:opacity-60"
                >
                  {couponLoading
                    ? "Applying..."
                    : "Apply Coupon"}
                </button>
              </form>
            )}
          </motion.div>

          {/* summary */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>

              <div>
                <h2 className="font-black text-lg">
                  Order Summary
                </h2>

                <p className="text-xs text-slate-400">
                  Secure checkout overview
                </p>
              </div>
            </div>

            <div className="space-y-4 border-b border-white/10 pb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Items Subtotal
                </span>

                <span className="font-bold">
                  ₹{itemsPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Shipping
                </span>

                <span className="font-bold">
                  {shippingPrice === 0 ? (
                    <span className="text-emerald-400">
                      FREE
                    </span>
                  ) : (
                    `₹${shippingPrice.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Taxes</span>

                <span className="font-bold">
                  ₹{taxPrice.toFixed(2)}
                </span>
              </div>

              {discountPrice > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400">
                    Discount
                  </span>

                  <span className="font-black text-emerald-400">
                    -₹{discountPrice.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* total */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Grand Total
                </p>

                <h2 className="text-4xl font-black text-cyan-400">
                  ₹{totalPrice.toFixed(2)}
                </h2>
              </div>
            </div>

            {itemsPrice < 150 && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
                Add ₹{(150 - itemsPrice).toFixed(2)} more to
                unlock FREE shipping.
              </div>
            )}

            {/* checkout */}
            <button
              onClick={handleCheckoutRedirect}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-2xl shadow-cyan-500/20"
            >
              <span>Proceed to Checkout</span>

              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />

              <span>100% Secure Premium Checkout</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;