import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingCart, Heart, Star, MapPin, Store, 
  ChevronLeft, ShieldCheck, Truck, Clock, ArrowRight,
  Share2, Info
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import ProductGrid from '../components/ProductGrid';
import { MOCK_PRODUCTS } from '../data/mockData';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiFetch } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { i18n, t } = useTranslation();
  const isTa = i18n.language.startsWith('ta');

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const resp = await apiFetch(`/api/products/${id}/`);
        let foundProduct = null;
        if (resp?.ok) {
          foundProduct = await resp.json();
        } else {
          foundProduct = null;
        }
        setProduct(foundProduct);

        // Fetch related products (same category)
        const relResp = await apiFetch(`/api/products/?category=${foundProduct.category || foundProduct.category_name}`);
        if (relResp?.ok) {
          const d = await relResp.json();
          const items = Array.isArray(d) ? d : (d.results || []);
          setRelatedProducts(items.filter(p => p.id.toString() !== id.toString()).slice(0, 4));
        } else {
          setRelatedProducts([]);
        }
      } catch (e) {
        console.error("Error loading product detail:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, apiFetch]);

  if (loading) return (
    <MainLayout title="Loading...">
      <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </MainLayout>
  );

  if (!product) return (
    <MainLayout title="Not Found">
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brown-deep)' }}>Product Not Found</h2>
        <button onClick={() => navigate('/products')} style={{ marginTop: 20, padding: '10px 24px', background: 'var(--brown-deep)', color: '#fff', border: 'none', borderRadius: 12 }}>Back to Products</button>
      </div>
    </MainLayout>
  );

  const images = product.images?.length > 0 ? product.images : [product.image_url || product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'];

  return (
    <MainLayout title={isTa ? (product.name_ta || product.name) : product.name}>
      <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, marginBottom: 60 }}>
          {/* Left: Images */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: '100%', aspectRatio: '1/1', background: '#fff', borderRadius: 32, overflow: 'hidden', border: '1.5px solid var(--parchment)', position: 'relative' }}>
               <img 
                src={images[activeImg]} 
                alt={product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'; }}
               />
               <button 
                onClick={() => toggleWishlist(product)}
                style={{ position: 'absolute', top: 20, right: 20, width: 48, height: 48, borderRadius: '50%', background: '#fff', border: '1.5px solid var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isInWishlist(product.id) ? 'var(--rust)' : 'var(--brown-mid)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
               >
                 <Heart size={24} fill={isInWishlist(product.id) ? 'var(--rust)' : 'none'} />
               </button>
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveImg(idx)}
                    style={{ width: 80, height: 80, borderRadius: 16, border: `2px solid ${activeImg === idx ? 'var(--gold)' : 'var(--parchment)'}`, overflow: 'hidden', cursor: 'pointer', transition: '.2s', opacity: activeImg === idx ? 1 : 0.6 }}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150'; }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
               <span style={{ fontSize: '.75rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category_name || product.category}</span>
               <div style={{ width: 4, height: 4, background: 'var(--parchment)', borderRadius: '50%' }} />
               <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--gold-pale)', padding: '3px 10px', borderRadius: 8, fontSize: '.7rem', fontWeight: 900, color: 'var(--brown-deep)' }}>
                 <Star size={12} fill="var(--gold)" /> {product.rating || '4.8'}
               </div>
            </div>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--brown-deep)', margin: '0 0 16px', lineHeight: 1.1 }}>
              {isTa ? (product.name_ta || product.name) : product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24 }}>
               <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--brown-deep)' }}>₹{product.price?.toLocaleString()}</span>
               {product.original_price && <span style={{ fontSize: '1.4rem', color: 'var(--brown-mid)', textDecoration: 'line-through', opacity: 0.6 }}>₹{product.original_price}</span>}
               {product.discount && <span style={{ color: 'var(--green)', fontWeight: 800, fontSize: '1rem' }}>({product.discount}% OFF)</span>}
            </div>

            <p style={{ fontSize: '1rem', color: 'var(--brown-mid)', lineHeight: 1.6, marginBottom: 32, fontWeight: 600 }}>
              {isTa ? (product.description_ta || product.description) : (product.description || "Crafted with excellence by local artisans. This premium selection offers both durability and style, perfect for those who appreciate quality and heritage.")}
            </p>

            <div className="responsive-badges-grid">
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--cream-dark)', borderRadius: 20, border: '1.5px solid var(--parchment)' }}>
                  <Truck size={24} color="var(--gold)" />
                  <div>
                    <div style={{ fontSize: '.8rem', fontWeight: 900, color: 'var(--brown-deep)' }}>Fast Delivery</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--brown-mid)', fontWeight: 700 }}>24-48 Hours</div>
                  </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--cream-dark)', borderRadius: 20, border: '1.5px solid var(--parchment)' }}>
                  <ShieldCheck size={24} color="var(--gold)" />
                  <div>
                    <div style={{ fontSize: '.8rem', fontWeight: 900, color: 'var(--brown-deep)' }}>100% Genuine</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--brown-mid)', fontWeight: 700 }}>Verified Store</div>
                  </div>
               </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
               <button 
                onClick={() => { addToCart(product); navigate('/cart'); }}
                style={{ flex: 2, padding: '20px', background: 'var(--brown-deep)', color: 'var(--gold-light)', border: 'none', borderRadius: 20, fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 10px 25px rgba(59,31,14,0.2)' }}
               >
                 <ShoppingCart size={24} /> {isTa ? 'இப்பொழுதே வாங்கு' : 'Buy Now'}
               </button>
               <button 
                onClick={() => addToCart(product)}
                style={{ flex: 1, padding: '20px', background: 'var(--parchment)', color: 'var(--brown-deep)', border: '2px solid var(--brown-deep)', borderRadius: 20, fontSize: '1rem', fontWeight: 900, cursor: 'pointer' }}
               >
                 {isTa ? 'கூடை' : 'Add to Cart'}
               </button>
            </div>

            <div 
              onClick={() => navigate(`/store/${product.store_id || 'mock-1'}`)}
              style={{ marginTop: 40, padding: '20px', background: '#fff', borderRadius: 24, border: '1.5px solid var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: '.2s' }}
              className="store-card-detail"
            >
               <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, background: 'var(--gold-pale)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Store size={24} color="var(--brown-deep)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '.7rem', color: 'var(--brown-mid)', fontWeight: 800, textTransform: 'uppercase' }}>Sold by</div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--brown-deep)' }}>{product.store_name || product.store || 'Murugan Textiles'}</div>
                  </div>
               </div>
               <ArrowRight size={20} color="var(--brown-mid)" />
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div style={{ marginTop: 40 }}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brown-deep)' }}>{isTa ? 'தொடர்புடைய தயாரிப்புகள்' : 'You May Also Like'}</h2>
              <button onClick={() => navigate('/products')} style={{ fontSize: '.9rem', color: 'var(--gold)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
           </div>
           {relatedProducts.length > 0 ? (
             <ProductGrid products={relatedProducts} onSelect={(p) => navigate(`/product/${p.id}`)} />
           ) : (
             <div style={{ padding: '40px', textAlign: 'center', color: 'var(--brown-mid)', fontWeight: 700 }}>Finding similar treasures...</div>
           )}
        </div>
      </div>

      <style>{`
        .store-card-detail:hover { border-color: var(--gold); transform: translateX(4px); box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
        .responsive-badges-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 40px;
        }
        @media (max-width: 600px) {
          .responsive-badges-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </MainLayout>
  );
}
