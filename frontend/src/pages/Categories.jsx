import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import MainLayout from '../components/MainLayout';

const CATEGORY_META = {
  'Groceries':    { gradient: 'linear-gradient(135deg,#22c55e,#16a34a)', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=220&fit=crop', emoji: '🛒', ta: 'மளிகை சாமான்கள்', desc: 'Fresh & daily needs', desc_ta: 'அன்றாட தேவைகள்' },
  'Textiles':     { gradient: 'linear-gradient(135deg,#a855f7,#7c3aed)', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=220&fit=crop', emoji: '👗', ta: 'ஆடைகள்', desc: 'Sarees, fabrics & more', desc_ta: 'சேலைகள், துணிகள் மற்றும் பலவும்' },
  'Services':     { gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=220&fit=crop', emoji: '🔧', ta: 'சேவைகள்', desc: 'Local skilled services', desc_ta: 'உள்ளூர் சேவைகள்' },
  'Gift Items':   { gradient: 'linear-gradient(135deg,#f43f5e,#be123c)', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=220&fit=crop', emoji: '🎁', ta: 'பரிசு பொருட்கள்', desc: 'Curated festive gifts', desc_ta: 'திருவிழா பரிசுகள்' },
  'Garlands':     { gradient: 'linear-gradient(135deg,#f97316,#ea580c)', img: 'https://images.unsplash.com/photo-1490750967868-88df5691cc3f?w=400&h=220&fit=crop', emoji: '🌸', ta: 'மாலைகள்', desc: 'Fresh flower garlands', desc_ta: 'புதிய பூ மாலைகள்' },
  'Crackers':     { gradient: 'linear-gradient(135deg,#eab308,#ca8a04)', img: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&h=220&fit=crop', emoji: '🎆', ta: 'பட்டாசுகள்', desc: 'Festival fireworks', desc_ta: 'திருவிழா பட்டாசுகள்' },
  'Lamps & Decor':{ gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=220&fit=crop', emoji: '🪔', ta: 'விளக்கு & அலங்காரம்', desc: 'Brass lamps & decor', desc_ta: 'பித்தளை விளக்குகள்' },
};

const FALLBACK_CATEGORIES = [
  { id: 1, name: 'Groceries' }, { id: 2, name: 'Textiles' },
  { id: 3, name: 'Services' }, { id: 4, name: 'Gift Items' },
  { id: 5, name: 'Garlands' }, { id: 6, name: 'Crackers' },
  { id: 7, name: 'Lamps & Decor' },
];

export default function Categories() {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiFetch('/api/products/categories/');
        if (r?.ok) {
          const d = await r.json();
          setDbCategories(Array.isArray(d) ? d : (d.results || []));
        }
      } catch {}
      setLoading(false);
    })();
  }, [apiFetch]);

  const cats = (dbCategories.length > 0 ? dbCategories : FALLBACK_CATEGORIES).map(c => ({
    ...c,
    ...CATEGORY_META[c.name],
    displayName: isTa ? (c.name_ta || CATEGORY_META[c.name]?.ta || c.name) : c.name,
    displayDesc: isTa ? (CATEGORY_META[c.name]?.desc_ta || '') : (CATEGORY_META[c.name]?.desc || ''),
  }));

  return (
    <MainLayout title={isTa ? 'வகைகள்' : 'Categories'} showSearch={false}>
      {/* Rich Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--brown-deep) 0%, #5c2a0e 100%)',
        padding: '30px 24px',
        borderRadius: 24,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 24,
        boxShadow: '0 8px 32px rgba(59,31,14,0.15)'
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(201,146,26,0.15)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-d)', fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>
             {isTa ? 'அனைத்து வகைகள்' : 'Shop by Categories'}
          </h1>
          <p style={{ margin: '8px 0 20px', fontSize: '.85rem', color: 'rgba(255,255,255,0.7)' }}>
            {isTa ? 'உங்கள் தேவையான வகையை தேர்வு செய்யுங்கள்' : 'Explore curated collections from local stores'}
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { label: isTa ? 'வகைகள்' : 'Categories', value: cats.length },
              { label: isTa ? 'கடைகள்' : 'Stores', value: '50+' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-d)' }}>{s.value}</div>
                <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} style={{ height: 180, borderRadius: 16, background: '#eee', animation: 'pulse 1.5s infinite' }} />
          ))
        ) : (
          cats.map(c => (
            <button
              key={c.id}
              onClick={() => navigate('/', { state: { categoryFilter: c.name, activeSubTab: 'all', portalType: 'all' } })}
              style={{
                position: 'relative', border: 'none', borderRadius: 16,
                overflow: 'hidden', cursor: 'pointer', textAlign: 'left',
                height: 180, padding: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className="cat-card"
            >
              {c.img && (
                <img src={c.img} alt={c.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
              )}
              <div style={{ position: 'absolute', inset: 0, background: c.gradient ? `${c.gradient.replace(')', ', 0.8)')}` : 'rgba(59,31,14,0.7)', zIndex: 1 }} />
              <div style={{ position: 'relative', zIndex: 2, padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{c.emoji || '📁'}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>{c.displayName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,0.8)' }}>{c.displayDesc}</span>
                    <ChevronRight size={16} color="#fff" />
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <style>{`
        .cat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      `}</style>
    </MainLayout>
  );
}

