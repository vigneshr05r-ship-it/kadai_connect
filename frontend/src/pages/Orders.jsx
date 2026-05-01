import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Clock, Lock, ShieldCheck, History, X, MapPin, ArrowLeft } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import CancelOrderModal from '../components/CancelOrderModal';
import DeliveryMap from '../components/DeliveryMap';
import WhatsAppButton from '../components/WhatsAppButton';

export default function Orders() {
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');
  
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCancelOrder, setActiveCancelOrder] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  
  // For countdown timers
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll for tracking location if modal is open
  useEffect(() => {
    if (!trackingOrder) return;
    
    const interval = setInterval(async () => {
      try {
        const resp = await apiFetch(`/api/orders/${trackingOrder.id}/`);
        if (resp.ok) {
          const updatedOrder = await resp.json();
          setTrackingOrder(updatedOrder);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [trackingOrder?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oResp, bResp] = await Promise.all([
        apiFetch('/api/orders/'),
        apiFetch('/api/services/bookings/')
      ]);
      if (oResp.ok) setOrders(await oResp.json());
      if (bResp.ok) setBookings(await bResp.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleCancelSubmit = async (id, reason) => {
    const isBooking = activeCancelOrder.type === 'booking';
    const endpoint = isBooking 
      ? `/api/services/bookings/${id}/cancel/` 
      : `/api/orders/${id}/cancel/`;
    
    // OPTIMISTIC UPDATE: Update UI instantly
    const previousOrders = [...orders];
    const previousBookings = [...bookings];

    if (isBooking) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
    } else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    }
    
    setActiveCancelOrder(null); // Close modal instantly

    try {
      const resp = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Cancellation failed');
      }
      // Re-fetch to be sure everything is in sync
      fetchData();
    } catch (e) {
      console.error(e);
      // ROLLBACK on failure
      setOrders(previousOrders);
      setBookings(previousBookings);
      alert(isTa ? 'ரத்து செய்ய முடியவில்லை: ' + e.message : 'Cancellation failed: ' + e.message);
    }
  };

  const getStatusConfig = (s) => {
    const map = {
      'new': { bg: 'var(--gold-pale)', col: 'var(--brown-deep)', label: isTa ? 'புதியது' : 'New' },
      'payment_pending': { bg: 'var(--parchment)', col: 'var(--brown-mid)', label: isTa ? 'பணம் நிலுவையில் உள்ளது' : 'Payment Pending' },
      'confirmed': { bg: 'var(--green-light)', col: '#fff', label: isTa ? 'உறுதி செய்யப்பட்டது' : 'Confirmed' },
      'packed': { bg: 'var(--brown-light)', col: '#fff', label: isTa ? 'பேக் செய்யப்பட்டது' : 'Packed' },
      'ready': { bg: 'var(--gold)', col: 'var(--brown-deep)', label: isTa ? 'தயார்' : 'Ready' },
      'delivered': { bg: 'var(--green)', col: '#fff', label: isTa ? 'டெலிவரி செய்யப்பட்டது' : 'Delivered' },
      'cancelled': { bg: 'var(--rust)', col: '#fff', label: isTa ? 'ரத்து செய்யப்பட்டது' : 'Cancelled' },
      'Pending': { bg: 'var(--gold-pale)', col: 'var(--brown-deep)', label: isTa ? 'நிலுவையில் உள்ளது' : 'Pending' },
      'Accepted': { bg: 'var(--green-light)', col: '#fff', label: isTa ? 'ஏற்கப்பட்டது' : 'Accepted' },
      'Completed': { bg: 'var(--green)', col: '#fff', label: isTa ? 'முடிந்தது' : 'Completed' }
    };
    return map[s] || { bg: 'var(--parchment)', col: 'var(--brown-deep)', label: s };
  };

  return (
    <MainLayout title={isTa ? 'எனது வரலாறு' : 'Order History'}>
      <div className="max-w-2xl mx-auto space-y-8 p-6">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--brown-deep)', border: 'none', color: 'var(--gold-light)', cursor: 'pointer', width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}><ArrowLeft size={22} /></button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--brown-deep)', margin: 0 }}>{isTa ? 'எனது வரலாறு' : 'Order History'}</h1>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 40, display: 'none' }}>
           <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--brown-deep)' }}>
             {isTa ? 'எனது வரலாறு' : 'Order History'}
           </h1>
           <div style={{ width: 50, height: 3, background: 'var(--gold)', margin: '0 auto', borderRadius: 2 }} />
           <p style={{ marginTop: 12, color: 'var(--brown-mid)', fontSize: '.85rem', fontWeight: 600 }}>Tracking your local treasures and services</p>
        </div>

        {/* Mixed History List */}
        <div className="space-y-6">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height: 200, borderRadius: 24 }} />
            ))
          ) : (
            [...(Array.isArray(orders) ? orders : []), ...(Array.isArray(bookings) ? bookings.map(b => ({ ...b, isBooking: true })) : [])]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((item) => {
              const s = getStatusConfig(item.status);
              const createdAt = new Date(item.created_at).getTime();
              const limit = 15 * 60 * 1000; 
              const timeLeft = Math.max(0, limit - (now - createdAt));
              const isTimeValid = timeLeft > 0;
              const isCancellable = isTimeValid && !['delivered', 'cancelled', 'Cancelled', 'Completed', 'completed', 'out_for_delivery', 'picked_up'].includes(item.status);
              
              const formatTimer = (ms) => {
                const mins = Math.floor(ms / 60000);
                const secs = Math.floor((ms % 60000) / 1000);
                return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
              };

              return (
                <div key={item.isBooking ? `booking-${item.id}` : `order-${item.id}`} style={{ background: '#fff', border: '2px solid var(--parchment)', borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                  {isCancellable && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--parchment)', opacity: 0.3 }}>
                       <div style={{ height: '100%', background: 'var(--gold)', transition: 'width 1s linear', width: `${(timeLeft / limit) * 100}%` }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                         <div style={{ width: 8, height: 8, background: item.isBooking ? 'var(--green)' : 'var(--gold)', borderRadius: '50%' }} />
                         <span style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--brown-mid)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                           {item.isBooking ? (isTa ? 'சேவை' : 'Service') : (isTa ? 'ஆர்டர்' : 'Order')}
                         </span>
                      </div>
                      <h3 style={{ fontWeight: 800, color: 'var(--brown-deep)', fontSize: '1.1rem' }}>
                        #{item.id} — {item.isBooking ? item.service_name : (item.items?.[0]?.product_name || 'Mixed Items')}
                      </h3>
                    </div>
                    <div style={{ background: s.bg, color: s.col, padding: '4px 12px', borderRadius: 10, fontSize: '.7rem', fontWeight: 800, border: '1.5px solid rgba(0,0,0,0.05)' }}>
                      {s.label}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1.5px solid var(--parchment)', paddingTop: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <p style={{ fontSize: '.65rem', color: 'var(--brown-mid)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Date</p>
                        <p style={{ fontSize: '.9rem', fontWeight: 800, color: 'var(--brown-deep)' }}>{new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>

                      {!['delivered', 'cancelled', 'Completed'].includes(item.status) && (
                         <div style={{ 
                           display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', 
                           borderRadius: 14, border: '1.5px solid', transition: '.3s',
                           borderColor: isCancellable ? 'var(--gold-pale)' : 'var(--parchment)',
                           background: isCancellable ? 'rgba(201,146,26,0.05)' : 'var(--cream-dark)'
                         }}>
                           {isCancellable ? (
                             <>
                               <Clock size={14} color="var(--gold)" />
                               <span style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--brown-deep)', textTransform: 'uppercase' }}>
                                 Cancel ends in <span style={{ color: 'var(--gold)' }}>{formatTimer(timeLeft)}</span>
                               </span>
                             </>
                           ) : (
                             <>
                               <Lock size={14} color="var(--brown-mid)" />
                               <span style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--brown-mid)', textTransform: 'uppercase' }}>
                                 Finalized
                               </span>
                             </>
                           )}
                         </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                         <span style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--brown-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 2 }}>Amount</span>
                         <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold)' }}>₹{Number(item.total_price || item.service_price || 0).toLocaleString()}</p>
                      </div>
                      
                      {!item.isBooking && ['assigned', 'ready', 'picked_up', 'out_for_delivery'].includes(item.status) && (
                        <button 
                          onClick={() => setTrackingOrder(item)}
                          style={{ background: 'var(--brown-deep)', color: 'var(--gold-light)', border: '2px solid var(--gold)', borderRadius: 10, padding: '8px 16px', fontSize: '.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                        >
                          <MapPin size={14} /> {isTa ? 'கண்காணிக்கவும்' : 'Track Order'}
                        </button>
                      )}

                      {isCancellable && (
                        <button 
                          onClick={() => setActiveCancelOrder({ id: item.id, type: item.isBooking ? 'booking' : 'order' })}
                          style={{ background: 'var(--rust)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: '.75rem', fontWeight: 800, cursor: 'pointer', transition: '.2s' }}
                        >
                          {isTa ? 'ரத்து செய்' : 'Cancel'}
                        </button>
                      )}

                      {item.isBooking && item.status !== 'Cancelled' && (
                        <WhatsAppButton 
                          phone={item.store_phone}
                          label={isTa ? 'வாட்ஸ்அப்பில் பகிரவும்' : 'Share on WhatsApp'}
                          message={`Hi, I have booked a service on KadaiConnect.\n\nOrder ID: #${item.id}\nService: ${item.service_name}\n\nI am sharing reference images/details here.`}
                          style={{ marginTop: 8 }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {activeCancelOrder && (
          <CancelOrderModal 
            order={activeCancelOrder}
            isTa={isTa}
            onCancel={handleCancelSubmit}
            onClose={() => setActiveCancelOrder(null)}
          />
        )}

        {/* Tracking Modal */}
        {trackingOrder && (
          <div onClick={() => setTrackingOrder(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'grid', placeItems: 'center', padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--cream)', width: '100%', maxWidth: 600, borderRadius: 24, overflow: 'hidden', border: '2px solid var(--gold)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1.5px solid var(--parchment)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--brown-deep)' }}>
                <div style={{ color: '#fff' }}>
                  <div style={{ fontSize: '.7rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 800 }}>{isTa ? 'நேரலை டெலிவரி' : 'Live Delivery Tracking'}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>Order #{trackingOrder.id}</div>
                </div>
                <button onClick={() => setTrackingOrder(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: 10, borderRadius: '50%', cursor: 'pointer' }}><X size={24}/></button>
              </div>

              {/* Status Flow */}
              <div style={{ background: 'var(--cream-dark)', padding: '15px 20px', borderBottom: '1px solid var(--parchment)', display: 'flex', justifyContent: 'space-between' }}>
                {['ready', 'assigned', 'picked_up', 'out_for_delivery', 'delivered'].map((s, i, arr) => {
                  const currentIdx = arr.indexOf(trackingOrder.status);
                  const active = i <= currentIdx;
                  const labels = {
                    ready: isTa ? 'தயார்' : 'Ready',
                    assigned: isTa ? 'ஒதுக்கப்பட்டது' : 'Assigned',
                    picked_up: isTa ? 'எடுக்கப்பட்டது' : 'Picked Up',
                    out_for_delivery: isTa ? 'வருகிறது' : 'On Way',
                    delivered: isTa ? 'சேர்ந்தது' : 'Done'
                  };
                  return (
                    <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: active ? 'var(--gold)' : 'var(--parchment)', margin: '0 auto 5px', border: '2px solid #fff', display: 'grid', placeItems: 'center', fontSize: '12px', fontWeight: 900, color: active ? 'var(--brown-deep)' : 'var(--brown-mid)', zIndex: 2, position: 'relative' }}>{i + 1}</div>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: active ? 'var(--brown-deep)' : 'var(--brown-mid)', textTransform: 'uppercase' }}>{labels[s]}</div>
                      {i < arr.length - 1 && (
                        <div style={{ position: 'absolute', top: 12, left: '50%', width: '100%', height: 2, background: i < currentIdx ? 'var(--gold)' : 'var(--parchment)', zIndex: 1 }} />
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div style={{ height: 350, position: 'relative' }}>
                <DeliveryMap 
                  pickupCoords={trackingOrder.store_lat ? { lat: Number(trackingOrder.store_lat), lng: Number(trackingOrder.store_lng) } : null}
                  deliveryCoords={trackingOrder.customer_lat ? { lat: Number(trackingOrder.customer_lat), lng: Number(trackingOrder.customer_lng) } : null}
                  currentCoords={trackingOrder.delivery_info?.lat ? { lat: Number(trackingOrder.delivery_info.lat), lng: Number(trackingOrder.delivery_info.lng) } : null}
                  orderAddress={trackingOrder.address}
                />
              </div>
              
              <div style={{ padding: 24, background: '#fff' }}>
                {trackingOrder.delivery_info ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--gold-pale)', display: 'grid', placeItems: 'center', fontSize: '1.8rem' }}>🛵</div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--brown-deep)' }}>{trackingOrder.delivery_info.partner_name}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--green)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 8, height: 8, background: 'var(--green)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                          {isTa ? 'உங்கள் இல்லத்தை நோக்கி...' : 'Heading to your location...'}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open(`tel:${trackingOrder.delivery_info.partner_phone}`)}
                      style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 14, fontWeight: 800, fontSize: '.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      📞 {isTa ? 'அழைக்கவும்' : 'Call'}
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--brown-mid)', fontStyle: 'italic' }}>
                    {isTa ? 'டெலிவரி நபர் விரைவில் ஒதுக்கப்படுவார்...' : 'Waiting for partner assignment...'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
