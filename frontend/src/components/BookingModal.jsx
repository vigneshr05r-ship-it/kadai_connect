import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

const BookingModal = ({ service, store, onClose, apiFetch, showToast, isTa }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customer_name: user?.name || user?.first_name || user?.username || '',
    customer_phone: user?.phone || '',
    customer_email: user?.email || '',
    booking_date: new Date().toISOString().split('T')[0],
    booking_time: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lockingSlot, setLockingSlot] = useState(false); // Product-Level Lock simulation

  // Generate next 7 days
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString(isTa ? 'ta-IN' : 'en-US', { weekday: 'short' }),
      date: d.getDate()
    };
  });

  const slots = [
    { label: isTa ? 'காலை' : 'Morning', icon: '🌅', times: ['09:00', '10:00', '11:00'] },
    { label: isTa ? 'மதியம்' : 'Afternoon', icon: '☀️', times: ['13:00', '14:00', '15:00', '16:00'] },
    { label: isTa ? 'மாலை' : 'Evening', icon: '🌙', times: ['18:00', '19:00', '20:00'] }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.booking_date || !formData.booking_time) {
      if (typeof showToast === 'function') {
        showToast(isTa ? 'தயவுசெய்து அனைத்து கட்டாய புலங்களையும் நிரப்பவும்' : 'Please fill in all required fields');
      }
      return;
    }

    setSubmitting(true);
    try {
      const resp = await apiFetch(`${API}/api/services/bookings/`, {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          store: store.id,
          service: service.id,
          status: 'Pending'
        })
      });

      if (resp.ok) {
        setSuccess(true);
        if (typeof showToast === 'function') {
          showToast(isTa ? '✅ முன்பதிவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!' : '✅ Booking submitted successfully!');
        }
      } else {
        const data = await resp.json();
        if (typeof showToast === 'function') {
          showToast('❌ ' + (data.detail || data.error || 'Booking failed'));
        }
      }
    } catch (err) {
      console.error('Booking error:', err);
      if (typeof showToast === 'function') {
        showToast('❌ Server error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-brown-deep/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl border-4 border-gold animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle2 size={60} className="text-gold animate-bounce" />
          </div>
          <h2 className="text-3xl font-serif font-black italic text-brown-deep mb-3">
            {isTa ? 'வெற்றி!' : 'Success!'}
          </h2>
          <p className="text-brown-mid font-bold text-sm leading-relaxed mb-8">
            {isTa 
              ? 'உங்கள் சேவை முன்பதிவு செய்யப்பட்டது. கடைக்காரர் விரைவில் உங்களைத் தொடர்புகொள்வார்.' 
              : 'Your professional service is booked! The expert will contact you shortly to confirm the details.'}
          </p>
          <button 
            onClick={onClose}
            className="w-full bg-brown-deep text-gold-light py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            {isTa ? 'சரி' : 'Awesome'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-brown-deep/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-cream w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-gold/20 animate-in zoom-in-95 duration-300">
        
        {/* Top Header - Service Card Summary */}
        <div className="bg-brown-deep p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
            <X size={20} />
          </button>
          
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-gold-pale rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-gold/30">
               {service.emoji || '🧵'}
            </div>
            <div>
              <h3 className="text-2xl font-serif font-black italic text-gold-light leading-none mb-1">
                {isTa ? (service.name_ta || service.name) : service.name}
              </h3>
              <div className="flex items-center gap-3 text-white/60 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><Clock size={12}/> {service.duration || '1 hr'}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                <span className="text-gold">₹{Number(service.price).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Booking Flow */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* STEP 1: Select Date */}
          <div>
            <label className="text-[10px] font-black text-brown-deep/40 uppercase tracking-[0.2em] mb-3 block">
              01. {isTa ? 'தேதியைத் தேர்ந்தெடுக்கவும்' : 'Select Date'}
            </label>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {days.map((d) => (
                <button 
                  key={d.full}
                  type="button"
                  onClick={() => setFormData({ ...formData, booking_date: d.full })}
                  className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${formData.booking_date === d.full ? 'bg-brown-deep border-gold text-gold shadow-lg translate-y-[-2px]' : 'bg-white border-parchment text-brown-mid hover:border-gold/50'}`}
                >
                  <span className="text-[10px] font-black uppercase mb-1">{d.day}</span>
                  <span className="text-xl font-serif font-black italic">{d.date}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Select Time Slot */}
          <div>
            <label className="text-[10px] font-black text-brown-deep/40 uppercase tracking-[0.2em] mb-3 block">
              02. {isTa ? 'நேரத்தைத் தேர்ந்தெடுக்கவும்' : 'Select Time Slot'}
            </label>
            <div className="space-y-4">
              {slots.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-brown-mid uppercase tracking-widest">
                    <span>{s.icon}</span> {s.label}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {s.times.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({ ...formData, booking_time: t })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${formData.booking_time === t ? 'bg-gold text-brown-deep border-gold shadow-md' : 'bg-white text-brown-mid border-parchment hover:border-gold/30'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: Personal Details */}
          <div className="pt-4 border-t border-parchment/50 space-y-4">
             <label className="text-[10px] font-black text-brown-deep/40 uppercase tracking-[0.2em] mb-1 block">
              03. {isTa ? 'தனிப்பட்ட விவரங்கள்' : 'Personal Details'}
            </label>
            
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-brown-mid group-focus-within:text-gold transition-colors" size={18} />
              <input
                type="text"
                placeholder={isTa ? 'உங்கள் பெயர்' : 'Full Name'}
                required
                className="w-full bg-white border-2 border-parchment rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-gold transition-all text-sm font-bold text-brown-deep"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </div>

            <div className="relative group">
              <Phone className="absolute left-4 top-3.5 text-brown-mid group-focus-within:text-gold transition-colors" size={18} />
              <input
                type="tel"
                placeholder={isTa ? 'தொலைபேசி எண்' : 'Phone Number'}
                required
                className="w-full bg-white border-2 border-parchment rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-gold transition-all text-sm font-bold text-brown-deep"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              />
            </div>

            <div className="relative group">
              <FileText className="absolute left-4 top-4 text-brown-mid group-focus-within:text-gold transition-colors" size={18} />
              <textarea
                placeholder={isTa ? 'ஏதேனும் கூடுதல் குறிப்புகள்...' : 'Any special requests or notes...'}
                className="w-full bg-white border-2 border-parchment rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-gold transition-all text-sm font-bold text-brown-deep resize-none h-24"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting || !formData.booking_time}
              className="w-full bg-brown-deep text-gold py-5 rounded-3xl font-serif font-black italic text-lg shadow-2xl shadow-brown-deep/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-3 border-gold/30 border-t-gold rounded-full animate-spin"/>
                  <span>{isTa ? 'முன்பதிவு செய்யப்படுகிறது...' : 'Confirming Booking...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={24}/>
                  <span>{isTa ? 'இப்போதே முன்பதிவு செய்யுங்கள்' : 'Book Now'}</span>
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-brown-mid/60 mt-4 uppercase tracking-widest font-bold">
               {isTa ? 'முன்பதிவு செய்யப்பட்டதும் கடைக்காரர் உங்களைத் தொடர்புகொள்வார்' : 'Storekeeper will contact you after booking confirmation'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
