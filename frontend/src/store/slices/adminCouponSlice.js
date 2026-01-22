import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// Get all coupons
export const getCoupons = createAsyncThunk(
  'adminCoupons/getCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/coupons');
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get single coupon
export const getCouponDetails = createAsyncThunk(
  'adminCoupons/getCouponDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/coupons/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create new coupon
export const createCoupon = createAsyncThunk(
  'adminCoupons/createCoupon',
  async (couponData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/coupons', couponData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update coupon
export const updateCoupon = createAsyncThunk(
  'adminCoupons/updateCoupon',
  async ({ id, couponData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/coupons/${id}`, couponData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Delete coupon
export const deleteCoupon = createAsyncThunk(
  'adminCoupons/deleteCoupon',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/coupons/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Make sure the initialState has the correct structure
const initialState = {
  coupons: [],
  coupon: null,
  loading: false,
  error: null,
  success: false,
};

const adminCouponSlice = createSlice({
  name: 'adminCoupons',
  initialState,
  reducers: {
    resetCouponState: (state) => {
      state.success = false;
      state.error = null;
    },
    clearCouponDetails: (state) => {
      state.coupon = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all coupons
      .addCase(getCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCoupons.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const list = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
        state.coupons = list.map(c => ({ ...c, _id: c._id || c.id }));
      })
      .addCase(getCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get coupon details
      .addCase(getCouponDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCouponDetails.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.coupon = payload.data || payload;
      })
      .addCase(getCouponDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create coupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const item = (action.payload && action.payload.data) || action.payload || {};
        state.coupons.push({ ...item, _id: item._id || item.id });
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update coupon
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const item = (action.payload && action.payload.data) || action.payload || {};
        const itemId = item._id || item.id;
        state.coupon = item;
        state.coupons = state.coupons.map(coupon => 
          coupon._id === itemId ? { ...item, _id: itemId } : coupon
        );
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete coupon
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = state.coupons.filter(coupon => coupon._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCouponState, clearCouponDetails } = adminCouponSlice.actions;
export default adminCouponSlice.reducer;
