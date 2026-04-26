import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, MessageCircle, Heart, Search, ArrowLeft, Briefcase, ShoppingBag, Clock, Calendar, Plus, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

const MOCK_PRODS = [
  { id: 101, name: 'Kanjivaram Silk Saree', price: 3200, rating: 4.9, stock: 4, reviews_count: 128, emoji: '👗' },
  { id: 105, name: 'Cotton Fabric (per m)', price: 180, rating: 4.5, stock: 15, reviews_count: 91, emoji: '🧵' }
];

const MOCK_SERS = [
  { id: 'ser-1', name: 'Tailoring', price: 250, duration_minutes: 120, bookings_count: 34, emoji: '✂️' }
];


const Toast = ({ msg, visible }) => (
  <div style={{ 
    position: 'fixed', bottom: 30, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`, 
    background: 'var(--brown-deep)', color: 'var(--gold-light)', padding: '12px 24px', borderRadius: 30, 
    fontSize: '.85rem', border: '1px solid var(--gold)', opacity: visible ? 1 : 0, transition: '.3s', 
    pointerEvents: 'none', zIndex: 1000, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' 
  }}>
    {msg}
  </div>
);

const StorePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiFetch, user } = useAuth();
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
          setProducts(r.length > 0 ? r : MOCK_PRODS);
        } else { setProducts(MOCK_PRODS); }

        if (serResp.ok) {
          const serData = await serResp.json();
          const r = Array.isArray(serData) ? serData : (serData.results || []);
          setServices(r.length > 0 ? r : MOCK_SERS);
        } else { setServices(MOCK_SERS); }
      } catch (err) {
        console.error('Error fetching store page:', err);
        if (id && id.startsWith('mock-')) {
          setStore({ ...MOCK_STORE_DATA, id: id });
          setProducts(MOCK_PRODS);
          setServices(MOCK_SERS);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStoreData();
  }, [id, apiFetch]);

  // Set default tab based on capabilities if available
  useEffect(() => {
    if (store) {
      if (!store.has_products && store.has_services) {
        setActiveTab('services');
      }
    }
  }, [store]);

  if (loading) return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
      <div className="text-brown-deep font-serif italic animate-pulse">
        {isTa ? 'கடை விவரங்கள் ஏற்றப்படுகின்றன...' : 'Opening Store Doors...'}
      </div>
    </div>
  );

  if (!store) return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
      <div className="text-5xl mb-4">🏚️</div>
      <h2 className="text-2xl font-serif font-bold text-brown-deep mb-2">{isTa ? 'கடை காணப்படவில்லை' : 'Store Not Found'}</h2>
      <p className="text-brown-mid mb-6">{isTa ? 'நாங்கள் தேடும் கடை தற்போது இல்லை அல்லது இணைப்பில் சிக்கல் உள்ளது.' : 'The store you are looking for might have closed or moved.'}</p>
      <button onClick={() => navigate('/')} className="bg-brown-deep text-gold-light px-8 py-3 rounded-xl font-bold border-2 border-gold shadow-lg">
        {isTa ? 'முகப்பு பக்கத்திற்குச் செல்' : 'Back to Home'}
      </button>
    </div>
  );

  const filteredItems = activeTab === 'products' 
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.name_ta && p.name_ta.includes(searchQuery)))
    : services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.name_ta && s.name_ta.includes(searchQuery)));

  return (
    <div className="bg-cream min-h-screen pb-24 font-sans text-brown-deep">
      {/* Header Sticky */}
      <div className="sticky top-0 z-50 bg-brown-deep border-b-2 border-gold px-6 py-4 flex items-center gap-4 shadow-lg">
        <div className="flex-1 min-width-0">
          <h1 className="font-serif font-bold text-lg text-gold-light truncate italic">{store.name}</h1>
          <div className="flex items-center gap-1 text-[10px] text-cream/70 uppercase tracking-widest font-bold">
            <MapPin size={10} /> {store.location || 'Tamil Nadu'}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-gold-pale/10 rounded-full flex items-center justify-center text-gold hover:bg-gold-pale/20 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gold rounded-full border-2 border-brown-deep"></span>
          </button>
          <button className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-brown-deep shadow-inner border border-white/20">
            <Phone size={18} />
          </button>
          <button className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-inner border border-white/20">
            <MessageCircle size={18} />
          </button>
        </div>
      </div>

      {/* Banner & Header Section */}
      <div className="relative">
        <div 
          className="h-48 w-full bg-brown-mid"
          style={{ 
            background: (store.banner_url || store.banner) 
              ? `url(${store.banner_url || store.banner}) center/cover no-repeat` 
              : 'linear-gradient(45deg, var(--brown-deep), var(--brown-mid))',
            boxShadow: 'inset 0 -80px 60px -20px rgba(43,21,5,0.6)'
          }}
        >
          {!(store.banner_url || store.banner) && <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }}/>}
        </div>
        
        <div className="px-6 relative flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
          <div className="-mt-12 w-28 h-28 bg-cream rounded-3xl p-1.5 shadow-2xl border-2 border-gold overflow-hidden flex-shrink-0 relative z-10">
            <div className="w-full h-full bg-gold-pale rounded-2xl flex items-center justify-center text-brown-deep font-serif font-black text-4xl italic overflow-hidden">
              {(store.logo_url || store.logo) 
                ? <img src={store.logo_url || store.logo} alt="Logo" className="w-full h-full object-cover" /> 
                : (store.name?.charAt(0) || 'S')}
            </div>
          </div>
          <div className="pb-3 flex-1 flex flex-col items-center sm:items-start w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1 bg-gold text-brown-deep px-2 py-0.5 rounded-lg font-bold text-[11px] shadow-sm">
                <Star size={12} fill="currentColor" /> {store.rating || '5.0'}
              </div>
              <span className="text-[10px] font-black text-brown-deep/60 bg-gold-pale px-3 py-1 rounded-full border border-gold/20 tracking-wider">VERIFIED STORE</span>
            </div>
            <h2 className="text-3xl font-serif font-black italic tracking-tight text-brown-deep leading-none mb-3">{isTa ? (store.name_ta || store.name) : store.name}</h2>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-brown-deep/80 bg-gold/10 px-2.5 py-1 rounded-lg border border-gold/20">
                <ShoppingBag size={12}/> 🛍️ Products Available
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-brown-deep/80 bg-parchment/30 px-2.5 py-1 rounded-lg border border-parchment">
                <Briefcase size={12}/> 🧵 Services Offered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Info & Tabs */}
      <div className="px-6 mt-6">
        <p className="text-sm text-brown-mid leading-relaxed mb-6 italic border-l-2 border-gold pl-3 py-1">
          {isTa ? (store.description_ta || store.description || 'சிறந்த தரமான தயாரிப்புகள் மற்றும் சேவைகளை வழங்குகிறோம்.') : (store.description || 'Dedicated to providing premium quality products and professional services to our community.')}
        </p>

        {/* Tab System */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex p-1 bg-cream-dark rounded-2xl border border-parchment shadow-inner">
            {store.has_products !== false && (
              <button 
                onClick={() => setActiveTab('products')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-serif font-bold italic text-sm transition-all ${activeTab === 'products' ? 'bg-brown-deep text-gold shadow-lg translate-y-[-1px]' : 'text-brown-mid hover:text-brown-deep'}`}
              >
                <ShoppingBag size={18} />
                {isTa ? 'பொருட்கள்' : 'Products'}
                {products.length > 0 && <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'products' ? 'bg-gold text-brown-deep' : 'bg-parchment text-brown-mid'}`}>{products.length}</span>}
              </button>
            )}
            {store.has_services && (
              <button 
                onClick={() => setActiveTab('services')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-serif font-bold italic text-sm transition-all ${activeTab === 'services' ? 'bg-brown-deep text-gold shadow-lg translate-y-[-1px]' : 'text-brown-mid hover:text-brown-deep'}`}
              >
                <Briefcase size={18} />
                {isTa ? 'சேவைகள்' : 'Services'}
                {services.length > 0 && <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'services' ? 'bg-gold text-brown-deep' : 'bg-parchment text-brown-mid'}`}>{services.length}</span>}
              </button>
            )}
          </div>
          
          {/* ALSO OFFERS HINT (Product-Level Upgrade) */}
          {activeTab === 'products' && services.length > 0 && (
             <div className="flex items-center justify-center animate-in fade-in slide-in-from-top-2">
                <div className="bg-gold-pale text-brown-deep text-[10px] px-4 py-2 rounded-full font-black border border-gold flex items-center gap-2 shadow-sm">
                   ✨ {isTa ? 'இந்தக் கடை சேவைகளையும் வழங்குகிறது!' : 'Also offers professional services!'}
                   <button onClick={() => setActiveTab('services')} className="underline decoration-gold-light hover:text-gold transition-colors ml-1">{isTa ? 'இப்போதே பார்' : 'View Now'}</button>
                </div>
             </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-3.5 text-brown-mid" size={18} />
          <input 
            type="text" 
            placeholder={isTa ? `தேடு ${activeTab === 'products' ? 'பொருட்கள்' : 'சேவைகள்'}...` : `Search ${activeTab === 'products' ? 'products' : 'services'}...`}
            className="w-full bg-white border-2 border-parchment rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-gold transition-all shadow-sm font-medium text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dynamic Grid */}
        <div className="kc-grid">
          {activeTab === 'products' ? (
            filteredItems.map((p) => (
              <div key={p.id} className="bg-white border-2 border-parchment rounded-3xl overflow-hidden shadow-soft group hover:border-gold transition-all duration-300 flex flex-col">
                <div className="h-48 bg-cream-dark relative overflow-hidden">
                  {(p.image_url || p.image) 
                    ? <img src={p.image_url || p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> 
                    : <div className="w-full h-full flex items-center justify-center text-5xl opacity-40">{p.emoji || '📦'}</div>}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {p.stock < 5 && p.stock > 0 && <span className="bg-rust text-white text-[9px] font-black px-2 py-1 rounded-full shadow-sm animate-pulse">🔥 ONLY {p.stock} LEFT</span>}
                    {p.stock <= 0 && <span className="bg-gray-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-sm">OUT OF STOCK</span>}
                    {p.badge && <span className="bg-gold text-brown-deep text-[9px] font-black px-2 py-1 rounded-full shadow-sm uppercase">{p.badge}</span>}
                  </div>

                  <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-rust shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                    <Heart size={18} />
                  </button>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-gold uppercase tracking-widest">{p.category_name || 'General'}</span>
                    <div className="flex items-center gap-1 text-brown-mid font-bold text-[10px]">
                      <Star size={10} fill="var(--gold)" className="text-gold" />
                      {p.rating || '4.8'} ({p.reviews_count || '12'})
                    </div>
                  </div>

                  <h4 className="font-serif font-black text-brown-deep leading-tight mb-2 text-base group-hover:text-gold transition-colors">{isTa ? (p.name_ta || p.name) : p.name}</h4>
                  
                  <p className="text-[11px] text-brown-mid line-clamp-3 mb-4 leading-relaxed flex-1 italic">
                    {isTa ? (p.description_ta || p.desc_ta || 'சிறந்த தரமான தயாரிப்பு.') : (p.description || p.desc || 'Premium quality product sourced locally.')}
                  </p>

                  <div className="pt-4 border-t border-parchment/40 mt-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-brown-light line-through decoration-rust/40">₹{(Number(p.price) * 1.2).toFixed(0)}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-gold font-serif font-black italic text-2xl">₹{Number(p.price).toLocaleString()}</span>
                          <span className="text-[10px] text-brown-mid font-bold">/ pc</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                         <div className={`w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-green-500' : 'bg-rust'}`}></div>
                         <span className="text-[9px] font-black text-brown-mid uppercase">{p.stock > 0 ? (isTa ? 'இருப்பில் உள்ளது' : 'In Stock') : (isTa ? 'இல்லை' : 'Sold Out')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a href={`tel:${store.phone || '+919876543210'}`} className="bg-cream-dark text-brown-deep w-11 h-11 flex items-center justify-center rounded-2xl border-2 border-parchment hover:border-gold hover:text-gold transition-all shadow-sm" title="Call Store">
                        <Phone size={18} />
                      </a>
                      <button 
                        onClick={() => {
                          if (p.stock > 0) {
                            apiFetch('/api/orders/add-to-cart/', {
                              method: 'POST',
                              body: JSON.stringify({ product_id: p.id, quantity: 1 })
                            }).then(res => {
                              if (res?.ok) showToast(isTa ? 'கூடையில் சேர்க்கப்பட்டது!' : 'Added to Cart!');
                            });
                          }
                        }}
                        disabled={p.stock <= 0}
                        className={`flex-1 ${p.stock > 0 ? 'bg-brown-deep text-gold hover:bg-brown-mid' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} py-3 rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:shadow-gold/20 active:scale-95 transition-all text-xs font-black uppercase tracking-wider`}
                      >
                        <Plus size={16} /> {isTa ? 'கார்ட்டில் சேர்' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredItems.map((s) => {
              const workPhotos = s.work_photos || [
                s.image_url || s.image,
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
                'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop',
              ].filter(Boolean);
              const mainPhoto = workPhotos[0] || `https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=300&fit=crop`;
              return (
                <div key={s.id} className="bg-white border-2 border-parchment rounded-3xl overflow-hidden shadow-soft group hover:border-gold transition-all duration-300 flex flex-col">
                  {/* Work banner image */}
                  <div className="h-48 relative overflow-hidden bg-gold-pale">
                    <img src={mainPhoto} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={e => { e.target.style.display='none'; e.target.parentNode.querySelector('.fallback').style.display='flex'; }} />
                    <div className="fallback" style={{ display:'none', position:'absolute', inset:0, alignItems:'center', justifyContent:'center', fontSize:'3rem', background:'var(--gold-pale)' }}>{s.emoji || '✂️'}</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="bg-gold text-brown-deep text-[9px] font-black px-2 py-1 rounded-full shadow-lg border border-white/20">PREMIUM SERVICE</span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <div className="text-white font-serif font-black text-lg leading-tight drop-shadow-md">{isTa ? (s.name_ta || s.name) : s.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-gold text-2xl font-black font-serif italic drop-shadow-md">₹{Number(s.price).toLocaleString()}</div>
                          <span className="text-white/60 text-[10px] font-bold line-through decor-rust/50">₹{(Number(s.price) * 1.5).toFixed(0)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(star => <Star key={star} size={10} fill="var(--gold)" className="text-gold" />)}
                        </div>
                        <span className="text-white/80 text-[9px] font-black uppercase tracking-tighter bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">4.9 (45+ Reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info + Actions */}
                  <div className="p-5 flex flex-col gap-4 flex-1">
                    <div className="flex items-center gap-4 text-[11px] text-brown-mid font-bold">
                      <span className="flex items-center gap-1.5"><Clock size={12} className="text-gold"/> {s.duration_minutes ? `${s.duration_minutes} min` : (s.duration || '45 min')}</span>
                      <span className="w-1 h-1 rounded-full bg-parchment"></span>
                      <span className="flex items-center gap-1.5 text-green-600"><CheckCircle2 size={12}/> {isTa ? 'இன்று கிடைக்கும்' : 'Available Today'}</span>
                    </div>

                    <p className="text-[11px] text-brown-mid leading-relaxed italic line-clamp-2">
                      {isTa ? (s.description_ta || 'தொழில்முறை சேவை தரம் உறுதி செய்யப்படுகிறது.') : (s.description || 'Professional service with guaranteed quality and satisfaction.')}
                    </p>

                    <div className="flex gap-2 mt-auto pt-4 border-t border-parchment/30">
                      {/* Call button */}
                      <a href={`tel:${store.phone || '+919876543210'}`}
                        className="flex items-center justify-center w-12 h-12 rounded-2xl border-2 border-parchment bg-cream-dark text-brown-deep hover:border-gold hover:text-gold transition-all flex-shrink-0 shadow-sm"
                        title="Call Shopkeeper">
                        <Phone size={20} />
                      </a>
                      {/* Book Now */}
                      <button onClick={() => setBookingService(s)}
                        className="flex-1 bg-brown-deep text-gold py-3 rounded-2xl text-sm font-serif font-black italic uppercase tracking-wider hover:bg-brown-mid transition-all shadow-xl hover:shadow-gold/10 active:scale-95 border-2 border-transparent hover:border-gold/50">
                        {isTa ? '📅 முன்பதிவு செய்' : '📅 Book Now'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {filteredItems.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white/40 rounded-3xl border-2 border-dashed border-parchment">
              <div className="text-4xl mb-3 grayscale opacity-30">🔍</div>
              <p className="text-brown-mid font-medium italic">
                {isTa ? `மன்னிக்கவும், "${searchQuery}" காணப்படவில்லை.` : `Oops, couldn't find any ${activeTab === 'products' ? 'products' : 'services'} matching "${searchQuery}".`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
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
        .kc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 18px;
        }
        @media (max-width: 480px) {
          .kc-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default StorePage;

