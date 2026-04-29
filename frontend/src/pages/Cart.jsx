import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');
  const navigate = useNavigate();
  const { cart, bookings, removeFromCart, removeBooking, updateQuantity, cartTotal, clearCart } = useCart();
  const { apiFetch, user } = useAuth();
  const [checkingOut, setCheckingOut] = React.useState(false);
  const [step, setStep] = React.useState(0); // 0: Cart, 1: Address/Review

  const [address, setAddress] = React.useState(user?.address || '');
  const [phone, setPhone] = React.useState(user?.phone || '');

  const [paymentMethod, setPaymentMethod] = React.useState('COD'); // COD, UPI, CARD

  // Delivery Pricing Logic
  const distance = 2.5; // Mock distance or get from map
  const baseFee = 20;
  const ratePerKm = 8;
  const totalDeliveryFee = cart.length > 0 ? baseFee + (distance * ratePerKm) : 0;
  
  const isFirstOrderDeal = user?.is_first_order && cart.length > 0;
  const maxFreeCap = 50;
  const discountAmount = isFirstOrderDeal ? Math.min(totalDeliveryFee, maxFreeCap) : 0;
  
  const customerDeliveryPay = totalDeliveryFee - discountAmount;
  const finalTotal = cartTotal + customerDeliveryPay;

  const [isPlaced, setIsPlaced] = React.useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0 && bookings.length === 0) return;
    
    if (step === 0) {
      setStep(1);
      return;
    }

    if (!address || !phone) {
      alert(isTa ? 'தயவுசெய்து முகவரி மற்றும் தொலைபேசி எண்ணை வழங்கவும்' : 'Please provide address and phone number');
      return;
    }

    setCheckingOut(true);
    try {
      // 1. Process Product Orders
      if (cart.length > 0) {
        await apiFetch('/api/orders/', {
          method: 'POST',
          body: JSON.stringify({
            input_items: cart.map(item => ({
              product: item.id,
              quantity: item.qty
            })),
            total_price: finalTotal,
            delivery_charge: totalDeliveryFee,
            distance_km: distance,
            address: address,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'COD' ? 'pending' : 'paid',
            status: 'new'
          })
        });
      }

      // 2. Process Service Bookings
      if (bookings.length > 0) {
        for (const b of bookings) {
          await apiFetch('/api/services/bookings/', {
            method: 'POST',
            body: JSON.stringify({
              store: b.store,
              service: b.id,
              customer_name: user?.name || 'Guest',
              customer_phone: phone,
              booking_date: b.bookingDate,
              booking_time: b.bookingTime,
              payment_method: paymentMethod,
              payment_status: paymentMethod === 'COD' ? 'pending' : 'paid',
              status: 'Pending'
            })
          });
        }
      }

      clearCart();
      setIsPlaced(true);
      
      // Delay navigation to show animation
      setTimeout(() => {
        navigate('/orders', { state: { msg: isTa ? 'வெற்றிகரமாக செய்யப்பட்டது!' : 'Order/Booking placed successfully!' } });
      }, 3000);
      
    } catch (err) {
      console.error(err);
      alert(isTa ? 'செயல்முறையில் பிழை' : 'Error processing checkout');
    } finally {
      setCheckingOut(false);
    }
  };

  if (isPlaced) {
    return (
      <div className="min-h-screen bg-cream p-4 pb-24 font-sans flex flex-col items-center justify-center">
        <div className="bg-white rounded-32 border-2 border-parchment p-10 shadow-md flex flex-col items-center text-center max-w-sm w-full animate-fadeIn relative overflow-hidden">
          <div className="relative mb-8 mt-4">
            <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center shadow-xl relative z-10 animate-successScale">
               <span className="text-4xl">✅</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-brown-deep mb-2">
            {isTa ? 'ஆர்டர் செய்யப்பட்டது!' : 'Order Placed!'}
          </h2>
          <p className="text-brown-mid text-sm font-semibold max-w-xs">
            {isTa ? 'உங்கள் பொருட்கள் விரைவில் வரும்.' : 'Your items are on their way.'}
          </p>

          <div className="mt-8 w-full bg-parchment/50 rounded-full h-1.5 overflow-hidden">
             <div className="h-full bg-gold animate-loadingProgress" />
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-cream p-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-parchment/30 rounded-full flex items-center justify-center text-brown-deep/20 mb-6 border-2 border-dashed border-parchment">
          <ShoppingBag size={40} />
        </div>
        <h3 className="text-xl font-bold text-brown-deep mb-2">{isTa ? 'உங்கள் கூடை காலியாக உள்ளது' : 'Your Cart is Empty'}</h3>
        <p className="text-brown-mid mb-8 max-w-xs">{isTa ? 'சிறந்த தயாரிப்புகள் அல்லது சேவைகளைத் தேடி உங்கள் கூடையில் சேர்க்கவும்.' : 'Looks like you haven\'t added any items or services to your cart yet.'}</p>
        <button onClick={() => navigate('/')} className="bg-brown-deep text-gold px-8 py-3 rounded-16 font-bold border-2 border-gold shadow-md">
          {isTa ? 'ஷாப்பிங் தொடரவும்' : 'Start Shopping'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 pb-24 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step === 0 ? navigate(-1) : setStep(0)} className="p-2.5 bg-white rounded-16 shadow-sm text-brown-deep border-1 border-parchment">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-brown-deep">
            {step === 0 ? (isTa ? 'உங்கள் கூடை' : 'My Cart') : (isTa ? 'கட்டணம்' : 'Checkout')}
          </h2>
          <p className="text-[10px] font-bold text-brown-mid uppercase tracking-widest">Step {step + 1} of 2</p>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-5">
        {step === 0 ? (
          <div className="space-y-4">
            {/* Products Section */}
            {cart.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase text-gold tracking-widest ml-1">{isTa ? 'தயாரிப்புகள்' : 'Products'}</h3>
                {cart.map((item) => (
                  <div key={item.cartId} className="bg-white border-1 border-parchment rounded-24 p-4 shadow-sm flex items-center gap-4 relative">
                    <div className="w-16 h-16 bg-gold/5 rounded-16 overflow-hidden border border-parchment">
                      {item.image_url || item.image ? <img src={item.image_url || item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-brown-deep text-base truncate mb-1">{isTa ? (item.name_ta || item.name) : item.name}</h4>
                      <p className="text-gold font-bold text-lg">₹{item.price}</p>
                      <div className="flex items-center gap-4 mt-2 bg-cream-dark w-fit rounded-10 px-2 py-1 border border-parchment">
                        <button onClick={() => updateQuantity(item.cartId, -1)} className="text-brown-mid"><Minus size={12} /></button>
                        <span className="text-xs font-bold text-brown-deep min-w-[0.8rem] text-center">{item.qty}</span>
                        <button onClick={() => updateQuantity(item.cartId, 1)} className="text-brown-deep"><Plus size={12} /></button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} className="absolute top-4 right-4 text-rust/40 hover:text-rust p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bookings Section */}
            {bookings.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="text-[10px] font-bold uppercase text-green tracking-widest ml-1">{isTa ? 'சேவைகள்' : 'Services'}</h3>
                {bookings.map((item) => (
                  <div key={item.bookingId} className="bg-white border-1 border-parchment rounded-24 p-4 shadow-sm flex items-center gap-4 relative">
                    <div className="w-16 h-16 bg-green/5 rounded-16 overflow-hidden border border-parchment">
                      {item.image_url || item.image ? <img src={item.image_url || item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🧵</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-brown-deep text-base truncate mb-1">{isTa ? (item.name_ta || item.name) : item.name}</h4>
                      <p className="text-green font-bold text-lg">₹{item.price}</p>
                      <p className="text-[9px] text-brown-mid mt-1 font-bold uppercase bg-cream rounded-6 px-2 py-0.5 w-fit border border-parchment">
                        📅 {item.bookingDate} • ⏰ {item.bookingTime}
                      </p>
                    </div>
                    <button onClick={() => removeBooking(item.bookingId)} className="absolute top-4 right-4 text-rust/40 hover:text-rust p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Address Block */}
            <div className="bg-white rounded-32 p-6 border-1 border-parchment shadow-sm space-y-4">
              <h3 className="font-bold text-xl text-brown-deep">{isTa ? 'டெலிவரி முகவரி' : 'Delivery Details'}</h3>
              <div className="space-y-3">
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-cream-dark border-1 border-parchment rounded-16 p-3 text-sm font-bold text-brown-deep focus:border-gold min-h-[80px]"
                  placeholder={isTa ? 'முகவரி...' : 'Address...'}
                />
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-cream-dark border-1 border-parchment rounded-16 p-3 text-sm font-bold text-brown-deep focus:border-gold"
                  placeholder={isTa ? 'தொலைபேசி எண்' : 'Phone'}
                />
              </div>
            </div>

            {/* Payment Block */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase text-gold tracking-widest ml-1">{isTa ? 'கட்டண முறை' : 'Payment Method'}</h3>
              <div className="space-y-2">
                {[
                  { id: 'COD', label: isTa ? 'பணம் செலுத்துதல்' : 'Cash on Delivery', icon: '💵' },
                  { id: 'UPI', label: 'UPI (GPay / PhonePe)', icon: '📱' },
                  { id: 'CARD', label: isTa ? 'அட்டை' : 'Card', icon: '💳' }
                ].map((m) => (
                  <div 
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-4 rounded-20 border-1 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === m.id ? 'border-gold bg-gold/5' : 'border-parchment bg-white'}`}
                  >
                    <div className="text-2xl bg-cream-dark w-12 h-12 rounded-16 flex items-center justify-center border border-parchment">{m.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-brown-deep text-sm">{m.label}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === m.id ? 'border-gold bg-gold text-brown-deep' : 'border-parchment'}`}>
                      {paymentMethod === m.id && <span className="font-bold text-[10px]">✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Block */}
            <div className="bg-white rounded-32 border-1 border-parchment p-6 shadow-sm space-y-4">
              <h3 className="text-[10px] font-bold uppercase text-brown-mid tracking-widest">{isTa ? 'கட்டண விவரம்' : 'Price Details'}</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold text-brown-mid">
                  <span>{isTa ? 'மொத்தம்' : 'Subtotal'}</span>
                  <span className="font-bold text-brown-deep text-base">₹{cartTotal.toLocaleString()}</span>
                </div>

                {cart.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center text-sm font-bold text-brown-mid">
                      <span>{isTa ? 'டெலிவரி' : 'Delivery'}</span>
                      <span className="font-bold text-brown-deep text-base">₹{totalDeliveryFee}</span>
                    </div>

                    {isFirstOrderDeal && (
                      <div className="flex justify-between items-center text-[10px] font-bold text-green bg-green/5 p-3 rounded-12 border-1 border-green/10">
                        <span>{isTa ? 'முதல் ஆர்டர் தள்ளுபடி' : 'First Order Offer'}</span>
                        <span className="font-bold">-₹{discountAmount}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="h-px bg-parchment my-1"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-brown-mid">{isTa ? 'மொத்தம்' : 'Total'}</span>
                  <span className="text-2xl font-bold text-gold">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Action */}
        <div className="bg-brown-deep rounded-24 p-6 shadow-lg flex items-center justify-between border-1 border-gold/20">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gold/60 mb-0.5">{isTa ? 'மொத்தம்' : 'Total'}</span>
            <span className="text-2xl font-bold text-gold">₹{finalTotal.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={checkingOut}
            className="bg-gold text-brown-deep px-8 py-3.5 rounded-14 font-bold text-base flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {checkingOut ? '...' : (step === 0 ? (isTa ? 'தொடரவும்' : 'Continue') : (isTa ? 'ஆர்டர் செய்' : 'Checkout'))}
            {!checkingOut && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
