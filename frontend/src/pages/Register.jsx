import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { User, Phone, Mail, Lock, Loader2 as Loader, ArrowRight } from 'lucide-react';

const Register = () => {
  const { t } = useTranslation();
  const { login, apiFetch } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', role: 'customer',
    store_name: '', store_category: 'Textiles & Sarees', pincode: '',
    vehicle_type: 'Motorcycle', vehicle_reg_no: '', license_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.phone) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const payload = new FormData();
    payload.append('username', form.email);
    payload.append('email', form.email);
    payload.append('password', form.password);
    payload.append('role', form.role);
    payload.append('phone', form.phone);
    payload.append('name', form.name);
    if (form.role === 'shopkeeper') {
      payload.append('store_name', form.store_name);
      payload.append('store_category', form.store_category);
      payload.append('pincode', form.pincode);
    }
    try {
      const resp = await apiFetch('/api/users/', { method: 'POST', body: payload });
      const data = await resp.json();
      if (resp.ok) {
        const loginResp = await apiFetch('/api/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: form.email, password: form.password })
        });
        const loginData = await loginResp.json();
        if (loginResp.ok) {
          login({ name: form.name, email: form.email, role: form.role }, loginData.access);
          navigate(form.role === 'shopkeeper' ? '/shopkeeper' : form.role === 'delivery' ? '/delivery' : '/');
        } else { navigate('/login'); }
      } else {
        setError(`Registration failed: ${typeof data === 'object' ? Object.entries(data).map(([k,v])=>`${k}: ${v}`).join(', ') : JSON.stringify(data)}`);
      }
    } catch (err) { setError('Server error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 500, width: '100%', animation: 'fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
            width: 80, height: 80, background: 'var(--brown-deep)', borderRadius: '24px', 
            marginBottom: 24, border: '3px solid var(--gold)', boxShadow: '0 8px 24px rgba(59,31,14,0.2)' 
          }}>
            <span style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: '2.5rem', fontStyle: 'italic' }}>K</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--brown-deep)', fontStyle: 'italic', marginBottom: 12 }}>Forge Your Account</h1>
          <p style={{ color: 'var(--brown-mid)', fontSize: '1.05rem', fontWeight: 600, fontStyle: 'italic' }}>Join the Kadai Connect Heritage</p>
        </div>

        <div className="vintage-card" style={{ padding: '48px 40px', background: '#fff', borderWidth: '3px', borderRadius: '40px' }}>
          {/* Role Selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, background: 'var(--parchment)', padding: 6, borderRadius: 24 }}>
            {['customer', 'shopkeeper', 'delivery'].map((r) => (
              <button key={r} type="button" onClick={() => setForm({ ...form, role: r })} style={{
                flex: 1, py: 2, padding: '12px 8px', borderRadius: 18, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-d)', fontSize: '.85rem', fontWeight: 900, transition: '.3s',
                background: form.role === r ? 'var(--brown-deep)' : 'transparent',
                color: form.role === r ? 'var(--gold-light)' : 'var(--brown-mid)',
              }}>
                {r === 'customer' ? '🛍 Bazaar' : r === 'shopkeeper' ? '🏪 Guild' : '🛵 Messenger'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div style={{ padding: '14px 18px', background: 'var(--rust)', color: '#fff', borderRadius: 16, fontSize: '.9rem', fontWeight: 800, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <FormGroup label="Full Name" icon={<User size={18}/>}>
              <input className="vintage-input" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
            </FormGroup>

            <FormGroup label="Messenger Phone" icon={<Phone size={18}/>}>
              <input className="vintage-input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/>
            </FormGroup>

            <FormGroup label="Archive Email" icon={<Mail size={18}/>}>
              <input className="vintage-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/>
            </FormGroup>

            <FormGroup label="Secure Secret" icon={<Lock size={18}/>}>
              <input className="vintage-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/>
            </FormGroup>

            {form.role === 'shopkeeper' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 10, padding: 24, background: 'var(--parchment)', borderRadius: 24, border: '2px solid var(--gold-pale)' }}>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 900, color: 'var(--brown-deep)' }}>Guild Records</div>
                <div>
                  <label style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--brown-mid)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Guild Name</label>
                  <input className="vintage-input" type="text" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })}/>
                </div>
                <div>
                  <label style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--brown-mid)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Guild Craft</label>
                  <input className="vintage-input" type="text" value={form.store_category} onChange={(e) => setForm({ ...form, store_category: e.target.value })}/>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="vintage-btn-primary" style={{ width: '100%', marginTop: 12, padding: 18, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              {loading ? <Loader size={20} className="animate-spin" /> : <>Forge Account <ArrowRight size={20} /></>}
            </button>
          </form>

          <div style={{ marginTop: 32, textAlign: 'center', fontSize: '.95rem', color: 'var(--brown-mid)', fontWeight: 600 }}>
            Already an Initiate? {' '}
            <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 900, textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormGroup = ({ label, icon, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <label style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--brown-mid)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--brown-light)', zIndex: 1 }}>{icon}</div>
      <div style={{ width: '100%' }}>
        {React.cloneElement(children, { style: { ...children.props.style, paddingLeft: 52 } })}
      </div>
    </div>
  </div>
);

export default Register;
