import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, MapPin, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BADGE_COLORS = { 
  festival: { bg: 'var(--gold-pale)', color: 'var(--brown-deep)', label: 'Trending' }, 
  top: { bg: 'var(--rust)', color: '#fff', label: 'Best Seller' }, 
  new: { bg: 'var(--green)', color: '#fff', label: 'New Arrival' }, 
  sale: { bg: 'var(--gold)', color: 'var(--brown-deep)', label: 'Hot Deal' } 
};

export default function ProductGrid({ products, onSelect, onEdit, onDelete, onAdd }) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { wishlist, addToCart, toggleWishlist } = useCart();
  const isTa = i18n.language.startsWith('ta');

  return (
    <div className="responsive-product-grid">
      {products.map(p => {
        const inWishlist = wishlist?.some(w => w.id === p.id);
        const badge = BADGE_COLORS[p.badgeType] || (p.badge ? { bg: 'var(--parchment)', color: 'var(--brown-deep)', label: p.badge } : null);
        
        const rawImg = p.image_url || p.image || '';
        const resolveImg = (u) => {
          if (!u) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';
          if (u.startsWith('http') || u.startsWith('blob:') || u.startsWith('data:')) return u;
          const base = (import.meta.env.VITE_API_URL || 'https://kadai-connect.onrender.com').replace(/\/$/, '');
          return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
        };
        const imgSrc = resolveImg(rawImg);

        return (
          <div 
            key={p.id} 
            style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--parchment)', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}
          >
            {/* Image Section */}
            <div 
              onClick={() => onSelect ? onSelect(p) : navigate(`/product/${p.id}`)} 
              style={{ height: 160, background: 'var(--cream)', position: 'relative', cursor: 'pointer', overflow: 'hidden', borderBottom: '1px solid var(--parchment)' }}
            >
              <img 
                src={imgSrc}
                alt={p.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'; }}
              />
              {badge && (
                <div style={{ position: 'absolute', top: 10, left: 10, background: badge.bg, color: badge.color, padding: '4px 8px', borderRadius: 8, fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  {badge.label}
                </div>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: inWishlist ? 'var(--rust)' : 'var(--brown-mid)' }}
              >
                <Heart size={18} fill={inWishlist ? 'var(--rust)' : 'none'} />
              </button>
              
              {onEdit && (
                <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 6 }}>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(p); }} style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', border: '1px solid var(--parchment)' }}>✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(p.id); }} style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', border: '1px solid var(--parchment)' }}>🗑️</button>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div onClick={() => onSelect ? onSelect(p) : navigate(`/product/${p.id}`)} style={{ cursor: 'pointer', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.7rem', color: 'var(--brown-mid)', marginBottom: 6, fontWeight: 800 }}>
                  <Store size={14} color="var(--gold)" />
                  <span style={{ textTransform: 'uppercase' }}>{isTa ? (p.store_name_ta || p.store_name || p.store) : (p.store_name || p.store)}</span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brown-deep)', margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {isTa ? (p.name_ta || p.name) : p.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ background: 'var(--cream)', color: 'var(--gold)', padding: '2px 6px', borderRadius: 6, fontSize: '.65rem', fontWeight: 800 }}>
                      ⭐ {p.rating || '4.5'}
                    </div>
                    <span style={{ fontSize: '.65rem', color: 'var(--brown-mid)', fontWeight: 700 }}>{p.dist || '0.5'}km</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brown-deep)' }}>₹{p.price?.toLocaleString()}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                     <div style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%' }} />
                     <span style={{ fontSize: '.65rem', color: 'var(--green)', fontWeight: 800 }}>{isTa ? 'இருப்பில் உள்ளது' : 'In Stock'}</span>
                  </div>
                </div>
                {!onEdit && (
                  <button 
                    onClick={() => addToCart(p)}
                    style={{ width: '100%', padding: 12, background: 'var(--brown-deep)', color: 'var(--gold-light)', border: 'none', borderRadius: 12, fontSize: '.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
                  >
                    <ShoppingCart size={16} /> {isTa ? 'கார்ட்டில் சேர்' : 'Add to Cart'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {onAdd && (
        <div 
          onClick={onAdd}
          style={{ border: '2px dashed var(--parchment)', borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 240, background: 'var(--cream-dark)' }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown-deep)', marginBottom: 12, fontSize: '1.5rem', border: '1px solid var(--parchment)' }}>＋</div>
          <div style={{ fontSize: '.8rem', fontWeight: 800, color: 'var(--brown-mid)', textTransform: 'uppercase' }}>{isTa ? 'சேர்' : 'Add New'}</div>
        </div>
      )}

      <style>{`
        .responsive-product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }
        @media (max-width: 600px) {
          .responsive-product-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
