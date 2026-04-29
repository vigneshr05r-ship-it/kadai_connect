import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductGrid from '../components/ProductGrid';
import { MOCK_PRODUCTS } from '../data/mockData';
import MainLayout from '../components/MainLayout';
import { X, ShoppingCart, Heart, Store, ShieldCheck, Truck, ChevronLeft, Filter, Star, MapPin, ArrowLeft } from 'lucide-react';

const CATEGORY_BANNERS = {
  'Grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  'Fruits & Veg': 'https://images.unsplash.com/photo-1518977676601-b53f02ac10dd?auto=format&fit=crop&w=800&q=80',
  'Clothing': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
  'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'Jewellery': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
  'Bakery': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80'
};

export default function Products() {
  const { t, i18n } = useTranslation();
  const { apiFetch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isTa = i18n.language.startsWith('ta');
  
  const category = location.state?.category || 'All Products';
  const bannerImg = CATEGORY_BANNERS[category] || CATEGORY_BANNERS.default;

  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating'); // 'price', 'rating', 'dist'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const pResp = await apiFetch('/api/products/');
        let allProds = MOCK_PRODUCTS;
        if (pResp?.ok) {
          const d = await pResp.json();
          const real = Array.isArray(d) ? d : (d.results || []);
          if (real.length > 0) allProds = [...real, ...MOCK_PRODUCTS];
        }
        
        // Filter by category if specified
        const filtered = category === 'All Products' 
          ? allProds 
          : allProds.filter(p => p.category === category || p.category_name === category);
          
        setDbProducts(filtered);
      } catch (e) {
        setDbProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiFetch, category]);

  const sortedProducts = [...dbProducts].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'dist') return a.dist - b.dist;
    return 0;
  });

  return (
    <MainLayout title={isTa ? category : category}>

      {/* Back Button and Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--cream)', borderBottom: '1px solid var(--parchment)', position: 'sticky', top: 0, zIndex: 20 }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--brown-deep)', color: 'var(--gold-light)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { id: 'rating', label: 'Top Rated', icon: <Star size={14} fill={sortBy === 'rating' ? 'currentColor' : 'none'} /> },
          { id: 'price', label: 'Low Price', icon: <Filter size={14} /> },
          { id: 'dist', label: 'Nearby', icon: <MapPin size={14} /> }
        ].map(f => (
          <button 
            key={f.id}
            onClick={() => setSortBy(f.id)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1.5px solid',
              borderColor: sortBy === f.id ? 'var(--brown-deep)' : 'var(--parchment)',
              background: sortBy === f.id ? 'var(--brown-deep)' : '#fff',
              color: sortBy === f.id ? 'var(--gold-light)' : 'var(--brown-mid)',
              fontSize: '.75rem', fontWeight: 800, whiteSpace: 'nowrap', cursor: 'pointer'
            }}
          >
            {f.icon} {isTa ? f.label : f.label}
          </button>
        ))}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {[1,2,3,4].map(i => <div key={i} style={{ height: 240, background: 'var(--cream-dark)', borderRadius: 20, animation: 'pulse 1.5s infinite linear' }} />)}
             </div>
          </div>
        ) : (
          <ProductGrid 
            products={sortedProducts} 
          />
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .modal-btn:hover { background: var(--brown) !important; transform: translateY(-2px); }
        .modal-btn:active { transform: translateY(0); }
      `}</style>
    </MainLayout>
  );
}
