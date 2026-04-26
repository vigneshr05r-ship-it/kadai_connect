import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '';

const STATUS_COLOR = {
  Pending:          { bg: '#fff3cd', text: '#856404' },
  Accepted:         { bg: '#d1ecf1', text: '#0c5460' },
  Confirmed:        { bg: '#cce5ff', text: '#004085' },
  ReadyForPickup:   { bg: '#e2e3e5', text: '#383d41' },
  Assigned:         { bg: '#fef3cd', text: '#856404' },
  PickedUp:         { bg: '#d4edda', text: '#155724' },
  Completed:        { bg: '#d4edda', text: '#155724' },
  Cancelled:        { bg: '#f8d7da', text: '#721c24' },
};

const S = {
  panel: {
    background: 'var(--cream)',
    borderRadius: 12,
    padding: 20,
    border: '1px solid rgba(201,146,26,.15)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  badge: (status) => ({
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: '.72rem',
    fontWeight: 700,
    background: STATUS_COLOR[status]?.bg || '#f0f0f0',
    color: STATUS_COLOR[status]?.text || '#333',
  }),
};

const STATUSES = ['Pending', 'Accepted', 'Confirmed', 'ReadyForPickup', 'Assigned', 'PickedUp', 'Completed', 'Cancelled'];

export default function BookingsPanel({ apiFetch, isTa, showToast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const r = await apiFetch(`${API}/api/services/bookings/`);
      if (r.ok) setBookings(await r.json());
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id, status) => {
    try {
      const r = await apiFetch(`${API}/api/services/bookings/${id}/status/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (r.ok) {
        showToast(`✅ Booking marked as ${status}`);
        fetchBookings();
      }
    } catch (e) { showToast('❌ Error updating status'); }
  };

  const displayed = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--brown-deep)' }}>
          📅 <span style={{ color: 'var(--gold)' }}>{isTa ? 'முன்பதிவுகள்' : 'Bookings'}</span>
        </div>
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: `2px solid ${filter === s ? 'var(--gold)' : 'var(--parchment)'}`,
              background: filter === s ? 'var(--cream-dark)' : 'transparent',
              fontWeight: 700,
              color: filter === s ? 'var(--brown-deep)' : 'var(--brown-mid)',
              cursor: 'pointer',
              fontSize: '.78rem',
            }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {STATUSES.map(s => {
          const count = bookings.filter(b => b.status === s).length;
          const cfg = STATUS_COLOR[s];
          return (
            <div key={s} style={{ ...S.panel, textAlign: 'center', padding: '14px 10px', background: cfg.bg, border: 'none' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: cfg.text }}>{count}</div>
              <div style={{ fontSize: '.75rem', fontWeight: 700, color: cfg.text }}>{s}</div>
            </div>
          );
        })}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--brown-mid)' }}>⏳ {isTa ? 'ஏற்றுகிறது...' : 'Loading bookings...'}</div>
      ) : displayed.length === 0 ? (
        <div style={{ ...S.panel, textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--gold)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
          <div style={{ fontFamily: 'var(--font-d)', color: 'var(--brown-deep)' }}>
            {filter === 'All' ? (isTa ? 'இன்னும் முன்பதிவுகள் இல்லை' : 'No bookings yet') : `No ${filter} bookings`}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {displayed.map(b => (
            <div key={b.id} style={{ ...S.panel, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {/* Left Icon */}
              <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--cream-dark)', display: 'grid', placeItems: 'center', fontSize: '1.4rem', flexShrink: 0 }}>📅</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontFamily: 'var(--font-d)', fontWeight: 800, color: 'var(--brown-deep)', fontSize: '1rem', marginBottom: 3 }}>
                  {b.service_name}
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--brown-mid)', marginBottom: 2 }}>
                  👤 {b.customer_name}{b.customer_phone ? ` · 📞 ${b.customer_phone}` : ''}
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--brown-mid)' }}>
                  📆 {b.booking_date} &nbsp;🕐 {b.booking_time} &nbsp;⏱️ {b.service_duration} {isTa ? 'நிமிடம்' : 'min'}
                </div>
                {b.notes && <div style={{ fontSize: '.75rem', color: 'var(--brown-mid)', marginTop: 4, fontStyle: 'italic' }}>💬 {b.notes}</div>}
              </div>

              {/* Status Badge + Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <span style={S.badge(b.status)}>{b.status}</span>
                {b.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => updateStatus(b.id, 'Confirmed')} style={{ padding: '5px 12px', borderRadius: 6, background: '#004085', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.75rem' }}>
                      ✅ {isTa ? 'உறுதிப்படுத்து' : 'Confirm'}
                    </button>
                    <button onClick={() => updateStatus(b.id, 'Cancelled')} style={{ padding: '5px 12px', borderRadius: 6, background: 'transparent', color: '#721c24', border: '1.5px solid #721c24', fontWeight: 700, cursor: 'pointer', fontSize: '.75rem' }}>
                      ✖ {isTa ? 'ரத்து' : 'Cancel'}
                    </button>
                  </div>
                )}
                {b.status === 'Confirmed' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => updateStatus(b.id, 'ReadyForPickup')} style={{ padding: '5px 12px', borderRadius: 6, background: 'var(--gold)', color: 'var(--brown-deep)', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.75rem' }}>
                      🚚 {isTa ? 'பிக்கப்பிற்கு தயார்' : 'Ready for Pickup'}
                    </button>
                    <button onClick={() => updateStatus(b.id, 'Completed')} style={{ padding: '5px 14px', borderRadius: 6, background: '#155724', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '.75rem' }}>
                      🏁 {isTa ? 'முடிந்தது' : 'Mark Complete'}
                    </button>
                  </div>
                )}
                {b.status === 'ReadyForPickup' && (
                  <span style={{ fontSize: '.7rem', color: 'var(--brown-mid)', fontStyle: 'italic' }}>{isTa ? 'பிக்கப் காத்திருக்கிறது...' : 'Awaiting Pickup...'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
