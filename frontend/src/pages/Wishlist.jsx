import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import MainLayout from '../components/MainLayout';

export default function Wishlist() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');

  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('kc_wishlist') || '[]'));
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('kc_cart') || '[]'));
  const [toast, setToast] = useState({ msg: '', visible: false });

  const showToast = (msg) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  };

  const removeFromWishlist = (prod) => {
    const updated = wishlist.filter(w => w.id !== prod.id);
    setWishlist(updated);
    localStorage.setItem('kc_wishlist', JSON.stringify(updated));
    showToast(isTa ? 'விருப்பப்பட்டியலிலிருந்து நீக்கப்பட்டது' : 'Removed from wishlist');
  };

  const addToCart = (prod) => {
    const existing = cart.find(i => i.id === prod.id);
    const updated = existing
      ? cart.map(i => i.id === prod.id ? { ...i, qty: i.qty + 1 } : i)
      : [...cart, { ...prod, qty: 1 }];
    setCart(updated);
    localStorage.setItem('kc_cart', JSON.stringify(updated));
    showToast(isTa ? 'கூடையில் சேர்க்கப்பட்டது! 🛒' : 'Added to cart! 🛒');
  };

  return (
    <MainLayout title={isTa ? 'விருப்பப்பட்டியல்' : 'Wishlist'} showSearch={false}>
      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: 100, left: '50%',
        transform: `translateX(-50%) translateY(${toast.visible ? 0 : 30}px)`,
        background: 'var(--brown-deep)', color: 'var(--gold-light)',
        padding: '10px 24px', borderRadius: 16, fontSize: '.85rem',
        border: '1.5px solid var(--gold)', opacity: toast.visible ? 1 : 0,
        transition: '.3s ease-out', pointerEvents: 'none', zIndex: 1000,
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
      }}>{toast.msg}</div>

      <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 60, padding: '0 20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40, marginTop: 20 }}>
           <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 8 }}>
             {isTa ? 'விருப்பப்பட்டியல்' : 'Wishlist'}
           </h1>
           <div style={{ width: 40, height: 3, background: 'var(--gold)', margin: '0 auto', borderRadius: 2 }} />
           <p style={{ marginTop: 12, color: 'var(--brown-mid)', fontSize: '.85rem', fontWeight: 600 }}>Items you saved for later</p>
        </div>

        {wishlist.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: 'var(--cream-dark)', borderRadius: 32,
            border: '2px dashed var(--parchment)',
            maxWidth: 400, margin: '0 auto'
          }}>
            <div style={{ width: 80, height: 80, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: '2.5rem' }}>
              ❤️
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 8 }}>
              {isTa ? 'விருப்பப்பட்டியல் காலியாக உள்ளது' : 'Wishlist is Empty'}
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--brown-mid)', marginBottom: 24, fontWeight: 600 }}>
              {isTa ? 'தயாரிப்புகளை உலாவி விருப்பப்பட்டியலில் சேர்க்கவும்' : 'You haven\'t saved any items yet. Start exploring local shops.'}
            </div>
            <button onClick={() => navigate('/')} style={{
              padding: '14px 32px', background: 'var(--brown-deep)',
              color: 'var(--gold-light)', border: 'none', borderRadius: 14,
              fontSize: '.9rem', fontWeight: 800, cursor: 'pointer'
            }}>
              {isTa ? 'ஷாப்பிங் செய்' : 'Shop Now'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
            {wishlist.map(p => (
              <div key={p.id} style={{
                background: '#fff', border: '1.5px solid var(--parchment)',
                borderRadius: 24, overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(59,31,14,0.04)',
                display: 'flex', flexDirection: 'column', position: 'relative'
              }}>
                <div style={{
                  height: 150, background: 'var(--cream)',
                  position: 'relative', overflow: 'hidden',
                  borderBottom: '1px solid var(--parchment)'
                }}>
                  {(p.image_url || p.image)
                    ? <img src={p.image_url || p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📦</div>}
                  
                  <button onClick={() => removeFromWishlist(p)} style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'rgba(255,255,255,0.9)', border: '1px solid var(--parchment)',
                    borderRadius: '50%', width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--rust)', zIndex: 5
                  }}>
                    <Heart size={16} fill="var(--rust)" />
                  </button>
                </div>

                <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.65rem', color: 'var(--brown-mid)', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase' }}>
                    <div style={{ width: 5, height: 5, background: 'var(--gold)', borderRadius: '50%' }} />
                    {p.store}
                  </div>
                  <div style={{ fontSize: '.95rem', fontWeight: 800, color: 'var(--brown-deep)', marginBottom: 6, lineHeight: 1.2 }}>
                    {isTa ? (p.name_ta || p.name) : p.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.7rem', color: 'var(--brown-mid)', marginBottom: 10, fontWeight: 700 }}>
                    <Star size={12} fill="var(--gold)" style={{ color: 'var(--gold)' }} />
                    {p.rating || '4.8'}
                  </div>
                  <div style={{ fontSize: '1.2rem', color: 'var(--gold)', fontWeight: 900, marginBottom: 14 }}>
                    ₹{p.price?.toLocaleString()}
                  </div>
                  <button onClick={() => addToCart(p)} style={{
                    marginTop: 'auto', width: '100%', padding: '10px',
                    background: 'var(--brown-deep)', color: 'var(--gold-light)',
                    border: 'none', borderRadius: 12, fontSize: '.8rem',
                    fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8
                  }}>
                    <ShoppingCart size={14} /> {isTa ? 'கூடையில் சேர்' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
