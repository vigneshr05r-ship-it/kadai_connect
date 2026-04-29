import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

// ------ MODAL COMPONENT ------
const Modal = ({ role, title, icon, onClose, onLogin, apiFetch }) => {
  const [tab, setTab] = useState('login');
  const [forgotStep, setForgotStep] = useState('input'); // 'input', 'confirm_demo', 'otp', 'reset'
  const [isDemo, setIsDemo] = useState(false);
  const [form, setForm] = useState({ 
    email: '', password: '', name: '', phone: '', address: '', district: 'Chennai',
    store_name: '', store_category: 'Textiles & Sarees', pincode: '',
    vehicle_type: 'Motorcycle', vehicle_reg_no: '', license_number: '',
    logoFile: null, bannerFile: null,
    otp: '', newPassword: '', confirmPassword: ''
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const handleForgotSubmit = async () => {
    if (!form.email) { showMsg('error', 'Email or Phone is required.'); return; }
    setLoading(true);
    try {
      const resp = await apiFetch('/api/users/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const data = await resp.json();
      if (data.status === 'user_found') {
        setForgotStep('otp');
        setIsDemo(false);
        setTimer(60);
      } else if (data.status === 'demo_suggested') {
        setForgotStep('confirm_demo');
      } else {
        showMsg('error', data.error || 'Something went wrong.');
      }
    } catch (e) {
      showMsg('error', 'Server error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!form.otp) { showMsg('error', 'Please enter OTP.'); return; }
    setLoading(true);
    try {
      const resp = await apiFetch('/api/users/verify-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: form.otp, is_demo: isDemo })
      });
      if (resp.ok) {
        setForgotStep('reset');
      } else {
        const data = await resp.json();
        showMsg('error', data.error || 'Invalid OTP.');
      }
    } catch (e) {
      showMsg('error', 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (form.newPassword !== form.confirmPassword) { showMsg('error', 'Passwords do not match.'); return; }
    if (form.newPassword.length < 6) { showMsg('error', 'Password too short.'); return; }
    setLoading(true);
    try {
      const resp = await apiFetch('/api/users/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: form.otp, password: form.newPassword, is_demo: isDemo })
      });
      if (resp.ok) {
        showMsg('success', 'Password reset successful!');
        setTimeout(() => setTab('login'), 1500);
      } else {
        const data = await resp.json();
        showMsg('error', data.error || 'Reset failed.');
      }
    } catch (e) {
      showMsg('error', 'Server error.');
    } finally {
      setLoading(false);
    }
  };

  // Timer logic for resend
  React.useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleLogin = async () => {
    if (!form.email || !form.password) { showMsg('error', 'Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const resp = await apiFetch('/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.email, password: form.password })
      });
      const data = await resp.json();
      if (resp.ok) {
        const userResp = await apiFetch('/api/users/me/', {
          headers: { 'Authorization': `Bearer ${data.access}` }
        });
        
        if (!userResp.ok) throw new Error('Failed to fetch profile');
        const profile = await userResp.json();
        const userRole = profile?.role || 'customer';
        if (userRole !== role) {
          throw new Error(`Unauthorized: This account is registered as a ${userRole}. Please use the ${userRole === 'shopkeeper' ? 'Shopkeeper' : userRole === 'delivery' ? 'Delivery' : 'Customer'} portal.`);
        }
        
        showMsg('success', 'Login successful! Redirecting…');
        setTimeout(() => onLogin({ 
          ...profile,
          name: profile?.name || profile?.first_name || profile?.username || form.email, 
          email: profile?.email || form.email, 
          role: userRole
        }, data.access, role), 900);
      } else {
        showMsg('error', data.detail || 'Invalid credentials.');
      }
    } catch (err) {
      showMsg('error', err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.email || !form.password) { showMsg('error', 'Please fill all fields.'); return; }
    if (form.password.length < 6) { showMsg('error', 'Password must be at least 6 characters.'); return; }
    setLoading(true);
    const payload = new FormData();
    payload.append('username', form.email);
    payload.append('email', form.email);
    payload.append('password', form.password);
    payload.append('role', role);
    payload.append('phone', form.phone);
    payload.append('name', form.name); 
    payload.append('address', form.address);
    payload.append('district', form.district);
    if (role === 'shopkeeper') {
      payload.append('store_name', form.store_name);
      payload.append('store_category', form.store_category);
      payload.append('pincode', form.pincode);
      if (form.logoFile) payload.append('logo', form.logoFile);
      if (form.bannerFile) payload.append('banner', form.bannerFile);
    }
    if (role === 'delivery') {
      payload.append('vehicle_type', form.vehicle_type);
      payload.append('vehicle_reg_no', form.vehicle_reg_no);
      payload.append('license_number', form.license_number);
    }

    try {
      const resp = await apiFetch('/api/users/', {
        method: 'POST',
        body: payload
      });
      const data = await resp.json();
      if (resp.ok) {
        showMsg('success', 'Account created! Logging in…');
        handleLogin();
      } else {
        const errText = typeof data === 'object' ? Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(', ') : JSON.stringify(data);
        showMsg('error', `Registration failed: ${errText}`);
      }
    } catch (e) {
      showMsg('error', 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['login', 'register'];
  const tabLabels = { 
    shopkeeper: ['Login', 'Register Store'], 
    customer: ['Login', 'Join Us'], 
    delivery: ['Login', 'Partner Up'] 
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(43,21,5,.75)',
      backdropFilter: 'blur(10px)', zIndex: 6000, display: 'grid', placeItems: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} className="vintage-card" style={{
        padding: '48px 40px', maxWidth: 480, width: '100%',
        position: 'relative', maxHeight: '92vh', overflowY: 'auto',
        borderWidth: '3px', borderRadius: '40px'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 24, right: 28, background: 'var(--parchment)', border: 'none',
          width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', cursor: 'pointer', color: 'var(--brown-deep)', fontWeight: 900
        }}>✕</button>

        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 8 }}>
          {icon} {title}
        </div>
        <div style={{ fontSize: '.95rem', color: 'var(--brown-mid)', marginBottom: 32, fontWeight: 600 }}>
          {role === 'shopkeeper' ? 'Manage your shop and orders' :
           role === 'customer' ? 'Shop from local stores near you' : 'Manage your deliveries'}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 0, marginBottom: 32,
          background: 'var(--parchment)', padding: 6, borderRadius: 20,
        }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '14px 10px', textAlign: 'center', cursor: 'pointer',
              fontFamily: 'var(--font-d)', fontSize: '.9rem', fontWeight: 900, border: 'none',
              transition: '.3s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: 16,
              background: tab === t ? 'var(--brown-deep)' : 'transparent',
              color: tab === t ? 'var(--gold-light)' : 'var(--brown-mid)',
            }}>{tabLabels[role][i]}</button>
          ))}
        </div>

        {/* Message */}
        {msg.text && (
          <div style={{
            padding: '14px 18px', borderRadius: 16, fontSize: '.85rem', marginBottom: 20,
            background: msg.type === 'success' ? 'var(--green-light)' : 'var(--rust)',
            color: '#fff', fontWeight: 800, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>{msg.text}</div>
        )}

        {/* LOGIN TAB */}
        {tab === 'login' && (
          <div>
            <FormGroup label="Email">
              <input className="vintage-input" type="text" placeholder="" autoComplete="off"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
            </FormGroup>
            <FormGroup 
              label="Password" 
              rightLabel={<span onClick={() => setTab('forgot')} style={{ fontSize: '.75rem', color: 'var(--gold)', cursor: 'pointer', fontWeight: 800 }}>Forgot password?</span>}
            >
              <input className="vintage-input" type="password" placeholder="" autoComplete="new-password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/>
            </FormGroup>
            <button className="vintage-btn-primary" style={{ width: '100%', marginTop: 12, padding: 18 }} onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in…' : `Login as ${role === 'shopkeeper' ? 'Shopkeeper' : role === 'delivery' ? 'Delivery' : 'Customer'}`}
            </button>
          </div>
        )}

        {/* FORGOT PASSWORD TAB */}
        {tab === 'forgot' && (
          <div>
            {forgotStep === 'input' && (
              <>
                <div style={{ fontSize: '.9rem', color: 'var(--brown-mid)', marginBottom: 20, fontStyle: 'italic', fontWeight: 600 }}>Enter your identity to receive a verification code.</div>
                <FormGroup label="Email / Phone">
                  <input className="vintage-input" type="text" placeholder="Identity" autoFocus
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
                </FormGroup>
                <button className="vintage-btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={handleForgotSubmit} disabled={loading}>{loading ? 'Seeking…' : 'Send Code →'}</button>
              </>
            )}

            {forgotStep === 'confirm_demo' && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>📜</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 8, fontFamily: 'var(--font-d)' }}>Record Not Found</div>
                <div style={{ fontSize: '.9rem', color: 'var(--brown-mid)', marginBottom: 24, fontStyle: 'italic' }}>This identity is not recorded in our archives. Explore as a <strong>Guest Witness</strong> instead?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button className="vintage-btn-primary" onClick={() => { setIsDemo(true); setForgotStep('otp'); }}>Witness in Demo Mode</button>
                  <button style={{ background: 'none', border: 'none', color: 'var(--brown-mid)', fontWeight: 800, cursor: 'pointer' }} onClick={() => setForgotStep('input')}>Back to Search</button>
                </div>
              </div>
            )}

            {forgotStep === 'otp' && (
              <>
                {isDemo && (
                  <div className="vintage-tag" style={{ width: '100%', textAlign: 'center', marginBottom: 20, padding: 10 }}>
                    🛠️ Demo Key: <strong>123456</strong>
                  </div>
                )}
                <div style={{ fontSize: '.9rem', color: 'var(--brown-mid)', marginBottom: 20, fontStyle: 'italic', fontWeight: 600 }}>Enter the 6-digit code sent to your archive.</div>
                <FormGroup label="Verification Code">
                  <input className="vintage-input" style={{ textAlign: 'center', letterSpacing: 12, fontSize: '1.5rem', fontWeight: 900 }} 
                    type="text" maxLength={6} placeholder="------" autoFocus
                    value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })}/>
                </FormGroup>
                <button className="vintage-btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={handleVerifyOtp} disabled={loading}>{loading ? 'Verifying…' : 'Verify Code →'}</button>
              </>
            )}

            {forgotStep === 'reset' && (
              <>
                <div style={{ fontSize: '.9rem', color: 'var(--brown-mid)', marginBottom: 20, fontStyle: 'italic', fontWeight: 600 }}>Archive verified! Set your new secure secret.</div>
                <FormGroup label="New Secret">
                  <input className="vintage-input" type="password" placeholder="" autoFocus
                    value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })}/>
                </FormGroup>
                <FormGroup label="Confirm Secret">
                  <input className="vintage-input" type="password" placeholder=""
                    value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}/>
                </FormGroup>
                <button className="vintage-btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={handleResetPassword} disabled={loading}>{loading ? 'Securing…' : 'Finalize & Enter →'}</button>
              </>
            )}

            <div style={{ marginTop: 24, textAlign: 'center', borderTop: '2px solid var(--parchment)', paddingTop: 20 }}>
              <span onClick={() => { setTab('login'); setForgotStep('input'); }} style={{ fontSize: '.85rem', color: 'var(--brown-mid)', cursor: 'pointer', fontWeight: 800 }}>← Return to Login</span>
            </div>
          </div>
        )}

        {/* REGISTER TAB */}
        {tab === 'register' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FormGroup label="Full Name"><input className="vintage-input" placeholder="" autoComplete="off" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></FormGroup>
            <FormGroup label="Phone"><input className="vintage-input" type="tel" placeholder="" autoComplete="off" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/></FormGroup>
            <FormGroup label="Email"><input className="vintage-input" type="email" placeholder="" autoComplete="off" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></FormGroup>
            <FormGroup label="Address"><input className="vintage-input" placeholder="" autoComplete="off" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}/></FormGroup>
            <FormGroup label="District">
              <select className="vintage-input" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}>
                {TN_DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Password"><input className="vintage-input" type="password" placeholder="" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/></FormGroup>
            
            {role === 'shopkeeper' && (
              <div style={{ marginTop: 20, padding: 24, background: 'var(--parchment)', borderRadius: 24, border: '2px solid var(--gold-pale)' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 20, color: 'var(--brown-deep)' }}>Shop Details</div>
                <FormGroup label="Shop Name"><input className="vintage-input" placeholder="" value={form.store_name} onChange={e => setForm({...form, store_name: e.target.value})}/></FormGroup>
                <FormGroup label="Category">
                  <input className="vintage-input" placeholder="" value={form.store_category} onChange={e => setForm({...form, store_category: e.target.value})}/>
                </FormGroup>
                <FormGroup label="Pincode"><input className="vintage-input" placeholder="" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})}/></FormGroup>
              </div>
            )}
            
            <button className="vintage-btn-primary" style={{ width: '100%', marginTop: 20, padding: 18 }} onClick={handleRegister} disabled={loading}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </div>
        )}

        <div style={{ marginTop: 24, fontSize: '.9rem', color: 'var(--brown-mid)', textAlign: 'center', fontWeight: 600 }}>
          {tab === 'login' && <span>New to the Bazaar? <span onClick={() => setTab('register')} style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 900 }}>Join Us →</span></span>}
          {tab === 'register' && <span>Already an Initiate? <span onClick={() => setTab('login')} style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 900 }}>Login →</span></span>}
        </div>
      </div>
    </div>
  );
};

const FormGroup = ({ label, children, rightLabel }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
      <label style={{ fontSize: '.72rem', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--brown-mid)' }}>{label}</label>
      {rightLabel}
    </div>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', maxWidth: '100%', padding: '11px 14px', border: '1.5px solid var(--parchment)',
  borderRadius: 4, background: 'var(--cream-dark)', fontFamily: 'var(--font-b)',
  fontSize: '.92rem', color: 'var(--brown-deep)', outline: 'none',
  boxSizing: 'border-box', appearance: 'none', // Prevents default styling issues
};

const submitBtn = {
  width: '100%', padding: 13, background: 'var(--brown-deep)', color: 'var(--gold-light)',
  border: '2px solid var(--gold)', borderRadius: 4, fontFamily: 'var(--font-d)',
  fontWeight: 700, fontSize: '.95rem', cursor: 'pointer', marginTop: 8,
};

const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 
  'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 
  'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 
  'Viluppuram', 'Virudhunagar'
];

// ------ PRODUCTS (Floating Cards) ------
const PRODUCTS = [
  { emoji: '👗', label: 'Silk Saree', price: '₹2,499', badge: 'Diwali Pick' },
  { emoji: '🪔', label: 'Brass Lamp', price: '₹549', badge: 'Trending 🔥' },
  { emoji: '🌸', label: 'Jasmine Mala', price: '₹80', badge: 'Festival Top' },
  { emoji: '🍚', label: 'Ponni Rice', price: '₹420', badge: 'Pongal Pick' },
  { emoji: '🧵', label: 'Cotton Fabric', price: '₹180', badge: 'Aadi Sale' },
  { emoji: '🫙', label: 'Pickle Jar', price: '₹160', badge: 'Home Store' },
  { emoji: '🎆', label: 'Sparklers', price: '₹120', badge: 'Diwali 🎇' },
  { emoji: '🎁', label: 'Gift Box', price: '₹720', badge: 'Premium' },
];

const FEATURES = [
  '🎉 Festival Demand AI', '🧠 Smart Recommendations', '🗺️ Route Optimisation',
  '📸 Vision Product Tagging', '🎤 Voice Assistant', '🌐 Tamil + English',
  '✂️ Service Booking', '📱 Hyperlocal Commerce',
];

// ------ MAIN LOGIN / LANDING PAGE ------
const Login = () => {
  const { login, apiFetch } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [openModal, setOpenModal] = useState(null); // 'shopkeeper' | 'customer' | 'delivery'
  const lang = i18n.language.startsWith('ta') ? 'ta' : 'en';

  const LANG = {
    en: {
      sup: 'Tamil Nadu Hyperlocal Commerce',
      main: <>Your Local <span style={{ color: 'var(--gold)' }}>Kadai</span>,<br/>Now Powered by <span style={{ color: 'var(--gold)' }}>AI</span></>,
      sub: 'Connect with local shops, services, and delivery partners. Smart ordering, localized service booking, and fast delivery.',
      shop: 'Shopkeeper Portal', cust: 'Customer Portal', del: 'Delivery Portal',
    },
    ta: {
      sup: 'தமிழ்நாடு ஹைப்பர்லோகல் காமர்ஸ்',
      main: <>உங்கள் உள்ளூர் <span style={{ color: 'var(--gold)' }}>கடை</span>,<br/>இப்போது <span style={{ color: 'var(--gold)' }}>AI</span> உடன்</>,
      sub: 'உள்ளூர் கடைகள், சேவைகள் மற்றும் டெலிவரி கூட்டாளர்களுடன் இணையுங்கள்.',
      shop: 'கடைக்காரர் நுழைவு', cust: 'வாடிக்கையாளர் சந்தை', del: 'டெலிவரி',
    },
  }[lang];

  const toggleLang = (l) => i18n.changeLanguage(l);

  const handleLogin = (userData, accessToken, portalRole) => {
    login(userData, accessToken);
    setOpenModal(null);
    if (userData.role === 'shopkeeper') navigate('/shopkeeper');
    else if (userData.role === 'delivery') navigate('/delivery');
    else navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', position: 'relative' }}>
      {/* Top Bar */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, display: 'flex', gap: 10 }}>
        <div style={{ background: 'var(--parchment)', padding: 4, borderRadius: 12, display: 'flex', border: '1px solid var(--parchment)' }}>
          {['en', 'ta'].map(l => (
            <button key={l} onClick={() => toggleLang(l)} style={{ 
              padding: '6px 14px', borderRadius: 10, border: 'none', 
              background: i18n.language.startsWith(l) ? 'var(--brown-deep)' : 'transparent', 
              color: i18n.language.startsWith(l) ? 'var(--gold-light)' : 'var(--brown-mid)', 
              fontSize: '.75rem', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase'
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 20px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 800 }}>
          <span style={{ fontSize: '.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 800, marginBottom: 16, display: 'block' }}>{LANG.sup}</span>
          
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 900, lineHeight: 1.2, color: 'var(--brown-deep)', marginBottom: 20 }}>{LANG.main}</h1>
          
          <p style={{ fontSize: '1.1rem', color: 'var(--brown-mid)', lineHeight: 1.5, maxWidth: 600, margin: '0 auto 40px', fontWeight: 600 }}>{LANG.sub}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <CtaBtn onClick={() => setOpenModal('shopkeeper')} variant="primary" icon="🏪">{LANG.shop}</CtaBtn>
            <CtaBtn onClick={() => setOpenModal('customer')} variant="accent" icon="🛍️">{LANG.cust}</CtaBtn>
            <CtaBtn onClick={() => setOpenModal('delivery')} variant="secondary" icon="🛵">{LANG.del}</CtaBtn>
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, maxWidth: 1000, width: '100%', marginTop: 80 }}>
           {[
             { title: 'Local Shopping', desc: 'Buy from your favourite neighbourhood stores.', icon: '🛒' },
             { title: 'Fast Delivery', desc: 'Get items delivered to your doorstep in minutes.', icon: '⚡' },
             { title: 'Service Booking', desc: 'Book skilled professionals for your home needs.', icon: '🛠️' },
           ].map((f, i) => (
             <div key={i} style={{ padding: 30, background: '#fff', borderRadius: 24, border: '1.5px solid var(--parchment)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
               <div style={{ fontSize: '2rem', marginBottom: 16 }}>{f.icon}</div>
               <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brown-deep)', marginBottom: 10 }}>{f.title}</h3>
               <p style={{ color: 'var(--brown-mid)', lineHeight: 1.4, fontSize: '.9rem', fontWeight: 600 }}>{f.desc}</p>
             </div>
           ))}
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '40px 20px', borderTop: '1px solid var(--parchment)', fontSize: '.8rem', color: 'var(--brown-mid)', fontWeight: 600 }}>
        © 2025 KadaiConnect · Hyperlocal eCommerce Platform · Tamil Nadu
      </footer>

      {/* Modals */}
      {openModal && (
        <Modal role={openModal} title={LANG[openModal === 'shopkeeper' ? 'shop' : openModal === 'customer' ? 'cust' : 'del']} 
          icon={openModal === 'shopkeeper' ? '🏪' : openModal === 'customer' ? '🛍️' : '🛵'}
          onClose={() => setOpenModal(null)} onLogin={handleLogin} apiFetch={apiFetch}/>
      )}
    </div>
  );
};

const CtaBtn = ({ children, onClick, variant, icon }) => {
  const styles = {
    primary: { background: 'var(--brown-deep)', color: 'var(--gold-light)', borderColor: 'var(--gold)' },
    secondary: { background: 'transparent', color: 'var(--brown-deep)', borderColor: 'var(--brown-mid)' },
    accent: { background: 'var(--gold)', color: 'var(--brown-deep)', borderColor: 'var(--brown-mid)' },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} style={{
       display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: '.95rem', fontWeight: 800,
       padding: '14px 28px', borderRadius: 14, border: '2px solid', cursor: 'pointer', transition: '.2s', ...s
    }}>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span> {children}
    </button>
  );
};

export default Login;
