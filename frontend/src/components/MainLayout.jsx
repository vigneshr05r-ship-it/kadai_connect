import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Menu, Search, Heart, ShoppingCart, UserCircle, ArrowLeft, Bell
} from 'lucide-react';
import Sidebar from './Sidebar';

export default function MainLayout({ children, title, showSearch = true, onSearch = () => {} }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, apiFetch } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isTa = i18n.language.startsWith('ta');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const cart = JSON.parse(localStorage.getItem('kc_cart') || '[]');
  const wishlist = JSON.parse(localStorage.getItem('kc_wishlist') || '[]');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main style={{ flex: 1, marginLeft: window.innerWidth > 992 ? 240 : 0, transition: '.3s', minWidth: 0 }}>
        {/* TOP NAVBAR */}
        <header style={{ height: 70, background: '#fff', borderBottom: '1px solid var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 400, padding: '0 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--brown-deep)', cursor: 'pointer', display: window.innerWidth > 992 ? 'none' : 'block' }}
            >
              <Menu size={24} />
            </button>

            {showSearch ? (
              <div style={{ position: 'relative', width: '100%', maxWidth: 450 }}>
                <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--brown-mid)' }} size={16} />
                <input 
                  value={search} 
                  onChange={e => { setSearch(e.target.value); onSearch(e.target.value); }} 
                  placeholder={t('search_placeholder') || "Search products, stores..."}
                  style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 12, border: '1.5px solid var(--parchment)', background: 'var(--cream-dark)', fontSize: '.85rem', outline: 'none' }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--brown-deep)', margin: 0 }}>{title}</h1>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button onClick={() => navigate('/wishlist')} style={{ position: 'relative', background: 'none', border: 'none', color: 'var(--brown-deep)', cursor: 'pointer' }}>
              <Heart size={22} fill={wishlist.length > 0 ? 'var(--gold)' : 'none'} color={wishlist.length > 0 ? 'var(--gold)' : 'currentColor'} />
            </button>
            <button style={{ background: 'none', border: 'none', color: 'var(--brown-deep)', cursor: 'pointer', position: 'relative' }}>
              <Bell size={22} />
              <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: 'var(--gold)', borderRadius: '50%', border: '1.5px solid #fff' }}></span>
            </button>
            <button onClick={() => navigate('/')} style={{ position: 'relative', background: 'var(--brown-deep)', color: 'var(--gold-light)', border: 'none', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ShoppingCart size={20} />
            </button>
            <div onClick={() => navigate('/profile')} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gold-pale)', border: '1.5px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
               <UserCircle size={22} color="var(--brown-deep)" />
            </div>
          </div>
        </header>

        <div style={{ padding: '24px clamp(16px, 3vw, 32px)', maxWidth: 1400, margin: '0 auto' }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 992px) {
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
