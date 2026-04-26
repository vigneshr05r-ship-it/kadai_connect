import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

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

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  const { user, loading } = useAuth();

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
  );
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
