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
    width: 240,
    background: 'var(--brown-deep)',
    borderRight: '2px solid var(--gold)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 500,
    transition: '0.3s'
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 18px',
    color: active ? 'var(--gold-light)' : 'var(--parchment)',
    fontSize: '.88rem',
    cursor: 'pointer',
    border: 'none',
    background: active ? 'rgba(201,146,26,.15)' : 'none',
    width: '100%',
    textAlign: 'left',
    borderLeft: `4px solid ${active ? 'var(--gold)' : 'transparent'}`,
    transition: '.2s',
    fontFamily: 'var(--font-d)',
    fontWeight: 700
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(43,21,5,0.6)', zIndex: 490, backdropFilter: 'blur(3px)' }} 
        />
      )}
      <aside 
        className={`main-sidebar ${isOpen ? 'mobile-open' : ''}`}
        style={{ 
          ...S.sidebar,
          transform: (isOpen || window.innerWidth > 992) ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="Logo" style={{ height: 35, borderRadius: 8, border: '1.5px solid var(--gold)' }} />
            <span style={{ fontFamily: 'var(--font-d)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--gold-light)' }}>
              Kadai<span style={{ color: 'var(--cream)' }}>Connect</span>
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          <div style={{ fontSize: '.65rem', color: 'var(--gold)', fontWeight: 800, textTransform: 'uppercase', padding: '16px 18px 8px', letterSpacing: '1px' }}>
            {isTa ? 'முதன்மை' : 'Main Menu'}
          </div>
          <button onClick={() => { navigate('/'); onClose?.(); }} style={S.navItem(isActive('/'))}>
            <HomeIcon size={20}/> {t('home')}
          </button>
          <button onClick={() => { navigate('/orders'); onClose?.(); }} style={S.navItem(isActive('/orders'))}>
            <History size={20}/> {t('my_orders')}
          </button>
          <button onClick={() => { navigate('/wishlist'); onClose?.(); }} style={S.navItem(isActive('/wishlist'))}>
            <Heart size={20}/> {t('wishlist')}
          </button>
          <button onClick={() => { navigate('/profile'); onClose?.(); }} style={S.navItem(isActive('/profile'))}>
            <UserCircle size={20}/> {t('profile')}
          </button>

          <div style={{ fontSize: '.65rem', color: 'var(--gold)', fontWeight: 800, textTransform: 'uppercase', padding: '24px 18px 8px', letterSpacing: '1px' }}>
            {isTa ? 'உலாவுக' : 'Explore'}
          </div>
          <button onClick={() => { navigate('/categories'); onClose?.(); }} style={S.navItem(isActive('/categories'))}>
            <SlidersHorizontal size={18}/> {isTa ? 'வகைகள்' : 'Categories'}
          </button>
          <button onClick={() => { navigate('/products'); onClose?.(); }} style={S.navItem(isActive('/products'))}>
            <ShoppingBasket size={18}/> {isTa ? 'தயாரிப்புகள்' : 'Products'}
          </button>
          <button onClick={() => { navigate('/', { state: { activeSubTab: 'services' } }); onClose?.(); }} style={S.navItem(location.state?.activeSubTab === 'services')}>
            <Shirt size={18}/> {isTa ? 'சேவைகள்' : 'Services'}
          </button>
          <button onClick={() => { navigate('/', { state: { activeSubTab: 'stores' } }); onClose?.(); }} style={S.navItem(location.state?.activeSubTab === 'stores')}>
            <MapPin size={18}/> {isTa ? 'கடைகள்' : 'Stores'}
          </button>
        </div>

        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={logout} style={{ ...S.navItem(false), color: 'var(--rust)', padding: '10px 18px' }}>
            <LogOut size={20}/> {t('logout')}
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 992px) {
          .main-sidebar { transform: translateX(-100%) !important; }
          .main-sidebar.mobile-open { transform: translateX(0) !important; }
        }
      `}</style>
    </>
  );
}
