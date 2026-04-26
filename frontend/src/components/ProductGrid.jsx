import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';

const BADGE_COLORS = { 
  festival: { bg: 'var(--gold)', color: 'var(--brown-deep)' }, 
  top: { bg: 'var(--rust)', color: '#fff' }, 
  new: { bg: 'var(--green)', color: '#fff' }, 
  sale: { bg: '#1a5276', color: '#fff' } 
};

export default function ProductGrid({ products, cart, wishlist, onAddToCart, onToggleWishlist, onSelect }) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const isTa = i18n.language.startsWith('ta');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
      {products.map(p => {
        const inWishlist = wishlist?.some(w => w.id === p.id);
        const bc = BADGE_COLORS[p.badgeType] || BADGE_COLORS.new;
        return (
          <div key={p.id} style={{ background: 'var(--cream)', border: '1.5px solid var(--parchment)', borderRadius: 10, overflow: 'hidden', boxShadow: '2px 3px 10px var(--shadow)', transition: '.25s', display: 'flex', flexDirection: 'column' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '4px 8px 20px var(--shadow)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '2px 3px 10px var(--shadow)'; }}>
            <div onClick={() => onSelect && onSelect(p)} style={{ height: 130, background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--parchment)', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}>
              {(p.image_url || p.image)
                ? <img src={p.image_url || p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '3rem' }}>{p.emoji || '📦'}</span>}
              {p.badge && <span style={{ position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: 10, fontSize: '.58rem', fontWeight: 700, letterSpacing: '.5px', background: bc.bg, color: bc.color }}>{p.badge}</span>}
            </div>
            <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '.64rem', color: 'var(--brown-light)', marginBottom: 2, fontStyle: 'italic', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>{(isTa && p.store_ta) ? p.store_ta : p.store}</span>
                <span>{Number(p.dist).toFixed(1)} km</span>
              </div>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '.84rem', fontWeight: 700, color: 'var(--brown-deep)', marginBottom: 4, lineClamp: 1, WebkitLineClamp: 1 }}>{isTa ? (p.name_ta || p.name) : p.name}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--brown-mid)', lineHeight: 1.4, marginBottom: 8, height: '2.8em', overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                {isTa ? (p.desc_ta || p.desc) : p.desc}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, fontSize: '.65rem' }}>
                <span style={{ color: p.stock < 5 ? 'var(--rust)' : 'var(--green)', fontWeight: 800 }}>
                  {p.stock < 5 ? `🔥 ${isTa ? (p.stock + ' மட்டுமே உள்ளது!') : ('Only ' + p.stock + ' left!')}` : `✓ ${isTa ? 'கையிருப்பில் உள்ளது' : 'In Stock'}`}
                </span>
                <span style={{ color: 'var(--brown-mid)', fontWeight: 600 }}>⭐ {p.rating || '5.0'} ({p.reviews_count || '10+'})</span>
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '.7rem', color: 'var(--brown-mid)', textDecoration: 'line-through', opacity: 0.6 }}>₹{(p.price * 1.2).toFixed(0)}</div>
                  <div style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 800, fontFamily: 'var(--font-d)' }}>₹{p.price?.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '.75rem', fontWeight: 800, color: 'var(--brown-deep)' }}>
                    <Star size={12} fill="var(--gold)" />
                    {p.rating || '4.8'}
                  </div>
                  <div style={{ fontSize: '.55rem', color: 'var(--brown-mid)', fontWeight: 600 }}>{p.reviews_count || '120'} {isTa ? 'மதிப்பாய்வுகள்' : 'Reviews'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(p); }} style={{ flex: 1, padding: '8px', border: '1.5px solid var(--parchment)', borderRadius: 8, background: 'var(--cream-dark)', cursor: 'pointer', color: inWishlist ? 'var(--rust)' : 'var(--brown-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '.7rem', fontWeight: 700 }}>
                   <Heart size={14} fill={inWishlist ? 'var(--rust)' : 'none'} /> {isTa ? 'விருப்பம்' : 'Wish'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={() => onAddToCart(p)} style={{ width: '100%', padding: '8px', background: 'var(--brown-deep)', color: 'var(--gold-light)', border: 'none', borderRadius: 6, fontSize: '.7rem', fontFamily: 'var(--font-d)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <ShoppingCart size={14} /> {isTa ? 'கார்ட்டில் சேர்' : 'Add to Cart'}
                </button>
                <button onClick={() => navigate(`/store/${p.store_id || 'mock-1'}`)} style={{ width: '100%', padding: '8px', background: 'var(--gold-pale)', color: 'var(--brown-deep)', border: '1px solid var(--gold)', borderRadius: 6, fontSize: '.7rem', fontFamily: 'var(--font-d)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  🏪 {isTa ? 'கடையை பார்வையிடு' : 'View Store'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
