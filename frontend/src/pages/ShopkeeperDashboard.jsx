import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Home,
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Sparkles, 
   Megaphone, 
  Truck, 
  Briefcase, 
  CalendarDays,
  Settings, 
  UserCircle, 
  LogOut, 
  Menu,
  Bell,
  ChevronRight,
  TrendingUp,
  Clock,
  MessageSquare,
  Tag,
  ToggleLeft,
  ToggleRight,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import GoogleMapView from '../components/GoogleMapView';
import FestivalCalendar from '../components/FestivalCalendar';
import ServiceManager from '../components/ServiceManager';
import BookingsPanel from '../components/BookingsPanel';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { parseProductVoiceCommand } from '../utils/aiUtils';

const S = {
  sidebar: { width: 210, minHeight: '100vh', background: 'var(--brown-deep)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, borderRight: '2px solid var(--gold)', transition: '.3s' },
  navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', color: active ? 'var(--gold-light)' : 'var(--brown-light)', fontSize: '.8rem', cursor: 'pointer', border: 'none', background: active ? 'rgba(201,146,26,.12)' : 'none', width: '100%', textAlign: 'left', borderLeft: `3px solid ${active ? 'var(--gold)' : 'transparent'}`, transition: '.2s', fontFamily: 'var(--font-b)' }),
  statCard: { background: 'var(--cream)', border: '1.5px solid var(--parchment)', borderRadius: 8, padding: 18, boxShadow: '3px 3px 12px var(--shadow)', position: 'relative', overflow: 'hidden' },
  panel: { background: 'var(--cream)', border: '1.5px solid var(--parchment)', borderRadius: 8, padding: 20, boxShadow: '3px 3px 12px var(--shadow)' },
  panelTitle: { fontFamily: 'var(--font-d)', fontSize: '.95rem', fontWeight: 700, color: 'var(--brown-deep)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--parchment)', paddingBottom: 10 },
  btnPrimary: { padding: '10px 20px', background: 'var(--brown-deep)', color: 'var(--gold-light)', border: '2px solid var(--gold)', borderRadius: 10, fontFamily: 'var(--font-d)', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(59,31,14,0.15)' },
  formInput: { width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1.5px solid var(--parchment)', borderRadius: 8, background: 'var(--cream-dark)', fontFamily: 'var(--font-b)', fontSize: '.88rem', color: 'var(--brown-deep)', outline: 'none', transition: '.2s' },
  statusBadge: { padding: '4px 10px', borderRadius: 20, fontSize: '.63rem', fontWeight: 700, letterSpacing: '.5px', display: 'inline-block', border: '1px solid rgba(0,0,0,0.05)' },
};

const FESTIVALS = [
  { name: 'Diwali', name_ta: 'தீபாவளி', date: '2026-11-08', days: 221, emoji: '🪔', tags: ['silk_saree','brass_lamp','sparklers','sweets','gift_box'] },
  { name: 'Navratri', name_ta: 'நவராத்திரி', date: '2026-10-11', days: 193, emoji: '🎭', tags: ['silk_saree','golu_dolls','flowers','lamp'] },
  { name: 'Karthigai', name_ta: 'கார்த்திகை', date: '2026-11-24', days: 237, emoji: '🕯️', tags: ['diya','lamp','cotton_wick','sweets'] },
  { name: 'Pongal', name_ta: 'பொங்கல்', date: '2026-01-14', days: -77, emoji: '🍚', tags: ['ponni_rice','sugarcane','milk_pot','kolam'] },
];

const EMOJIS = { Textiles: '👗', 'Lamps & Decor': '🪔', Groceries: '🫙', Crackers: '🎆', Garlands: '🌸', 'Gift Items': '🎁', Services: '✂️' };

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Kanjivaram Silk Saree', name_ta: 'காஞ்சிபுரம் பட்டுச் சேலை', category: 'Textiles', price: 3200, stock: 14, fabric: 'Pure Silk', color: 'Deep Red & Gold', size: '5.5m', desc: 'Handwoven Kanjivaram silk with zari border.', desc_ta: 'ஜரி பார்டருடன் கூடிய கைத்தறி காஞ்சிபுரம் பட்டு.', emoji: '👗', festival: 'diwali', imgUrl: '' },
  { id: 2, name: 'Brass Diya Set', name_ta: 'பித்தளை விளக்கு செட்', category: 'Lamps & Decor', price: 680, stock: 32, fabric: 'Brass', color: 'Golden', size: 'Set of 4', desc: 'Hand-polished brass diyas for Diwali puja.', desc_ta: 'தீபாவளி பூஜைக்கு கையால் பாலிஷ் செய்யப்பட்ட பித்தளை விளக்குகள்.', emoji: '🪔', festival: 'diwali', imgUrl: '' },
  { id: 3, name: 'Cotton Fabric (per m)', name_ta: 'பருத்தித் துணி (ஒரு மீட்டருக்கு)', category: 'Textiles', price: 180, stock: 200, fabric: 'Cotton Blend', color: 'Various', size: 'Per metre', desc: 'Fine quality cotton in 20+ vibrant colours.', desc_ta: '20+ துடிப்பான வண்ணங்களில் சிறந்த தரமான பருத்தி.', emoji: '🧵', festival: 'aadi', imgUrl: '' },
  { id: 4, name: 'Sparkler Box', name_ta: 'பட்டாசுப் பெட்டி', category: 'Crackers', price: 450, stock: 55, fabric: '', color: '', size: 'Large Box', desc: 'Premium sparklers for Diwali celebrations.', desc_ta: 'தீபாவளி கொண்டாட்டங்களுக்கு பிரீமியம் ஸ்பார்க்லர்கள்.', emoji: '🎆', festival: 'diwali', imgUrl: '' },
  { id: 5, name: 'Mysore Pak (500g)', name_ta: 'மைசூர் பாக் (500 கிராம்)', category: 'Groceries', price: 280, stock: 40, fabric: '', color: '', size: '500g', desc: 'Fresh homemade Mysore pak.', desc_ta: 'புதிய ஹோம்மேட் மைசூர் பாக்.', emoji: '🍬', festival: 'diwali', imgUrl: '' },
];

function Toast({ msg, visible }) {
  return (
    <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`, background: 'var(--brown-deep)', color: 'var(--gold-light)', padding: '12px 24px', borderRadius: 24, fontSize: '.82rem', border: '1px solid var(--gold)', opacity: visible ? 1 : 0, transition: '.3s', pointerEvents: 'none', zIndex: 500, whiteSpace: 'nowrap' }}>
      {msg}
    </div>
  );
}

function UploadModal({ onClose, onSave, editItem, mode = 'product', showToast }) {
  const { t, i18n } = useTranslation();
  const { apiFetch } = useAuth();
  const { speak, listen, stopListening, isListening, listeningError, volume } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('manual');
  
  const initialForm = mode === 'service' 
    ? { name: '', name_ta: '', description: '', price: '', duration_minutes: 60, imgUrl: '' }
    : { name: '', name_ta: '', category: 'Textiles', price: '', stock: '', fabric: '', color: '', size: '', desc: '', imgUrl: '', festival: '' };
    
  const [form, setForm] = useState(editItem || initialForm);
  const [voiceError, setVoiceError] = useState('');
  const [vTranscript, setVTranscript] = useState('');

  const isService = mode === 'service';
  const isTa = i18n.language.startsWith('ta');

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm(p => ({ ...p, imgUrl: url, imageFile: file }));
    e.target.value = null; // Reset so same file can be clicked
  };

  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!form.imgUrl) return;

    f('color', i18n.language.startsWith('ta') ? "பகுப்பாய்வு..." : "Analyzing...");
    
    const imgElement = e.target;
    // Calculate click pos
    const rect = imgElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = imgElement.naturalWidth / rect.width;
    const scaleY = imgElement.naturalHeight / rect.height;
    const realX = Math.floor(x * scaleX);
    const realY = Math.floor(y * scaleY);

    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);

    // Grab a 3x3 pixel area around the click for accuracy
    const pixelData = ctx.getImageData(Math.max(0, realX - 1), Math.max(0, realY - 1), 3, 3).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < pixelData.length; i += 4) {
      r += pixelData[i]; g += pixelData[i+1]; b += pixelData[i+2]; count++;
    }
    r = Math.round(r/count); g = Math.round(g/count); b = Math.round(b/count);
    
    // Convert RGB to HSL for much better accuracy
    const rr = r / 255, gg = g / 255, bb = b / 255;
    const cmax = Math.max(rr, gg, bb), cmin = Math.min(rr, gg, bb);
    const delta = cmax - cmin;
    
    let h = 0;
    if (delta === 0) h = 0;
    else if (cmax === rr) h = ((gg - bb) / delta) % 6;
    else if (cmax === gg) h = (bb - rr) / delta + 2;
    else h = (rr - gg) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    let l = (cmax + cmin) / 2;
    let s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    let colorName = 'Multi-color';
    
    // HSL mapping logic
    if (l < 15) colorName = 'Black';
    else if (l > 85) colorName = 'White';
    else if (s < 15) colorName = 'Grey';
    else {
      if (h < 15 || h >= 345) colorName = l < 45 ? 'Brown' : 'Red';
      else if (h >= 15 && h < 45) colorName = l < 50 ? 'Brown' : 'Orange';
      else if (h >= 45 && h < 65) colorName = 'Yellow';
      else if (h >= 65 && h < 165) colorName = 'Green';
      else if (h >= 165 && h < 260) colorName = 'Blue';
      else if (h >= 260 && h < 290) colorName = 'Purple';
      else if (h >= 290 && h < 345) colorName = 'Pink';
    }
    
    const speakColor = i18n.language.startsWith('ta') ? `${colorName} நிறம் தேர்ந்தெடுக்கப்பட்டது` : `Picked ${colorName}`;
    console.log(`📸 Cursor Picked Color: ${colorName} (HSL: ${h},${s}%,${l}%)`);
    f('color', colorName);
    
    speak(speakColor);
  };

  const handleVoiceUpload = () => {
    setVoiceError('');
    listen((text) => {
      setVTranscript(text);
      parseVoice(text);
    }, i18n.language.startsWith('ta') ? 'ta' : 'en');
  };

  const parseVoice = (text) => {
    if (!text) return;
    const updates = parseProductVoiceCommand(text);
    if (Object.keys(updates).length > 0) {
      setForm(prev => ({ ...prev, ...updates }));
    }
  };

  const generateAIDescription = async () => {
    if (!form.name) return showToast(isTa ? 'முதலில் பொருளின் பெயரை உள்ளிடவும்!' : 'Enter product name first!');
    f('desc', 'Generating AI description...');
    try {
      const resp = await apiFetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/generate-marketing/`, {
        method: 'POST',
        body: JSON.stringify({
          product_name: form.name,
          category: form.category === 'Other' ? (form.customCategory || 'Service') : form.category
        })
      });
      if (resp?.ok) {
        const data = await resp.json();
        if (data.caption) f('desc', data.caption);
      }
    } catch (err) {
      console.error('AI Generator Error:', err);
      f('desc', 'Amazing high-quality ' + form.name + ' for your needs!');
    }
  };

  const predictPrice = async () => {
    if (!form.name) return showToast(isTa ? 'முதலில் பொருளின் பெயரை உள்ளிடவும்!' : 'Enter product name first!');
    const prev = form.price;
    f('price', '...');
    try {
      const resp = await apiFetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/predict-price/`, {
        method: 'POST',
        body: JSON.stringify({ product_name: form.name, category: form.category === 'Other' ? (form.customCategory || 'General') : form.category })
      });
      if (resp?.ok) {
        const data = await resp.json();
        f('price', data.predicted_price);
      } else {
        f('price', prev);
        showToast(isTa ? 'இப்போது விலையைக் கணிக்க முடியவில்லை.' : 'Could not predict price at this time.');
      }
    } catch (err) {
      console.error('Price prediction error:', err);
      f('price', prev);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return showToast(isTa ? 'பெயர் மற்றும் விலை உள்ளிடவும்.' : 'Enter name and price.');
    
    if (isService) {
      await onSave({ 
        ...form, 
        id: editItem?.id || null,
        price: parseFloat(form.price), 
        duration_minutes: parseInt(form.duration_minutes) || 60 
      });
    } else {
      let finalCategory = form.category;
      if (form.category === 'Other') {
        finalCategory = form.customCategory || 'General';
      }
      await onSave({ 
        ...form, 
        id: editItem?.id || null, 
        category: finalCategory, 
        emoji: EMOJIS[finalCategory] || '📦', 
        price: parseFloat(form.price), 
        stock: parseInt(form.stock) || 0 
      });
    }
  };

  const tabs = ['image', 'voice', 'manual'];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(43,21,5,.72)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'grid', placeItems: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ 
        background: 'var(--cream)', border: '2px solid var(--gold)', borderRadius: 10, 
        padding: window.innerWidth < 480 ? '20px 16px' : '28px', 
        maxWidth: 580, width: 'calc(100% - 32px)', 
        maxHeight: '92vh', overflowY: 'auto', 
        boxShadow: '8px 8px 0 var(--brown-deep)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', fontWeight: 900, color: 'var(--brown-deep)' }}>
            {activeTab === 'voice' 
              ? (isTa ? '🎤 AI குரல் பதிவேற்றம்' : '🎤 AI Voice Upload') 
              : (isService ? '🧵 ' : '📸 ') + (editItem ? (isTa ? 'திருத்து' : 'Edit') : (isTa ? 'புதிய பதிவு' : 'New Upload')) + (isService ? (isTa ? ' சேவை' : ' Service') : (isTa ? ' பொருள்' : ' Product'))}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--brown-mid)' }}>✕</button>
        </div>
        
        {activeTab === 'voice' ? (
          <div style={{ textAlign: 'center', padding: '20px 0', background: 'var(--cream-dark)', borderRadius: 8, marginBottom: 20, border: `1px dashed ${voiceError ? 'var(--rust)' : 'var(--gold)'}` }}>
            <div style={{ fontSize: '3rem', marginBottom: 15, animation: isListening ? 'pulse 1.5s infinite' : 'none' }}>{isListening ? '🎙️' : '🎤'}</div>
            <button onClick={() => isListening ? stopListening() : handleVoiceUpload()} style={{ ...S.btnPrimary, background: isListening ? 'var(--rust)' : 'var(--brown-deep)', padding: '12px 24px', borderRadius: 30 }}>
              {isListening ? (isTa ? '⏹️ நிறுத்து' : '⏹️ STOP NOW') : (isTa ? '▶ பேசத் தொடங்கு' : '▶ Start Speaking')}
            </button>
            {isListening && (
              <div style={{ width: '60%', height: 4, background: 'rgba(0,0,0,0.05)', borderRadius: 10, margin: '15px auto 0', overflow: 'hidden' }}>
                <div style={{ width: `${volume}%`, height: '100%', background: 'var(--gold)', transition: '0.1s' }} />
              </div>
            )}
            {voiceError ? (
              <div style={{ marginTop: 12, fontSize: '.82rem', color: 'var(--rust)', padding: '8px 16px', background: 'rgba(166,61,47,.08)', borderRadius: 6, marginInline: 16 }}>
                {voiceError}
              </div>
            ) : (
              <div style={{ marginTop: 15, fontSize: '.85rem', color: 'var(--brown-mid)', fontStyle: 'italic', padding: '0 20px' }}>
                {vTranscript
                  ? <span style={{ color: 'var(--brown-deep)', fontStyle: 'normal', fontWeight: 600 }}>{vTranscript}</span>
                  : (isTa ? 'உதாரணம்: "பட்டுச் சேலை விலை 2500"' : 'Example: "Silk Saree price 2500"')}
              </div>
            )}
            {vTranscript && !voiceError && (
              <div style={{ marginTop: 8, fontSize: '.75rem', color: 'var(--green)', fontWeight: 600 }}>
                {isTa ? '✅ தகவல்கள் உள்ளே நிரப்பப்பட்டன — கீழே சரிபார்க்கவும்' : '✅ Fields filled below — please review & confirm'}
              </div>
            )}
            <style>{`@keyframes pulse { 0% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.5; transform: scale(1); } }`}</style>
          </div>
        ) : (
          <div style={{ fontSize: '.8rem', color: 'var(--brown-mid)', fontStyle: 'italic', marginBottom: 18 }}>{isTa ? 'சரக்கில் சேர் — AI தானாகவே விவரங்களை நிரப்பும்' : 'Add to inventory — AI fills details automatically'}</div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${activeTab === t ? 'var(--brown-deep)' : 'var(--parchment)'}`, background: activeTab === t ? 'var(--brown-deep)' : 'var(--cream-dark)', fontSize: '.76rem', cursor: 'pointer', fontFamily: 'var(--font-b)', color: activeTab === t ? 'var(--gold-light)' : 'var(--brown)' }}>
              {t === 'image' ? (isTa ? '📸 படம்' : '📸 Image') : t === 'voice' ? (isTa ? '🎤 குரல்' : '🎤 Voice') : (isTa ? '✏️ கையேடு' : '✏️ Manual')}
            </button>
          ))}
        </div>
        {/* Interactive Image Preview */}
        {form.imgUrl && (
          <div style={{ marginBottom: 18, border: '2px solid var(--gold)', padding: 4, borderRadius: 10, background: 'var(--cream-dark)', textAlign: 'center', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexDirection: 'column' }}>
             <img crossOrigin="anonymous" src={form.imgUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'crosshair', borderRadius: 6 }} onClick={handleImageClick} />
             <div style={{ fontSize: '.75rem', color: 'var(--brown-mid)', marginTop: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
               {isTa ? '👆 சரியான வண்ணத்தைப் பெற படத்தின் மீது எங்கும் கிளிக் செய்யவும்' : '👆 Click anywhere on image to pick exact color'}
             </div>
          </div>
        )}
        {/* Form Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: isService ? (isTa ? 'சேவை பெயர் *' : 'Service Name *') : (isTa ? 'பொருளின் பெயர் *' : 'Product Name *'), key: 'name', full: true, placeholder: isService ? (isTa ? 'உ.ம். ரவிக்கை தையல்' : 'e.g. Blouse Stitching') : (isTa ? 'உ.ம். காஞ்சிபுரம் பட்டுச் சேலை' : 'e.g. Kanjivaram Silk Saree') },
            { label: isTa ? 'விலை (₹) *' : 'Price (₹) *', key: 'price', type: 'number', placeholder: '0' },
            isService 
              ? { label: isTa ? 'கால அளவு (நிமிடம்)' : 'Duration (min)', key: 'duration_minutes', type: 'number', placeholder: '60' }
              : { label: isTa ? 'இருப்பு அளவு *' : 'Stock Qty *', key: 'stock', type: 'number', placeholder: '0' },
            !isService && { label: isTa ? 'பொருள் / துணி' : 'Material / Fabric', key: 'fabric', placeholder: isTa ? 'உ.ம். தூய பட்டு' : 'e.g. Pure Silk' },
            !isService && { label: isTa ? 'நிறம்' : 'Color', key: 'color', placeholder: isTa ? 'உ.ம். அடர் சிவப்பு & தங்கம்' : 'e.g. Deep Red & Gold' },
            !isService && { label: isTa ? 'அளவு / எடை' : 'Size / Weight', key: 'size', placeholder: isTa ? 'உ.ம். 5.5 மீ / 500 கிராம்' : 'e.g. 5.5m / 500g' },
            { label: isTa ? 'விளக்கம் *' : 'Description *', key: 'desc', full: true, placeholder: isTa ? 'சுருக்கமான விளக்கம்…' : 'Brief description…' },
            { label: isTa ? 'படத்தின் URL (விரும்பினால்)' : 'Image URL (optional)', key: 'imgUrl', full: true, placeholder: 'https://…' },
          ].filter(Boolean).map(({ label, key, type, full, placeholder }) => (
            <div key={key} style={{ gridColumn: full ? '1/-1' : 'auto' }}>
              <label style={{ display: 'block', fontSize: '.7rem', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--brown-mid)', marginBottom: 4 }}>{label}</label>
              {key === 'imgUrl' ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <input style={{ ...S.formInput, flex: 1 }} type="text" placeholder={isTa ? 'URL ஐ ஒட்டவும்' : "Paste URL"} value={form[key] || ''} onChange={e => f(key, e.target.value)}/>
                  <label style={{ ...S.btnPrimary, padding: '0 15px', height: 38, cursor: 'pointer', flexShrink: 0 }}>
                    {isTa ? '🖼️ பதிவேற்று' : '🖼️ Upload'}<input type="file" hidden accept="image/*" onChange={handleFile}/>
                  </label>
                </div>
              ) : key === 'desc' ? (
                <div style={{ position: 'relative' }}>
                  <textarea style={{ ...S.formInput, width: '100%', height: 80, resize: 'none' }} placeholder={placeholder} value={form[key] || ''} onChange={e => f(key, e.target.value)}/>
                  <button onClick={generateAIDescription} style={{ position: 'absolute', bottom: 10, right: 10, background: 'var(--gold)', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: '.65rem', fontWeight: 700, cursor: 'pointer', color: 'var(--brown-deep)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isTa ? '✨ AI உருவாக்கு' : '✨ AI Generate'}
                  </button>
                </div>
              ) : key === 'price' ? (
                <div style={{ position: 'relative' }}>
              <input 
                style={S.formInput} 
                type={form[key] === '...' ? 'text' : (type || 'text')} 
                placeholder={placeholder} 
                value={form[key] || ''} 
                onChange={e => f(key, e.target.value)}
              />
                  <button onClick={predictPrice} style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', background: 'var(--gold)', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: '.65rem', fontWeight: 700, cursor: 'pointer', color: 'var(--brown-deep)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    🪄 {isTa ? 'AI விலை' : 'AI Predict'}
                  </button>
                </div>
              ) : (
                <input 
                  style={S.formInput} 
                  type={form[key] === '...' ? 'text' : (type || 'text')} 
                  placeholder={placeholder} 
                  value={form[key] || ''} 
                  onChange={e => f(key, e.target.value)}
                />
              )}
            </div>
          ))}
          {!isService && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '.7rem', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--brown-mid)', marginBottom: 4 }}>{isTa ? 'வகை' : 'Category'}</label>
                <select style={S.formInput} value={form.category} onChange={e => f('category', e.target.value)}>
                  {Object.keys(EMOJIS).map(c => <option key={c}>{c}</option>)}
                  <option value="Other">{isTa ? 'மற்றவை (Other)' : 'Other'}</option>
                </select>
                {form.category === 'Other' && (
                  <input style={{ ...S.formInput, marginTop: 8 }} placeholder={isTa ? 'வகையை உள்ளிடவும்' : 'Type category...'} value={form.customCategory || ''} onChange={e => f('customCategory', e.target.value)}/>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.7rem', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--brown-mid)', marginBottom: 4 }}>{isTa ? 'திருவிழா குறிச்சொல்' : 'Festival Tag'}</label>
                <select style={S.formInput} value={form.festival} onChange={e => f('festival', e.target.value)}>
                  <option value="">{isTa ? 'ஏதுமில்லை (None)' : 'None'}</option>
                  {FESTIVALS.filter(fest => new Date(fest.date) >= new Date()).map(fest => (
                    <option key={fest.name.toLowerCase()} value={fest.name.toLowerCase()}>{isTa ? fest.name_ta : fest.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 4, border: '2px solid var(--parchment)', background: 'transparent', color: 'var(--brown-mid)', cursor: 'pointer', fontFamily: 'var(--font-d)' }}>{isTa ? 'ரத்துசெய்' : 'Cancel'}</button>
          <button onClick={handleSave} style={{ flex: 2, padding: 12, borderRadius: 4, background: 'var(--brown-deep)', color: 'var(--gold-light)', border: '2px solid var(--gold)', fontFamily: 'var(--font-d)', fontWeight: 700, cursor: 'pointer' }}>
            {isTa ? `✅ ${isService ? 'சேவையைச் சேமி' : 'பொருளைச் சேமி'}` : `✅ Save ${isService ? 'Service' : 'Product'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function MarketingHub({ products, services, storeData, isTa, apiFetch, showToast }) {
  const [mode, setMode] = useState('single');
  const [targetType, setTargetType] = useState('product'); // 'product' or 'service'
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [campaignData, setCampaignData] = useState(null);
  const [showInstaPopup, setShowInstaPopup] = useState(false);

  const handleInstagramShare = async () => {
    // 1. Copy caption to clipboard in the background
    navigator.clipboard.writeText(getCombinedText());
    
    // 2. Download Image (if single product mode and it has an image)
    let triggeredShare = false;
    const pool = targetType === 'product' ? products : services;
    if (mode === 'single' && selectedId) {
      const item = pool.find(i => i.id === parseInt(selectedId));
      if (item && (item.image || item.image_url)) {
        const imgUrl = item.image || item.image_url;
        try {
          // Attempt native Web Share API (Mobile OS Share Sheet -> Instagram)
          const response = await fetch(imgUrl);
          const blob = await response.blob();
          const file = new File([blob], `kadai_connect_${item.id}.jpg`, { type: blob.type || 'image/jpeg' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
             await navigator.share({
                files: [file],
                title: 'New Post',
             });
             triggeredShare = true;
          } else {
             throw new Error("Web Share not supported");
          }
        } catch(e) {
          console.log("Falling back to manual download", e);
          // Fallback to manual download
          try {
            const a = document.createElement('a');
            a.href = imgUrl;
            a.download = `instagram-post-${item.id}.jpg`;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch(err) {
            console.error("Image download failed", err);
          }
        }
      }
    }
    
    // 3. Show fallback modal giving manual instructions
    if (!triggeredShare) {
      setShowInstaPopup(true);
    } else {
      showToast(isTa ? '📋 தலைப்பு நகலெடுக்கப்பட்டது! இன்ஸ்டாகிராமில் பகிரவும்.' : '📋 Caption copied! Select Instagram to share.');
    }
  };

  const generateContent = async () => {
    setLoading(true);
    let itemNames = [];
    const pool = targetType === 'product' ? products : services;

    if (mode === 'single') {
      const item = pool.find(i => i.id === parseInt(selectedId));
      if (!item) { showToast(isTa ? (targetType === 'product' ? 'முதலில் ஒரு பொருளைத் தேர்ந்தெடுக்கவும்' : 'முதலில் ஒரு சேவையைத் தேர்ந்தெடுக்கவும்') : `Select a ${targetType} first`); setLoading(false); return; }
      itemNames = [item.name];
    } else if (mode === 'recent') {
      itemNames = pool.slice(0, 3).map(i => i.name);
    } else {
      itemNames = pool.map(i => i.name);
    }

    if (itemNames.length === 0) {
      showToast(isTa ? (targetType === 'product' ? 'பொருட்கள் இல்லை!' : 'சேவைகள் இல்லை!') : `No ${targetType}s found!`);
      setLoading(false);
      return;
    }

    try {
      const resp = await apiFetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/generate-marketing/`, {
        method: 'POST',
        body: JSON.stringify({
          type: mode === 'single' ? 'single' : 'multiple',
          product_names: itemNames,
          category: storeData?.category || 'General',
          is_service: targetType === 'service'
        })
      });
      if (resp?.ok) {
        const data = await resp.json();
        setCampaignData(data);
        showToast(isTa ? '✅ உள்ளடக்கம் உருவாக்கப்பட்டது!' : '✅ Content Generated!');
      }
    } catch (err) {
      showToast('❌ Error generating content');
    }
    setLoading(false);
  };

  const getCombinedText = () => {
    if (!campaignData) return '';
    return `${campaignData.caption}\n\n${campaignData.offer}\n\n${campaignData.hashtags}`;
  };

  const copyText = () => {
    navigator.clipboard.writeText(getCombinedText());
    showToast(isTa ? '📋 நகலெடுக்கப்பட்டது!' : '📋 Copied!');
  };

  const shareWhatsApp = () => {
    window.open('https://wa.me/?text=' + encodeURIComponent(getCombinedText() + '\n\n' + (storeData?.name || 'Shop') + ' : https://kadaiconnect.com/shop/' + (storeData?.id || 1)));
  };

  const shareSMS = () => {
    window.open('sms:?body=' + encodeURIComponent(getCombinedText() + '\n\n' + (storeData?.name || 'Shop') + ' : https://kadaiconnect.com/shop/' + (storeData?.id || 1)));
  };

  const S = {
    panel: { background: 'var(--cream)', borderRadius: 12, padding: 24, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(201,146,26,.15)' },
    panelTitle: { fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
    btnPrimary: { background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', color: 'var(--brown-deep)', border: 'none', padding: '10px 20px', borderRadius: 8, fontFamily: 'var(--font-d)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
    formInput: { width: '100%', padding: '10px 14px', borderRadius: 6, border: '1.5px solid var(--parchment)', background: '#fff', color: 'var(--brown-deep)', fontSize: '.85rem', fontFamily: 'var(--font-b)' },
  };

  return (
    <div style={{ maxWidth: 850 }}>
      <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 24 }}>📣 <span style={{ color: 'var(--gold)' }}>{isTa ? 'மார்க்கெட்டிங் மையம்' : 'Marketing Hub'}</span></div>
      
      <div style={{ ...S.panel, marginBottom: 24 }}>
        <div style={S.panelTitle}>⚙️ {isTa ? 'பிரச்சார அமைப்புகள்' : 'Campaign Settings'}</div>
        
        {services.length > 0 && products.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, background: 'var(--cream-dark)', padding: 6, borderRadius: 10 }}>
            {['product', 'service'].map(t => (
              <button key={t} onClick={() => { setTargetType(t); setSelectedId(''); }} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: targetType === t ? 'var(--gold)' : 'transparent', color: targetType === t ? 'var(--brown-deep)' : 'var(--brown-mid)', fontWeight: 800, cursor: 'pointer', transition: '.2s', textTransform: 'uppercase', fontSize: '.7rem' }}>
                {t === 'product' ? (isTa ? 'பொருட்கள்' : 'Products') : (isTa ? 'சேவைகள்' : 'Services')}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { id: 'single', label: isTa ? 'ஒரு தயாரிப்பு' : 'Single Product' },
            { id: 'recent', label: isTa ? 'சமீபத்திய 3' : 'Recent 3' },
            { id: 'all', label: isTa ? 'அனைத்தும்' : 'Entire Catalog' }
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{ flex: 1, padding: 10, borderRadius: 8, border: `2px solid ${mode === m.id ? 'var(--gold)' : 'var(--parchment)'}`, background: mode === m.id ? 'var(--cream-dark)' : 'transparent', fontWeight: 700, color: mode === m.id ? 'var(--brown-deep)' : 'var(--brown-mid)', cursor: 'pointer' }}>
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'single' && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: 'var(--brown-mid)', marginBottom: 8, textTransform: 'uppercase' }}>{isTa ? (targetType === 'product' ? 'தயாரிப்பைத் தேர்ந்தெடுக்கவும்' : 'சேவையைத் தேர்ந்தெடுக்கவும்') : `Select ${targetType === 'product' ? 'Product' : 'Service'}`}</label>
            <select style={S.formInput} value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              <option value="">{isTa ? '-- தேர்ந்தெடுக்கவும் --' : '-- Select --'}</option>
              {(targetType === 'product' ? products : services).map(p => (
                <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
              ))}
            </select>
          </div>
        )}

        <button onClick={generateContent} disabled={loading} style={{ ...S.btnPrimary, width: '100%', justifyContent: 'center' }}>
          ✨ {loading ? (isTa ? 'உருவாக்குகிறது...' : 'Generating...') : (isTa ? 'AI உள்ளடக்கத்தை உருவாக்கு' : 'Generate AI Content')}
        </button>
      </div>

      {campaignData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
          {/* Editor/Preview Area */}
          <div style={S.panel}>
            <div style={S.panelTitle}>📝 {isTa ? 'உள்ளடக்க முன்னோட்டம்' : 'Content Preview'}</div>
            <textarea 
              value={campaignData.caption} 
              onChange={e => setCampaignData({...campaignData, caption: e.target.value})}
              style={{ ...S.formInput, height: 100, marginBottom: 12, resize: 'none' }}
            />
            <input 
              value={campaignData.offer} 
              onChange={e => setCampaignData({...campaignData, offer: e.target.value})}
              style={{ ...S.formInput, marginBottom: 12 }}
            />
            <input 
              value={campaignData.hashtags} 
              onChange={e => setCampaignData({...campaignData, hashtags: e.target.value})}
              style={S.formInput}
            />
          </div>

          {/* Share Actions */}
          <div style={{ ...S.panel, background: 'var(--brown-deep)', color: 'var(--cream)', border: 'none' }}>
            <div style={{ ...S.panelTitle, color: 'var(--gold-light)' }}>🚀 {isTa ? 'பகிரவும்' : 'Share Now'}</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
              <button onClick={handleInstagramShare} style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                📸 Share to Instagram
              </button>
              <button onClick={shareWhatsApp} style={{ background: '#25D366', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                 WhatsApp
              </button>
              <button onClick={shareSMS} style={{ background: 'var(--cream)', color: 'var(--brown-deep)', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                 SMS / Message
              </button>
              <button onClick={copyText} style={{ background: 'transparent', color: 'var(--cream)', border: '2px solid var(--gold)', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                 📋 Copy Caption
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Success Modal */}
      {showInstaPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'grid', placeItems: 'center' }}>
          <div style={{ background: 'var(--cream)', padding: 32, borderRadius: 12, width: '90%', maxWidth: 400, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📸</div>
            <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--brown-deep)', marginBottom: 16 }}>{isTa ? 'உங்கள் பதிவு தயார்!' : 'Your post is ready!'}</h3>
            <div style={{ textAlign: 'left', background: 'var(--cream-dark)', padding: 16, borderRadius: 8, marginBottom: 24, fontSize: '.9rem', color: 'var(--brown)' }}>
              <div style={{ marginBottom: 8 }}>✅ {isTa ? 'தலைப்பு நகலெடுக்கப்பட்டது' : 'Caption copied to clipboard'}</div>
              <div style={{ marginBottom: 12 }}>✅ {isTa ? 'படம் பதிவிறக்கம் செய்யப்பட்டது (இருந்தால்)' : 'Image downloaded (if available)'}</div>
              <b>{isTa ? 'அடுத்த படிகள்:' : 'Next steps:'}</b>
              <ol style={{ paddingLeft: 20, marginTop: 8, lineHeight: 1.5 }}>
                <li>{isTa ? 'இன்ஸ்டாகிராமை திறக்கவும்' : 'Open Instagram'}</li>
                <li>{isTa ? 'படத்தைப் பதிவேற்றவும்' : 'Upload the downloaded image'}</li>
                <li>{isTa ? 'தலைப்பை ஒட்டவும்' : 'Paste the copied caption'}</li>
              </ol>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowInstaPopup(false)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '2px solid var(--parchment)', background: 'transparent', cursor: 'pointer', fontWeight: 700, color: 'var(--brown-mid)' }}>OK</button>
              <button onClick={() => { setShowInstaPopup(false); window.open("https://www.instagram.com/", "_blank"); }} style={{ flex: 2, padding: 12, borderRadius: 8, background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Open Instagram</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopkeeperDashboard() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');
  const { user, logout, apiFetch } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [dbOrders, setDbOrders] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [storeEdit, setStoreEdit] = useState({ name: '', location: '', category: '', logo: null, banner: null, pincode: '' });
  const [loading, setLoading] = useState(false); // Start false — was deadlocked at true
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [insights, setInsights] = useState({ demands: [], service_demands: [], suggestions: [] });
  const [isNewUser, setIsNewUser] = useState(false);
  const [campaignOutput, setCampaignOutput] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [uploadMode, setUploadMode] = useState('product'); // 'product' or 'service'
  const [editItem, setEditItem] = useState(null);
  
  const TN_DISTRICTS = ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Thanjavur", "Dindigul", "Ranipet", "Virudhunagar", "Kanyakumari", "Theni", "Namakkal", "Tiruppur", "Kancheepuram", "Chengalpattu", "Thiruvallur", "Cuddalore", "Nagapattinam", "Pudukkottai", "Sivaganga", "Tiruvarur", "Tiruvannamalai", "Viluppuram", "Ariyalur", "Dharmapuri", "Karur", "Krishnagiri", "Perambalur", "Ramanathapuram", "The Nilgiris", "Tenkasi", "Mayiladuthurai", "Kallakurichi", "Tirupathur"];
  
  const [festivals, setFestivals] = useState([]);
  const [nextFestival, setNextFestival] = useState(null);

  useEffect(() => {
    if (storeData?.category) {
      fetchInsights();
    }
  }, [storeData?.category]);

  const fetchInsights = async () => {
    if (!storeData?.category) return;
    try {
      const resp = await apiFetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/insights/`, {
        method: 'POST',
        body: JSON.stringify({
          category: storeData.category
        })
      });
      if (resp?.ok) {
        const data = await resp.json();
        setInsights(data);
      }
    } catch (e) {
      console.error('Failed to fetch insights', e);
    }
  };


  const fetchData = async () => {
    setLoading(true);
    try {
        const [fResp, pResp, oResp, sResp, svResp] = await Promise.all([
          apiFetch('/api/ai/festivals/'),
          apiFetch('/api/products/'),
          apiFetch('/api/orders/'),
          apiFetch('/api/stores/mine/'),
          apiFetch('/api/services/')
        ]);

        if (fResp.ok) {
          const data = await fResp.json();
          setFestivals(data);
          const today = new Date();
          const upcoming = data.filter(f => new Date(f.date) >= today).sort((a,b) => new Date(a.date) - new Date(b.date));
          if (upcoming.length > 0) {
            const next = upcoming[0];
            const diffDays = Math.ceil(Math.abs(new Date(next.date) - today) / 86400000);
            setNextFestival({ ...next, daysLeft: diffDays });
          }
        }

        let fetchedProductsCount = 0;
        let fetchedOrdersCount = 0;

        if (pResp?.ok) {
          const pData = await pResp.json();
          const pArr = Array.isArray(pData) ? pData : (pData.results || []);
          setProducts(pArr);
          fetchedProductsCount = pArr.length;
        }
        if (oResp?.ok) {
          const oData = await oResp.json();
          const oArr = Array.isArray(oData) ? oData : (oData.results || []);
          setDbOrders(oArr);
          fetchedOrdersCount = oArr.length;
        }
        if (svResp?.ok) {
          const svData = await svResp.json();
          setServices(Array.isArray(svData) ? svData : (svData.results || []));
        }
        if (sResp?.ok) {
          const sData = await sResp.json();
          setStoreData(sData);
          setStoreEdit({ 
            name: sData.name || '', 
            location: sData.location || '', 
            category: sData.category || 'General',
            contact_name: sData.contact_name || '',
            phone: sData.phone || '',
            district: sData.district || 'Chennai',
            pincode: sData.pincode || '',
            logo: null, 
            banner: null 
          });
        }

    if (fetchedProductsCount === 0 && fetchedOrdersCount === 0) {
      setIsNewUser(true);
    } else {
      setIsNewUser(false);
    }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    const newNotifs = [];
    
    // Low Stock Notifs
    products.filter(p => p.stock < 5 && p.stock > 0).forEach(p => {
      newNotifs.push({
        id: `stock-${p.id}`,
        type: 'stock',
        text: isTa ? `${p.name} இருப்பு குறைவாக உள்ளது (${p.stock})` : `Low stock for ${p.name} (${p.stock})`,
        time: isTa ? 'இப்போது' : 'Just now',
        read: false
      });
    });

    // Recent Order Notifs
    dbOrders.filter(o => o.status === 'Pending').slice(0, 3).forEach(o => {
      newNotifs.push({
        id: `order-${o.id}`,
        type: 'order',
        text: isTa ? `புதிய ஆர்டர் #${o.id} - ${o.customer_name || 'வாடிக்கையாளர்'}` : `New Order #${o.id} from ${o.customer_name || 'Customer'}`,
        time: isTa ? 'செயலில் உள்ளது' : 'Action Required',
        read: false
      });
    });

    // Festival Notifs
    if (nextFestival && nextFestival.daysLeft <= 15) {
      newNotifs.push({
        id: `fest-${nextFestival.name}`,
        type: 'ai',
        text: isTa ? `${nextFestival.name_ta} வரவிருக்கிறது! உங்கள் இருப்பைச் சரிபார்க்கவும்.` : `${nextFestival.name} is coming! Check your inventory.`,
        time: `${nextFestival.daysLeft} ${isTa ? 'நாட்கள்' : 'days left'}`,
        read: true
      });
    }

    setNotifications(newNotifs);
  }, [products, dbOrders, nextFestival, isTa]);

  const showToast = (msg) => { setToast({ msg, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000); };
  const saveProducts = (p) => { setProducts(p); localStorage.setItem('kc_products', JSON.stringify(p)); };

  const sess = JSON.parse(localStorage.getItem('kc_session') || '{}');
  const userFullName = user?.first_name ? (`${user.first_name} ${user.last_name || ''}`).trim() : (user?.name || user?.username || '');
  const firstName = user?.first_name || userFullName.split(' ')[0] || (isTa ? 'வணக்கம்' : 'Welcome');
  
  const fallbackShopName = isTa ? 'முருகன் டெக்ஸ்டைல்ஸ்' : 'Murugan Textiles';
  const shopName = storeData?.name || sess?.storeName || sess?.name || fallbackShopName;

  const updateOrderStatus = async (id, status) => {
    try {
      const r = await apiFetch(`/api/orders/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (r.ok) {
        showToast(isTa ? `நிலை ${status} க்கு புதுப்பிக்கப்பட்டது` : `Status updated to ${status}`);
        fetchData();
      }
    } catch (e) {
      showToast(isTa ? 'புதுப்பிப்பதில் பிழை' : 'Error updating status');
    }
  };

  const handleSaveProduct = async (formData) => {
    const isEdit = formData.id && !isNaN(formData.id);
    const url = isEdit ? `/api/products/${formData.id}/` : '/api/products/';
    const method = isEdit ? 'PATCH' : 'POST';

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('price', formData.price);
    payload.append('stock', formData.stock || 0);
    payload.append('description', formData.desc || formData.description || '');
    payload.append('category_name', formData.category);

    if (formData.name_ta) payload.append('name_ta', formData.name_ta);
    if (formData.desc_ta || formData.description_ta) payload.append('description_ta', formData.desc_ta || formData.description_ta);
    if (formData.imageFile) payload.append('image', formData.imageFile);
    if (formData.imgUrl && !formData.imageFile && formData.imgUrl.startsWith('http')) payload.append('imgUrl', formData.imgUrl);
    if (formData.festival) payload.append('festival', formData.festival);

    try {
      const resp = await apiFetch(url, { method, body: payload });
      if (resp?.ok) {
        showToast(`✅ "${formData.name}" ${isEdit ? 'updated' : 'added'}!`);
        setShowUpload(false);
        setEditItem(null);
        fetchData();
      } else {
        const errData = await resp.json().catch(() => ({}));
        showToast('❌ ' + (errData.detail || JSON.stringify(errData)));
      }
    } catch (e) { showToast('❌ Error saving product'); }
  };

  const handleSaveService = async (formData) => {
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/services/${formData.id}/` : '/api/services/';
    const method = isEdit ? 'PATCH' : 'POST';

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('price', formData.price);
    payload.append('duration_minutes', formData.duration_minutes || 60);
    payload.append('description', formData.desc || formData.description || '');

    if (formData.name_ta) payload.append('name_ta', formData.name_ta);
    if (formData.imageFile) payload.append('image', formData.imageFile);
    if (formData.imgUrl && !formData.imageFile && formData.imgUrl.startsWith('http')) payload.append('image_url', formData.imgUrl);

    try {
      const resp = await apiFetch(url, { method, body: payload });
      if (resp?.ok) {
        showToast(`✅ "${formData.name}" ${isEdit ? 'updated' : 'added'}!`);
        setShowUpload(false);
        setEditItem(null);
        fetchData();
      } else {
        const errData = await resp.json().catch(() => ({}));
        showToast('❌ ' + (errData.detail || JSON.stringify(errData)));
      }
    } catch (e) { showToast('❌ Error saving service'); }
  };

  const handleUpdateStore = async () => {
    setLoading(true);
    const payload = new FormData();
    payload.append('name', storeEdit.name);
    payload.append('location', storeEdit.location);
    payload.append('category', storeEdit.category);
    payload.append('contact_name', storeEdit.contact_name);
    payload.append('phone', storeEdit.phone);
    payload.append('district', storeEdit.district);
    payload.append('pincode', storeEdit.pincode);
    if (storeEdit.logo) payload.append('logo', storeEdit.logo);
    if (storeEdit.banner) payload.append('banner', storeEdit.banner);

    try {
      const resp = await apiFetch('/api/stores/mine/', {
        method: 'PATCH',
        body: payload
      });
      if (resp?.ok) {
        const updated = await resp.json();
        setStoreData(updated);
        showToast(isTa ? '✅ கடை விவரங்கள் புதுப்பிக்கப்பட்டன!' : '✅ Store profile updated!');
        setStoreEdit(prev => ({ ...prev, logo: null, banner: null })); // Reset file inputs
      } else {
        showToast(isTa ? '❌ புதுப்பிக்க முடியவில்லை' : '❌ Failed to update store');
      }
    } catch (e) {
      showToast('❌ Server error');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const resp = await apiFetch(`/api/products/${id}/`, { method: 'DELETE' });
      if (resp?.ok) {
        setProducts(products.filter(p => p.id !== id));
        showToast('Product deleted.');
      }
    } catch (e) {
      showToast('❌ Failed to delete');
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm(isTa ? 'நீக்கவா?' : 'Delete this service?')) return;
    try {
      const resp = await apiFetch(`/api/services/${id}/`, { method: 'DELETE' });
      if (resp.status === 204) {
        showToast('🗑️ Deleted');
        fetchData();
      }
    } catch (e) { showToast('❌ Error deleting'); }
  };

  const hasProducts = storeData?.has_products !== false;
  const hasServices = storeData?.has_services === true;

  const navItems = [
    { key: 'dashboard', icon: <Home size={18} />, label: t('dashboard'), show: true },
    { key: 'products', icon: <Package size={18} />, label: t('my_products'), show: hasProducts },
    { key: 'services', icon: <Briefcase size={18} />, label: isTa ? 'சேவைகள்' : 'Services', show: hasServices },
    { key: 'orders', icon: <ShoppingBag size={18} />, label: t('orders'), show: hasProducts },
    { key: 'bookings', icon: <CalendarDays size={18} />, label: isTa ? 'முன்பதிவுகள்' : 'Bookings', show: hasServices },
    { key: 'festivals', icon: <Sparkles size={18} />, label: t('festivals'), show: true },
    { key: 'marketing', icon: <Megaphone size={18} />, label: t('marketing'), show: true },
    { key: 'deliveries', icon: <Truck size={18} />, label: t('deliveries'), show: hasProducts },
    { key: 'settings', icon: <UserCircle size={18} />, label: isTa ? 'கடை சுயவிவரம்' : 'Shop Profile', show: true },
  ].filter(n => n.show);

  const toggleCapability = async (field, value) => {
    try {
      const fd = new FormData();
      fd.append(field, value ? 'true' : 'false');
      const r = await apiFetch('/api/stores/mine/', { method: 'PATCH', body: fd });
      if (r?.ok) {
        const updated = await r.json();
        setStoreData(updated);
        showToast(`✅ ${field === 'has_products' ? 'Products' : 'Services'} ${value ? 'enabled' : 'disabled'}`);
      }
    } catch (e) { showToast('❌ Failed to update capabilities'); }
  };

  const DEMANDS = insights.demands.length > 0 ? insights.demands.map(d => ({ ...d, color: 'linear-gradient(to right,var(--gold),var(--gold-light))' })) : [
    { label: isTa ? 'பட்டு சாடிகள்' : 'Silk Sarees', pct: 90, color: 'linear-gradient(to right,var(--gold),var(--gold-light))' },
    { label: isTa ? 'பித்தளை விளக்குகள்' : 'Brass Lamps', pct: 78, color: 'linear-gradient(to right,var(--gold),var(--gold-light))' },
    { label: isTa ? 'பருத்தி குர்தாக்கள்' : 'Cotton Kurtas', pct: 65, color: 'linear-gradient(to right,var(--rust),#d4674f)' },
  ];

  const SUGGESTIONS = insights.suggestions.length > 0 ? insights.suggestions : [
    { icon: '📱', title: isTa ? 'வாட்ஸ்அப் பிரச்சாரம் · வெள்ளி மாலை 6–8 மணி' : 'WhatsApp Campaign · Friday 6–8 PM', body: isTa ? '5 கிமீ சுற்றளவில் 25–45 வயதுடைய பெண்களை இலக்காகக் கொள்ளுங்கள். பட்டுப் புடவைகளை விளம்பரப்படுத்துங்கள். எதிர்பார்க்கப்படும் நோக்கம்: 420 வாடிக்கையாளர்கள்.' : 'Target women aged 25–45 within 5 km. Promote silk sarees. Expected reach: 420 customers.', tag: isTa ? 'அதிக தாக்கம்' : 'High Impact' },
  ];

  const ORDERS = [
    { id: '#ORD-1041', customer: isTa ? 'பிரியா எஸ்.' : 'Priya S.', product: isTa ? 'காஞ்சிபுரம் பட்டுச் சேலை' : 'Kanjivaram Silk Saree', amount: '₹3,200', time: isTa ? '10 நிமிடம் முன்' : '10 min ago', status: isTa ? 'Processing' : 'Processing' },
    { id: '#ORD-1040', customer: isTa ? 'கவிதா ஆர்.' : 'Kavitha R.', product: isTa ? 'பித்தளை விளக்கு செட்' : 'Brass Lamp Set', amount: '₹980', time: isTa ? '35 நிமிடம் முன்' : '35 min ago', status: isTa ? 'Delivered' : 'Delivered' },
    { id: '#ORD-1039', customer: isTa ? 'மீனா டி.' : 'Meena T.', product: isTa ? 'பருத்தி சல்வார் × 2' : 'Cotton Salwar × 2', amount: '₹1,150', time: isTa ? '1 மணி நேரத்திற்கு முன்' : '1 hr ago', status: isTa ? 'Pending' : 'Pending' },
  ];

  const statusColor = { Processing: '#cce5ff', Delivered: '#d4edda', Pending: '#fef3cd', Cancelled: '#f8d7da' };
  const statusText = { Processing: '#004085', Delivered: '#155724', Pending: '#856404', Cancelled: '#721c24' };

  const generateCampaign = async () => {
    try {
      const resp = await apiFetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/generate-marketing/`, {
        method: 'POST',
        body: JSON.stringify({
          product_name: "our best services",
          category: storeData?.category || 'General'
        })
      });
      if (resp?.ok) {
        const data = await resp.json();
        setCampaignOutput(data.caption + "\n\n" + data.offer + "\n\n" + data.hashtags);
        showToast(isTa ? '✅ பிரச்சாரம் AI உதவியுடன் உருவாக்கப்பட்டது!' : '✅ Campaign generated by AI!');
      }
    } catch (e) {
      showToast('❌ AI Error');
    }
  };

  return (
    <div className="db-shell">
      {/* Sidebar Overlay (mobile) */}
      <div className={`db-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}/>

      {/* SIDEBAR */}
      <aside className={`db-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(201,146,26,.3)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/logo.png" alt="Kadai Connect Logo" style={{ height: 40, borderRadius: 6, border: '1px solid var(--gold)', objectFit: 'cover', marginBottom: 10 }} />
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '.95rem', fontWeight: 900, color: 'var(--gold-light)', lineHeight: 1.2 }}>KadaiConnect</div>
          <div style={{ fontSize: '.6rem', color: 'var(--brown-light)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 2 }}>Shopkeeper Panel</div>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.08)', padding: 3, borderRadius: 16, marginTop: 10, justifyContent: 'center' }}>
            {['en', 'ta'].map(l => (
              <button key={l} onClick={() => i18n.changeLanguage(l)} style={{ padding: '3px 8px', borderRadius: 12, border: 'none', background: i18n.language.startsWith(l) ? 'var(--gold)' : 'transparent', color: i18n.language.startsWith(l) ? 'var(--brown-deep)' : 'var(--cream)', fontSize: '.62rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(201,146,26,.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold)', display: 'grid', placeItems: 'center', fontSize: '1.1rem', border: '2px solid var(--gold-light)', flexShrink: 0, overflow: 'hidden' }}>
            {storeData?.logo ? <img src={storeData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : '🏪'}
          </div>
          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--cream)', fontWeight: 600 }}>{storeData?.name || shopName}</div>
            <div style={{ fontSize: '.6rem', color: 'var(--brown-light)', fontStyle: 'italic' }}>📍 {storeData?.location || 'Tamil Nadu'}</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {navItems.map(n => (
            <button key={n.key} style={S.navItem(section === n.key)} onClick={() => { setSection(n.key); setSidebarOpen(false); }}>
              <span style={{ fontSize: '.95rem', minWidth: 20 }}>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(201,146,26,.1)' }}>
          <button 
            onClick={logout} 
            style={{ 
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(166,61,47,0.1)', // Subtle rust background
              border: '1.5px solid var(--rust)',
              color: 'var(--rust)',
              cursor: 'pointer',
              fontFamily: 'var(--font-d)',
              fontWeight: 800,
              fontSize: '.85rem',
              transition: '.2s',
              textTransform: 'uppercase',
              letterSpacing: '.5px'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--rust)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(166,61,47,0.1)'; e.currentTarget.style.color = 'var(--rust)'; }}
          >
            <LogOut size={18} /> {t('logout')}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="db-main">
        {/* TOP HEADER */}
        <header className="db-top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} className="hamburger-btn" style={{ background: 'none', border: 'none', color: 'inherit', fontSize: '1.4rem', cursor: 'pointer', display: 'none', alignItems: 'center' }}>
              <Menu size={24} />
            </button>
            <div className="db-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/logo.png" alt="Kadai Connect Logo" style={{ height: 28, borderRadius: 4, border: '1px solid var(--gold)', objectFit: 'cover' }} />
              <span style={{ fontFamily: 'var(--font-d)', fontWeight: 900, color: 'var(--brown-deep)', fontSize: '1.1rem' }}>Kadai<span style={{ color: 'var(--gold)' }}>Connect</span></span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--header-icon-color, var(--brown-deep))', display: 'flex', alignItems: 'center', position: 'relative' }}
              >
                <Bell size={24} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--rust)', color: '#fff', fontSize: '10px', width: 16, height: 16, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 900, border: '2px solid var(--cream)' }}>
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{ position: 'absolute', top: 'calc(100% + 15px)', right: -10, width: 300, background: 'var(--cream)', border: '2px solid var(--gold)', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', zIndex: 6000, overflow: 'hidden', animation: 'slideInDown .3s ease' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1.5px solid var(--parchment)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--cream-dark)' }}>
                    <span style={{ fontWeight: 800, fontSize: '.85rem', color: 'var(--brown-deep)' }}>{isTa ? 'அறிவிப்புகள்' : 'Notifications'}</span>
                    <button onClick={() => setNotifications(n => n.map(x => ({...x, read: true})))} style={{ background: 'none', border: 'none', fontSize: '.65rem', color: 'var(--gold)', fontWeight: 700, cursor: 'pointer' }}>{isTa ? 'அனைத்தும் படி' : 'Mark all read'}</button>
                  </div>
                  <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} style={{ padding: '14px 18px', borderBottom: '1px solid var(--parchment)', background: n.read ? 'transparent' : 'rgba(201,146,26,.05)', position: 'relative', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'} onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(201,146,26,.05)'}>
                        {!n.read && <div style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }} />}
                        <div style={{ fontSize: '.78rem', color: 'var(--brown-deep)', fontWeight: n.read ? 400 : 700, marginBottom: 4 }}>{n.text}</div>
                        <div style={{ fontSize: '.65rem', color: 'var(--brown-mid)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10}/> {n.time}</div>
                      </div>
                    )) : (
                      <div style={{ padding: 30, textAlign: 'center', color: 'var(--brown-mid)', fontStyle: 'italic', fontSize: '.85rem' }}>{isTa ? 'அறிவிப்புகள் எதுவும் இல்லை' : 'No new notifications'}</div>
                    )}
                  </div>
                  <div style={{ padding: 10, textAlign: 'center', borderTop: '1px solid var(--parchment)' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--brown-mid)', fontSize: '.7rem', fontWeight: 600, cursor: 'pointer' }}>{isTa ? 'அனைத்தையும் காண்க' : 'View all history'}</button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setSection('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gold)', display: 'grid', placeItems: 'center', border: '1.5px solid var(--gold-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {storeData?.logo ? <img src={storeData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <UserCircle size={20} color="var(--brown-deep)" />}
              </div>
              <span className="profile-name" style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--brown-deep)' }}>{storeData?.name || firstName}</span>
            </button>
          </div>
        </header>

        <div className="db-content">
          {/* ── DASHBOARD ── */}
          {section === 'dashboard' && (
            isNewUser ? (
              <div style={{ maxWidth: 800, margin: '20px auto', textAlign: 'center' }}>
                <div style={{ background: 'var(--brown-deep)', borderRadius: 12, padding: 40, border: '3px solid var(--gold)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>🏪</div>
                  <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', color: 'var(--gold-light)', marginBottom: 12 }}>{isTa ? 'வணக்கம்!' : 'Welcome!'} {firstName}</h1>
                  <p style={{ color: 'var(--parchment)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 30 }}>{isTa ? 'உங்கள் கடையை டிஜிட்டல் முறைக்கு மாற்றியதற்கு வாழ்த்துகள். உங்கள் முதல் பொருளைச் சேர்ப்பதன் மூலம் தொடங்கவும்.' : "Congratulations on taking your shop digital. Let's start by adding your first product to your catalog."}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 30 }}>
                    {hasProducts && (
                      <div onClick={() => { setUploadMode('product'); setShowUpload(true); }} style={{ background: 'rgba(255,255,255,.05)', border: '2px dashed var(--gold)', borderRadius: 10, padding: 25, cursor: 'pointer', transition: '.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,146,26,.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}>
                        <div style={{ fontSize: '2rem', marginBottom: 10 }}>📦</div>
                        <div style={{ color: 'var(--gold-light)', fontWeight: 700 }}>{isTa ? 'தயாரிப்பைச் சேர்' : 'Add Product'}</div>
                      </div>
                    )}
                    {hasServices && (
                      <div onClick={() => { setUploadMode('service'); setShowUpload(true); }} style={{ background: 'rgba(255,255,255,.05)', border: '2px dashed var(--gold)', borderRadius: 10, padding: 25, cursor: 'pointer', transition: '.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,146,26,.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}>
                        <div style={{ fontSize: '2rem', marginBottom: 10 }}>🧵</div>
                        <div style={{ color: 'var(--gold-light)', fontWeight: 700 }}>{isTa ? 'சேவையைச் சேர்' : 'Add Service'}</div>
                      </div>
                    )}
                    <div onClick={() => setSection('settings')} style={{ background: 'rgba(255,255,255,.05)', border: '2px dashed var(--gold)', borderRadius: 10, padding: 25, cursor: 'pointer', transition: '.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,146,26,.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}>
                      <div style={{ fontSize: '2rem', marginBottom: 10 }}>⚙️</div>
                      <div style={{ color: 'var(--gold-light)', fontWeight: 700 }}>{isTa ? 'சுயவிவரத்தை அமை' : 'Setup Profile'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--brown-deep)' }}>{t('good_morning')}, <span style={{ color: 'var(--gold)' }}>{firstName}</span> 🙏</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--brown-mid)', fontStyle: 'italic', marginTop: 2 }}>
                      {nextFestival 
                        ? `${isTa ? nextFestival.name_ta : nextFestival.name} ${t('is_in')} ${nextFestival.daysLeft} ${t('days')} — ${isTa ? 'AI தேவை கணிப்புகள் செயலில் உள்ளன' : 'AI demand predictions active'}`
                        : (isTa ? 'AI தேவை கணிப்புகள் செயலில் உள்ளன' : 'AI demand predictions active')
                      }
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {hasProducts && (
                      <button style={S.btnPrimary} onClick={() => { setUploadMode('product'); setShowUpload(true); }}>{t('upload_product')}</button>
                    )}
                    {hasServices && (
                      <button style={{ ...S.btnPrimary, background: 'var(--green)', color: '#fff', border: 'none' }} onClick={() => { setUploadMode('service'); setShowUpload(true); }}>
                        ＋ {isTa ? 'சேவை சேர்க்கவும்' : 'Add Service'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="stats-grid" style={{ marginBottom: 22 }}>
                  {[
                    { label: t('todays_orders'), value: dbOrders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length, change: isTa ? 'நிஜ நேர தரவு' : 'Real-time data', up: true },
                    { label: t('total_products'), value: products.length, change: isTa ? 'உங்கள் இருப்பிலிருந்து நேரலையில்' : 'Live from your inventory', up: true },
                    { label: t('revenue_month'), value: '₹' + dbOrders.reduce((sum, o) => sum + Number(o.total_price), 0).toLocaleString(), change: isTa ? 'மொத்த வருவாய்' : 'Total revenue', up: true },
                    { label: t('pending_deliveries'), value: dbOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length, change: isTa ? 'செயலில் உள்ள ஆர்டர்கள்' : 'Active assignments', up: false },
                  ].map((s, i) => (
                    <div key={i} style={S.statCard}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--gold)' }}/>
                      <div style={{ fontSize: '.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--brown-mid)', marginBottom: 5 }}>{s.label}</div>
                      <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.7rem', fontWeight: 900, color: 'var(--brown-deep)' }}>{s.value}</div>
                      <div style={{ fontSize: '.7rem', marginTop: 3, fontStyle: 'italic', color: s.up ? 'var(--green)' : 'var(--rust)' }}>{s.change}</div>
                    </div>
                  ))}
                </div>

                {/* FRS Card */}
                <div style={{ background: 'var(--brown-deep)', border: '2px solid var(--gold)', borderRadius: 10, padding: 24, marginBottom: 22, display: 'flex', alignItems: 'center', gap: 28, boxShadow: '6px 6px 0 var(--gold)', flexWrap: 'wrap' }}>
                  <div style={{ flexShrink: 0, width: 100, height: 100, position: 'relative' }}>
                    <svg viewBox="0 0 100 100" width="100" height="100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(201,146,26,.2)" strokeWidth="9"/>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#e8b84b" strokeWidth="9" strokeDasharray="263.9" strokeDashoffset="79.2" strokeLinecap="round" transform="rotate(-90 50 50)"/>
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-d)', fontSize: '1.7rem', fontWeight: 900, color: 'var(--gold-light)' }}>70</span>
                      <span style={{ fontSize: '.65rem', color: 'var(--brown-light)' }}>/100</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold-light)', marginBottom: 5 }}>🏆 {isTa ? 'திருவிழா தயார்நிலை மதிப்பெண்' : 'Festival Readiness Score'} — {nextFestival ? (isTa ? nextFestival.name_ta : nextFestival.name) : (isTa ? 'வரவிருக்கும் திருவிழா' : 'Upcoming Festival')} 2026</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--parchment)', lineHeight: 1.5, marginBottom: 12 }}>
                      {nextFestival 
                        ? (isTa ? `உங்கள் கடை ${nextFestival.name_ta} க்கு 70% தயாராக உள்ளது. AI அதிக தேவையை கணிக்கிறது — ${nextFestival.inventory_tip_ta || nextFestival.inventory_tip}` : `Your store is 70% ready for ${nextFestival.name}. AI predicts high demand — ${nextFestival.inventory_tip}`)
                        : (isTa ? 'AI தரவைப் பெறுகிறது...' : 'Fetching AI readiness data...')
                      }
                    </div>
                    <span style={{ display: 'inline-block', padding: '4px 14px', background: 'var(--gold)', color: 'var(--brown-deep)', borderRadius: 20, fontWeight: 700, fontSize: '.76rem', fontFamily: 'var(--font-d)' }}>{isTa ? '🟡 கொஞ்சம் சரிசெய்ய வேண்டும்' : '🟡 Getting There'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
                    {nextFestival ? (
                      <>
                        <div style={{ background: 'rgba(201,146,26,.15)', border: '1px solid rgba(201,146,26,.4)', borderRadius: 6, padding: '9px 12px', fontSize: '.75rem', color: 'var(--parchment)', lineHeight: 1.4 }}>💡 {isTa ? (nextFestival.suggestion_ta || nextFestival.suggestion) : nextFestival.suggestion}</div>
                        <div style={{ background: 'rgba(201,146,26,.15)', border: '1px solid rgba(201,146,26,.4)', borderRadius: 6, padding: '9px 12px', fontSize: '.75rem', color: 'var(--parchment)', lineHeight: 1.4 }}>📣 {isTa ? (nextFestival.marketing_tip_ta || nextFestival.marketing_tip) : nextFestival.marketing_tip}</div>
                      </>
                    ) : (
                      <div style={{ background: 'rgba(201,146,26,.15)', border: '1px solid rgba(201,146,26,.4)', borderRadius: 6, padding: '9px 12px', fontSize: '.75rem', color: 'var(--parchment)', lineHeight: 1.4 }}>{isTa ? 'AI பரிந்துரைகள் ஏற்றப்படுகின்றன...' : 'Loading AI insights...'}</div>
                    )}
                  </div>
                </div>

                {/* Two-col: Demand + Suggestions */}
                <div className="two-col" style={{ marginBottom: 24 }}>
                  <div style={S.panel}>
                    <div style={S.panelTitle}>📈 {isTa ? 'AI தேவை கணிப்பு — அடுத்த 14 நாட்கள்' : 'AI Demand Prediction — Next 14 Days'}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--brown-mid)', fontStyle: 'italic', marginBottom: 12 }}>
                      {nextFestival ? `${isTa ? nextFestival.name_ta : nextFestival.name} ${isTa ? 'நாள்காட்டி செயலில் உள்ளது' : 'Calendar Active'}` : (isTa ? 'AI மாதிரி தயாராகிறது...' : 'AI Model Warming Up...')}
                    </div>
                    
                    {/* Products Demand */}
                    {(nextFestival?.predicted_products || insights.demands).length > 0 && (
                      <>
                        <div style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '.5px' }}>📦 {isTa ? 'தயாரிப்பு தேவைகள்' : 'Product Demands'}</div>
                        {(nextFestival?.predicted_products || insights.demands).slice(0, 4).map((item, i) => {
                          const label = typeof item === 'string' ? item : item.label;
                          const pct = typeof item === 'string' ? (85 - i * 8) : item.pct;
                          const color = 'linear-gradient(to right,var(--gold),var(--gold-light))';
                          return (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                              <div style={{ width: 110, fontSize: '.76rem', color: 'var(--brown)', flexShrink: 0 }}>{label}</div>
                              <div style={{ flex: 1, background: 'var(--parchment)', borderRadius: 4, height: 9, overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 4, background: color, width: `${pct}%` }}/>
                              </div>
                              <div style={{ fontSize: '.68rem', color: 'var(--brown-mid)', width: 34, textAlign: 'right' }}>{pct}%</div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Services Demand */}
                    {hasServices && (insights.service_demands || []).length > 0 && (
                      <>
                        <div style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase', marginTop: 18, marginBottom: 10, letterSpacing: '.5px' }}>🧵 {isTa ? 'சேவை தேவைகள்' : 'Service Demands'}</div>
                        {(insights.service_demands || []).slice(0, 4).map((item, i) => (
                          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                            <div style={{ width: 110, fontSize: '.76rem', color: 'var(--brown)', flexShrink: 0 }}>{item.label}</div>
                            <div style={{ flex: 1, background: 'var(--parchment)', borderRadius: 4, height: 9, overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(to right, var(--green), #48bb78)', width: `${item.pct}%` }}/>
                            </div>
                            <div style={{ fontSize: '.68rem', color: 'var(--brown-mid)', width: 34, textAlign: 'right' }}>{item.pct}%</div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  <div style={S.panel}>
                    <div style={S.panelTitle}>📣 {isTa ? 'AI மார்க்கெட்டிங் பரிந்துரைகள்' : 'AI Marketing Suggestions'}</div>
                    {SUGGESTIONS.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 11, borderRadius: 6, marginBottom: 9, background: 'var(--cream-dark)', border: '1px solid var(--parchment)' }}>
                        <div style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: 2 }}>{s.icon}</div>
                        <div style={{ fontSize: '.78rem', color: 'var(--brown)', lineHeight: 1.5 }}>
                          <strong style={{ color: 'var(--brown-deep)' }}>{s.title}</strong><br/>{s.body}
                          <br/><span style={{ display: 'inline-block', marginTop: 4, padding: '2px 9px', background: 'var(--gold-pale)', border: '1px solid var(--gold)', borderRadius: 12, fontSize: '.6rem', color: 'var(--brown)' }}>{s.tag}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Orders */}
                <div style={{ ...S.panel, marginBottom: 24, overflowX: 'auto' }}>
                  <div style={S.panelTitle}>📦 {isTa ? 'சமீபத்திய ஆர்டர்கள்' : 'Recent Orders'}</div>
                  <div style={{ minWidth: 600 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
                      <thead><tr>{(isTa ? ['ஆர்டர் ஐடி','வாடிக்கையாளர்','தயாரிப்பு','தொகை','நேரம்','நிலை'] : ['Order ID','Customer','Product','Amount','Time','Status']).map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 10px', background: 'var(--brown-deep)', color: 'var(--gold-light)', fontFamily: 'var(--font-d)', fontSize: '.75rem', letterSpacing: '.5px' }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {dbOrders.length > 0 ? dbOrders.slice(0, 10).map(o => (
                          <tr key={o.id}>
                            <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--parchment)' }}>#ORD-{o.id}</td>
                            <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--parchment)' }}>{o.customer_name || 'Guest'}</td>
                            <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--parchment)' }}>{o.items?.[0]?.product_name || 'Multiple'}</td>
                            <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--parchment)' }}>₹{Number(o.total_price).toLocaleString()}</td>
                            <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--parchment)' }}>{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--parchment)' }}>
                              <span style={{ ...S.statusBadge, 
                                background: o.status === 'Delivered' ? '#d4edda' : o.status === 'Cancelled' ? '#f8d7da' : '#fff3cd', 
                                color: o.status === 'Delivered' ? '#155724' : o.status === 'Cancelled' ? '#721c24' : '#856404' 
                              }}>{o.status}</span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="6" style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--brown-mid)', fontStyle: 'italic' }}>
                              {isTa ? 'இன்னும் ஆர்டர்கள் எதுவும் இல்லை. தயாராக இருங்கள்!' : 'No orders yet. Your first order will appear here!'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Growth Feature Showcase */}
                <div style={{ padding: 24, background: 'linear-gradient(135deg, var(--brown-deep), #5a2e1a)', borderRadius: 12, marginBottom: 24, color: 'var(--cream)', border: '2px solid var(--gold)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <div style={{ background: 'var(--gold)', padding: 8, borderRadius: 8, color: 'var(--brown-deep)' }}><Sparkles size={24}/></div>
                    <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', margin: 0 }}>{isTa ? 'ஸ்மார்ட் வளர்ச்சி கருவிகள்' : 'Smart Growth Toolbox'}</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    {[
                      { icon: '🎯', title: isTa ? 'AI பரிந்துரைகள்' : 'AI Recommendations', desc: isTa ? 'வாடிக்கையாளர் விருப்பங்களுக்கு ஏற்ப தயாரிப்புகளைப் பகிரவும்.' : 'Share products tailored to customer preferences.' },
                      { icon: '📅', title: isTa ? 'திருவிழா தயார்நிலை' : 'Festival Readiness', desc: isTa ? 'வரவிருக்கும் நிகழ்வுகளுக்கான தானியங்கி சரக்கு திட்டமிடல்.' : 'Automated inventory planning for upcoming events.' },
                      { icon: '🤖', title: isTa ? 'தானியங்கி சந்தைப்படுத்தல்' : 'Auto Marketing', desc: isTa ? 'வாட்ஸ்அப் மற்றும் முகநூலில் பகிர AI விளம்பரங்கள்.' : 'AI promos for WhatsApp and Facebook sharing.' }
                    ].map((f, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 8, border: '1px solid rgba(201,146,26,0.2)' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{f.icon}</div>
                        <div style={{ fontWeight: 700, color: 'var(--gold-light)', marginBottom: 4, fontSize: '.85rem' }}>{f.title}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--parchment)', lineHeight: 1.4, opacity: 0.8 }}>{f.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {hasProducts && (
                  <div style={{ ...S.panel, marginBottom: 24 }}>
                    <div style={S.panelTitle}>🛍️ {isTa ? 'சிறந்த தயாரிப்புகள்' : 'Top Products'}</div>
                    <ProductGrid 
                      products={products.slice(0, 4)} 
                      onEdit={(p) => { setUploadMode('product'); setEditItem(p); setShowUpload(true); }} 
                      onDelete={deleteProduct} 
                      onAdd={() => { setUploadMode('product'); setEditItem(null); setShowUpload(true); }}
                    />
                  </div>
                )}

                {hasServices && (
                  <div style={S.panel}>
                    <div style={S.panelTitle}>🧵 {isTa ? 'சிறந்த சேவைகள்' : 'Top Services'}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                      {services.slice(0, 4).map(s => (
                        <div key={s.id} style={{ background: 'var(--cream-dark)', padding: 10, borderRadius: 12, border: '1.5px solid var(--parchment)', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                          <div style={{ height: 130, borderRadius: 8, background: s.image_url ? `url(${s.image_url}) center/cover no-repeat` : 'var(--parchment)', marginBottom: 8, display: 'grid', placeItems: 'center', fontSize: '2rem', overflow: 'hidden' }}>
                            {!s.image_url && '🧵'}
                          </div>
                          <div style={{ fontFamily: 'var(--font-d)', fontSize: '.85rem', fontWeight: 700, color: 'var(--brown-deep)' }}>{s.name}</div>
                          <div style={{ fontSize: '.8rem', color: 'var(--gold)', fontWeight: 800 }}>₹{s.price}</div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                            <button onClick={() => { setUploadMode('service'); setEditItem({ ...s, desc: s.description }); setShowUpload(true); }} style={{ flex: 1, padding: '4px', fontSize: '.65rem', borderRadius: 4, border: '1px solid var(--gold)', background: 'transparent', color: 'var(--gold)', cursor: 'pointer' }}>✏️</button>
                            <button onClick={() => deleteService(s.id)} style={{ flex: 1, padding: '4px', fontSize: '.65rem', borderRadius: 4, border: '1px solid var(--rust)', background: 'transparent', color: 'var(--rust)', cursor: 'pointer' }}>🗑️</button>
                          </div>
                        </div>
                      ))}
                      <div 
                        onClick={() => { setUploadMode('service'); setEditItem(null); setShowUpload(true); }}
                        style={{ border: '2px dashed var(--parchment)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 12, minHeight: 150 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-dark)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>＋</div>
                        <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--brown-mid)' }}>{isTa ? 'சேவை சேர்' : 'Add Service'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* ── PRODUCTS ── */}
          {section === 'products' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--brown-deep)' }}>🛍️ {isTa ? 'எனது ' : 'My '}<span style={{ color: 'var(--gold)' }}>{isTa ? 'தயாரிப்புகள்' : 'Products'}</span></div>
                  <div style={{ fontSize: '.8rem', color: 'var(--brown-mid)', fontStyle: 'italic' }}>{isTa ? 'உங்கள் இருப்பை நிர்வகிக்கவும்' : 'Manage your inventory'}</div>
                </div>
                <button style={S.btnPrimary} onClick={() => { setUploadMode('product'); setEditItem(null); setShowUpload(true); }}>{isTa ? '+ புதிய பொருள் சேர்' : '+ Add Product'}</button>
              </div>
              <div style={S.panel}>
                <ProductGrid 
                  products={products} 
                  onEdit={(p) => { setUploadMode('product'); setEditItem(p); setShowUpload(true); }} 
                  onDelete={deleteProduct} 
                  onAdd={() => { setUploadMode('product'); setEditItem(null); setShowUpload(true); }}
                />
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {section === 'orders' && (
            <div style={{ maxWidth: 900 }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 24 }}>📦 <span style={{ color: 'var(--gold)' }}>{isTa ? 'ஆร்டர்கள்' : 'Orders'}</span></div>
              {dbOrders.length === 0 ? (
                <div style={{ ...S.panel, textAlign: 'center', padding: '60px 20px', background: 'var(--cream-dark)', border: '2px dashed var(--gold)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>🥡</div>
                  <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--brown-deep)', marginBottom: 8 }}>{isTa ? 'இன்னும் ஆர்டர்கள் எதுவும் இல்லை' : 'No Orders Yet'}</h3>
                  <p style={{ color: 'var(--brown-mid)', fontSize: '.85rem' }}>{isTa ? 'உங்கள் தயாரிப்புகளைப் பகிர்ந்து முதல் ஆர்டரைப் பெறுங்கள்!' : 'Share your products and get your first order today!'}</p>
                  <button style={{ ...S.btnPrimary, margin: '20px auto 0' }} onClick={() => setSection('marketing')}>{isTa ? 'விற்பனையை ஊக்குவிக்கவும்' : 'Promote Your Shop'}</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {dbOrders.map(o => (
                    <div key={o.id} style={{ ...S.panel, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--cream-dark)', display: 'grid', placeItems: 'center', fontSize: '1.4rem', border: '1.5px solid var(--parchment)' }}>📦</div>
                        <div>
                          <div style={{ fontSize: '.73rem', color: 'var(--brown-mid)', fontWeight: 600 }}>#ORD-{o.id} · {new Date(o.created_at).toLocaleDateString()}</div>
                          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--brown-deep)' }}>{o.items?.[0]?.product_name || 'Multiple Items'}</div>
                          <div style={{ fontSize: '.78rem', color: 'var(--brown-mid)' }}>{isTa ? 'வாடிக்கையாளர்' : 'Customer'}: <strong>{o.customer_name || 'Guest'}</strong></div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                        <div style={{ textAlign: 'right', minWidth: 100 }}>
                          <div style={{ fontSize: '.9rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 5 }}>₹{Number(o.total_price).toLocaleString()}</div>
                          <span style={{ 
                            ...S.statusBadge, 
                            background: o.status === 'delivered' ? '#d4edda' : o.status === 'ready' ? '#cce5ff' : o.status === 'assigned' ? '#e2e3e5' : '#fff3cd', 
                            color: o.status === 'delivered' ? '#155724' : o.status === 'ready' ? '#004085' : o.status === 'assigned' ? '#383d41' : '#856404' 
                          }}>{o.status.replace('_', ' ')}</span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: 8 }}>
                          {o.status === 'new' && (
                            <button onClick={() => updateOrderStatus(o.id, 'confirmed')} style={{ padding: '6px 12px', background: 'var(--brown-deep)', color: 'var(--gold-light)', border: 'none', borderRadius: 8, fontSize: '.7rem', fontWeight: 800, cursor: 'pointer' }}>
                              {isTa ? 'உறுதிப்படுத்து' : 'Confirm'}
                            </button>
                          )}
                          {(o.status === 'confirmed' || o.status === 'packed') && (
                            <button onClick={() => updateOrderStatus(o.id, 'ready')} style={{ padding: '6px 12px', background: 'var(--gold)', color: 'var(--brown-deep)', border: 'none', borderRadius: 8, fontSize: '.7rem', fontWeight: 800, cursor: 'pointer' }}>
                              {isTa ? 'தயார்' : 'Mark Ready'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── FESTIVALS ── */}
          {section === 'festivals' && (
            <div>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.8rem', fontWeight: 950, color: 'var(--brown-deep)', marginBottom: 30, display: 'flex', alignItems: 'center', gap: 15 }}>
                 <Sparkles size={28} color="var(--gold)" />
                 <span>{t('festivals')} <span style={{ color: 'var(--gold)' }}>2026</span></span>
              </div>
              <FestivalCalendar />
            </div>
          )}

          {/* ── MARKETING ── */}
          {section === 'marketing' && (
            <MarketingHub products={products} services={services} storeData={storeData} isTa={isTa} apiFetch={apiFetch} showToast={showToast} />
          )}

          {/* ── DELIVERIES ── */}
          {section === 'deliveries' && (
            <div>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 24 }}>🗺️ <span style={{ color: 'var(--gold)' }}>{isTa ? 'டெலிவரிகள்' : 'Deliveries'}</span></div>
              <div style={S.panel}>
                <div style={S.panelTitle}>📦 {isTa ? 'செயலில் உள்ள டெலிவரிகள்' : 'Active Deliveries'}</div>
                {(dbOrders.filter(o => ['Processing', 'Out for Delivery', 'Shipped'].includes(o.status)).length > 0) ? (
                  dbOrders.filter(o => ['Processing', 'Out for Delivery', 'Shipped'].includes(o.status)).map(d => {
                    const statusConfig = {
                      'Processing': { bg: '#fff3cd', col: '#856404' },
                      'Out for Delivery': { bg: '#cce5ff', col: '#004085' },
                      'Shipped': { bg: '#d4edda', col: '#155724' }
                    };
                    const cfg = statusConfig[d.status] || { bg: '#f8f9fa', col: '#333' };
                    return (
                      <div key={d.id} style={{ background: 'var(--cream)', border: '1.5px solid var(--parchment)', borderRadius: 8, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ fontSize: '1.5rem' }}>🛵</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-d)', fontSize: '.82rem', fontWeight: 700 }}>#ORD-{d.id} → {d.customer_name || 'Customer'}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--brown-mid)' }}>{d.items?.[0]?.product_name || (isTa ? 'பல பொருட்கள்' : 'Multiple items')} · {isTa ? 'ETA கணிக்கப்படுகிறது' : 'ETA Calculating...'}</div>
                        </div>
                        <span style={{ ...S.statusBadge, background: cfg.bg, color: cfg.col }}>{d.status}</span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--brown-mid)', fontStyle: 'italic' }}>
                    {isTa ? 'தற்போது டெலிவரிகள் எதுவும் இல்லை.' : 'No active deliveries at the moment.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {section === 'services' && (
            <ServiceManager 
              apiFetch={apiFetch} 
              isTa={isTa} 
              services={services}
              loading={loading}
              showToast={showToast} 
              onAdd={() => { setUploadMode('service'); setEditItem(null); setShowUpload(true); }}
              onDelete={deleteService}
              onEdit={(srv) => { 
                setUploadMode('service'); 
                setEditItem({ 
                  ...srv, 
                  desc: srv.description,
                  imgUrl: srv.image_url
                }); 
                setShowUpload(true); 
              }}
            />
          )}

          {/* ── BOOKINGS ── */}
          {section === 'bookings' && (
            <BookingsPanel apiFetch={apiFetch} isTa={isTa} showToast={showToast} />
          )}

          {/* ── SETTINGS (PROFILE) ── */}
          {section === 'settings' && (
            <div style={{ maxWidth: 850 }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 24 }}>🏪 <span style={{ color: 'var(--gold)' }}>{isTa ? 'கடை சுயவிவரம்' : 'Shop Profile'}</span></div>
              
              <div style={{ ...S.panel, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={S.panelTitle}>🏪 {isTa ? 'பொது விவரங்கள்' : 'General Details'}</h3>
                  <button 
                    onClick={() => setIsEditingProfile(!isEditingProfile)} 
                    style={{ ...S.btnPrimary, background: isEditingProfile ? 'var(--rust)' : 'var(--brown-deep)', border: 'none', padding: '6px 14px', fontSize: '.75rem' }}
                  >
                    {isEditingProfile ? (isTa ? 'ரத்து' : 'Cancel') : (isTa ? 'திருத்து' : 'Edit')}
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, opacity: isEditingProfile ? 1 : 0.7, pointerEvents: isEditingProfile ? 'all' : 'none' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '.7rem', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--brown-mid)', marginBottom: 4 }}>{isTa ? 'கடையின் பெயர்' : 'Store Name'}</label>
                    <input style={S.formInput} disabled={!isEditingProfile} value={storeEdit.name} onChange={e => setStoreEdit({...storeEdit, name: e.target.value})}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.7rem', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--brown-mid)', marginBottom: 4 }}>{isTa ? 'கடைக்காரர் பெயர்' : 'Shopkeeper Name'}</label>
                    <input style={S.formInput} disabled={!isEditingProfile} value={storeEdit.contact_name} onChange={e => setStoreEdit({...storeEdit, contact_name: e.target.value})}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.7rem', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--brown-mid)', marginBottom: 4 }}>{isTa ? 'தொடர்பு எண்' : 'Contact Number'}</label>
                    <input style={S.formInput} disabled={!isEditingProfile} value={storeEdit.phone} onChange={e => setStoreEdit({...storeEdit, phone: e.target.value})}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.7rem', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--brown-mid)', marginBottom: 4 }}>{isTa ? 'மாவட்டம்' : 'District'}</label>
                    <select style={S.formInput} disabled={!isEditingProfile} value={storeEdit.district} onChange={e => setStoreEdit({...storeEdit, district: e.target.value})}>
                      {TN_DISTRICTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.7rem', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--brown-mid)', marginBottom: 4 }}>{isTa ? 'கடை வகை' : 'Category'}</label>
                    <input style={S.formInput} disabled={!isEditingProfile} value={storeEdit.category} onChange={e => setStoreEdit({...storeEdit, category: e.target.value})}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '.7rem', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--brown-mid)', marginBottom: 4 }}>{isTa ? 'பின்கோடு' : 'Pincode'}</label>
                    <input style={S.formInput} disabled={!isEditingProfile} value={storeEdit.pincode} onChange={e => setStoreEdit({...storeEdit, pincode: e.target.value})}/>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '.7rem', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--brown-mid)', marginBottom: 4 }}>{isTa ? 'கடை முகவரி' : 'Store Address'}</label>
                    <textarea style={{ ...S.formInput, height: 80, resize: 'none' }} disabled={!isEditingProfile} value={storeEdit.location} onChange={e => setStoreEdit({...storeEdit, location: e.target.value})}/>
                  </div>
                </div>

                <div style={{ marginTop: 24, padding: 16, background: 'var(--cream-dark)', borderRadius: 10, border: '1.5px solid var(--parchment)', opacity: isEditingProfile ? 1 : 0.7, pointerEvents: isEditingProfile ? 'all' : 'none' }}>
                  <div style={{ fontSize: '.75rem', color: 'var(--brown-mid)', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>{isTa ? 'பிராண்டிங் (Logo & Banner)' : 'Store Branding'}</div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    {/* Logo Upload */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 80, height: 80, borderRadius: 12, border: '2px solid var(--gold)', background: 'var(--cream)', overflow: 'hidden', marginBottom: 8, position: 'relative' }}>
                        {storeEdit.logo ? <img src={URL.createObjectURL(storeEdit.logo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : (storeData?.logo ? <img src={storeData.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', fontSize: '2rem' }}>🏪</div>)}
                      </div>
                      <label style={{ ...S.btnPrimary, padding: '5px 10px', fontSize: '.65rem', display: 'inline-flex', opacity: isEditingProfile ? 1 : 0.5 }}>
                        {isTa ? 'லோகோ' : 'Logo'} <input type="file" hidden accept="image/*" disabled={!isEditingProfile} onChange={e => setStoreEdit({...storeEdit, logo: e.target.files[0]})}/>
                      </label>
                    </div>
                    {/* Banner Upload */}
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ height: 140, borderRadius: 12, border: '2px solid var(--parchment)', background: storeEdit.banner ? `url(${URL.createObjectURL(storeEdit.banner)}) center/cover no-repeat` : (storeData?.banner ? `url(${storeData.banner}) center/cover no-repeat` : 'var(--brown-deep)'), marginBottom: 8, opacity: isEditingProfile ? 1 : 0.6, boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)' }}></div>
                      <label style={{ ...S.btnPrimary, padding: '5px 10px', fontSize: '.65rem', display: 'inline-flex', opacity: isEditingProfile ? 1 : 0.5 }}>
                        {isTa ? 'பேனர்' : 'Banner'} <input type="file" hidden accept="image/*" disabled={!isEditingProfile} onChange={e => setStoreEdit({...storeEdit, banner: e.target.files[0]})}/>
                      </label>
                    </div>
                  </div>
                </div>

                {isEditingProfile && (
                  <button 
                    disabled={loading} 
                    style={{ ...S.btnPrimary, marginTop: 24, width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }} 
                    onClick={async () => {
                      await handleUpdateStore();
                      setIsEditingProfile(false);
                    }}
                  >
                    {loading ? (isTa ? 'சேமிக்கிறது...' : 'Saving...') : (isTa ? 'மாற்றங்களைச் சேமி' : 'Save Profile Changes')}
                  </button>
                )}
              </div>

              {/* ── Shop Capabilities Toggle ── */}
              <div style={{ ...S.panel, marginBottom: 24 }}>
                <h3 style={S.panelTitle}>🏪 {isTa ? 'கடை திறன்கள்' : 'Shop Capabilities'}</h3>
                <p style={{ fontSize: '.82rem', color: 'var(--brown-mid)', marginBottom: 16 }}>
                  {isTa ? 'உங்கள் கடை என்னென்ன வழங்குகிறது என்பதை தேர்வு செய்யவும். இது உங்கள் டாஷ்போர்டு மற்றும் வாடிக்கையாளர் பக்கத்தை மாற்றும்.' : 'Choose what your shop offers. This dynamically changes your dashboard and customer-facing store page.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { field: 'has_products', icon: '📦', label: isTa ? 'பொருட்கள்' : 'Products', sublabel: isTa ? 'சரக்கு, ஆர்டர்கள், டெலிவரிகள்' : 'Inventory, Orders, Deliveries', value: hasProducts },
                    { field: 'has_services', icon: '🧵', label: isTa ? 'சேவைகள்' : 'Services', sublabel: isTa ? 'புக்கிங்கள், அட்டவணை, வருமானம்' : 'Bookings, Scheduling, Earnings', value: hasServices },
                  ].map(({ field, icon, label, sublabel, value }) => (
                    <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: value ? 'rgba(201,146,26,.06)' : 'var(--cream-dark)', borderRadius: 10, border: `2px solid ${value ? 'var(--gold)' : 'var(--parchment)'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--brown-deep)', fontSize: '.95rem' }}>{label}</div>
                          <div style={{ fontSize: '.73rem', color: 'var(--brown-mid)' }}>{sublabel}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCapability(field, !value)}
                        style={{ width: 52, height: 28, borderRadius: 14, background: value ? 'var(--gold)' : '#ccc', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .3s', flexShrink: 0 }}
                        title={value ? 'Click to disable' : 'Click to enable'}
                      >
                        <span style={{ position: 'absolute', top: 4, left: value ? 28 : 4, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .3s', display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
                      </button>
                    </div>
                  ))}
                </div>
                {!hasProducts && !hasServices && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff3cd', borderRadius: 8, fontSize: '.8rem', color: '#856404', fontWeight: 600 }}>
                    ⚠️ {isTa ? 'குறைந்தது ஒரு திறனை இயக்கவும்.' : 'Please enable at least one capability.'}
                  </div>
                )}
              </div>

              <div style={{ ...S.panel, marginBottom: 24 }}>
                <h3 style={S.panelTitle}>🔔 {isTa ? 'அறிவிப்பு விருப்பத்தேர்வுகள்' : 'Notification Preferences'}</h3>
                {['Order Alerts', 'Inventory Warnings', 'AI Marketing Suggestions'].map(l => <ToggleSwitch key={l} label={l}/>)}
              </div>
              
              {/* ── Danger Zone ── */}
              <div style={{ ...S.panel, marginBottom: 24, border: '1.5px solid var(--rust)', background: '#fff9f9' }}>
                <h3 style={{ ...S.panelTitle, color: 'var(--rust)' }}>⚠️ {isTa ? 'அபாய பகுதி' : 'Danger Zone'}</h3>
                <p style={{ fontSize: '.82rem', color: 'var(--brown-mid)', marginBottom: 16 }}>
                  {isTa ? 'உங்கள் கணக்கை நீக்கினால், உங்கள் கடை, பொருட்கள் மற்றும் சேவைகள் நிரந்தரமாக நீக்கப்படும். இந்த செயலை ரத்து செய்ய முடியாது.' : 'Deleting your account will permanently remove your store, products, and services from Kadai Connect. This action cannot be undone.'}
                </p>
                <button onClick={async () => {
                  if (window.confirm(isTa ? 'நிச்சயமாக உங்கள் கணக்கை நீக்க வேண்டுமா? இந்த செயலை ரத்து செய்ய முடியாது.' : 'Are you sure you want to delete your account? This action cannot be undone.')) {
                    try {
                      const res = await apiFetch('/api/users/delete-account/', { method: 'DELETE' });
                      if (res?.ok) {
                        alert(isTa ? 'உங்கள் கணக்கு வெற்றிகரமாக நீக்கப்பட்டது.' : 'Your account was successfully deleted.');
                        logout();
                        navigate('/login');
                      } else {
                        showToast(isTa ? 'கணக்கை நீக்க முடியவில்லை' : 'Failed to delete account');
                      }
                    } catch (e) {
                      showToast('Error deleting account');
                    }
                  }
                }} style={{ ...S.btnPrimary, background: 'var(--rust)', border: 'none', width: '100%', justifyContent: 'center' }}>
                  <Trash2 size={18} /> {isTa ? 'கணக்கை நீக்கு' : 'Delete Account'}
                </button>
              </div>

              <button onClick={logout} style={{ ...S.btnPrimary, background: 'var(--brown-mid)', border: 'none', width: '100%', justifyContent: 'center' }}>
                <LogOut size={18} /> {t('logout')}
              </button>
            </div>
          )}
        </div>
      </main>

      {showUpload && (
        <UploadModal 
          mode={uploadMode}
          onClose={() => { setShowUpload(false); setEditItem(null); }} 
          onSave={uploadMode === 'service' ? handleSaveService : handleSaveProduct} 
          editItem={editItem}
          showToast={showToast}
        />
      )}
      <Toast msg={toast.msg} visible={toast.visible}/>

      {/* BOTTOM NAV (Mobile) */}
      <nav className="db-bottom-nav">
        {[
          { key: 'dashboard', icon: '📊', label: isTa ? 'முகப்பு' : 'Home' },
          { key: 'products', icon: '🛍️', label: isTa ? 'பொருட்கள்' : 'Items' },
          { key: 'orders', icon: '📦', label: isTa ? 'ஆர்டர்கள்' : 'Orders' },
          { key: 'marketing', icon: '📣', label: isTa ? 'விளம்பரம்' : 'Promo' },
        ].map(n => (
          <button key={n.key} className={section === n.key ? 'active' : ''} onClick={() => setSection(n.key)}>
            <span>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function ProductGrid({ products, onEdit, onDelete, onAdd }) {
  const { i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginTop: 8 }}>
      {products.map(p => (
        <div key={p.id} style={{ background: 'var(--cream)', border: '1.5px solid var(--parchment)', borderRadius: 8, overflow: 'hidden', boxShadow: '2px 3px 10px var(--shadow)', transition: '.25s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '4px 8px 20px var(--shadow)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '2px 3px 10px var(--shadow)'; }}>
          <div style={{ height: 160, background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--parchment)', fontSize: '2.8rem', overflow: 'hidden' }}>
            {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }}/> : (p.imgUrl ? <img src={p.imgUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }}/> : p.emoji || (p.category === 'Services' ? '✂️' : '📦'))}
          </div>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '.78rem', fontWeight: 700, color: 'var(--brown-deep)' }}>{isTa ? (p.name_ta || p.name) : p.name}</div>
            <div style={{ fontSize: '.65rem', color: 'var(--brown-mid)', marginTop: 2, lineHeight: 1.4, height: '2.8em', overflow: 'hidden' }}>{isTa ? (p.description_ta || p.description || p.desc_ta || p.desc) : (p.description || p.desc)}</div>
            <div style={{ fontSize: '.76rem', color: 'var(--gold)', marginTop: 3, fontWeight: 600 }}>₹{p.price?.toLocaleString()}</div>
            <div style={{ fontSize: '.63rem', color: 'var(--brown-light)', marginTop: 3 }}>{isTa ? 'இருப்பு' : 'Stock'}: {p.stock} {p.size ? '· ' + p.size : ''}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button onClick={() => onEdit(p)} style={{ flex: 1, padding: 5, border: '1.5px solid var(--gold)', borderRadius: 4, background: 'transparent', fontSize: '.62rem', fontFamily: 'var(--font-d)', color: 'var(--gold)', cursor: 'pointer' }}>{isTa ? '✏️ திருத்து' : '✏️ Edit'}</button>
              <button onClick={() => onDelete(p.id)} style={{ padding: '5px 8px', border: '1.5px solid var(--rust)', borderRadius: 4, background: 'transparent', fontSize: '.62rem', color: 'var(--rust)', cursor: 'pointer' }}>🗑</button>
            </div>
          </div>
        </div>
      ))}
      <div onClick={onAdd} style={{ border: '2px dashed var(--gold)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 180, fontSize: '.8rem', color: 'var(--brown-mid)', background: 'transparent', borderRadius: 8, transition: '.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-pale)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>＋</div>
        <div>{isTa ? 'புதிய பொருளைச் சேர்' : 'Add New Product'}</div>
      </div>
    </div>
  );
}

function ToggleSwitch({ label }) {
  const [on, setOn] = useState(true);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--parchment)' }}>
      <span style={{ fontSize: '.82rem', color: 'var(--brown)' }}>{label}</span>
      <button onClick={() => setOn(o => !o)} style={{ width: 44, height: 24, borderRadius: 12, background: on ? 'var(--green)' : 'var(--parchment)', border: 'none', cursor: 'pointer', position: 'relative', transition: '.3s' }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: '.3s', display: 'block' }}/>
      </button>
    </div>
  );
}
