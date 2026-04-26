import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductGrid from '../components/ProductGrid';
import { MOCK_PRODUCTS } from '../data/mockData';
import MainLayout from '../components/MainLayout';

export default function Products() {
  const { t, i18n } = useTranslation();
  const { apiFetch } = useAuth();
  const navigate = useNavigate();
  const isTa = i18n.language.startsWith('ta');

  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('kc_cart') || '[]'));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('kc_wishlist') || '[]'));
  const [search, setSearch] = useState('');
  const [categoryFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const pResp = await apiFetch('/api/products/');
        if (pResp?.ok) {
          const d = await pResp.json();
          const real = Array.isArray(d) ? d : (d.results || []);
          setDbProducts(real.length > 0 ? [...real, ...MOCK_PRODUCTS.slice(0, 4)] : MOCK_PRODUCTS);
        } else {
          setDbProducts(MOCK_PRODUCTS);
        }
      } catch (e) {
        setDbProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiFetch]);

  const addToCart = (p) => {
    const newCart = [...cart, { ...p, cartId: Math.random().toString(36).substr(2, 9) }];
    setCart(newCart);
    localStorage.setItem('kc_cart', JSON.stringify(newCart));
  };

  const toggleWishlist = (p) => {
    const exists = wishlist.find(w => w.id === p.id);
    let newWish;
    if (exists) newWish = wishlist.filter(w => w.id !== p.id);
    else newWish = [...wishlist, p];
    setWishlist(newWish);
    localStorage.setItem('kc_wishlist', JSON.stringify(newWish));
  };

  const filteredProducts = dbProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         (p.name_ta && p.name_ta.includes(search));
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter || p.category_name === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <MainLayout title={isTa ? 'தயாரிப்புகள்' : 'Products'} onSearch={setSearch}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--brown-mid)' }}>{t('loading')}...</div>
      ) : (
        <ProductGrid 
          products={filteredProducts} 
          cart={cart} 
          wishlist={wishlist} 
          onAddToCart={addToCart} 
          onToggleWishlist={toggleWishlist} 
        />
      )}
    </MainLayout>
  );
}

