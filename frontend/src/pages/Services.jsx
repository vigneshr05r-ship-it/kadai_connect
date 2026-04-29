import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import BookingModal from '../components/BookingModal';
import { Star, Clock, MapPin, ShieldCheck, ChevronLeft, ArrowRight, Zap, Info, ArrowLeft } from 'lucide-react';
import { MOCK_SERVICES, STORES } from '../data/mockData';

export default function Services() {
  const { apiFetch } = useAuth();
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isTa = i18n.language.startsWith('ta');
  
  const category = location.state?.category || 'All Services';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingService, setBookingService] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const resp = await apiFetch('/api/services/');
        let allServices = MOCK_SERVICES;
        if (resp?.ok) {
          const d = await resp.json();
          const real = Array.isArray(d) ? d : (d.results || []);
          if (real.length > 0) allServices = [...real, ...MOCK_SERVICES];
        }
        
        const filtered = category === 'All Services'
          ? allServices
          : allServices.filter(s => s.category === category || s.category_name === category);
          
        setServices(filtered);
      } catch (e) {
        setServices([]);
      }
      setLoading(false);
    })();
  }, [apiFetch, category]);

  return (
    <MainLayout title={isTa ? category : category}>

      {/* Back Button and Trust Bar */}
      <div style={{ background: 'var(--parchment)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1.5px solid rgba(59,31,14,0.1)' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--brown-deep)', color: 'var(--gold-light)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'var(--gold)', borderRadius: '50%', padding: 4, flexShrink: 0 }}>
             <Zap size={12} color="var(--brown-deep)" fill="var(--brown-deep)" />
          </div>
          <span style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--brown-deep)' }}>100% Verified Local Professionals • Quality Guaranteed</span>
        </div>
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {loading ? (
          [1,2,3].map(i => <div key={i} style={{ height: 160, background: 'var(--cream-dark)', borderRadius: 28, animation: 'pulse 1.5s infinite linear' }} />)
        ) : services.length > 0 ? (
          services.map(service => (
            <div 
              key={service.id} 
              className="uc-service-item"
              style={{ background: '#fff', borderRadius: 32, padding: 24, border: '2px solid var(--parchment)', boxShadow: '0 8px 20px rgba(59,31,14,0.04)', display: 'flex', gap: 20, position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                   <div style={{ background: 'var(--gold-pale)', color: 'var(--brown-deep)', padding: '3px 10px', borderRadius: 10, fontSize: '.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4, border: '1px solid var(--parchment)' }}>
                     <Star size={12} fill="var(--gold)" /> {service.rating || '4.8'}
                   </div>
                   <span style={{ fontSize: '.7rem', color: 'var(--brown-mid)', fontWeight: 700, textTransform: 'uppercase' }}>• {service.bookings_count || '120'} Bookings</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brown-deep)', margin: '0 0 6px' }}>
                  {isTa ? (service.name_ta || service.name) : service.name}
                </h3>
                <p style={{ fontSize: '.85rem', color: 'var(--brown-mid)', margin: '0 0 16px', lineHeight: 1.5, fontWeight: 600 }}>
                  {isTa ? (service.subtitle_ta || service.subtitle) : service.subtitle}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--gold)' }}>₹{service.price}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--brown-mid)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                    <Clock size={14} className="text-gold" /> {service.duration || '1 hr'}
                  </div>
                </div>
                <button 
                  onClick={() => setBookingService(service)}
                  style={{ padding: '12px 32px', background: 'var(--brown-deep)', color: 'var(--gold-light)', border: 'none', borderRadius: 14, fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', transition: '.3s', boxShadow: '0 8px 15px rgba(59,31,14,0.15)' }}
                >
                  Book Now
                </button>
              </div>
              <div style={{ width: 120, height: 120, position: 'relative' }}>
                <img 
                  src={service.image_url} 
                  alt={service.name} 
                  style={{ width: '100%', height: '100%', borderRadius: 24, objectFit: 'cover', border: '2px solid var(--parchment)' }} 
                />
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--parchment)/30', borderRadius: 40, border: '2px dashed var(--parchment)' }}>
            <div style={{ width: 80, height: 80, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
               <Info size={40} color="var(--parchment)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brown-deep)', fontFamily: 'var(--font-d)' }}>No Experts Found</h3>
            <p style={{ fontSize: '.9rem', color: 'var(--brown-mid)', maxWidth: '240px', margin: '10px auto 0', fontWeight: 600 }}>We're currently scouting the best professionals in this category for you.</p>
          </div>
        )}
      </div>

      {bookingService && (
        <BookingModal 
          service={bookingService}
          store={STORES.find(s => s.id === bookingService.store_id) || STORES[0]}
          onClose={() => setBookingService(null)}
          apiFetch={apiFetch}
          showToast={() => {}}
          isTa={isTa}
        />
      )}

      <style>{`
        .uc-service-item { transition: .3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .uc-service-item:hover { transform: translateY(-5px); border-color: var(--gold); box-shadow: 0 15px 35px rgba(59,31,14,0.1) !important; }
        .uc-service-item:active { transform: scale(0.96); background: var(--cream); }
      `}</style>
    </MainLayout>
  );
}
