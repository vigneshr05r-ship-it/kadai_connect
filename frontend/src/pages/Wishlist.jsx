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
    <MainLayout title={isTa ? 'விருப்பப்பட்டியல்' : 'My Wishlist'} showSearch={false}>
      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: 80, left: '50%',
        transform: `translateX(-50%) translateY(${toast.visible ? 0 : 20}px)`,
        background: 'var(--brown-deep)', color: 'var(--gold-light)',
        padding: '10px 22px', borderRadius: 24, fontSize: '.8rem',
        border: '1px solid var(--gold)', opacity: toast.visible ? 1 : 0,
        transition: '.3s', pointerEvents: 'none', zIndex: 600, whiteSpace: 'nowrap'
      }}>{toast.msg}</div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {wishlist.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#fff', borderRadius: 16,
            border: '1.5px solid var(--parchment)',
            boxShadow: '2px 2px 12px var(--shadow)'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>💔</div>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown-deep)', marginBottom: 8 }}>
              {isTa ? 'விருப்பப்பட்டியல் காலியாக உள்ளது' : 'Your wishlist is empty'}
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--brown-mid)', marginBottom: 20 }}>
              {isTa ? 'தயாரிப்புகளை உலாவி ❤️ அழுத்தி சேர்க்கவும்' : 'Browse products and tap ❤️ to save them here'}
            </div>
            <button onClick={() => navigate('/')} style={{
              padding: '10px 28px', background: 'var(--brown-deep)',
              color: 'var(--gold-light)', border: 'none', borderRadius: 8,
              fontFamily: 'var(--font-d)', fontSize: '.85rem', fontWeight: 800, cursor: 'pointer'
            }}>
              {isTa ? 'கடைக்கு செல்' : 'Start Shopping'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {wishlist.map(p => (
              <div key={p.id} style={{
                background: '#fff', border: '1.5px solid var(--parchment)',
                borderRadius: 12, overflow: 'hidden',
                boxShadow: '2px 3px 10px var(--shadow)',
                display: 'flex', flexDirection: 'column',
                transition: '.25s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--parchment)'; }}
              >
                <div style={{
                  height: 130, background: 'var(--cream-dark)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden'
                }}>
                  {(p.image_url || p.image)
                    ? <img src={p.image_url || p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '3rem' }}>{p.emoji || '📦'}</span>}
                  <button onClick={() => removeFromWishlist(p)} style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(255,255,255,0.9)', border: 'none',
                    borderRadius: '50%', width: 28, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--rust)'
                  }}>
                    <Heart size={14} fill="var(--rust)" />
                  </button>
                </div>

                <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '.62rem', color: 'var(--brown-light)', fontStyle: 'italic', marginBottom: 4 }}>
                    {p.store}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-d)', fontSize: '.84rem', fontWeight: 700,
                    color: 'var(--brown-deep)', marginBottom: 4
                  }}>
                    {isTa ? (p.name_ta || p.name) : p.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.65rem', color: 'var(--brown-mid)', marginBottom: 8 }}>
                    <Star size={11} fill="var(--gold)" style={{ color: 'var(--gold)' }} />
                    {p.rating || '4.8'}
                  </div>
                  <div style={{ fontSize: '1.05rem', color: 'var(--gold)', fontWeight: 800, fontFamily: 'var(--font-d)', marginBottom: 10 }}>
                    ₹{p.price?.toLocaleString()}
                  </div>
                  <button onClick={() => addToCart(p)} style={{
                    marginTop: 'auto', width: '100%', padding: '8px',
                    background: 'var(--brown-deep)', color: 'var(--gold-light)',
                    border: 'none', borderRadius: 6, fontSize: '.7rem',
                    fontFamily: 'var(--font-d)', fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 6
                  }}>
                    <ShoppingCart size={13} /> {isTa ? 'கூடையில் சேர்' : 'Add to Cart'}
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
