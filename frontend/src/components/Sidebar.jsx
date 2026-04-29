import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  Home as HomeIcon, History, Heart, UserCircle, 
  SlidersHorizontal, ShoppingBasket, Shirt, MapPin, LogOut
} from 'lucide-react';

const S = {
  sidebar: {
    width: 280,
    background: 'linear-gradient(180deg, var(--brown-deep) 0%, #2b1505 100%)',
    borderRight: '3px solid var(--gold)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 500,
    transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '10px 0 30px rgba(0,0,0,0.2)'
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 24px',
    color: active ? 'var(--gold-light)' : 'var(--parchment)',
    fontSize: '.9rem',
    cursor: 'pointer',
    border: 'none',
    background: active ? 'rgba(234,179,8,0.08)' : 'none',
    width: '100%',
    textAlign: 'left',
    borderLeft: `4px solid ${active ? 'var(--gold)' : 'transparent'}`,
    transition: '.2s',
    fontWeight: 800,
    marginBottom: 4
  })
};

export default function Sidebar({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isTa = i18n.language.startsWith('ta');

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div 
          onClick={onClose} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 490 }} 
        />
      )}
      <aside 
        className={`main-sidebar ${isOpen ? 'mobile-open' : ''}`}
        style={{ 
          ...S.sidebar,
          transform: (isOpen || window.innerWidth > 992) ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        <div style={{ padding: '30px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#fff', padding: 5, borderRadius: 10, border: '1.5px solid var(--gold)' }}>
               <img src="/logo.png" alt="Logo" style={{ height: 28 }} />
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--gold-light)', letterSpacing: '-0.3px' }}>
              Kadai<span style={{ color: 'var(--cream)', fontWeight: 600 }}>Connect</span>
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          <div style={{ fontSize: '.65rem', color: 'var(--gold)', fontWeight: 900, textTransform: 'uppercase', padding: '16px 20px 8px', letterSpacing: '1px', opacity: 0.5 }}>
            {isTa ? 'முதன்மை' : 'Main Menu'}
          </div>
          <button onClick={() => { navigate('/'); onClose?.(); }} className="sidebar-nav-btn" style={S.navItem(isActive('/'))}>
            <HomeIcon size={20} /> {t('home')}
          </button>
          <button onClick={() => { navigate('/orders'); onClose?.(); }} className="sidebar-nav-btn" style={S.navItem(isActive('/orders'))}>
            <History size={20} /> {t('my_history')}
          </button>
          <button onClick={() => { navigate('/wishlist'); onClose?.(); }} className="sidebar-nav-btn" style={S.navItem(isActive('/wishlist'))}>
            <Heart size={20} /> {isTa ? 'விருப்பப்பட்டியல்' : 'Wishlist'}
          </button>
          <button onClick={() => { navigate('/profile'); onClose?.(); }} className="sidebar-nav-btn" style={S.navItem(isActive('/profile'))}>
            <UserCircle size={20} /> {isTa ? 'சுயவிவரம்' : 'Profile'}
          </button>

          <div style={{ fontSize: '.65rem', color: 'var(--gold)', fontWeight: 900, textTransform: 'uppercase', padding: '24px 20px 8px', letterSpacing: '1px', opacity: 0.5 }}>
            {isTa ? 'உலாவுக' : 'Explore'}
          </div>
          <button onClick={() => { navigate('/categories'); onClose?.(); }} className="sidebar-nav-btn" style={S.navItem(isActive('/categories'))}>
            <SlidersHorizontal size={18}/> {isTa ? 'வகைகள்' : 'Categories'}
          </button>
          <button onClick={() => { navigate('/products'); onClose?.(); }} className="sidebar-nav-btn" style={S.navItem(isActive('/products'))}>
            <ShoppingBasket size={18}/> {isTa ? 'தயாரிப்புகள்' : 'Products'}
          </button>
          <button onClick={() => { navigate('/services'); onClose?.(); }} className="sidebar-nav-btn" style={S.navItem(isActive('/services'))}>
            <Shirt size={18}/> {isTa ? 'சேவைகள்' : 'Services'}
          </button>
          <button onClick={() => { navigate('/shops'); onClose?.(); }} className="sidebar-nav-btn" style={S.navItem(isActive('/shops'))}>
            <MapPin size={18}/> {isTa ? 'கடைகள்' : 'Shops'}
          </button>
        </div>

        <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
          <button onClick={logout} className="sidebar-logout-btn" style={{ ...S.navItem(false), color: 'var(--rust)', padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.2)' }}>
            <LogOut size={20}/> {t('logout')}
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 992px) {
          .main-sidebar { transform: translateX(-100%) !important; width: 300px !important; }
          .main-sidebar.mobile-open { transform: translateX(0) !important; }
        }
        .sidebar-nav-btn:hover { background: rgba(255,255,255,0.05) !important; color: var(--gold-light) !important; transform: translateX(4px); }
        .sidebar-logout-btn:hover { background: rgba(239,68,68,0.05) !important; color: #ef4444 !important; transform: translateY(-2px); border-color: #ef4444 !important; }
      `}</style>
    </>
  );
}
