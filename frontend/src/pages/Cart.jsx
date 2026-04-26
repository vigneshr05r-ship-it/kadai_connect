import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';

const Cart = () => {
  const { t } = useTranslation();
  const [items, setItems] = React.useState([
    { id: 1, name: 'Ponni Rice (5kg)', price: 450, qty: 1 },
    { id: 2, name: 'Cold Pressed Coconut Oil', price: 180, qty: 1 },
  ]);

  const total = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const delivery = 30;

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors text-primary">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-serif font-bold text-primary">{t('cart')}</h2>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="vintage-card flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg"></div>
            <div className="flex-1">
              <h4 className="font-bold">{item.name}</h4>
              <p className="text-primary font-serif font-bold italic">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-3 bg-background rounded-full px-3 py-1 border border-black/5">
              <button className="text-text/40"><Minus size={14} /></button>
              <span className="text-sm font-bold">{item.qty}</span>
              <button className="text-primary"><Plus size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-soft border border-black/5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text/60">Subtotal</span>
          <span className="font-bold">₹{total}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text/60">Delivery Fee</span>
          <span className="font-bold">₹{delivery}</span>
        </div>
        <div className="h-px bg-black/5 my-2"></div>
        <div className="flex justify-between text-lg font-serif font-bold">
          <span>Total</span>
          <span className="text-primary tracking-tight">₹{total + delivery}</span>
        </div>
      </div>

      <button className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 shadow-lg">
        {t('checkout')}
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default Cart;
