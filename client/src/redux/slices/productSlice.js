import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// Async Thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await API.get('/products', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await API.get(`/products/slug/${slug}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const submitReview = createAsyncThunk(
  'products/submitReview',
  async ({ productId, reviewData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post(`/reviews/${productId}`, reviewData);
      // Re-fetch product to get updated ratings and reviews
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  products: [],
  product: null,
  totalProducts: 0,
  pages: 1,
  currentPage: 1,
  loading: false,
  detailLoading: false,
  error: null,
  filters: {
    keyword: '',
    category: '',
    priceMin: '',
    priceMax: '',
    ratingMin: '',
    sort: 'newest'
  }
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        keyword: '',
        category: '',
        priceMin: '',
        priceMax: '',
        ratingMin: '',
        sort: 'newest'
      };
    },
    clearProductError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.totalProducts = action.payload.totalProducts;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Product by Slug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.detailLoading = true;
        state.product = null;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      // Submit Review
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, resetFilters, clearProductError } = productSlice.actions;
export default productSlice.reducer;
