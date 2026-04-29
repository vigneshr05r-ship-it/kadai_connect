import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('kc_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('kc_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('kc_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kc_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('kc_bookings', JSON.stringify(bookings));
    window.dispatchEvent(new Event('storage'));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('kc_wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('storage'));
  }, [wishlist]);

  const [toast, setToast] = useState({ visible: false, msg: '', icon: '🛍️' });

  const showToast = (msg, icon = '🛍️') => {
    setToast({ visible: true, msg, icon });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 2000);
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, qty: item.qty + quantity } 
            : item
        );
      }
      return [...prev, { ...product, qty: quantity, cartId: Math.random().toString(36).substr(2, 9) }];
    });
    showToast(`${product.name} added to bag!`, '✨');
  };

  const addBooking = (service, date, time) => {
    setBookings(prev => [
      ...prev, 
      { 
        ...service, 
        bookingDate: date, 
        bookingTime: time, 
        bookingId: Math.random().toString(36).substr(2, 9) 
      }
    ]);
    showToast(`Service booked for ${date}!`, '📅');
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const removeBooking = (bookingId) => {
    setBookings(prev => prev.filter(item => item.bookingId !== bookingId));
  };

  const updateQuantity = (cartId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setBookings([]);
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0) +
                    bookings.reduce((acc, item) => acc + Number(item.price), 0);
  
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0) + bookings.length;

  return (
    <CartContext.Provider value={{
      cart,
      bookings,
      wishlist,
      addToCart,
      addBooking,
      removeFromCart,
      removeBooking,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      cartTotal,
      cartCount
    }}>
      {children}

      {/* Add to Cart Popup */}
      {toast.visible && (
        <div 
          style={{
            position: 'fixed',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--brown-deep)',
            color: 'var(--gold-light)',
            padding: '12px 24px',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            zIndex: 9999,
            border: '2px solid var(--gold)',
            animation: 'slideUpBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>{toast.icon}</span>
          <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{toast.msg}</span>
        </div>
      )}

      <style>{`
        @keyframes slideUpBounce {
          from { transform: translate(-50%, 50px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </CartContext.Provider>
  );
};
