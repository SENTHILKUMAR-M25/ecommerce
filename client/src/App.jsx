import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import store from './redux/store';
import { ToastProvider } from './components/common/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/common/LoadingSpinner';

// Layouts & Protected Routes
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { ProtectedRoute, AdminRoute } from './router/ProtectedRoutes';
import OrderInvoice from './pages/Common/InvoicePage';

// Lazy Loaded Pages
const Home = lazy(() => import('./pages/User/Home'));
const ProductListings = lazy(() => import('./pages/User/ProductListings'));
const ProductDetails = lazy(() => import('./pages/User/ProductDetails'));
const CartPage = lazy(() => import('./pages/User/CartPage'));
const WishlistPage = lazy(() => import('./pages/User/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/User/CheckoutPage'));
const PaymentSuccess = lazy(() => import('./pages/User/PaymentSuccess'));
const ProfilePage = lazy(() => import('./pages/User/ProfilePage'));
const OrdersHistory = lazy(() => import('./pages/User/OrdersHistory'));
const LoginPage = lazy(() => import('./pages/User/LoginPage'));
const RegisterPage = lazy(() => import('./pages/User/RegisterPage'));
const OffersProductPage = lazy(() => import('./pages/User/OffersProductPage'));

const Dashboard = lazy(() => import('./pages/Admin/Dashboard'));
const ProductManager = lazy(() => import('./pages/Admin/ProductManager'));
const CategoryManager = lazy(() => import('./pages/Admin/CategoryManager'));
const OrderManager = lazy(() => import('./pages/Admin/OrderManager'));
const UserManager = lazy(() => import('./pages/Admin/UserManager'));
const AuditLogs = lazy(() => import('./pages/Admin/AuditLogs'));
const CouponManager = lazy(() => import('./pages/Admin/CouponManager'));
const OffersPage = lazy(() => import('./pages/Admin/OfferPage'));
// const OrderInvoice = lazy(() => import('./pages/Common/InvoicePage'));

function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<LoadingSpinner size="lg" />}>
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
                    <Route path="/order/invoice/:id" element={<OrderInvoice />} />
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
              </Suspense>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </HelmetProvider>
    </Provider>
  );
}

export default App;
