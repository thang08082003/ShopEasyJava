import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistAPI from '../../api/wishlistAPI';

// Get wishlist from localStorage safely
let wishlistItems = [];
try {
  const storedItems = localStorage.getItem('wishlistItems');
  if (storedItems) {
    const parsed = JSON.parse(storedItems);
    wishlistItems = Array.isArray(parsed) ? parsed : [];
  }
} catch (error) {
  console.error('Error parsing wishlist from localStorage:', error);
}

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.getWishlist();
      return response.data.data.products || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch wishlist'
      );
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (product, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.addToWishlist(product._id);
      // Return both the product and the response data
      return {
        product,
        wishlistData: response.data.data
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add to wishlist'
      );
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      return productId; // Return the ID to remove from state
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove from wishlist'
      );
    }
  }
);

// Wishlist slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: Array.isArray(wishlistItems) ? wishlistItems : [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      localStorage.setItem('wishlistItems', JSON.stringify([]));
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist cases
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure action.payload is an array before assigning to state.items
        state.items = Array.isArray(action.payload) ? action.payload : [];
        localStorage.setItem('wishlistItems', JSON.stringify(state.items));
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to wishlist cases
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        
        // Check if we have products from the wishlist data
        if (action.payload.wishlistData && action.payload.wishlistData.products) {
          // Use the complete updated wishlist from API
          state.items = action.payload.wishlistData.products;
        } else {
          // Fallback: Just add the product to the current items
          const productToAdd = action.payload.product;
          // Only add if not already in the list
          if (!state.items.some(item => item._id === productToAdd._id)) {
            state.items.push(productToAdd);
          }
        }
        localStorage.setItem('wishlistItems', JSON.stringify(state.items));
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove from wishlist cases
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        // Filter the item out immediately for better UI responsiveness
        state.items = state.items.filter(item => item._id !== action.payload);
        localStorage.setItem('wishlistItems', JSON.stringify(state.items));
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
