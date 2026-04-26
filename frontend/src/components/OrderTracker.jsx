import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Truck, Home as HomeIcon } from 'lucide-react';

export default function OrderTracker({ order }) {
  const { t, i18n } = useTranslation();
  if (!order) return null;
  const isTa = i18n?.language?.startsWith('ta');
  const s = order.raw_status || 'new';
  const isDelivered = s === 'delivered';
  const isOut = isDelivered || s === 'out_for_delivery';
  const isConf = isOut || ['confirmed', 'packed', 'ready'].includes(s);

  const steps = [
    { label: t('order_placed') || 'Order Placed', done: true, icon: <CheckCircle2 size={16} /> },
    { label: t('store_confirmed') || 'Confirmed', done: isConf, active: !isConf, icon: <CheckCircle2 size={16} /> },
    { label: t('out_for_delivery') || 'Out for Delivery', done: isOut, active: isConf && !isOut, icon: <Truck size={16} /> },
    { label: t('delivered') || 'Delivered', done: isDelivered, active: isOut && !isDelivered, icon: <HomeIcon size={16} /> },
  ];

  return (
    <div style={{ background: 'var(--cream)', border: '1.5px solid var(--parchment)', borderRadius: 10, padding: 20, boxShadow: '2px 3px 10px var(--shadow)', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '.95rem', fontWeight: 700, color: 'var(--brown-deep)' }}>{order.name || (isTa ? 'ஆர்டர்' : 'Order')}</div>
          <div style={{ fontSize: '.72rem', color: 'var(--brown-mid)', marginTop: 2 }}>
            {order.id} • {order.items_str || (Array.isArray(order.items) ? order.items.map(i => i.product_name).join(', ') : order.items)}
          </div>
        </div>
        <span style={{ fontSize: '.7rem', color: 'var(--green)', fontWeight: 700, background: '#d4edda', padding: '4px 12px', borderRadius: 10 }}>{isTa ? 'கண்காணிக்கப்படுகிறது' : 'Tracking Active'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
              <div style={{ 
                width: 30, height: 30, borderRadius: '50%', 
                border: `2px solid ${step.done ? 'var(--gold)' : step.active ? 'var(--brown-deep)' : 'var(--parchment)'}`, 
                background: step.done ? 'var(--gold)' : step.active ? 'var(--brown-deep)' : 'var(--cream)', 
                display: 'grid', placeItems: 'center', fontSize: '.82rem', position: 'relative', zIndex: 1, 
                animation: step.active ? 'pulseDot 1.2s infinite' : 'none' 
              }}>
                {step.icon}
              </div>
              <div style={{ fontSize: '.6rem', marginTop: 6, textAlign: 'center', color: (step.done || step.active) ? 'var(--brown-deep)' : 'var(--brown-mid)', fontWeight: (step.done || step.active) ? 700 : 400, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{step.label}</div>
            </div>
            {i < steps.length - 1 && <div style={{ height: 2, flex: 1, background: step.done ? 'var(--gold)' : 'var(--parchment)', marginBottom: 20, zIndex: 0 }}/>}
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: '.75rem', color: 'var(--brown-mid)', fontStyle: 'italic' }}>🛵 {t('tracker_note')}</div>
      <style>{`
        @keyframes pulseDot {
          0% { box-shadow: 0 0 0 0 rgba(59,31,14, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(59,31,14, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59,31,14, 0); }
        }
      `}</style>
    </div>
  );
}
