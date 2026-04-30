import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Store, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ItemGrid({ items, type = 'product', onSelect, onEdit, onDelete, onAdd }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { wishlist, addToCart, toggleWishlist } = useCart();
  const isTa = i18n.language.startsWith('ta');

  return (
    <div className="compact-item-grid">
      {items.map(item => {
        const inWishlist = wishlist?.some(w => w.id === item.id);
        let imageUrl = item.image_url || item.image;
        
        // Always resolve relative /media/ paths using the absolute backend URL
        if (typeof imageUrl === 'string' && (imageUrl.startsWith('/media/') || imageUrl.startsWith('/static/'))) {
          const baseUrl = (import.meta.env.VITE_API_URL || 'https://kadai-connect.onrender.com').replace(/\/$/, '');
          imageUrl = `${baseUrl}${imageUrl}`;
        }

        if (!imageUrl) {
          imageUrl = type === 'product' 
            ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' 
            : 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400';
        }
        
        return (
          <div key={item.id} className="compact-card">
            {/* Image Container (1:1 Aspect Ratio) */}
            <div className="card-image-wrapper" onClick={() => onSelect ? onSelect(item) : navigate(`/${type}/${item.id}`)}>
              <img src={imageUrl} alt={item.name} className="card-image" loading="lazy" />
              
              {/* Type Badge */}
              <div className="card-badge">
                {type === 'product' ? '📦' : '🛠️'}
              </div>

              {/* Wishlist Button (Product only) */}
              {type === 'product' && (
                <button 
                  className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
                >
                  <Heart size={16} fill={inWishlist ? 'var(--rust)' : 'none'} />
                </button>
              )}

              {/* Edit Controls (if provided) */}
              {onEdit && (
                <div className="card-admin-btns">
                  <button onClick={(e) => { e.stopPropagation(); onEdit(item); }}>✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(item.id); }}>🗑️</button>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="card-content">
              <div className="card-store-info">
                <Store size={12} />
                <span>{isTa ? (item.store_name_ta || item.store_name || item.store) : (item.store_name || item.store)}</span>
              </div>
              
              <h3 className="card-title">
                {isTa ? (item.name_ta || item.name) : item.name}
              </h3>

              <div className="card-footer">
                <span className="card-price">₹{item.price?.toLocaleString()}</span>
                
                {type === 'product' ? (
                  <button className="card-action-btn" onClick={() => addToCart(item)}>
                    <ShoppingCart size={14} />
                  </button>
                ) : (
                  <button className="card-action-btn service" onClick={() => onSelect && onSelect(item)}>
                    <ExternalLink size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {onAdd && (
        <div className="compact-card add-new" onClick={onAdd}>
          <div className="add-icon">＋</div>
          <span>{isTa ? 'சேர்' : 'Add New'}</span>
        </div>
      )}

      <style>{`
        .compact-item-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
          padding: 4px;
        }

        .compact-card {
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid var(--parchment);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 12px rgba(59,31,14,0.04);
        }

        .compact-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(59,31,14,0.08);
          border-color: var(--gold);
        }

        .card-image-wrapper {
          position: relative;
          width: 100%;
          padding-top: 100%; /* 1:1 Aspect Ratio */
          overflow: hidden;
          cursor: pointer;
          background: var(--cream);
        }

        .card-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .compact-card:hover .card-image {
          transform: scale(1.1);
        }

        .card-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(4px);
          padding: 4px;
          border-radius: 8px;
          font-size: 0.8rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .wishlist-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brown-mid);
          cursor: pointer;
          transition: 0.2s;
        }

        .wishlist-btn.active {
          color: var(--rust);
        }

        .card-content {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-store-info {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          color: var(--brown-mid);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .card-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--brown-deep);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
          height: 2.2em;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
        }

        .card-price {
          font-size: 0.95rem;
          font-weight: 900;
          color: var(--brown-deep);
        }

        .card-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: var(--brown-deep);
          color: var(--gold-light);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
        }

        .card-action-btn:hover {
          background: var(--gold);
          transform: scale(1.05);
        }

        .card-action-btn.service {
          background: var(--gold);
          color: var(--brown-deep);
        }

        .card-admin-btns {
          position: absolute;
          bottom: 8px;
          right: 8px;
          display: flex;
          gap: 4px;
        }

        .card-admin-btns button {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #fff;
          border: 1px solid var(--parchment);
          font-size: 0.8rem;
          cursor: pointer;
        }

        /* Add New Card */
        .compact-card.add-new {
          border: 2px dashed var(--parchment);
          background: var(--cream-dark);
          align-items: center;
          justify-content: center;
          min-height: 200px;
          cursor: pointer;
          color: var(--brown-mid);
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.75rem;
        }

        .add-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          margin-bottom: 8px;
          border: 1px solid var(--parchment);
        }

        @media (min-width: 768px) {
          .compact-item-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 16px;
          }
          .card-title {
            font-size: 0.95rem;
          }
        }

        @media (min-width: 1024px) {
          .compact-item-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}
