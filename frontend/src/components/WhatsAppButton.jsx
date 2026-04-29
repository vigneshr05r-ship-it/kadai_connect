import React from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * Reusable WhatsApp Button Component
 * @param {string} phone - The recipient's phone number
 * @param {string} message - The pre-filled message
 * @param {string} label - Button text
 * @param {string} variant - 'primary' (green) or 'ghost'
 * @param {object} style - Custom styles
 */
export default function WhatsAppButton({ phone, message, label = 'Share on WhatsApp', variant = 'primary', style = {} }) {
  
  const formatPhone = (num) => {
    if (!num) return '';
    // Remove non-numeric characters
    let clean = num.toString().replace(/\D/g, '');
    // If it doesn't start with 91 (India) and is 10 digits, add it
    if (clean.length === 10) return `91${clean}`;
    return clean;
  };

  const handleOpen = (e) => {
    e.stopPropagation();
    if (!phone) {
       alert('Contact phone number not available.');
       return;
    }
    const formattedPhone = formatPhone(phone);
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const colors = {
    primary: {
      bg: '#25D366',
      text: '#fff',
      border: '#128C7E'
    },
    ghost: {
      bg: 'rgba(37, 211, 102, 0.1)',
      text: '#25D366',
      border: 'transparent'
    }
  };

  const config = colors[variant] || colors.primary;

  return (
    <button 
      onClick={handleOpen}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px 18px',
        background: config.bg,
        color: config.text,
        border: `1.5px solid ${config.border}`,
        borderRadius: 14,
        fontSize: '0.8rem',
        fontWeight: 800,
        cursor: 'pointer',
        transition: '.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: variant === 'primary' ? '0 4px 12px rgba(37, 211, 102, 0.2)' : 'none',
        ...style
      }}
      className="whatsapp-btn-hover"
    >
      <MessageCircle size={16} fill={variant === 'primary' ? '#fff' : 'currentColor'} />
      {label}
      
      <style>{`
        .whatsapp-btn-hover:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
          box-shadow: 0 6px 15px rgba(37, 211, 102, 0.3) !important;
        }
        .whatsapp-btn-hover:active {
          transform: scale(0.95);
        }
      `}</style>
    </button>
  );
}
