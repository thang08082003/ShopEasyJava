import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productAPI from '../../api/productAPI';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProducts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch products');
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProductById(productId);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch product details');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      // Backend does not support sorting params; fetch all and pick top locally
      const response = await productAPI.getProducts();
      const payload = response.data?.data || response.data || [];
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload.data) ? payload.data : []);
      // Sort by ratingAverage (or ratings.average) and take top 8
      const withRatings = list.map(p => ({
        ...p,
        _id: p._id || p.id,
        ratingScore: p.ratingAverage ?? p.ratings?.average ?? 0
      }));
      return withRatings.sort((a, b) => (b.ratingScore || 0) - (a.ratingScore || 0)).slice(0, 12);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch featured products');
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  'products/fetchRelatedProducts',
  async ({ categoryId, productId }, { rejectWithValue }) => {
    try {
      // Get products in the same category, excluding current product
      const response = await productAPI.getProducts({ 
        category: categoryId,
        limit: 4
      });
      // Filter out the current product
      const relatedProducts = response.data.data.filter(p => p._id !== productId);
      return relatedProducts;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch related products');
    }
  }
);

// Admin actions
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await productAPI.createProduct(productData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await productAPI.updateProduct(id, productData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await productAPI.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete product');
    }
  }
);

const initialState = {
  products: [],
  product: null,
  featuredProducts: [],
  relatedProducts: [],
  loading: false,
  error: null,
  total: 0,
  pagination: {}
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    clearProductDetails: (state) => {
      state.product = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const data = Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];
        state.products = data.map(p => ({ ...p, _id: p._id || p.id }));
        state.total = payload.total || data.length;
        state.pagination = payload.pagination || {};
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch product details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload || {};
        state.product = { ...p, _id: p._id || p.id };
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        const mapped = (action.payload || []).map(p => ({ ...p, _id: p._id || p.id }));
        const uniq = [];
        const seen = new Set();
        for (const item of mapped) {
          if (!item._id || !seen.has(item._id)) {
            if (item._id) seen.add(item._id);
            uniq.push(item);
          }
          if (uniq.length >= 8) break;
        }
        state.featuredProducts = uniq;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch related products
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.relatedProducts = action.payload;
      })
      
      // Create product (admin)
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload || {};
        state.products.push({ ...item, _id: item._id || item.id });
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update product (admin)
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload || {};
        const updatedId = updated._id || updated.id;
        const index = state.products.findIndex(p => p._id === updatedId);
        if (index !== -1) {
          state.products[index] = { ...updated, _id: updatedId };
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete product (admin)
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProductError, clearProductDetails } = productSlice.actions;

export default productSlice.reducer;
