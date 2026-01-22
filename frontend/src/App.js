import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';
import { fetchCategories } from './store/slices/categorySlice';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WishlistPage from './pages/WishlistPage';
import NotFoundPage from './pages/NotFoundPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import CouponListPage from './pages/admin/CouponListPage';
import CouponFormPage from './pages/admin/CouponFormPageSimple';

// Protected Route Component
const ProtectedRoute = ({ children, isAdmin = false }) => {
  const { isAuthenticated, isAdmin: userIsAdmin } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (isAdmin && !userIsAdmin) {
    return <Navigate to="/" />;
  }
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector(state => state.auth);
  
  useEffect(() => {
    // Fetch initial data
    dispatch(fetchCategories());
    
    if (token) {
      dispatch(getUserProfile());
      dispatch(fetchCart());
    }
  }, [dispatch, token]);
  
  return (
    <Routes>
      {/* Main Layout Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListingPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route 
          path="checkout" 
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="orders" 
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="orders/:id" 
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="wishlist" 
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          } 
        />
        <Route path="login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>
      
      {/* Admin Layout Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute isAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="coupons" element={
          <ProtectedRoute isAdmin={true}>
            <CouponListPage />
          </ProtectedRoute>
        } />
        <Route path="coupons/create" element={
          <ProtectedRoute isAdmin={true}>
            <CouponFormPage />
          </ProtectedRoute>
        } />
        <Route path="coupons/:id/edit" element={
          <ProtectedRoute isAdmin={true}>
            <CouponFormPage />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
