import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../../redux/slices/orderSlice';
import { updateProfile } from '../../redux/slices/authSlice';
import { useToast } from '../../components/common/ToastContext';
import { CreditCard, Wallet, MapPin, Plus, CheckCircle, ShieldCheck, RefreshCw } from 'lucide-react';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user } = useSelector((state) => state.auth);
  const { cartItems, coupon, itemsPrice, shippingPrice, taxPrice, discountPrice, totalPrice } = useSelector((state) => state.cart);
  const { loading } = useSelector((state) => state.orders);

  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'Card'
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New Address Form States
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('United States');
  const [zipCode, setZipCode] = useState('');

  // Card payment states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zipCode) {
      toast('Please fill out all address fields.', 'error');
      return;
    }

    const newAddress = { street, city, state, country, zipCode, isDefault: user.addresses.length === 0 };
    const updatedAddresses = [...user.addresses, newAddress];

    try {
      await dispatch(updateProfile({ addresses: updatedAddresses })).unwrap();
      toast('New shipping address saved successfully!', 'success');
      
      // Reset form states
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setShowNewAddressForm(false);
      setSelectedAddressIdx(user.addresses.length); // select the newly added address
    } catch (err) {
      toast(err || 'Failed to save address.', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!user.addresses || user.addresses.length === 0) {
      toast('Please add a shipping address first!', 'error');
      return;
    }

    const shippingAddress = user.addresses[selectedAddressIdx];

    // Compile orderItems
    const orderItems = cartItems.map((item) => ({
      product: item.product,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
      variant: item.variant
    }));

    const orderData = {
      orderItems,
      shippingAddress: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country,
        zipCode: shippingAddress.zipCode
      },
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      couponCode: coupon?.code
    };

    if (paymentMethod === 'Card') {
      // Validate card details
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        toast('Please enter your card payment details.', 'error');
        return;
      }
      
      try {
        setProcessingPayment(true);
        // Simulate a secure bank processing latency
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setProcessingPayment(false);
      } catch (err) {
        setProcessingPayment(false);
        toast('Card transaction refused. Check funds or credentials.', 'error');
        return;
      }
    }

    try {
      const order = await dispatch(placeOrder(orderData)).unwrap();
      toast('Order placed successfully! Redirecting...', 'success');
      navigate(`/payment-success/${order._id}`);
    } catch (err) {
      toast(err || 'Failed to process order.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>
      <p className="text-sm text-slate-500">Provide shipping coordinates and finalize your secure transaction.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column: Address & payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address selection */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-bold text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-500" />
                <span>Shipping Coordinates</span>
              </h2>
              <button
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="text-xs text-cyan-500 font-bold flex items-center gap-1 hover:text-cyan-400"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* List addresses */}
            {user?.addresses.length === 0 ? (
              <div className="py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-sm">
                No shipping addresses saved. Add one below to continue.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user?.addresses.map((addr, idx) => {
                  const isSelected = selectedAddressIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedAddressIdx(idx)}
                      className={`p-4 rounded-2xl border text-left flex gap-3 relative transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10'
                          : 'border-white/10 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:border-slate-400'
                      }`}
                    >
                      <MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0 pt-0.5" />
                      <div className="text-xs space-y-1">
                        <p className="font-bold">Address #{idx + 1} {addr.isDefault && '(Default)'}</p>
                        <p className="text-slate-550 dark:text-slate-400 leading-normal">
                          {addr.street}, <br />
                          {addr.city}, {addr.state} - {addr.zipCode} <br />
                          {addr.country}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-cyan-500 absolute top-4 right-4 fill-cyan-500/10" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Add Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleAddNewAddress} className="border border-white/10 dark:border-slate-800 p-4 rounded-2xl space-y-4 animate-fadeIn">
                <h3 className="font-bold text-sm tracking-wider uppercase text-slate-400">New Coordinate Card</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Street Address</span>
                    <input
                      type="text"
                      required
                      placeholder="123 Luxury Dr, Suite 50"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-805 bg-white/40 dark:bg-slate-900/40 px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">City</span>
                    <input
                      type="text"
                      required
                      placeholder="Seattle"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-85 bg-white/40 dark:bg-slate-900/40 px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">State / Region</span>
                    <input
                      type="text"
                      required
                      placeholder="WA"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-85 bg-white/40 dark:bg-slate-900/40 px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Zip / Postal Code</span>
                    <input
                      type="text"
                      required
                      placeholder="98101"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-85 bg-white/40 dark:bg-slate-900/40 px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Country</span>
                    <input
                      type="text"
                      required
                      placeholder="United States"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-85 bg-white/40 dark:bg-slate-900/40 px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="px-4 py-2 border rounded-full text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-bold hover:bg-cyan-500"
                  >
                    Save Coordinates
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-lg space-y-4">
            <h2 className="font-bold text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              <span>Secure Payment Channels</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cash on delivery option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 relative transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10'
                    : 'border-white/10 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:border-slate-400'
                }`}
              >
                <Wallet className="w-6 h-6 text-emerald-500" />
                <div>
                  <h4 className="font-bold text-sm">Cash On Delivery (COD)</h4>
                  <p className="text-[10px] text-slate-450 mt-0.5">Settle with physical cash upon actual carrier delivery.</p>
                </div>
                {paymentMethod === 'COD' && (
                  <CheckCircle className="w-4 h-4 text-cyan-500 absolute top-4 right-4 fill-cyan-500/10" />
                )}
              </button>

              {/* Secure Card Payment Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 relative transition-all ${
                  paymentMethod === 'Card'
                    ? 'border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10'
                    : 'border-white/10 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:border-slate-400'
                }`}
              >
                <CreditCard className="w-6 h-6 text-indigo-500" />
                <div>
                  <h4 className="font-bold text-sm">Credit / Debit Card</h4>
                  <p className="text-[10px] text-slate-450 mt-0.5">Secure bank transfer completed instantly via mock checkout.</p>
                </div>
                {paymentMethod === 'Card' && (
                  <CheckCircle className="w-4 h-4 text-cyan-500 absolute top-4 right-4 fill-cyan-500/10" />
                )}
              </button>
            </div>

            {/* Card checkout fields */}
            {paymentMethod === 'Card' && (
              <div className="border border-white/10 dark:border-slate-800 p-5 rounded-2xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm tracking-wider uppercase text-slate-400">Card Payment details</h3>
                  <ShieldCheck className="w-4.5 h-4.5 text-cyan-500" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-450">Cardholder Name</span>
                    <input
                      type="text"
                      required
                      placeholder="Alexander Stone"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full rounded-xl border border-slate-205 dark:border-slate-85 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-455">Card Number</span>
                    <input
                      type="text"
                      required
                      placeholder="•••• •••• •••• ••••"
                      maxLength={16}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-xl border border-slate-205 dark:border-slate-85 bg-white/40 dark:bg-slate-900/40 px-3.5 py-2 text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-450">Expiry Date</span>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3 py-2 text-xs text-center focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-450">CVV Code</span>
                    <input
                      type="password"
                      required
                      placeholder="•••"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-80 bg-white/40 dark:bg-slate-900/40 px-3 py-2 text-xs text-center focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: summary checkout details */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-lg space-y-6">
          <h2 className="font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-3">Checkout Summary</h2>
          
          {/* List items mini */}
          <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-3 justify-between items-center text-xs">
                <div className="flex gap-2.5 items-center truncate">
                  <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover border border-white/10" />
                  <div className="truncate">
                    <p className="font-bold truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2.5 text-xs border-y border-slate-100 dark:border-slate-800/80 py-4">
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
              <span className="text-slate-500">Taxes (8%)</span>
              <span className="font-semibold">₹{taxPrice.toFixed(2)}</span>
            </div>
            {discountPrice > 0 && (
              <div className="flex justify-between text-emerald-500 font-semibold">
                <span>Coupon Applied</span>
                <span>-₹{discountPrice.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="font-bold text-sm">Amount Due</span>
            <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">₹{totalPrice.toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || processingPayment || cartItems.length === 0}
            className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold hover:shadow-lg shadow-md active:scale-98 transition-all disabled:opacity-50"
          >
            {(loading || processingPayment) ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                <span>{processingPayment ? 'Processing Card...' : 'Placing Order...'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Authorize & Pay ₹{totalPrice.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
