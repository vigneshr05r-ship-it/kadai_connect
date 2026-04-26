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
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'customer',
    // Shopkeeper fields
    store_name: '',
    store_category: 'Textiles & Sarees',
    pincode: '',
    // Delivery fields
    vehicle_type: 'Motorcycle',
    vehicle_reg_no: '',
    license_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.name || !form.email || !form.password || !form.phone) {
      setError('Please fill in all fields.');
      return;
    }

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
    } else if (form.role === 'delivery') {
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
        // Auto-login after registration
        const loginResp = await apiFetch('/api/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: form.email, password: form.password })
        });
        
        const loginData = await loginResp.json();
        if (loginResp.ok) {
          setError('');
          setLoading(false);
          // Briefly show a success state before navigating
          document.body.insertAdjacentHTML('beforeend', `<div id="reg-success" style="position:fixed;top:20px;left:50%;transform:translateX(-50%);background:var(--green);color:white;padding:12px 24px;border-radius:30px;z-index:9999;font-weight:bold;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:fadeDown 0.3s forwards;">Account created successfully! Redirecting...</div>`);
          
          login({ 
            name: form.name, 
            email: form.email, 
            role: form.role 
          }, loginData.access);

          setTimeout(() => {
            document.getElementById('reg-success')?.remove();
            if (form.role === 'shopkeeper') navigate('/shopkeeper');
            else if (form.role === 'delivery') navigate('/delivery');
            else navigate('/');
          }, 1500);
        } else {
          navigate('/login');
        }
      } else {
        const errText = typeof data === 'object' 
          ? Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(', ') 
          : JSON.stringify(data);
        setError(`Registration failed: ${errText}`);
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-serif font-bold text-2xl italic">K</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary italic">{t('register_account', 'Create Account')}</h1>
          <p className="text-text/60 mt-2 text-sm">Join Kadai Connect today</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-vintage border border-black/5">
          {/* Role Selector */}
          <div className="flex gap-2 mb-6 bg-background rounded-xl p-1">
            {['customer', 'shopkeeper', 'delivery'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all relative z-10 cursor-pointer ${
                  form.role === role
                    ? 'bg-primary text-white shadow'
                    : 'text-text/50 hover:text-text'
                }`}
              >
                {role === 'customer' ? '🛍 Customer' : role === 'shopkeeper' ? '🏪 Shopkeeper' : '🚴 Delivery'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase text-text/50 mb-1 block">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3.5 text-text/30" />
                <input
                  type="text"
                  className="w-full bg-background border border-black/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary transition-colors"
                  placeholder=""
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-text/50 mb-1 block">Phone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-3.5 text-text/30" />
                <input
                  type="tel"
                  className="w-full bg-background border border-black/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary transition-colors"
                  placeholder=""
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-text/50 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3.5 text-text/30" />
                <input
                  type="email"
                  className="w-full bg-background border border-black/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary transition-colors"
                  placeholder=""
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-text/50 mb-1 block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-text/30" />
                <input
                  type="password"
                  className="w-full bg-background border border-black/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary transition-colors"
                  placeholder=""
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {form.role === 'shopkeeper' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="text-xs font-bold uppercase text-text/50 mb-1 block">Store Name</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                    placeholder=""
                    value={form.store_name}
                    onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-text/50 mb-1 block">Store Category</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                    placeholder=""
                    value={form.store_category}
                    onChange={(e) => setForm({ ...form, store_category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-text/50 mb-1 block">Pincode</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                    placeholder=""
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  />
                </div>
              </div>
            )}

            {form.role === 'delivery' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="text-xs font-bold uppercase text-text/50 mb-1 block">Vehicle Type</label>
                  <select
                    className="w-full bg-background border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors appearance-none"
                    value={form.vehicle_type}
                    onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                  >
                    {['Bicycle', 'Motorcycle', 'Scooter', 'Auto'].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-text/50 mb-1 block">Vehicle Number</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                    placeholder=""
                    value={form.vehicle_reg_no}
                    onChange={(e) => setForm({ ...form, vehicle_reg_no: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-text/50 mb-1 block">License Number</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                    placeholder=""
                    value={form.license_number}
                    onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-base font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg mt-2"
            >
              {loading ? <Loader size={20} className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text/60">
            {t('already_have_account', 'Already have an account?')} {' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              {t('sign_in', 'Sign In')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
