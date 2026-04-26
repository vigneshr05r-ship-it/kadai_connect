import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, Star, MapPin, ArrowLeft, ShoppingCart, Heart
} from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import OrderTracker from '../components/OrderTracker';
import MainLayout from '../components/MainLayout';
import { STORES, MOCK_PRODUCTS, MOCK_SERVICES } from '../data/mockData';

const S = {
  sectionTitle: { fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown-deep)' },
};

function Toast({ msg, visible }) {
  return (
    <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`, background: 'var(--brown-deep)', color: 'var(--gold-light)', padding: '10px 22px', borderRadius: 24, fontSize: '.8rem', border: '1px solid var(--gold)', opacity: visible ? 1 : 0, transition: '.3s', pointerEvents: 'none', zIndex: 600, whiteSpace: 'nowrap' }}>
      {msg}
    </div>
  );
}

export default function Home() {
  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');

  const [activeSubTab, setActiveSubTab] = useState(location.state?.activeSubTab || 'all');
  const [categoryFilter, setCategoryFilter] = useState(location.state?.categoryFilter || 'all');
  const [portalType, setPortalType] = useState('all');
  
  const [dbProducts, setDbProducts] = useState([]);
  const [dbServices, setDbServices] = useState([]);
  const [dbStores, setDbStores] = useState(STORES);
  const [myOrders, setMyOrders] = useState([]);
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [search, setSearch] = useState('');

  const showToast = (msg) => { setToast({ msg, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000); };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pResp, sResp, oResp] = await Promise.all([
          apiFetch('/api/products/'),
          apiFetch('/api/services/'),
          apiFetch('/api/orders/')
        ]);

        if (pResp?.ok) {
          const d = await pResp.json();
          const real = Array.isArray(d) ? d : (d.results || []);
          setDbProducts(real.length > 0 ? [...real, ...MOCK_PRODUCTS.slice(0, 4)] : MOCK_PRODUCTS);
        } else setDbProducts(MOCK_PRODUCTS);

        if (sResp?.ok) {
          const d = await sResp.json();
          const real = Array.isArray(d) ? d : (d.results || []);
          setDbServices(real.length > 0 ? [...real, ...MOCK_SERVICES.slice(0, 4)] : MOCK_SERVICES);
        } else setDbServices(MOCK_SERVICES);

        if (oResp?.ok) {
          const d = await oResp.json();
          const raw = Array.isArray(d) ? d : (d.results || []);
          const mapped = raw.map(o => ({
            ...o,
            id: `#ORD-${o.id}`,
            name: o.items?.[0]?.product_name || (isTa ? 'ஆர்டர்' : 'Order'),
            items_str: o.items?.map(i => i.product_name).join(', ') || ''
          }));
          setMyOrders(mapped);
        }
      } catch (e) {
        setDbProducts(MOCK_PRODUCTS);
        setDbServices(MOCK_SERVICES);
      }
    };
    if (user) fetchData();
  }, [user, apiFetch]);

  useEffect(() => {
    if (location.state?.activeSubTab) setActiveSubTab(location.state.activeSubTab);
    if (location.state?.categoryFilter) setCategoryFilter(location.state.categoryFilter);
  }, [location.state]);

  const cart = JSON.parse(localStorage.getItem('kc_cart') || '[]');
  const wishlist = JSON.parse(localStorage.getItem('kc_wishlist') || '[]');

  const addToCart = (p) => {
    const newCart = [...cart, { ...p, cartId: Math.random().toString(36).substr(2, 9) }];
    localStorage.setItem('kc_cart', JSON.stringify(newCart));
    showToast(isTa ? 'கார்ட்டில் சேர்க்கப்பட்டது!' : 'Added to cart!');
    window.dispatchEvent(new Event('storage'));
  };

  const toggleWishlist = (p) => {
    const exists = wishlist.find(w => w.id === p.id);
    const newWish = exists ? wishlist.filter(w => w.id !== p.id) : [...wishlist, p];
    localStorage.setItem('kc_wishlist', JSON.stringify(newWish));
    showToast(exists ? (isTa ? 'நீக்கப்பட்டது' : 'Removed') : (isTa ? 'சேர்க்கப்பட்டது' : 'Added'));
    window.dispatchEvent(new Event('storage'));
  };

  const filteredProducts = dbProducts.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter && p.category_name !== categoryFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.name_ta?.includes(search)) return false;
    return true;
  });

  const filteredServices = dbServices.filter(s => {
    if (categoryFilter !== 'all' && s.category !== categoryFilter && s.category_name !== categoryFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.name_ta?.includes(search)) return false;
    return true;
  });

  return (
    <MainLayout onSearch={setSearch}>
      <Toast msg={toast.msg} visible={toast.visible} />
      
      {activeSubTab === 'all' && !search && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
          <div style={{ width: 45, height: 45, background: 'var(--gold)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown-deep)', boxShadow: '0 4px 12px rgba(201,146,26,0.2)' }}>
              <Sparkles size={24} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--brown-deep)', margin: 0 }}>
              {isTa ? 'வணக்கம்,' : 'Welcome back,'} <span style={{ color: 'var(--gold)' }}>{user?.first_name || user?.username || 'Shopper'}</span>
            </h1>
            <p style={{ fontSize: '.85rem', color: 'var(--brown-mid)', margin: 0 }}>{isTa ? 'புதிய வரவுகள் மற்றும் உள்ளூர் விருப்பங்களை ஆராயுங்கள்.' : 'Explore fresh arrivals and local favorites.'}</p>
          </div>
        </div>
      )}

      {activeSubTab !== 'all' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <button onClick={() => { setActiveSubTab('all'); setCategoryFilter('all'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brown-deep)', display: 'flex' }}>
            <ArrowLeft size={22} />
          </button>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--brown-deep)' }}>
            {activeSubTab === 'stores' && (isTa ? '🏪 கடைகள்' : '🏪 Stores Near You')}
            {activeSubTab === 'products' && (isTa ? '🛍️ தயாரிப்புகள்' : '🛍️ All Products')}
            {activeSubTab === 'services' && (isTa ? '🧵 சேவைகள்' : '🧵 Services')}
          </div>
        </div>
      )}

      {activeSubTab === 'all' && (
        <>
          {myOrders.find(o => !['delivered', 'cancelled'].includes(o.status)) && (
            <OrderTracker order={myOrders.find(o => !['delivered', 'cancelled'].includes(o.status))} />
          )}

          {/* Portal Type Switcher */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 26, background: 'var(--cream-dark)', padding: 6, borderRadius: 30, maxWidth: 400, border: '1.5px solid var(--parchment)' }}>
            {[
              { key: 'all', label: isTa ? 'அனைத்தும்' : 'All', icon: '✨' },
              { key: 'products', label: isTa ? 'தயாரிப்புகள்' : 'Products', icon: '🛍️' },
              { key: 'services', label: isTa ? 'சேவைகள்' : 'Services', icon: '🧵' }
            ].map(p => (
              <button key={p.key} onClick={() => setPortalType(p.key)} style={{ flex: 1, padding: '10px 14px', borderRadius: 24, border: 'none', background: portalType === p.key ? 'var(--brown-deep)' : 'transparent', color: portalType === p.key ? 'var(--gold-light)' : 'var(--brown-mid)', fontWeight: 800, cursor: 'pointer', transition: '.3s', fontSize: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={S.sectionTitle}>🏪 <span style={{ color: 'var(--gold)' }}>{isTa ? 'அருகிலுள்ள கடைகள்' : 'Stores Near You'}</span></div>
            <button onClick={() => setActiveSubTab('stores')} style={{ fontSize: '.76rem', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>{t('view_all')} →</button>
          </div>

          <div className="horizontal-scroll">
            {dbStores.map((s) => (
              <div key={s.id} onClick={() => navigate(`/store/${s.id}`)} style={{ flexShrink: 0, width: 160, background: '#fff', border: '1.5px solid var(--parchment)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: '.2s' }}>
                <div style={{ height: 70, background: `url(${s.banner_url || 'https://images.unsplash.com/photo-1534723452862-4c874e70d6f2?w=200'}) center/cover` }} />
                <div style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '.8rem', color: 'var(--brown-deep)' }}>{isTa ? (s.name_ta || s.name) : s.name}</div>
                  <div style={{ fontSize: '.6rem', color: 'var(--gold)', marginTop: 4 }}>⭐ {s.rating || '5.0'} • {s.dist || '0.5'} km</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {(activeSubTab === 'all' || activeSubTab === 'products') && (portalType === 'all' || portalType === 'products') && (
        <div style={{ marginBottom: 32 }}>
          {activeSubTab === 'all' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={S.sectionTitle}>🛍️ <span style={{ color: 'var(--gold)' }}>{isTa ? 'தயாரிப்புகள்' : 'Products'}</span></div>
              <button onClick={() => setActiveSubTab('products')} style={{ fontSize: '.76rem', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>{t('view_all')} →</button>
            </div>
          )}
          <ProductGrid products={filteredProducts.slice(0, activeSubTab === 'all' ? 8 : 100)} cart={cart} wishlist={wishlist} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} />
        </div>
      )}

      {(activeSubTab === 'all' || activeSubTab === 'services') && (portalType === 'all' || portalType === 'services') && (
        <div style={{ marginBottom: 32 }}>
          {activeSubTab === 'all' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={S.sectionTitle}>🧵 <span style={{ color: 'var(--gold)' }}>{isTa ? 'சேவைகள்' : 'Services'}</span></div>
              <button onClick={() => setActiveSubTab('services')} style={{ fontSize: '.76rem', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>{t('view_all')} →</button>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {filteredServices.slice(0, activeSubTab === 'all' ? 4 : 100).map((ser, i) => (
              <div key={ser.id || i} style={{ background: '#fff', border: '1.5px solid var(--parchment)', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <div style={{ height: 100, background: 'var(--gold-pale)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 10 }}>{ser.emoji || '✂️'}</div>
                <div style={{ fontWeight: 800, fontSize: '.85rem', color: 'var(--brown-deep)' }}>{isTa ? (ser.name_ta || ser.name) : ser.name}</div>
                <div style={{ fontSize: '.9rem', color: 'var(--gold)', fontWeight: 800, marginTop: 6 }}>₹{ser.price}</div>
                <button style={{ width: '100%', marginTop: 10, padding: 8, background: 'var(--brown-deep)', color: 'var(--gold)', border: 'none', borderRadius: 6, fontSize: '.7rem', fontWeight: 800 }}>{isTa ? 'முன்பதிவு' : 'Book Now'}</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeSubTab === 'stores' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {dbStores.map((s) => (
            <div key={s.id} onClick={() => navigate(`/store/${s.id}`)} style={{ background: '#fff', border: '1.5px solid var(--parchment)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: '.2s' }}>
              <div style={{ height: 100, background: `url(${s.banner_url || 'https://images.unsplash.com/photo-1534723452862-4c874e70d6f2?w=400'}) center/cover` }} />
              <div style={{ padding: 16, textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--brown-deep)' }}>{isTa ? (s.name_ta || s.name) : s.name}</div>
                <div style={{ fontSize: '.7rem', color: 'var(--brown-mid)', margin: '4px 0' }}>{s.category}</div>
                <div style={{ fontSize: '.7rem', color: 'var(--gold)', fontWeight: 800 }}>⭐ {s.rating || '5.0'} • {s.dist || '0.5'} km</div>
                <button style={{ width: '100%', marginTop: 12, padding: '8px', background: 'var(--brown-deep)', color: 'var(--gold-light)', border: 'none', borderRadius: 8, fontSize: '.75rem', fontWeight: 800 }}>
                  {isTa ? 'கடையை பார்வையிடு' : 'Visit Store'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .horizontal-scroll {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding-bottom: 10px;
          margin-bottom: 28px;
          scrollbar-width: thin;
          scrollbar-color: var(--gold) transparent;
        }
        .horizontal-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .horizontal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .horizontal-scroll::-webkit-scrollbar-thumb {
          background-color: var(--gold);
          border-radius: 10px;
        }
      `}</style>
    </MainLayout>
  );
}

