import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
import { 
  ArrowLeft, ChevronRight, Search
} from 'lucide-react';

export default function Categories() {
  const navigate = useNavigate();
  const { apiFetch } = useAuth();
  const { i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');
  
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [selectedMain, setSelectedMain] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/products/categories/?type=${activeTab === 'products' ? 'product' : 'service'}&top_level=true`);
        if (res?.ok) setCategories(await res.json());
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchCats();
    setSelectedMain(null);
  }, [activeTab]);

  const handleCatClick = (cat) => {
    if (cat.subcategories && cat.subcategories.length > 0) {
      setSelectedMain(cat);
    } else {
      navigate(activeTab === 'products' ? '/products' : '/services', { state: { category: cat.name, category_id: cat.id } });
    }
  };

  return (
    <MainLayout title={selectedMain ? (isTa ? selectedMain.name_ta || selectedMain.name : selectedMain.name) : (isTa ? 'வகைகள்' : 'Categories')}>

      <div style={{ padding: '20px' }}>
        {/* Tab Switcher */}
        {!selectedMain && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 25 }}>
            <button 
              onClick={() => navigate('/')} 
              style={{ width: 44, height: 44, borderRadius: 14, border: 'none', background: 'var(--brown-deep)', color: 'var(--gold-light)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <ArrowLeft size={22} />
            </button>
            <div style={{ display: 'flex', flex: 1, background: 'var(--parchment)', padding: 5, borderRadius: 20, border: '1px solid rgba(59,31,14,0.1)' }}>
            {['products', 'services'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                style={{ 
                  flex: 1, padding: '12px', borderRadius: 14, border: 'none', 
                  background: activeTab === tab ? 'var(--brown-deep)' : 'transparent', 
                  color: activeTab === tab ? 'var(--gold-light)' : 'var(--brown-mid)', 
                  fontWeight: 800, fontSize: '.85rem', cursor: 'pointer', 
                  transition: '.3s', textTransform: 'uppercase'
                }}
              >
                {tab === 'products' ? (isTa ? 'தயாரிப்புகள்' : 'Products') : (isTa ? 'சேவைகள்' : 'Services')}
              </button>
            ))}
          </div>
          </div>
        )}

        {selectedMain && (
          <button 
            onClick={() => setSelectedMain(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 800, marginBottom: 20, cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={18} /> {isTa ? 'பின்செல்லவும்' : 'Back to Main'}
          </button>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--brown-mid)' }}>{isTa ? 'ஏற்றுகிறது...' : 'Loading...'}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {(selectedMain ? selectedMain.subcategories : categories).map(cat => (
              <div 
                key={cat.id} 
                onClick={() => handleCatClick(cat)}
                style={{ 
                  background: '#fff', 
                  borderRadius: 24, 
                  padding: '24px 16px', 
                  textAlign: 'center', 
                  border: '1.5px solid var(--parchment)',
                  boxShadow: '0 4px 12px rgba(59,31,14,0.04)',
                  cursor: 'pointer',
                  transition: '.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--parchment)'}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{cat.icon || (activeTab === 'products' ? '📦' : '🛠️')}</div>
                <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--brown-deep)', marginBottom: 4 }}>
                  {isTa ? cat.name_ta || cat.name : cat.name}
                </div>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div style={{ fontSize: '.65rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {cat.subcategories.length} {isTa ? 'வகைகள்' : 'Subcategories'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && (selectedMain ? selectedMain.subcategories : categories).length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--brown-mid)', fontStyle: 'italic' }}>
            {isTa ? 'வகைகள் எதுவும் இல்லை' : 'No categories found for this section.'}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .category-card { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </MainLayout>
  );
}
