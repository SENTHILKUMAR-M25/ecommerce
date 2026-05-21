import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';
import { clearCart } from './cartSlice';

// Async Thunks
export const placeOrder = createAsyncThunk(
  'orders/place',
  async (orderData, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post('/orders', orderData);
      // Clean Cart upon success
      dispatch(clearCart());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/orders/my-orders');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchDetail',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const cancelMyOrder = createAsyncThunk(
  'orders/cancel',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await API.put(`/orders/${orderId}/cancel`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  orders: [],
  orderDetails: null,
  loading: false,
  success: false,
  error: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.orderDetails = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Order By ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.orderDetails = null;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Order
      .addCase(cancelMyOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelMyOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Update item in lists
        state.orders = state.orders.map(o => o._id === action.payload._id ? action.payload : o);
        if (state.orderDetails && state.orderDetails._id === action.payload._id) {
          state.orderDetails = action.payload;
        }
      })
      .addCase(cancelMyOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
