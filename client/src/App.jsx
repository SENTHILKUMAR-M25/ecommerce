import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { ToastProvider } from './components/common/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ScrollToTop from './components/ScrollToTop';

// Layouts & Protected Routes
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { ProtectedRoute, AdminRoute } from './router/ProtectedRoutes';

// Customer Facing Pages
import Home from './pages/User/Home';
import ProductListings from './pages/User/ProductListings';
import ProductDetails from './pages/User/ProductDetails';
import CartPage from './pages/User/CartPage';
import WishlistPage from './pages/User/WishlistPage';
import CheckoutPage from './pages/User/CheckoutPage';
import PaymentSuccess from './pages/User/PaymentSuccess';
import ProfilePage from './pages/User/ProfilePage';
import OrdersHistory from './pages/User/OrdersHistory';
import LoginPage from './pages/User/LoginPage';
import RegisterPage from './pages/User/RegisterPage';
import OffersProductPage from './pages/User/OffersProductPage';

// Admin Pages
import Dashboard from './pages/Admin/Dashboard';
import ProductManager from './pages/Admin/ProductManager';
import CategoryManager from './pages/Admin/CategoryManager';
import OrderManager from './pages/Admin/OrderManager';
import UserManager from './pages/Admin/UserManager';
import AuditLogs from './pages/Admin/AuditLogs';
import CouponManager from './pages/Admin/CouponManager';
import OffersPage from './pages/Admin/OfferPage';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Customer Routes (Main Layout) */}
            <Route path="/" element={
              <MainLayout>
                <Home />
              </MainLayout>
            } />
            <Route path="/products" element={
              <MainLayout>
                <ProductListings />
              </MainLayout>
            } />
            <Route path="/offers" element={
              <MainLayout>
                <OffersProductPage />
              </MainLayout>
            } />
            <Route path="/offers/:slug" element={
              <MainLayout>
                <OffersProductPage />
              </MainLayout>
            } />
            <Route path="/product/:slug" element={
              <MainLayout>
                <ProductDetails />
              </MainLayout>
            } />
            <Route path="/cart" element={
              <MainLayout>
                <CartPage />
              </MainLayout>
            } />
            <Route path="/wishlist" element={
              <MainLayout>
                <WishlistPage />
              </MainLayout>
            } />
            <Route path="/login" element={
              <MainLayout>
                <LoginPage />
              </MainLayout>
            } />
            <Route path="/register" element={
              <MainLayout>
                <RegisterPage />
              </MainLayout>
            } />

            {/* Protected Customer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={
                <MainLayout>
                  <CheckoutPage />
                </MainLayout>
              } />
              <Route path="/payment-success/:orderId" element={
                <MainLayout>
                  <PaymentSuccess />
                </MainLayout>
              } />
              <Route path="/profile" element={
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              } />
              <Route path="/orders" element={
                <MainLayout>
                  <OrdersHistory />
                </MainLayout>
              } />
            </Route>

            {/* Administrative Routes (Admin Sidebar Layout) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              } />
              <Route path="/admin/products" element={
                <AdminLayout>
                  <ProductManager />
                </AdminLayout>
              } />
              <Route path="/admin/categories" element={
                <AdminLayout>
                  <CategoryManager />
                </AdminLayout>
              } />
              <Route path="/admin/orders" element={
                <AdminLayout>
                  <OrderManager />
                </AdminLayout>
              } />
              <Route path="/admin/coupons" element={
                <AdminLayout>
                  <CouponManager />
                </AdminLayout>
              } />
              <Route path="/admin/offers" element={
                <AdminLayout>
                  <OffersPage />
                </AdminLayout>
              } />
              <Route path="/admin/users" element={
                <AdminLayout>
                  <UserManager />
                </AdminLayout>
              } />
              <Route path="/admin/logs" element={
                <AdminLayout>
                  <AuditLogs />
                </AdminLayout>
              } />
            </Route>

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
    </Provider>
  );
}

export default App;
