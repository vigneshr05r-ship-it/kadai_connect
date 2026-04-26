import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { History } from 'lucide-react';
import MainLayout from '../components/MainLayout';

export default function Orders() {
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          const oResp = await apiFetch('/api/orders/');
          if (oResp?.ok) {
            const data = await oResp.json();
            const rawOrders = Array.isArray(data) ? data : (data.results || []);
            const mappedOrders = rawOrders.map(o => {
                const statusColors = {
                  'new': { bg: '#fff3cd', col: '#856404', label: isTa ? 'புதியது' : 'New' },
                  'confirmed': { bg: '#d1ecf1', col: '#0c5460', label: isTa ? 'உறுதி செய்யப்பட்டது' : 'Confirmed' },
                  'packed': { bg: '#cce5ff', col: '#004085', label: isTa ? 'பேக் செய்யப்பட்டது' : 'Packed' },
                  'ready': { bg: '#e2e3e5', col: '#383d41', label: isTa ? 'தயார்' : 'Ready' },
                  'assigned': { bg: '#e2e3e5', col: '#383d41', label: isTa ? 'டெலிவரி ஒதுக்கப்பட்டது' : 'Delivery Assigned' },
                  'picked_up': { bg: '#fff3cd', col: '#856404', label: isTa ? 'பிக்கப் செய்யப்பட்டது' : 'Picked Up' },
                  'out_for_delivery': { bg: '#cce5ff', col: '#004085', label: isTa ? 'டெலிவரிக்கு வெளியே' : 'Out for Delivery' },
                  'delivered': { bg: '#d4edda', col: '#155724', label: isTa ? 'டெலிவரி செய்யப்பட்டது' : 'Delivered' }
                };
              const sc = statusColors[o.status] || { bg: '#f8d7da', col: '#721c24', label: o.status };
              return {
                id: `#ORD-${o.id}`,
                name: o.items?.[0]?.product_name || (isTa ? 'ஆர்டர்' : 'Order'),
                date: new Date(o.created_at).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short' }),
                items: o.items?.map(i => `${i.product_name} x ${i.quantity}`).join(' + ') || '',
                total: `₹${Number(o.total_price).toLocaleString()}`,
                status: sc.label,
                raw_status: o.status,
                bg: sc.bg,
                col: sc.col
              };
            });
            setMyOrders(mappedOrders);
          }
        } catch (e) {
          console.error("Fetch orders error", e);
        }
      };
      fetchOrders();
    }
  }, [user, apiFetch, isTa]);

  return (
    <MainLayout title={isTa ? 'எனது ஆர்டர்கள்' : 'My Orders'} showSearch={false}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {myOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--brown-mid)', fontStyle: 'italic', background: '#fff', borderRadius: 12, border: '1.5px solid var(--parchment)' }}>
            {t('orders_empty') || 'No orders yet.'}
          </div>
        ) : (
          myOrders.map(o => (
            <div key={o.id} style={{ background: '#fff', border: '1.5px solid var(--parchment)', borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: '2px 2px 8px var(--shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: '.84rem', fontWeight: 700 }}>{o.id} — {o.name}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--brown-mid)' }}>{o.date}</div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: '.68rem', fontWeight: 700, background: o.bg, color: o.col }}>{o.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--parchment)', paddingTop: 10 }}>
                <div style={{ fontSize: '.75rem', color: 'var(--brown-mid)' }}>
                  <div style={{ marginBottom: 4 }}>{isTa ? 'பொருட்கள்' : 'Items'}:</div>
                  <div style={{ fontWeight: 600 }}>{o.items}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '.65rem', color: 'var(--brown-mid)' }}>{isTa ? 'மொத்தம்' : 'Total'}</div>
                  <div style={{ fontSize: '.95rem', fontWeight: 800, color: 'var(--gold)' }}>{o.total}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </MainLayout>
  );
}

