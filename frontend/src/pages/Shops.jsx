import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, ChevronLeft, Search } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { STORES } from '../data/mockData';

export default function Shops() {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');
  
  const [stores, setStores] = useState(STORES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const resp = await apiFetch('/api/stores/');
        if (resp?.ok) {
          const d = await resp.json();
          const items = Array.isArray(d) ? d : (d.results || []);
          if (items.length > 0) setStores(items);
        }
      } catch (e) {
        console.error("Store load error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, [apiFetch]);

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.location && s.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <MainLayout title={isTa ? 'கடைகள்' : 'Local Shops'}>
      <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30, gap: 20 }}>
           <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--brown-mid)' }} />
              <input 
                type="text" 
                placeholder={isTa ? 'கடைகளைத் தேடுங்கள்...' : 'Search for stores or locations...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: 16, border: '1.5px solid var(--parchment)', background: '#fff', fontSize: '.9rem', fontWeight: 700, outline: 'none', color: 'var(--brown-deep)' }}
              />
           </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 200, background: 'var(--cream-dark)', borderRadius: 28, animation: 'pulse 1.5s infinite linear' }} />)}
          </div>
        ) : filteredStores.length > 0 ? (
          <div className="responsive-shops-grid">
            {filteredStores.map(store => (
              <div 
                key={store.id} 
                onClick={() => navigate(`/store/${store.id}`)}
                style={{ background: '#fff', borderRadius: 28, border: '1.5px solid var(--parchment)', overflow: 'hidden', cursor: 'pointer', transition: '.3s', boxShadow: '0 8px 20px rgba(59,31,14,0.04)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--parchment)'; }}
              >
                <div style={{ height: 140, background: `url(${store.banner_url || 'https://images.unsplash.com/photo-1534723452862-4c874e70d6f2?w=400'}) center/cover` }} />
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--brown-deep)', margin: 0 }}>{store.name}</h3>
                    <div style={{ background: 'var(--gold-pale)', padding: '2px 8px', borderRadius: 8, fontSize: '.75rem', fontWeight: 800, color: 'var(--brown-deep)', display: 'flex', alignItems: 'center', gap: 4 }}>
                       <Star size={12} fill="var(--gold)" /> {store.rating || '5.0'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--brown-mid)', fontSize: '.8rem', fontWeight: 700 }}>
                    <MapPin size={14} /> {store.location || 'Local Area'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--parchment)/30', borderRadius: 40, border: '2px dashed var(--parchment)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brown-deep)' }}>No Stores Found</h3>
            <p style={{ fontSize: '.9rem', color: 'var(--brown-mid)', fontWeight: 600 }}>Try searching for a different name or location.</p>
          </div>
        )}
      </div>
      <style>{`
        .responsive-shops-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        @media (max-width: 600px) {
          .responsive-shops-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </MainLayout>
  );
}
