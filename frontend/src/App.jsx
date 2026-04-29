import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { onMessageListener, requestNotificationPermission } from './firebase';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import ShopkeeperDashboard from './pages/ShopkeeperDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import Register from './pages/Register';
import StorePage from './pages/StorePage';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Services from './pages/Services';
import Shops from './pages/Shops';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  const { user, loading, apiFetch, updateUser } = useAuth();
  const [notification, setNotification] = useState({ title: '', body: '', show: false });

  // Handle Firebase Notifications
  useEffect(() => {
    if (user && !user.fcm_token) {
      // Small delay to ensure browser is ready
      setTimeout(() => {
        requestNotificationPermission(apiFetch, updateUser);
      }, 3000);
    }
  }, [user]);

  useEffect(() => {
    onMessageListener()
      .then((payload) => {
        setNotification({
          title: payload.notification.title,
          body: payload.notification.body,
          show: true
        });
        // Auto hide notification after 5 seconds
        setTimeout(() => setNotification({ show: false }), 5000);
      })
      .catch((err) => console.log('failed: ', err));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-primary rounded-2xl animate-pulse flex items-center justify-center mb-4">
          <span className="text-white font-serif font-bold text-2xl italic">K</span>
        </div>
        <div className="text-primary font-serif font-bold italic animate-bounce">Authenticating...</div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification Popup */}
      {notification.show && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: 'var(--brown-deep)', color: 'var(--gold-light)',
          padding: '16px 24px', borderRadius: 16, border: '2px solid var(--gold)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)', animation: 'slideIn 0.5s ease-out'
        }}>
          <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: 4 }}>{notification.title}</div>
          <div style={{ fontSize: '.85rem', fontWeight: 600, opacity: 0.9 }}>{notification.body}</div>
          <button 
            onClick={() => setNotification({ show: false })}
            style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ×
          </button>
        </div>
      )}

      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

        {/* Customer Portal */}
        <Route path="/" element={
          <ProtectedRoute>
             {user?.role === 'shopkeeper' ? <Navigate to="/shopkeeper" replace /> : 
              user?.role === 'delivery' ? <Navigate to="/delivery" replace /> : 
              <Home />}
          </ProtectedRoute>
        } />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
        <Route path="/shops" element={<ProtectedRoute><Shops /></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />

        {/* Shopkeeper */}
        <Route path="/shopkeeper" element={
          <ProtectedRoute role="shopkeeper"><ShopkeeperDashboard /></ProtectedRoute>
        } />
        <Route path="/shopkeeper/products" element={
          <ProtectedRoute role="shopkeeper"><ShopkeeperDashboard /></ProtectedRoute>
        } />
        <Route path="/shopkeeper/orders" element={
          <ProtectedRoute role="shopkeeper"><ShopkeeperDashboard /></ProtectedRoute>
        } />
        <Route path="/shopkeeper/settings" element={
          <ProtectedRoute role="shopkeeper"><ShopkeeperDashboard /></ProtectedRoute>
        } />

        {/* Delivery */}
        <Route path="/delivery" element={
          <ProtectedRoute role="delivery"><DeliveryDashboard /></ProtectedRoute>
        } />

        {/* Store Page */}
        <Route path="/store/:id" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
