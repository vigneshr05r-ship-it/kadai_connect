import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, MessageCircle, Heart, Search, ArrowLeft, Briefcase, ShoppingBag, Clock, Calendar, Plus, Bell, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import BookingModal from '../components/BookingModal';

const MOCK_STORE_DATA = {
  id: 'mock-1',
  name: 'Murugan Textiles',
  name_ta: 'முருகன் டெக்ஸ்டைல்ஸ்',
  description: 'Premium silk and cotton sarees for all occasions.',
  description_ta: 'அனைத்து சந்தர்ப்பங்களுக்கும் பிரீமியம் பட்டு மற்றும் பருத்தி சேலைகள்.',
  has_products: true,
  has_services: true,
  rating: '4.9',
  contact_name: 'Murugan',
  phone: '+91 9876543210',
  address: '12, South Mada Street, Mylapore, Chennai',
  emoji: '👗'
};

const [] = [
  { id: 101, name: 'Kanjivaram Silk Saree', price: 3200, rating: 4.9, stock: 4, reviews_count: 128, emoji: '👗' },
  { id: 105, name: 'Cotton Fabric (per m)', price: 180, rating: 4.5, stock: 15, reviews_count: 91, emoji: '🧵' }
];

const [] = [
  { id: 'ser-1', name: 'Tailoring', price: 250, duration_minutes: 120, bookings_count: 34, emoji: '✂️' }
];


import MainLayout from '../components/MainLayout';

const Toast = ({ msg, visible }) => (
  <div style={{ 
    position: 'fixed', bottom: 100, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 30}px)`, 
    background: 'var(--brown-deep)', color: 'var(--gold-light)', padding: '10px 24px', borderRadius: 16, 
    fontSize: '.85rem', border: '1.5px solid var(--gold)', opacity: visible ? 1 : 0, transition: '.3s ease-out', 
    pointerEvents: 'none', zIndex: 1000, boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
  }}>
    {msg}
  </div>
);

const StorePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiFetch, user } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [bookingService, setBookingService] = useState(null);

  const showToast = (msg) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      try {
        const [sResp, pResp, serResp] = await Promise.all([
          apiFetch(`/api/stores/${id}/`),
          apiFetch(`/api/products/?store_id=${id}`),
          apiFetch(`/api/services/?store_id=${id}`)
        ]);
        
        if (sResp.ok) {
          setStore(await sResp.json());
        } else if (id && id.startsWith('mock-')) {
          setStore({ ...MOCK_STORE_DATA, id: id });
        }
        
        if (pResp.ok) {
          const pData = await pResp.json();
          const r = Array.isArray(pData) ? pData : (pData.results || []);
          setProducts(r.length > 0 ? r : []);
        } else { setProducts([]); }

        if (serResp.ok) {
          const serData = await serResp.json();
          const r = Array.isArray(serData) ? serData : (serData.results || []);
          setServices(r.length > 0 ? r : []);
        } else { setServices([]); }
      } catch (err) {
        console.error('Error fetching store page:', err);
        if (id && id.startsWith('mock-')) {
          setStore({ ...MOCK_STORE_DATA, id: id });
          setProducts([]);
          setServices([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStoreData();
  }, [id, apiFetch]);

  useEffect(() => {
    if (store) {
      if (!store.has_products && store.has_services) {
        setActiveTab('services');
      }
    }
  }, [store]);

  if (loading) return (
    <MainLayout title="Store">
      <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: 24, fontWeight: 700, color: 'var(--brown-deep)' }}>
          {isTa ? 'கடை விவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading store details...'}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </MainLayout>
  );

  if (!store) return (
    <MainLayout title="Store">
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>🏚️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 12 }}>{isTa ? 'கடை காணப்படவில்லை' : 'Store Not Found'}</h2>
        <p style={{ color: 'var(--brown-mid)', marginBottom: 32, fontWeight: 600 }}>{isTa ? 'நாங்கள் தேடும் கடை தற்போது இல்லை.' : 'The store you are looking for does not exist.'}</p>
        <button onClick={() => navigate('/')} style={{ background: 'var(--brown-deep)', color: 'var(--gold-light)', padding: '12px 32px', borderRadius: 16, border: '1.5px solid var(--gold)', fontWeight: 900, cursor: 'pointer' }}>
          {isTa ? 'முகப்பு பக்கத்திற்குச் செல்' : 'Return Home'}
        </button>
      </div>
    </MainLayout>
  );

  const filteredItems = activeTab === 'products' 
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.name_ta && p.name_ta.includes(searchQuery)))
    : services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.name_ta && s.name_ta.includes(searchQuery)));

  return (
    <MainLayout title={store.name}>
      <div style={{ paddingBottom: 60 }}>
        {/* Banner Section */}
        <div style={{ position: 'relative', height: 200, width: '100%', overflow: 'hidden', borderRadius: 32, marginBottom: 40 }}>
           <img 
            src={store.banner_url || store.banner || 'https://images.unsplash.com/photo-1534723452862-4c874e70d6f2?w=1200'} 
            alt="Banner" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534723452862-4c874e70d6f2?w=1200'; }}
           />
           <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))' }} />
           <div style={{ position: 'absolute', bottom: 20, left: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 80, height: 80, background: '#fff', borderRadius: 20, padding: 4, border: '2px solid var(--gold)', overflow: 'hidden' }}>
                 {(store.logo_url || store.logo) 
                  ? <img 
                      src={store.logo_url || store.logo} 
                      alt="Logo" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerHTML = `<div style="height: 100%; display: flex; alignItems: center; justifyContent: center; fontSize: 2rem; fontWeight: 900">${store.name?.charAt(0)}</div>`; }}
                    /> 
                  : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900 }}>{store.name?.charAt(0)}</div>}
              </div>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: 0 }}>{isTa ? (store.name_ta || store.name) : store.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <div style={{ background: 'var(--gold)', color: 'var(--brown-deep)', padding: '2px 8px', borderRadius: 8, fontSize: '.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={12} fill="currentColor" /> {store.rating || '5.0'}
                  </div>
                  <span style={{ color: '#fff', fontSize: '.75rem', fontWeight: 700, opacity: 0.9 }}>{store.location || 'Local Area'}</span>
                </div>
              </div>
           </div>
        </div>

        <div style={{ maxWidth: 900 }}>
          <p style={{ fontSize: '.9rem', color: 'var(--brown-mid)', lineHeight: 1.6, marginBottom: 32, borderLeft: '4px solid var(--gold)', paddingLeft: 16, fontWeight: 600 }}>
            {isTa ? (store.description_ta || store.description || 'சிறந்த தரமான தயாரிப்புகள் மற்றும் சேவைகளை வழங்குகிறோம்.') : (store.description || 'Providing quality products and professional services to our community.')}
          </p>

          <div style={{ display: 'flex', background: 'var(--parchment)', padding: 5, borderRadius: 16, marginBottom: 24, maxWidth: 400 }}>
            {store.has_products !== false && (
              <button 
                onClick={() => setActiveTab('products')}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: activeTab === 'products' ? 'var(--brown-deep)' : 'transparent', color: activeTab === 'products' ? 'var(--gold-light)' : 'var(--brown-mid)', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer' }}
              >
                {isTa ? 'பொருட்கள்' : 'Products'}
              </button>
            )}
            {store.has_services && (
              <button 
                onClick={() => setActiveTab('services')}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: activeTab === 'services' ? 'var(--brown-deep)' : 'transparent', color: activeTab === 'services' ? 'var(--gold-light)' : 'var(--brown-mid)', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer' }}
              >
                {isTa ? 'சேவைகள்' : 'Services'}
              </button>
            )}
          </div>

          <div style={{ position: 'relative', marginBottom: 32 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--brown-mid)' }} />
            <input 
              type="text" 
              placeholder={isTa ? `தேடு ${activeTab === 'products' ? 'பொருட்கள்' : 'சேவைகள்'}...` : `Search ${activeTab === 'products' ? 'products' : 'services'}...`}
              style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: 14, border: '1.5px solid var(--parchment)', background: '#fff', fontSize: '.9rem', fontWeight: 700, outline: 'none' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="responsive-store-grid">
            {filteredItems.map(item => (
              <div key={item.id} style={{ background: '#fff', border: '1.5px solid var(--parchment)', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 160, background: 'var(--cream)', position: 'relative' }}>
                  <img 
                    src={item.image_url || item.image || `https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400`} 
                    alt={item.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'; }}
                  />
                  <button 
                    onClick={() => toggleWishlist(item)}
                    style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isInWishlist(item.id) ? 'var(--rust)' : 'var(--brown-mid)' }}
                  >
                    <Heart size={18} fill={isInWishlist(item.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brown-deep)', marginBottom: 8 }}>{isTa ? (item.name_ta || item.name) : item.name}</h4>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--gold)', marginBottom: 16 }}>₹{item.price}</div>
                  <button 
                    onClick={() => {
                      if (activeTab === 'products') {
                        addToCart(item);
                        showToast(isTa ? 'கூடையில் சேர்க்கப்பட்டது!' : 'Added to Cart!');
                      } else {
                        setBookingService(item);
                      }
                    }}
                    style={{ width: '100%', padding: '12px', background: 'var(--brown-deep)', color: 'var(--gold-light)', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', marginTop: 'auto' }}
                  >
                    {activeTab === 'products' ? (isTa ? 'கூடையில் சேர்' : 'Add to Cart') : (isTa ? 'முன்பதிவு செய்' : 'Book Now')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--parchment)/20', borderRadius: 24, border: '2px dashed var(--parchment)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brown-deep)' }}>{isTa ? 'எதுவும் காணப்படவில்லை' : 'Nothing Found'}</div>
            </div>
          )}
        </div>
      </div>

      {bookingService && (
        <BookingModal 
          service={bookingService}
          store={store}
          onClose={() => setBookingService(null)}
          apiFetch={apiFetch}
          showToast={showToast}
          isTa={isTa}
        />
      )}
      <Toast msg={toast.msg} visible={toast.visible} />
      <style>{`
        .responsive-store-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
        @media (max-width: 600px) {
          .responsive-store-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default StorePage;

