import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '';

const S = {
  panel: {
    background: 'var(--cream)',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    border: '1px solid rgba(201,146,26,.15)',
    marginBottom: 20,
  },
  panelTitle: {
    fontFamily: 'var(--font-d)',
    fontSize: '1.1rem',
    fontWeight: 900,
    color: 'var(--brown-deep)',
    marginBottom: 18,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1.5px solid var(--parchment)',
    background: '#fff',
    color: 'var(--brown-deep)',
    fontSize: '.88rem',
    fontFamily: 'var(--font-b)',
    boxSizing: 'border-box',
  },
  label: {
    display: 'block',
    fontSize: '.73rem',
    fontWeight: 700,
    color: 'var(--brown-mid)',
    textTransform: 'uppercase',
    letterSpacing: '.6px',
    marginBottom: 5,
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
    color: 'var(--brown-deep)',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    fontFamily: 'var(--font-d)',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  btnDanger: {
    background: 'transparent',
    color: '#e53e3e',
    border: '1.5px solid #e53e3e',
    padding: '6px 14px',
    borderRadius: 6,
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '.78rem',
  },
  btnOutline: {
    background: 'transparent',
    color: 'var(--brown-deep)',
    border: '1.5px solid var(--parchment)',
    padding: '6px 14px',
    borderRadius: 6,
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '.78rem',
  },
};

const EMPTY = {
  name: '', name_ta: '', description: '', price: '', duration_minutes: 60, image: null
};

export default function ServiceManager({ isTa, services, loading, onAdd, onEdit, onDelete }) {

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--brown-deep)' }}>
          🧵 <span style={{ color: 'var(--gold)' }}>{isTa ? 'சேவைகள்' : 'My Services'}</span>
        </div>
        <button style={S.btnPrimary} onClick={onAdd}>
          ＋ {isTa ? 'சேவை சேர்க்கவும்' : 'Add Service'}
        </button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--brown-mid)' }}>⏳ {isTa ? 'ஏற்றுகிறது...' : 'Loading...'}</div>
      ) : services.length === 0 ? (
        <div style={{ ...S.panel, textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--gold)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🧵</div>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', color: 'var(--brown-deep)', marginBottom: 8 }}>
            {isTa ? 'இன்னும் சேவைகள் சேர்க்கப்படவில்லை' : 'No services added yet'}
          </div>
          <div style={{ color: 'var(--brown-mid)', fontSize: '.85rem' }}>
            {isTa ? 'மேலே உள்ள "சேவை சேர்க்கவும்" பொத்தானை கிளிக் செய்யவும்.' : 'Click "Add Service" above to get started.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
          {services.map(s => (
            <div key={s.id} style={{ ...S.panel, marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
              {s.image_url && (
                <div style={{ height: 160, marginBottom: 12, borderRadius: 8, overflow: 'hidden' }}>
                  <img src={s.image_url} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 800, color: 'var(--brown-deep)', marginBottom: 4 }}>{s.name}</div>
              {s.name_ta && <div style={{ fontSize: '.8rem', color: 'var(--brown-mid)', marginBottom: 8 }}>{s.name_ta}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 900, color: 'var(--gold)', fontSize: '1.1rem' }}>₹{s.price}</span>
                <span style={{ fontSize: '.75rem', background: 'var(--cream-dark)', padding: '3px 8px', borderRadius: 20, color: 'var(--brown-mid)' }}>
                  ⏱️ {s.duration_minutes} {isTa ? 'நிமிடம்' : 'min'}
                </span>
              </div>
              {s.description && <div style={{ fontSize: '.78rem', color: 'var(--brown-mid)', marginBottom: 14, lineHeight: 1.5 }}>{s.description.slice(0, 80)}{s.description.length > 80 ? '...' : ''}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={S.btnOutline} onClick={() => onEdit(s)}>✏️ {isTa ? 'திருத்து' : 'Edit'}</button>
                <button style={S.btnDanger} onClick={() => onDelete(s.id)}>🗑️ {isTa ? 'நீக்கு' : 'Delete'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
