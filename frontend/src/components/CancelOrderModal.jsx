import React, { useState } from 'react';
import { X, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

const REASONS = [
  'Ordered by mistake',
  'Found better price elsewhere',
  'Delivery delay',
  'Change of plans',
  'Other'
];

export default function CancelOrderModal({ order, onCancel, onClose, isTa }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [otherText, setOtherText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const finalReason = reason === 'Other' ? otherText : reason;
    if (reason === 'Other' && !otherText.trim()) {
      setError(isTa ? 'தயவுசெய்து காரணத்தை உள்ளிடவும்' : 'Please enter a reason');
      return;
    }

    setLoading(true);
    try {
      await onCancel(order.id, finalReason);
      setSuccess(true);
    } catch (err) {
      setError(err.message || (isTa ? 'ரத்து செய்ய முடியவில்லை' : 'Failed to cancel'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-brown-deep/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fadeIn">
        <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full border-4 border-gold shadow-2xl space-y-6 text-center">
          <div className="w-20 h-20 bg-rust/10 rounded-full flex items-center justify-center mx-auto text-rust">
             <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-serif font-black italic text-brown-deep">
            {isTa ? 'ஆர்டர் ரத்து செய்யப்பட்டது' : 'Order Cancelled'}
          </h2>
          <p className="text-sm text-brown-mid">
            {isTa ? 'உங்கள் கோரிக்கை வெற்றிகரமாக செயல்படுத்தப்பட்டது.' : 'Your request has been processed successfully.'}
          </p>
          <button onClick={onClose} className="w-full p-4 rounded-2xl bg-brown-deep text-gold font-black text-sm shadow-lg">
             {isTa ? 'சரி' : 'Done'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-brown-deep/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full border-4 border-gold shadow-2xl space-y-6 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-brown-mid"><X size={20}/></button>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-black italic text-brown-deep">
            {isTa ? 'ஆர்டரை ரத்து செய்யவா?' : 'Cancel Order'}
          </h2>
          <p className="text-xs text-brown-mid font-bold uppercase tracking-widest">
            {isTa ? 'தகுந்த காரணத்தை தேர்வு செய்யவும்' : 'Please provide a reason'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-gold uppercase tracking-widest ml-1">
               {isTa ? 'காரணம்' : 'Select Reason'}
             </label>
             <select 
               value={reason}
               onChange={(e) => { setReason(e.target.value); setError(''); }}
               className="w-full bg-cream border-2 border-parchment rounded-2xl p-4 text-sm font-bold focus:border-gold outline-none"
             >
               {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
             </select>
          </div>

          {reason === 'Other' && (
            <textarea 
              value={otherText}
              onChange={(e) => { setOtherText(e.target.value); setError(''); }}
              className="w-full bg-cream border-2 border-parchment rounded-2xl p-4 text-sm focus:border-gold outline-none min-h-[100px]"
              placeholder={isTa ? 'விவரங்களை இங்கே உள்ளிடவும்...' : 'Tell us more...'}
            />
          )}

          {error && (
            <div className="flex items-center gap-2 text-rust bg-rust/5 p-3 rounded-xl border border-rust/10 text-xs font-bold animate-shake">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button 
            onClick={onClose}
            className="p-4 rounded-2xl bg-parchment text-brown-deep font-black text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> {isTa ? 'திரும்பச் செல்' : 'Back'}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="p-4 rounded-2xl bg-rust text-white font-black text-sm shadow-lg shadow-rust/20 disabled:opacity-50"
          >
            {loading ? '...' : (isTa ? 'உறுதி செய்' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
