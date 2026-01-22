import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartAPI from '../../api/cartAPI';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) return { items: [], totalAmount: 0 };

      const response = await cartAPI.getCart();
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.addToCart(productId, quantity);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add item to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.updateCartItem(itemId, quantity);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update cart item');
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await cartAPI.removeCartItem(productId);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove cart item');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, { rejectWithValue }) => {
    try {
      const response = await cartAPI.applyCoupon(code);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Invalid coupon code');
    }
  }
);

const initialState = {
  items: [],
  totalAmount: 0,
  discountedAmount: 0,
  coupon: null,
  loading: false,
  error: null
};

const assignCartPayload = (state, payload = {}) => {
  state.items = payload.items || [];
  state.totalAmount = payload.totalAmount || 0;
  const discountAmount = payload.discountAmount;
  if (typeof discountAmount === 'number' && !isNaN(discountAmount)) {
    state.discountedAmount = state.totalAmount - discountAmount;
  } else if (typeof payload.discountedAmount === 'number' && !isNaN(payload.discountedAmount)) {
    state.discountedAmount = payload.discountedAmount;
  } else {
    state.discountedAmount = state.totalAmount;
  }

  const code = payload.coupon?.code || payload.couponCode;
  const discount = typeof discountAmount === 'number' && !isNaN(discountAmount)
    ? discountAmount
    : state.totalAmount - state.discountedAmount;
  state.coupon = code ? { code, discountAmount: discount } : null;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.discountedAmount = 0;
      state.coupon = null;
      state.error = null;
    },
    clearCartError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        assignCartPayload(state, action.payload || {});
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        assignCartPayload(state, action.payload || {});
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        assignCartPayload(state, action.payload || {});
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove cart item
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.loading = false;
        assignCartPayload(state, action.payload || {});
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Apply coupon
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        assignCartPayload(state, action.payload || {});
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCart, clearCartError } = cartSlice.actions;

export default cartSlice.reducer;
