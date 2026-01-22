import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderAPI from '../../api/orderAPI';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      if (!orderId) return rejectWithValue('Order id is missing');
      const response = await orderAPI.getOrderById(orderId);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch order details');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await orderAPI.cancelOrder(orderId);
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel order');
    }
  }
);

const initialState = {
  orders: [],
  order: null,
  loading: false,
  error: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearOrderDetails: (state) => {
      state.order = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const list = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
        state.orders = list.map(o => ({ ...o, _id: o._id || o.id }));
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.map(order => 
          order._id === action.payload
            ? { ...order, orderStatus: 'cancelled' }
            : order
        );
        if (state.order && state.order._id === action.payload) {
          state.order = { ...state.order, orderStatus: 'cancelled' };
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearOrderError, clearOrderDetails } = orderSlice.actions;

export default orderSlice.reducer;
