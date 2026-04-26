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
        // Fetch the REAL profile from /api/users/me/ (much safer than list filter)
        const userResp = await apiFetch('/api/users/me/', {
          headers: { 'Authorization': `Bearer ${data.access}` }
        });
        
        if (!userResp.ok) throw new Error('Failed to fetch profile');
        
        const profile = await userResp.json();
        
        // --- STRICT ROLE VERIFICATION ---
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
        // Auto-login after register
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
    customer: ['Login', 'Sign Up'], 
    delivery: ['Login', 'Sign Up'] 
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(43,21,5,.65)',
      backdropFilter: 'blur(4px)', zIndex: 6000, display: 'grid', placeItems: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--cream)', border: '2px solid var(--gold)', borderRadius: 10,
        padding: window.innerWidth < 480 ? '24px 20px' : '36px 40px', 
        maxWidth: 440, width: 'calc(100% - 32px)',
        boxShadow: '8px 8px 0 var(--brown-deep)', position: 'relative',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 16, background: 'none', border: 'none',
          fontSize: '1.3rem', cursor: 'pointer', color: 'var(--brown-mid)',
        }}>✕</button>

        <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.4rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 4 }}>
          {icon} {title}
        </div>
        <div style={{ fontSize: '.83rem', color: 'var(--brown-mid)', fontStyle: 'italic', marginBottom: 20 }}>
          {role === 'shopkeeper' ? 'Manage your store with AI-powered insights' :
           role === 'customer' ? 'Discover local stores near you' : 'View and manage your deliveries'}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 0, marginBottom: 20,
          border: '1.5px solid var(--parchment)', borderRadius: 6, overflow: 'hidden',
        }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px 8px', textAlign: 'center', cursor: 'pointer',
              fontFamily: 'var(--font-d)', fontSize: '.78rem', fontWeight: 700, border: 'none',
              transition: '.2s',
              background: tab === t ? 'var(--brown-deep)' : 'var(--cream-dark)',
              color: tab === t ? 'var(--gold-light)' : 'var(--brown-mid)',
            }}>{tabLabels[role][i]}</button>
          ))}
        </div>

        {/* Message */}
        {msg.text && (
          <div style={{
            padding: '10px 14px', borderRadius: 6, fontSize: '.82rem', marginBottom: 14,
            background: msg.type === 'success' ? '#d4edda' : '#f8d7da',
            color: msg.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${msg.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}>{msg.text}</div>
        )}

        {/* LOGIN TAB */}
        {tab === 'login' && (
          <div>
            <FormGroup label="Phone / Email">
              <input style={inputStyle} type="text" placeholder="" autoComplete="off"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
            </FormGroup>
            <FormGroup 
              label="Password" 
              rightLabel={<span onClick={() => setTab('forgot')} style={{ fontSize: '.72rem', color: 'var(--gold)', cursor: 'pointer', textDecoration: 'underline' }}>Forgot Password?</span>}
            >
              <input style={inputStyle} type="password" placeholder="" autoComplete="new-password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/>
            </FormGroup>
            <button style={submitBtn} onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in…' : `Login & Enter ${role === 'shopkeeper' ? 'Dashboard' : 'Portal'} →`}
            </button>
          </div>
        )}

        {/* FORGOT PASSWORD TAB (MULTI-STEP) */}
        {tab === 'forgot' && (
          <div>
            {forgotStep === 'input' && (
              <>
                <div style={{ fontSize: '.82rem', color: 'var(--brown-mid)', marginBottom: 14 }}>Enter your registered email or phone to receive an OTP.</div>
                <FormGroup label="Email / Phone">
                  <input style={inputStyle} type="text" placeholder="Email or Phone" autoFocus
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
                </FormGroup>
                <button style={submitBtn} onClick={handleForgotSubmit} disabled={loading}>{loading ? 'Checking…' : 'Send OTP →'}</button>
              </>
            )}

            {forgotStep === 'confirm_demo' && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>💡</div>
                <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--brown-deep)', marginBottom: 8 }}>Account Not Found</div>
                <div style={{ fontSize: '.82rem', color: 'var(--brown-mid)', marginBottom: 20 }}>This email/phone is not registered. Would you like to continue in <strong>Demo Mode</strong>?</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={{ ...submitBtn, background: 'var(--gold)', color: 'var(--brown-deep)', border: 'none', marginTop: 0 }} 
                    onClick={() => { setIsDemo(true); setForgotStep('otp'); }}>Continue in Demo Mode</button>
                  <button style={{ ...submitBtn, background: 'transparent', color: 'var(--brown-mid)', border: '1.5px solid var(--parchment)', marginTop: 0 }} 
                    onClick={() => setForgotStep('input')}>Back</button>
                </div>
              </div>
            )}

            {forgotStep === 'otp' && (
              <>
                {isDemo && (
                  <div style={{ background: 'var(--gold-pale)', border: '1px solid var(--gold)', padding: 10, borderRadius: 6, marginBottom: 14, fontSize: '.75rem', textAlign: 'center', color: 'var(--brown-deep)' }}>
                    🛠️ <strong>Demo Mode Enabled</strong><br/>Use OTP: <strong>123456</strong>
                  </div>
                )}
                <div style={{ fontSize: '.82rem', color: 'var(--brown-mid)', marginBottom: 14 }}>Enter the 6-digit OTP sent to <strong>{form.email}</strong></div>
                <FormGroup label="Enter OTP">
                  <input style={{ ...inputStyle, textAlign: 'center', letterSpacing: 8, fontSize: '1.2rem', fontWeight: 800 }} 
                    type="text" maxLength={6} placeholder="------" autoFocus
                    value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })}/>
                </FormGroup>
                <button style={submitBtn} onClick={handleVerifyOtp} disabled={loading}>{loading ? 'Verifying…' : 'Verify OTP →'}</button>
                
                <div style={{ marginTop: 16, textAlign: 'center', fontSize: '.75rem', color: 'var(--brown-mid)' }}>
                  {timer > 0 ? `Resend OTP in ${timer}s` : <span onClick={handleForgotSubmit} style={{ color: 'var(--gold)', cursor: 'pointer', textDecoration: 'underline' }}>Resend OTP</span>}
                </div>
              </>
            )}

            {forgotStep === 'reset' && (
              <>
                <div style={{ fontSize: '.82rem', color: 'var(--brown-mid)', marginBottom: 14 }}>OTP Verified! Now set your new secure password.</div>
                <FormGroup label="New Password">
                  <input style={inputStyle} type="password" placeholder="" autoFocus
                    value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })}/>
                </FormGroup>
                <FormGroup label="Confirm Password">
                  <input style={inputStyle} type="password" placeholder=""
                    value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}/>
                </FormGroup>
                <button style={submitBtn} onClick={handleResetPassword} disabled={loading}>{loading ? 'Saving…' : 'Reset Password & Login →'}</button>
              </>
            )}

            <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1.5px solid var(--parchment)', paddingTop: 16 }}>
              <span onClick={() => { setTab('login'); setForgotStep('input'); }} style={{ fontSize: '.75rem', color: 'var(--brown-mid)', cursor: 'pointer' }}>← Back to Login</span>
            </div>
          </div>
        )}

        {/* REGISTER TAB */}
        {tab === 'register' && (
          <div>
            <FormGroup label="Full Name"><input style={inputStyle} placeholder="" autoComplete="off" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></FormGroup>
            <FormGroup label="Phone"><input style={inputStyle} type="tel" placeholder="" autoComplete="off" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/></FormGroup>
            <FormGroup label="Email"><input style={inputStyle} type="email" placeholder="" autoComplete="off" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></FormGroup>
            <FormGroup label="Address"><input style={inputStyle} placeholder="" autoComplete="off" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}/></FormGroup>
            <FormGroup label="District">
              <select style={inputStyle} value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}>
                {TN_DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Password"><input style={inputStyle} type="password" placeholder="" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/></FormGroup>
            {role === 'shopkeeper' && (
              <>
                <FormGroup label="Store Name"><input style={inputStyle} placeholder="" value={form.store_name} onChange={e => setForm({...form, store_name: e.target.value})}/></FormGroup>
                <FormGroup label="Store Category">
                  <input style={inputStyle} placeholder="" value={form.store_category} onChange={e => setForm({...form, store_category: e.target.value})}/>
                </FormGroup>
                <FormGroup label="Pincode"><input style={inputStyle} placeholder="" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})}/></FormGroup>
                <FormGroup label="Logo Image">
                  <label style={{...submitBtn, background: 'var(--cream-dark)', color: 'var(--brown)', padding: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6}}>
                    {form.logoFile ? '✅ Logo Selected' : '📁 Choose Logo'}
                    <input type="file" hidden accept="image/*" onChange={e => setForm({...form, logoFile: e.target.files[0]})}/>
                  </label>
                </FormGroup>
                <FormGroup label="Store Banner">
                  <label style={{...submitBtn, background: 'var(--cream-dark)', color: 'var(--brown)', padding: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6}}>
                    {form.bannerFile ? '✅ Banner Selected' : '📁 Choose Banner'}
                    <input type="file" hidden accept="image/*" onChange={e => setForm({...form, bannerFile: e.target.files[0]})}/>
                  </label>
                </FormGroup>
              </>
            )}
            {role === 'delivery' && (
              <>
                <FormGroup label="Vehicle Type">
                  <select style={inputStyle} value={form.vehicle_type} onChange={e => setForm({...form, vehicle_type: e.target.value})}>
                    {['Bicycle','Motorcycle','Scooter','Auto'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Vehicle Number">
                  <input style={inputStyle} placeholder="" value={form.vehicle_reg_no} onChange={e => setForm({...form, vehicle_reg_no: e.target.value})}/>
                </FormGroup>
                <FormGroup label="License Number">
                  <input style={inputStyle} placeholder="" value={form.license_number} onChange={e => setForm({...form, license_number: e.target.value})}/>
                </FormGroup>
              </>
            )}
            <button style={submitBtn} onClick={handleRegister} disabled={loading}>
              {loading ? 'Creating Account…' : 'Create Account →'}
            </button>
          </div>
        )}



        <div style={{ marginTop: 16, fontSize: '.78rem', color: 'var(--brown-mid)', textAlign: 'center' }}>
          {tab === 'login' && <span>New here? <span onClick={() => setTab('register')} style={{ color: 'var(--gold)', cursor: 'pointer' }}>Register →</span></span>}
          {tab === 'register' && <span>Already have an account? <span onClick={() => setTab('login')} style={{ color: 'var(--gold)', cursor: 'pointer' }}>Login →</span></span>}
          {tab === 'forgot' && null}
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
      sup: 'Est. 2025 · Tamil Nadu · AI-Powered',
      main: <>Connecting <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Local Stores</em><br/>with Smart <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>AI Commerce</em></>,
      sub: 'Festival demand prediction · Service booking · Smart delivery routes — built for your neighbourhood store.',
      shop: 'Shopkeeper Portal', cust: 'Customer Portal', del: 'Delivery Partner',
    },
    ta: {
      sup: '2025 இல் தொடங்கியது · தமிழ்நாடு · AI',
      main: <><em style={{ color: 'var(--gold)' }}>உள்ளூர் கடைகளை</em><br/>AI உடன் <em style={{ color: 'var(--gold)' }}>இணைக்கிறோம்</em></>,
      sub: 'பண்டிகை தேவை கணிப்பு · சேவை முன்பதிவு · திட்டமிட்ட டெலிவரி',
      shop: 'கடைக்காரர் உள்நுழைவு', cust: 'வாடிக்கையாளர்', del: 'டெலிவரி பார்ட்னர்',
    },
  }[lang];

  const toggleLang = (l) => i18n.changeLanguage(l);

  const handleLogin = (userData, accessToken, portalRole) => {
    login(userData, accessToken);
    setOpenModal(null);
    
    // Redirect based on the portal they logged in through
    if (userData.role === 'shopkeeper') {
      navigate('/shopkeeper');
    } else if (userData.role === 'delivery') {
      navigate('/delivery');
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Top Bar for Language Toggle */}
      <div style={{ position: 'fixed', top: 20, right: 32, zIndex: 100, display: 'flex', gap: 6, background: 'rgba(43,21,5,.1)', padding: 4, borderRadius: 20 }}>
        {['en', 'ta'].map(l => (
          <button key={l} onClick={() => toggleLang(l)} style={{ padding: '6px 12px', borderRadius: 16, border: 'none', background: i18n.language.startsWith(l) ? 'var(--gold)' : 'transparent', color: i18n.language.startsWith(l) ? 'var(--brown-deep)' : 'var(--cream)', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', transition: '.2s' }}>{l}</button>
        ))}
      </div>
      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 32px 80px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Arch decorations */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {[
            { w: 700, h: 500, b: -80, borderColor: 'var(--gold)' },
            { w: 900, h: 650, b: -160, borderColor: 'var(--brown-mid)' },
            { w: 1100, h: 800, b: -240, borderColor: 'var(--gold)' },
          ].map((a, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: a.w, height: a.h,
              borderRadius: '50% 50% 0 0 / 60% 60% 0 0',
              border: `1.5px solid ${a.borderColor}`, opacity: .1,
              bottom: a.b, left: '50%', transform: 'translateX(-50%)',
            }}/>
          ))}
        </div>

        {/* Tagline */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, maxWidth: 800 }}>
          <span style={{
            fontSize: '.7rem', letterSpacing: '4px', textTransform: 'uppercase',
            color: 'var(--gold)', fontStyle: 'italic', marginBottom: 18, display: 'block',
            animation: 'fadeUp .6s .3s both',
          }}>{LANG.sup}</span>
          <h1 style={{
            fontFamily: 'var(--font-d)', fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 900,
            lineHeight: 1.12, color: 'var(--brown-deep)', marginBottom: 20,
            animation: 'fadeUp .7s .5s both',
          }}>{LANG.main}</h1>
          <p style={{
            fontSize: '1rem', color: 'var(--brown-mid)', lineHeight: 1.65,
            maxWidth: 520, margin: '0 auto 40px',
            animation: 'fadeUp .7s .7s both',
          }}>{LANG.sub}</p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center',
            animation: 'fadeUp .7s .9s both',
          }}>
            <CtaBtn onClick={() => setOpenModal('shopkeeper')} variant="primary" icon="🏪">{LANG.shop}</CtaBtn>
            <CtaBtn onClick={() => setOpenModal('customer')} variant="secondary" icon="👤">{LANG.cust}</CtaBtn>
            <CtaBtn onClick={() => setOpenModal('delivery')} variant="accent" icon="🛵">{LANG.del}</CtaBtn>
          </div>
        </div>

        {/* Floating Product Cards */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: 14, maxWidth: 900, margin: '48px auto 0',
          animation: 'fadeIn .5s 1.2s both',
        }}>
          {PRODUCTS.map((p, i) => (
            <div key={i} style={{
              width: 140, background: 'var(--cream-dark)',
              border: '1.5px solid var(--parchment)', borderRadius: 8,
              padding: '14px 12px', boxShadow: '3px 4px 18px var(--shadow)',
              textAlign: 'center', transition: 'transform .3s, box-shadow .3s',
              animation: `fadeUp .6s ${1.2 + i * 0.1}s both`, cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '5px 12px 28px var(--shadow)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 4px 18px var(--shadow)'; }}
            >
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}>{p.emoji}</span>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '.72rem', fontWeight: 700, color: 'var(--brown-deep)' }}>{p.label}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--gold)', marginTop: 4, fontStyle: 'italic' }}>{p.price}</div>
              <span style={{
                display: 'inline-block', marginTop: 6, padding: '2px 8px',
                background: 'var(--gold-pale)', border: '1px solid var(--gold)',
                borderRadius: 12, fontSize: '.58rem', color: 'var(--brown)',
              }}>{p.badge}</span>
            </div>
          ))}
        </div>

        {/* Feature Chips */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: 20, maxWidth: 1000, margin: '48px auto', padding: '0 24px',
          animation: 'fadeUp .7s 1.5s both',
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px',
              background: 'rgba(255,255,255,.5)', border: '1px solid var(--parchment)',
              borderRadius: 32, fontSize: '.82rem', color: 'var(--brown)',
              boxShadow: '2px 2px 8px var(--shadow)',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }}/>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </section>

      <footer style={{
        textAlign: 'center', padding: 28,
        borderTop: '1px solid var(--parchment)',
        fontSize: '.75rem', color: 'var(--brown-light)', fontStyle: 'italic',
      }}>
        © 2025 KadaiConnect · AI-Powered Hyperlocal Commerce Platform · Tamil Nadu
      </footer>

      {/* Modals */}
      {openModal === 'shopkeeper' && (
        <Modal role="shopkeeper" title="Shopkeeper Portal" icon="🏪"
          onClose={() => setOpenModal(null)} onLogin={handleLogin} apiFetch={apiFetch}/>
      )}
      {openModal === 'customer' && (
        <Modal role="customer" title="Customer Portal" icon="🛍️"
          onClose={() => setOpenModal(null)} onLogin={handleLogin} apiFetch={apiFetch}/>
      )}
      {openModal === 'delivery' && (
        <Modal role="delivery" title="Delivery Partner" icon="🛵"
          onClose={() => setOpenModal(null)} onLogin={handleLogin}/>
      )}
    </div>
  );
};

const CtaBtn = ({ children, onClick, variant, icon }) => {
  const styles = {
    primary: { background: 'var(--brown-deep)', color: 'var(--gold-light)', borderColor: 'var(--gold)', boxShadow: '4px 4px 0 var(--gold)' },
    secondary: { background: 'transparent', color: 'var(--brown-deep)', borderColor: 'var(--brown-mid)' },
    accent: { background: 'var(--gold)', color: 'var(--brown-deep)', borderColor: 'var(--brown-mid)', boxShadow: '4px 4px 0 var(--brown-deep)' },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} style={{
      padding: '14px 28px', borderRadius: 4, fontFamily: 'var(--font-d)',
      fontSize: '.95rem', fontWeight: 700, letterSpacing: '.5px', cursor: 'pointer',
      border: '2px solid transparent', transition: '.25s', display: 'inline-flex',
      alignItems: 'center', gap: 10, ...s,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
    >
      <span>{icon}</span> {children}
    </button>
  );
};

export default Login;
