import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "../../redux/slices/orderSlice";
import { updateProfile } from "../../redux/slices/authSlice";
import { useToast } from "../../components/common/ToastContext";

import {
  CreditCard,
  Wallet,
  MapPin,
  Plus,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Truck,
  BadgeCheck,
  Sparkles,
  LockKeyhole,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user } = useSelector((state) => state.auth);

  const {
    cartItems,
    coupon,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountPrice,
    totalPrice,
  } = useSelector((state) => state.cart);

  const { loading } = useSelector((state) => state.orders);

  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Address States
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [zipCode, setZipCode] = useState("");

  // Card States
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [processingPayment, setProcessingPayment] = useState(false);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();

    if (!street || !city || !state || !zipCode) {
      toast("Please fill all address fields.", "error");
      return;
    }

    const newAddress = {
      street,
      city,
      state,
      country,
      zipCode,
      isDefault: user.addresses.length === 0,
    };

    const updatedAddresses = [...user.addresses, newAddress];

    try {
      await dispatch(
        updateProfile({
          addresses: updatedAddresses,
        })
      ).unwrap();

      toast("New address saved successfully!", "success");

      setStreet("");
      setCity("");
      setState("");
      setZipCode("");

      setShowNewAddressForm(false);

      setSelectedAddressIdx(user.addresses.length);
    } catch (err) {
      toast(typeof err === 'string' ? err : "Failed to save address", "error");
    }
  };

  const handlePlaceOrder = async () => {
    if (!user.addresses || user.addresses.length === 0) {
      toast("Please add a shipping address first!", "error");
      return;
    }

    const shippingAddress = user.addresses[selectedAddressIdx];

    const orderItems = cartItems.map((item) => ({
      product: item.product,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
      variant: item.variant,
    }));

    const orderData = {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      couponCode: coupon?.code,
    };

    if (paymentMethod === "Card") {
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        toast("Please fill card details.", "error");
        return;
      }

      try {
        setProcessingPayment(true);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        setProcessingPayment(false);
      } catch (err) {
        setProcessingPayment(false);

        toast("Payment failed.", "error");
        return;
      }
    }

    try {
      const order = await dispatch(placeOrder(orderData)).unwrap();

      toast("Order placed successfully!", "success");

      navigate(`/payment-success/${order._id}`);
    } catch (err) {
      toast(typeof err === 'string' ? err : "Failed to place order", "error");
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* TOP HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-fuchsia-500/10 backdrop-blur-2xl p-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-5">
                <Sparkles className="w-4 h-4 text-cyan-400" />

                <span className="text-xs font-bold tracking-widest uppercase text-cyan-300">
                  Secure Checkout
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                Premium Checkout
              </h1>

              <p className="text-slate-400 mt-3 max-w-2xl text-sm leading-relaxed">
                Complete your order securely with encrypted payment protection,
                real-time processing, and lightning-fast delivery services.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs text-slate-400 uppercase tracking-widest">
                  Items
                </p>

                <h3 className="text-2xl font-black mt-1">
                  {cartItems.length}
                </h3>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs text-slate-400 uppercase tracking-widest">
                  Total
                </p>

                <h3 className="text-2xl font-black mt-1 text-cyan-400">
                  ₹{totalPrice.toFixed(2)}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="xl:col-span-2 space-y-8">
          {/* ADDRESS SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <MapPin className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    Shipping Address
                  </h2>

                  <p className="text-sm text-slate-400 mt-1">
                    Choose delivery location
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setShowNewAddressForm(!showNewAddressForm)
                }
                className="px-5 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold hover:bg-cyan-500/20 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Address
                </span>
              </button>
            </div>

            {/* ADDRESS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {user?.addresses?.map((addr, idx) => {
                const isSelected = idx === selectedAddressIdx;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedAddressIdx(idx)}
                    className={`relative overflow-hidden rounded-3xl border p-5 text-left transition-all duration-300 ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                        : "border-white/10 bg-white/5 hover:border-cyan-500/30"
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>

                      <h3 className="font-black text-sm mb-3">
                        Address #{idx + 1}
                      </h3>

                      <p className="text-sm text-slate-400 leading-relaxed">
                        {addr.street}
                        <br />
                        {addr.city}, {addr.state}
                        <br />
                        {addr.country} - {addr.zipCode}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* NEW ADDRESS FORM */}
            <AnimatePresence>
              {showNewAddressForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddNewAddress}
                  className="mt-8 border border-white/10 rounded-[2rem] p-6 bg-black/20 space-y-5"
                >
                  <h3 className="text-lg font-black">
                    Add New Address
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="h-14 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-500"
                    />

                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-14 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-500"
                    />

                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="h-14 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-500"
                    />

                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="h-14 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-500"
                    />

                    <input
                      type="text"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="md:col-span-2 h-14 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-5 py-3 rounded-2xl border border-white/10"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold"
                    >
                      Save Address
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* PAYMENT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <CreditCard className="w-6 h-6 text-white" />
              </div>

              <div>
                <h2 className="text-xl font-black">
                  Payment Method
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Secure payment options
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* COD */}
              <button
                onClick={() => setPaymentMethod("COD")}
                className={`rounded-3xl border p-5 text-left transition-all ${
                  paymentMethod === "COD"
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Wallet className="w-7 h-7 text-emerald-400" />
                  </div>

                  {paymentMethod === "COD" && (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  )}
                </div>

                <h3 className="font-black text-lg">
                  Cash On Delivery
                </h3>

                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Pay after your package arrives at your doorstep.
                </p>
              </button>

              {/* CARD */}
              <button
                onClick={() => setPaymentMethod("Card")}
                className={`rounded-3xl border p-5 text-left transition-all ${
                  paymentMethod === "Card"
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <CreditCard className="w-7 h-7 text-indigo-400" />
                  </div>

                  {paymentMethod === "Card" && (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  )}
                </div>

                <h3 className="font-black text-lg">
                  Credit / Debit Card
                </h3>

                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Secure encrypted payment with instant processing.
                </p>
              </button>
            </div>

            {/* CARD FORM */}
            <AnimatePresence>
              {paymentMethod === "Card" && (
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 rounded-[2rem] border border-white/10 bg-black/20 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-lg">
                      Card Information
                    </h3>

                    <div className="flex items-center gap-2 text-cyan-400 text-sm">
                      <LockKeyhole className="w-4 h-4" />
                      Encrypted
                    </div>
                  </div>

                  <div className="space-y-5">
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-500"
                    />

                    <input
                      type="text"
                      placeholder="Card Number"
                      maxLength={16}
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-500"
                    />

                    <div className="grid grid-cols-2 gap-5">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) =>
                          setCardExpiry(e.target.value)
                        }
                        className="h-14 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-500"
                      />

                      <input
                        type="password"
                        placeholder="CVV"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) =>
                          setCardCvv(
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        className="h-14 rounded-2xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          className="sticky top-24"
        >
          <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* HEADER */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    Order Summary
                  </h2>

                  <p className="text-sm text-slate-400">
                    {cartItems.length} products
                  </p>
                </div>
              </div>
            </div>

            {/* ITEMS */}
            <div className="max-h-[320px] overflow-y-auto p-6 space-y-5">
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-sm line-clamp-1">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-cyan-400">
                      ₹
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* TOTALS */}
            <div className="border-t border-white/10 p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">
                  Items Subtotal
                </span>

                <span className="font-bold">
                  ₹{itemsPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shipping</span>

                <span className="font-bold">
                  {shippingPrice === 0
                    ? "FREE"
                    : `₹${shippingPrice.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Taxes</span>

                <span className="font-bold">
                  ₹{taxPrice.toFixed(2)}
                </span>
              </div>

              {discountPrice > 0 && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Coupon Discount</span>

                  <span>-₹{discountPrice.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-400">
                    Total Payable
                  </p>

                  <h2 className="text-3xl font-black text-cyan-400 mt-1">
                    ₹{totalPrice.toFixed(2)}
                  </h2>
                </div>

                <BadgeCheck className="w-10 h-10 text-cyan-400" />
              </div>

              {/* PLACE ORDER */}
              <button
                onClick={handlePlaceOrder}
                disabled={
                  loading ||
                  processingPayment ||
                  cartItems.length === 0
                }
                className="w-full mt-5 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-black text-sm shadow-2xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {loading || processingPayment ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />

                    {processingPayment
                      ? "Processing Payment..."
                      : "Placing Order..."}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Secure Pay ₹{totalPrice.toFixed(2)}
                  </span>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-3">
                <LockKeyhole className="w-3.5 h-3.5" />

                SSL secured payment gateway
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;