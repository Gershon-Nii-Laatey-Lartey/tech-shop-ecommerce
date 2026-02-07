import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import AdminProducts from './pages/AdminProducts';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import AdminCategories from './pages/AdminCategories';
import SearchResults from './pages/SearchResults';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking'; // Import new tracking page
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';
import AdminDiscounts from './pages/AdminDiscounts';
import AdminContent from './pages/AdminContent';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminReviews from './pages/AdminReviews';
import AdminSettings from './pages/AdminSettings';
import HelpSupport from './pages/HelpSupport';
import ContentPage from './pages/ContentPage';
import NotFound from './pages/NotFound';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { CartProvider } from './contexts/CartContext';
import { useAnalytics } from './hooks/useAnalytics';
import './App.css';

const AppContent = () => {
  useAnalytics();
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="app-layout">
      {!isAuthPage && !isAdminPage && <Navbar />}
      <main className={isAuthPage || isAdminPage ? "" : "main-content"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
          <Route path="/admin/discounts" element={<AdminRoute><AdminDiscounts /></AdminRoute>} />
          <Route path="/admin/content" element={<AdminRoute><AdminContent /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderTracking />} /> {/* New Route */}
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/support" element={<HelpSupport />} />
          <Route path="/page/:slug" element={<ContentPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CategoryProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </CartProvider>
      </CategoryProvider>
    </AuthProvider>
  );
}

export default App;
