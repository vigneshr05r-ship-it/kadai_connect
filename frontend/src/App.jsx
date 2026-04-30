import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { onMessageListener, requestNotificationPermission } from './firebase';

// Pages - Lazy loaded
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const ShopkeeperDashboard = lazy(() => import('./pages/ShopkeeperDashboard'));
const DeliveryDashboard = lazy(() => import('./pages/DeliveryDashboard'));
const Register = lazy(() => import('./pages/Register'));
const StorePage = lazy(() => import('./pages/StorePage'));
const Orders = lazy(() => import('./pages/Orders'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const Categories = lazy(() => import('./pages/Categories'));
const Products = lazy(() => import('./pages/Products'));
const Services = lazy(() => import('./pages/Services'));
const Shops = lazy(() => import('./pages/Shops'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));

const PageLoader = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center">
    <div className="w-16 h-16 bg-primary rounded-2xl animate-pulse flex items-center justify-center mb-4">
      <span className="text-white font-serif font-bold text-2xl italic">K</span>
    </div>
    <div className="text-primary font-serif font-bold italic animate-bounce">Loading...</div>
  </div>
);

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

      <Suspense fallback={<PageLoader />}>
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
          <Route path="/store/:id" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />

          {/* Shopkeeper */}
          <Route path="/shopkeeper/*" element={
            <ProtectedRoute role="shopkeeper"><ShopkeeperDashboard /></ProtectedRoute>
          } />

          {/* Delivery */}
          <Route path="/delivery/*" element={
            <ProtectedRoute role="delivery"><DeliveryDashboard /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      
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
