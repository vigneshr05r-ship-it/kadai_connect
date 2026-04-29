import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { 
  Menu, Search, Heart, ShoppingCart, UserCircle, ArrowLeft, Bell
} from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';

export default function MainLayout({ children, title, showSearch = true, onSearch = () => {}, showHeader = true }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, apiFetch } = useAuth();
  const { cartCount, wishlist } = useCart();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isTa = i18n.language.startsWith('ta');
  const [search, setSearch] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <NotificationPanel isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />

      <main style={{ flex: 1, marginLeft: window.innerWidth > 992 ? 280 : 0, transition: '.3s', minWidth: 0 }}>
        {/* TOP NAVBAR */}
        {showHeader && (
          <header className="main-header" style={{ background: 'var(--cream)', borderBottom: '2.5px solid var(--parchment)', position: 'sticky', top: 0, zIndex: 400, boxShadow: '0 4px 15px rgba(59,31,14,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button 
                  className="mobile-menu-btn"
                  onClick={() => setSidebarOpen(true)}
                  style={{ background: '#fff', border: '2px solid var(--parchment)', color: 'var(--brown-deep)', cursor: 'pointer', display: window.innerWidth > 992 ? 'none' : 'flex', width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
                >
                  <Menu size={24} />
                </button>

                <div className="header-app-name" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => navigate('/')}>
                  <img src="/logo.png" alt="Kadai Connect Logo" style={{ height: 28, borderRadius: 4, border: '1px solid var(--gold)', objectFit: 'cover' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                    <span style={{ fontFamily: 'var(--font-d)', fontWeight: 900, color: 'var(--brown-deep)', fontSize: '1rem' }}>Kadai</span>
                    <span style={{ fontFamily: 'var(--font-d)', fontWeight: 900, color: 'var(--gold)', fontSize: '1rem' }}>Connect</span>
                  </div>
                </div>

                {!showSearch && (
                  <div className="header-divider" style={{ width: 2, height: 20, background: 'var(--parchment)', margin: '0 4px' }} />
                )}
                {!showSearch && (
                  <h1 className="header-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brown-mid)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{title}</h1>
                )}
              </div>

              {showSearch && (
                <div className="desktop-search-bar" style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 480, margin: '0 16px' }}>
                  <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--brown-mid)' }} size={18} />
                  <input 
                    value={search} 
                    onChange={e => { setSearch(e.target.value); onSearch(e.target.value); }} 
                    placeholder={t('search_placeholder') || "Search treasures & shops..."}
                    style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: 18, border: '2.5px solid var(--parchment)', background: '#fff', fontSize: '.9rem', outline: 'none', color: 'var(--brown-deep)', fontWeight: 700, transition: '.3s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                    className="main-search-input"
                  />
                </div>
              )}

            <div className="header-right-icons" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button 
                onClick={() => setNotificationOpen(true)} 
                style={{ position: 'relative', background: 'none', border: 'none', color: 'var(--brown-deep)', cursor: 'pointer', transition: '.3s', padding: '8px 4px' }}
                className="header-icon-btn"
              >
                <Bell size={24} />
              </button>
              <button 
                onClick={() => navigate('/wishlist')} 
                style={{ position: 'relative', background: 'none', border: 'none', color: 'var(--brown-deep)', cursor: 'pointer', transition: '.3s', padding: '8px 4px' }}
                className="header-icon-btn"
              >
                <Heart size={24} fill={wishlist.length > 0 ? 'var(--gold)' : 'none'} color={wishlist.length > 0 ? 'var(--gold)' : 'currentColor'} />
              </button>
              
              <button 
                onClick={() => navigate('/cart')} 
                style={{ position: 'relative', background: 'var(--brown-deep)', color: 'var(--gold-light)', border: 'none', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 16px rgba(59,31,14,0.2)', transition: '.3s', flexShrink: 0 }}
                className="cart-btn-header"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--gold)', color: 'var(--brown-deep)', fontSize: '11px', fontWeight: 900, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--cream)', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    {cartCount}
                  </span>
                )}
              </button>
              
              <div 
                onClick={() => navigate('/profile')} 
                style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,179,8,0.1)', transition: '.3s', flexShrink: 0 }}
                className="profile-btn-header"
              >
                 <UserCircle size={24} color="var(--brown-deep)" />
              </div>
            </div>
            </div>

            {showSearch && (
              <div className="mobile-search-bar" style={{ paddingBottom: 16 }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--brown-mid)' }} size={18} />
                  <input 
                    value={search} 
                    onChange={e => { setSearch(e.target.value); onSearch(e.target.value); }} 
                    placeholder={t('search_placeholder') || "Search treasures & shops..."}
                    style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: 18, border: '2.5px solid var(--parchment)', background: '#fff', fontSize: '.9rem', outline: 'none', color: 'var(--brown-deep)', fontWeight: 700, transition: '.3s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                    className="main-search-input"
                  />
                </div>
              </div>
            )}
          </header>
        )}

        <div className="main-content-padding" style={{ maxWidth: 1400, margin: '0 auto' }}>
          {children}
        </div>
      </main>

      <style>{`
        .main-header { padding: 0 32px; }
        .main-content-padding { padding: 32px 32px; }
        .mobile-search-bar { display: none; }
        @media (min-width: 993px) {
          .header-app-name, .header-divider { display: none !important; }
          .header-title { font-size: 1.5rem !important; color: var(--brown-deep) !important; margin-left: 0 !important; }
        }
        @media (max-width: 992px) {
          main { margin-left: 0 !important; }
        }
        @media (max-width: 600px) {
          .main-header { padding: 0 16px; }
          .main-content-padding { padding: 20px 16px; }
          .desktop-search-bar { display: none !important; }
          .mobile-search-bar { display: block !important; }
          .header-title { font-size: 1.2rem !important; }
          .header-right-icons { gap: 6px !important; }
        }

        .main-search-input:focus { border-color: var(--gold) !important; box-shadow: 0 4px 15px rgba(234,179,8,0.1) !important; }
        .header-icon-btn:hover { transform: scale(1.1); color: var(--gold) !important; }
        .cart-btn-header:hover { transform: translateY(-3px); background: var(--brown) !important; }
        .profile-btn-header:hover { transform: scale(1.05); border-color: var(--brown-deep) !important; }
      `}</style>
    </div>
  );
}
