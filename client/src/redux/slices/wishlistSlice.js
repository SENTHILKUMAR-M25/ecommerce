import { createSlice } from '@reduxjs/toolkit';

const savedWishlist = JSON.parse(localStorage.getItem('aura_wishlist')) || [];

const initialState = {
  wishlistItems: savedWishlist
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const item = action.payload;
      const exists = state.wishlistItems.find(x => x.product === item.product);
      if (!exists) {
        state.wishlistItems.push(item);
        localStorage.setItem('aura_wishlist', JSON.stringify(state.wishlistItems));
      }
    },
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      state.wishlistItems = state.wishlistItems.filter(x => x.product !== productId);
      localStorage.setItem('aura_wishlist', JSON.stringify(state.wishlistItems));
    }
  }
});

export const { addToWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
