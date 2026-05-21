import { createSlice } from '@reduxjs/toolkit';

const calculateTotals = (state) => {
  // 1. Items subtotal
  state.itemsPrice = state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // 2. Shipping: $15 flat or free if over $150
  state.shippingPrice = state.itemsPrice > 150 || state.itemsPrice === 0 ? 0 : 15;
  
  // 3. Tax: 8% of items subtotal
  state.taxPrice = Math.round((state.itemsPrice * 0.08) * 100) / 100;
  
  // 4. Coupon Discount
  state.discountPrice = 0;
  if (state.coupon) {
    if (state.coupon.discountType === 'percentage') {
      state.discountPrice = Math.round(((state.coupon.discountValue / 100) * state.itemsPrice) * 100) / 100;
    } else {
      state.discountPrice = state.coupon.discountValue;
    }
    // Limit discount to subtotal
    state.discountPrice = Math.min(state.discountPrice, state.itemsPrice);
  }

  // 5. Total
  state.totalPrice = Math.round((state.itemsPrice + state.shippingPrice + state.taxPrice - state.discountPrice) * 100) / 100;

  // Persist
  localStorage.setItem('aura_cart', JSON.stringify(state.cartItems));
  localStorage.setItem('aura_coupon', JSON.stringify(state.coupon));
};

const savedCart = JSON.parse(localStorage.getItem('aura_cart')) || [];
const savedCoupon = JSON.parse(localStorage.getItem('aura_coupon')) || null;

const initialState = {
  cartItems: savedCart,
  coupon: savedCoupon,
  itemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
  discountPrice: 0,
  totalPrice: 0
};

// Initial calculations
const tempState = { ...initialState };
calculateTotals(tempState);

const cartSlice = createSlice({
  name: 'cart',
  initialState: tempState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existItem = state.cartItems.find(x => x.product === newItem.product && x.variant === newItem.variant);

      if (existItem) {
        existItem.quantity = Math.min(existItem.quantity + newItem.quantity, existItem.stock);
      } else {
        state.cartItems.push(newItem);
      }
      calculateTotals(state);
    },
    removeFromCart: (state, action) => {
      const { product, variant } = action.payload;
      state.cartItems = state.cartItems.filter(x => !(x.product === product && x.variant === variant));
      calculateTotals(state);
    },
    updateCartQuantity: (state, action) => {
      const { product, variant, quantity } = action.payload;
      const existItem = state.cartItems.find(x => x.product === product && x.variant === variant);
      if (existItem) {
        existItem.quantity = Math.min(Math.max(Number(quantity), 1), existItem.stock);
      }
      calculateTotals(state);
    },
    applyCartCoupon: (state, action) => {
      state.coupon = action.payload;
      calculateTotals(state);
    },
    removeCartCoupon: (state) => {
      state.coupon = null;
      calculateTotals(state);
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.coupon = null;
      state.itemsPrice = 0;
      state.shippingPrice = 0;
      state.taxPrice = 0;
      state.discountPrice = 0;
      state.totalPrice = 0;
      localStorage.removeItem('aura_cart');
      localStorage.removeItem('aura_coupon');
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  applyCartCoupon,
  removeCartCoupon,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
