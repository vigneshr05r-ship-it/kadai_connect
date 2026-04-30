import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, Star, MapPin, ArrowLeft, ShoppingCart, Heart, ChevronRight
} from 'lucide-react';
import ItemGrid from '../components/ItemGrid';
import OrderTracker from '../components/OrderTracker';
import MainLayout from '../components/MainLayout';
import BookingModal from '../components/BookingModal';


export default function Home() {
  const { user, apiFetch } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');

  const [activeSubTab, setActiveSubTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [portalType, setPortalType] = useState('all');
  const [search, setSearch] = useState('');
  
  const [dbProducts, setDbProducts] = useState([]);
  const [dbServices, setDbServices] = useState([]);
  const [dbStores, setDbStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [bookingService, setBookingService] = useState(null);

  // Fetch all data progressively for instant feel
  useEffect(() => {
    const fetchItem = async (endpoint, setter, transform = (d) => d) => {
      try {
        const resp = await apiFetch(endpoint);
        if (resp?.ok) {
          const data = await resp.json();
          setter(transform(data));
        }
      } catch (e) { console.error(`Error loading ${endpoint}:`, e); }
    };

    const getArr = (d) => Array.isArray(d) ? d : (d.results || []);

    // Parallel execution but progressive state updates
    fetchItem('/api/products/', setDbProducts, getArr);
    fetchItem('/api/services/', setDbServices, getArr);
    fetchItem('/api/stores/', setDbStores, getArr);
    fetchItem('/api/orders/', setMyOrders, getArr);
    fetchItem('/api/products/categories/?top_level=true', setCategories);
  }, [apiFetch]);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return dbProducts.filter(p => {
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter || p.category_name === categoryFilter;
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.name_ta?.includes(search);
      return matchesCat && matchesSearch;
    });
  }, [dbProducts, categoryFilter, search]);

  const filteredServices = useMemo(() => {
    return dbServices.filter(s => {
      const matchesCat = categoryFilter === 'all' || s.category === categoryFilter || s.category_name === categoryFilter;
      const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.name_ta?.includes(search);
      return matchesCat && matchesSearch;
    });
  }, [dbServices, categoryFilter, search]);

  return (
    <MainLayout onSearch={setSearch}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30, background: 'var(--cream-dark)', padding: '16px 20px', borderRadius: 20, border: '1px solid var(--parchment)', boxShadow: '0 4px 15px rgba(59,31,14,0.05)' }}>
        <div style={{ width: 52, height: 52, background: 'var(--brown-deep)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', border: '1.5px solid var(--gold)' }}>
          <Sparkles size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brown-deep)', margin: 0 }}>
            {isTa ? 'வணக்கம்,' : 'Welcome,'} <span style={{ color: 'var(--gold)' }}>{user?.name || user?.username || user?.first_name || 'User'}</span>
          </h1>
          <p style={{ fontSize: '.8rem', color: 'var(--brown-mid)', margin: 0, fontWeight: 600 }}>Explore fresh arrivals today</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--parchment)', padding: 5, borderRadius: 18, marginBottom: 28, border: '1px solid rgba(59,31,14,0.1)' }}>
        {['all', 'products', 'services'].map(tab => (
          <button 
            key={tab} 
            onClick={() => { setPortalType(tab); setCategoryFilter('all'); }}
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: 14, 
              border: 'none', 
              background: portalType === tab ? 'var(--brown-deep)' : 'transparent', 
              color: portalType === tab ? 'var(--gold-light)' : 'var(--brown-mid)', 
              fontWeight: 800, 
              fontSize: '.85rem', 
              cursor: 'pointer', 
              transition: '.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        
        {/* Active Order Tracker */}
        {myOrders.find(o => !['delivered', 'cancelled'].includes(o.status)) && (
          <div style={{ background: 'var(--cream-dark)', borderRadius: 24, padding: 4, border: '1.5px solid var(--gold)' }}>
            <OrderTracker order={myOrders.find(o => !['delivered', 'cancelled'].includes(o.status))} />
          </div>
        )}

        {/* Categories Grid */}
        {portalType === 'all' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brown-deep)' }}>Top Categories</h2>
              <button onClick={() => navigate('/categories')} style={{ fontSize: '.8rem', color: 'var(--gold)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
            </div>
            <div className="responsive-home-categories-grid">
              {(categories.length > 0 ? categories : [
                { name: 'Grocery', icon: '🛒', color: 'var(--green)' },
                { name: 'Clothing', icon: '👗', color: 'var(--rust)' },
                { name: 'Electronics', icon: '💻', color: 'var(--brown-deep)' },
                { name: 'Jewellery', icon: '💎', color: 'var(--gold)' }
              ]).slice(0, 4).map(c => (
                <div key={c.id || c.name} onClick={() => { setPortalType(c.type === 'service' ? 'services' : 'products'); setCategoryFilter(c.name); }} style={{ background: '#fff', padding: '20px 10px', borderRadius: 20, textAlign: 'center', border: '1.5px solid var(--parchment)', cursor: 'pointer', transition: '.2s', boxShadow: '0 4px 10px rgba(59,31,14,0.03)' }}>
                   <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{c.icon || '📦'}</div>
                   <div style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--brown-mid)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{isTa ? (c.name_ta || c.name) : c.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stores Carousel */}
        {portalType === 'all' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brown-deep)' }}>Stores Near You</h2>
              <button onClick={() => navigate('/shops')} style={{ fontSize: '.8rem', color: 'var(--gold)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
            </div>
            <div style={{ display: 'flex', gap: 18, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
              {dbStores.map(s => (
                <div key={s.id} onClick={() => navigate(`/store/${s.id}`)} style={{ flexShrink: 0, width: 160, background: '#fff', borderRadius: 24, border: '1.5px solid var(--parchment)', overflow: 'hidden', cursor: 'pointer', transition: '.3s', boxShadow: '0 6px 15px rgba(59,31,14,0.06)' }}>
                  <div style={{ height: 100, background: `url(${s.banner_url || 'https://images.unsplash.com/photo-1534723452862-4c874e70d6f2?w=200'}) center/cover` }} />
                  <div style={{ padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--brown-deep)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--gold)', fontWeight: 800, marginTop: 6, background: 'var(--cream)', display: 'inline-block', padding: '2px 8px', borderRadius: 8 }}>⭐ {s.rating || '5.0'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        {(portalType === 'all' || portalType === 'products') && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brown-deep)' }}>
                {categoryFilter !== 'all' ? `${categoryFilter} Products` : 'Featured Products'}
              </h2>
              {portalType === 'all' && <button onClick={() => setPortalType('products')} style={{ fontSize: '.8rem', color: 'var(--gold)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>}
            </div>
            <ItemGrid 
              items={filteredProducts.slice(0, portalType === 'all' ? 8 : 100)} 
              type="product"
            />
          </div>
        )}

        {/* Services Section */}
        {(portalType === 'all' || portalType === 'services') && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brown-deep)' }}>Professional Services</h2>
              {portalType === 'all' && <button onClick={() => setPortalType('services')} style={{ fontSize: '.8rem', color: 'var(--gold)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>}
            </div>
            <ItemGrid 
              items={filteredServices.slice(0, portalType === 'all' ? 4 : 100)} 
              type="service"
              onSelect={setBookingService}
            />
          </div>
        )}
      </div>

      {bookingService && (
        <BookingModal 
          service={bookingService}
          store={dbStores.find(s => s.id === bookingService.store_id) || dbStores[0]}
          onClose={() => setBookingService(null)}
          apiFetch={apiFetch}
          isTa={isTa}
        />
      )}

      <style>{`
        .responsive-home-categories-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .responsive-home-services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        @media (max-width: 600px) {
          .responsive-home-categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .responsive-home-services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </MainLayout>
  );
}
