import { configureStore } from '@reduxjs/toolkit';
import adminCouponReducer from './slices/adminCouponSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';

const store = configureStore({
  reducer: {
    adminCoupons: adminCouponReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});

export default store;