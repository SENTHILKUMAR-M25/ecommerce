import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// Thunks for Analytics & Logs
export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/admin/analytics');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchAdminLogs = createAsyncThunk(
  'admin/fetchLogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/admin/logs');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Thunks for User Management
export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/admin/users');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const toggleUserBlockState = createAsyncThunk(
  'admin/toggleBlock',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await API.put(`/admin/users/${userId}/block`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Thunks for Category Management
export const fetchAdminCategories = createAsyncThunk(
  'admin/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/categories');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addAdminCategory = createAsyncThunk(
  'admin/addCategory',
  async (catData, { rejectWithValue }) => {
    try {
      const response = await API.post('/categories', catData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const editAdminCategory = createAsyncThunk(
  'admin/editCategory',
  async ({ id, catData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/categories/${id}`, catData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteAdminCategory = createAsyncThunk(
  'admin/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// FETCH
export const fetchAdminSubCategories = createAsyncThunk(
  'admin/fetchSubCategories',
  async (_, { rejectWithValue }) => {
    try {

      const response = await API.get('/subcategories');

      return response.data.data;

    } catch (error) {
      return rejectWithValue(error);
    }
  }
);




// ADD
export const addAdminSubCategory = createAsyncThunk(
  'admin/addSubCategory',
  async (subData, { rejectWithValue }) => {
    try {

      const response = await API.post('/subcategories', subData);

      return response.data.data;

    } catch (error) {
      return rejectWithValue(error);
    }
  }
);




// EDIT
export const editAdminSubCategory = createAsyncThunk(
  'admin/editSubCategory',
  async ({ id, subData }, { rejectWithValue }) => {
    try {

      const response = await API.put(
        `/subcategories/${id}`,
        subData
      );

      return response.data.data;

    } catch (error) {
      return rejectWithValue(error);
    }
  }
);




// DELETE
export const deleteAdminSubCategory = createAsyncThunk(
  'admin/deleteSubCategory',
  async (id, { rejectWithValue }) => {
    try {

      await API.delete(`/subcategories/${id}`);

      return id;

    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Thunks for Product Management
export const addAdminProduct = createAsyncThunk(
  'admin/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await API.post('/products', productData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const editAdminProduct = createAsyncThunk(
  'admin/editProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/products/${id}`, productData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteAdminProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Thunks for Order Management
export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/admin/orders');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateAdminOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/admin/orders/${id}`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchAdminCoupons = createAsyncThunk(
  'admin/fetchCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/coupons');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addAdminCoupon = createAsyncThunk(
  'admin/addCoupon',
  async (couponData, { rejectWithValue }) => {
    try {
      const response = await API.post('/coupons', couponData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const toggleCouponActiveState = createAsyncThunk(
  'admin/toggleCouponActive',
  async (couponId, { rejectWithValue }) => {
    try {
      const response = await API.put(`/coupons/${couponId}/toggle`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteAdminCoupon = createAsyncThunk(
  'admin/deleteCoupon',
  async (couponId, { rejectWithValue }) => {
    try {
      await API.delete(`/coupons/${couponId}`);
      return couponId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  analytics: null,
  users: [],
  categories: [],
  subcategories: [],
  orders: [],
  logs: [],
  coupons: [],
  loading: false,
  actionLoading: false,
  error: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Analytics & Logs
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAdminLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      // User Management
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(toggleUserBlockState.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.users = state.users.map(u => u._id === action.payload._id ? action.payload : u);
      })
      // Category Management
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(addAdminCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.categories.push(action.payload);
      })
      .addCase(editAdminCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.categories = state.categories.map(c => c._id === action.payload._id ? action.payload : c);
      })
      .addCase(deleteAdminCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.categories = state.categories.filter(c => c._id !== action.payload);
      })
      // FETCH
      .addCase(fetchAdminSubCategories.fulfilled, (state, action) => {

        state.loading = false;
        state.subcategories = action.payload;

      })




      // ADD
      .addCase(addAdminSubCategory.fulfilled, (state, action) => {

        state.actionLoading = false;
        state.subcategories.push(action.payload);

      })




      // EDIT
      .addCase(editAdminSubCategory.fulfilled, (state, action) => {

        state.actionLoading = false;

        state.subcategories =
          state.subcategories.map((s) =>
            s._id === action.payload._id
              ? action.payload
              : s
          );

      })
      // DELETE
      .addCase(deleteAdminSubCategory.fulfilled, (state, action) => {

        state.actionLoading = false;

        state.subcategories =
          state.subcategories.filter(
            (s) => s._id !== action.payload
          );

      })
      // Product Management
      .addCase(addAdminProduct.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(editAdminProduct.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteAdminProduct.fulfilled, (state) => {
        state.actionLoading = false;
      })
      // Order Management
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.orders = state.orders.map(o => o._id === action.payload._id ? action.payload : o);
      })
      // Coupon Management
      .addCase(fetchAdminCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(addAdminCoupon.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.coupons.push(action.payload);
      })
      .addCase(toggleCouponActiveState.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.coupons = state.coupons.map(c => c._id === action.payload._id ? action.payload : c);
      })
      .addCase(deleteAdminCoupon.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.coupons = state.coupons.filter(c => c._id !== action.payload);
      })
      // Pending statuses
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/pending'),
        (state, action) => {
          if (action.type.includes('fetch')) {
            state.loading = true;
          } else {
            state.actionLoading = true;
          }
          state.error = null;
        }
      )
      // Rejected statuses
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.actionLoading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
