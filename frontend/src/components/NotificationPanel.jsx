import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Bell, X, Check, Trash2, Clock, Info, Package, Truck, AlertTriangle } from 'lucide-react';

export default function NotificationPanel({ isOpen, onClose }) {
  const { apiFetch } = useAuth();
  const { t, i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const resp = await apiFetch('/api/notifications/');
      if (resp.ok) {
        const data = await resp.json();
        setNotifications(data.results || data);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      const resp = await apiFetch(`/api/notifications/${id}/mark_read/`, { method: 'POST' });
      if (resp.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      const resp = await apiFetch('/api/notifications/mark_all_read/', { method: 'POST' });
      if (resp.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (e) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <Package size={18} color="var(--gold)" />;
      case 'delivery': return <Truck size={18} color="var(--green)" />;
      case 'promotion': return <AlertTriangle size={18} color="var(--rust)" />;
      default: return <Info size={18} color="var(--brown-mid)" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="notification-overlay"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end', padding: 20 }}
      onClick={onClose}
    >
      <div 
        ref={panelRef}
        className="notification-panel"
        style={{ width: '100%', maxWidth: 400, background: 'var(--cream)', border: '2.5px solid var(--parchment)', borderRadius: 24, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(59,31,14,0.2)', animation: 'slideInRight 0.3s ease' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '24px 28px', borderBottom: '1.5px solid var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--brown-deep)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Bell size={20} color="var(--gold)" />
            <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>{isTa ? 'அறிவிப்புகள்' : 'Notifications'}</h3>
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span style={{ background: 'var(--gold)', color: 'var(--brown-deep)', fontSize: '0.65rem', fontWeight: 900, padding: '2px 8px', borderRadius: 20 }}>
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading && notifications.length === 0 ? (
            <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--brown-mid)', fontWeight: 800 }}>{isTa ? 'ஏற்றுகிறது...' : 'Loading...'}</div>
          ) : notifications.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--brown-mid)', gap: 15, padding: '40px 0' }}>
               <Bell size={48} opacity={0.2} />
               <p style={{ fontWeight: 800 }}>{isTa ? 'அறிவிப்புகள் எதுவும் இல்லை' : 'No notifications yet'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => !n.is_read && markRead(n.id)}
                  style={{ padding: '18px 20px', background: n.is_read ? 'transparent' : 'white', border: `1.5px solid ${n.is_read ? 'var(--parchment)' : 'var(--gold-pale)'}`, borderRadius: 16, cursor: 'pointer', transition: '.2s', position: 'relative', boxShadow: n.is_read ? 'none' : '0 4px 12px rgba(234,179,8,0.08)' }}
                >
                  {!n.is_read && <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, background: 'var(--gold)', borderRadius: '50%' }} />}
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--cream)', display: 'grid', placeItems: 'center', flexShrink: 0, border: '1px solid var(--parchment)' }}>
                      {getIcon(n.notification_type)}
                    </div>
                    <div>
                      <div style={{ fontSize: '.9rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 4 }}>{n.title}</div>
                      <div style={{ fontSize: '.8rem', color: 'var(--brown-mid)', fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>{n.message}</div>
                      <div style={{ fontSize: '.65rem', color: 'var(--parchment)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={10} /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1.5px solid var(--parchment)', background: '#fff' }}>
            <button 
              onClick={markAllRead}
              style={{ width: '100%', padding: '14px', background: 'var(--cream)', border: '1.5px solid var(--parchment)', borderRadius: 14, color: 'var(--brown-deep)', fontWeight: 900, fontSize: '.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: '.3s' }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--parchment)'}
            >
              <Check size={16} color="var(--gold)" />
              {isTa ? 'அனைத்தையும் படித்ததாகக் குறிக்கவும்' : 'Mark all as read'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
