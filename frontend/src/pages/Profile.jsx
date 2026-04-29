import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { User, Phone, MapPin, Map } from 'lucide-react';
import MainLayout from '../components/MainLayout';

const Toast = ({ msg, visible }) => (
  <div style={{ 
    position: 'fixed', bottom: 100, left: '50%', 
    transform: `translateX(-50%) translateY(${visible ? 0 : 30}px)`, 
    background: 'var(--brown-deep)', color: 'var(--gold-light)', 
    padding: '10px 24px', borderRadius: 16, fontSize: '.85rem', 
    border: '1.5px solid var(--gold)', opacity: visible ? 1 : 0, 
    transition: '.3s ease-out', pointerEvents: 'none', zIndex: 1000, 
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)' 
  }}>
    {msg}
  </div>
);

export default function Profile() {
  const { apiFetch, user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');
  
  const [profileForm, setProfileForm] = useState({ 
    name: user?.name || user?.first_name || user?.username || '', 
    email: user?.email || '', 
    phone: user?.phone || '', 
    address: user?.address || '',
    district: user?.district || 'Chennai' 
  });
  const [toast, setToast] = useState({ msg: '', visible: false });

  const showToast = (msg) => { setToast({ msg, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000); };

  const TN_DISTRICTS = ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Thanjavur", "Dindigul", "Ranipet", "Virudhunagar", "Kanyakumari", "Theni", "Namakkal", "Tiruppur", "Kancheepuram", "Chengalpattu", "Thiruvallur", "Cuddalore", "Nagapattinam", "Pudukkottai", "Sivaganga", "Tiruvarur", "Tiruvannamalai", "Viluppuram", "Ariyalur", "Dharmapuri", "Karur", "Krishnagiri", "Perambalur", "Ramanathapuram", "The Nilgiris", "Tenkasi", "Mayiladuthurai", "Kallakurichi", "Tirupathur"];

  useEffect(() => {
    const fetchFreshData = async () => {
      try {
        const resp = await apiFetch('/api/users/me/');
        if (resp?.ok) {
          const freshUser = await resp.json();
          updateUser(freshUser);
        }
      } catch (e) { console.error("Failed to fetch fresh profile", e); }
    };
    fetchFreshData();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({ 
        name: user?.name || user?.first_name || user?.username || '', 
        email: user?.email || '', 
        phone: user?.phone || '', 
        address: user?.address || '',
        district: user?.district || 'Chennai' 
      });
    }
  }, [user]);

  const updateProfile = async () => {
    try {
      const resp = await apiFetch('/api/users/me/', {
        method: 'PATCH',
        body: JSON.stringify({ 
          name: profileForm.name, 
          phone: profileForm.phone, 
          address: profileForm.address,
          district: profileForm.district 
        })
      });
      if (resp?.ok) {
        const updatedData = await resp.json();
        updateUser(updatedData);
        showToast(isTa ? '✅ சுயவிவரம் புதுப்பிக்கப்பட்டது!' : '✅ Profile Updated Successfully!');
      } else showToast('❌ Update Failed');
    } catch (e) { showToast('Error updating profile'); }
  };

  const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 16px', background: '#fff', border: '1.5px solid var(--parchment)', borderRadius: 14, fontSize: '.9rem', color: 'var(--brown-deep)', fontWeight: 700, transition: '.3s' };
  const labelStyle = { fontSize: '.65rem', color: 'var(--brown-mid)', fontWeight: 900, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <MainLayout title={isTa ? 'சுயவிவரம்' : 'Profile'} showSearch={false}>
      <Toast msg={toast.msg} visible={toast.visible} />
      <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40, padding: '0 20px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30, marginTop: 10 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--brown-deep)', border: 'none', color: 'var(--gold-light)', cursor: 'pointer', width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}><ArrowLeft size={22} /></button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--brown-deep)', margin: 0 }}>{isTa ? 'சுயவிவரம்' : 'My Profile'}</h1>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 40, marginTop: 20, display: 'none' }}>
           <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brown-deep)', marginBottom: 8 }}>
             {isTa ? 'சுயவிவரம்' : 'My Profile'}
           </h1>
           <div style={{ width: 40, height: 3, background: 'var(--gold)', margin: '0 auto', borderRadius: 2 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <div style={{ background: '#fff', border: '1.5px solid var(--parchment)', borderRadius: 24, padding: 24, boxShadow: '0 4px 12px rgba(59,31,14,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '.8rem', fontWeight: 900, color: 'var(--brown-deep)', textTransform: 'uppercase' }}>Personal Info</div>
              <button onClick={updateProfile} style={{ padding: '6px 16px', background: 'var(--gold)', color: 'var(--brown-deep)', border: 'none', borderRadius: 10, fontSize: '.75rem', fontWeight: 900, cursor: 'pointer' }}>Save</button>
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle}><User size={12} className="text-gold" />{isTa ? 'முழு பெயர்' : 'Full Name'}</label>
                <input style={inputStyle} className="profile-input" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>📧 Email</label>
                <input style={{...inputStyle, opacity: 0.6, cursor: 'not-allowed', background: 'var(--cream-dark)'}} value={profileForm.email} readOnly />
              </div>
              <div>
                <label style={labelStyle}><Phone size={12} className="text-gold" />{isTa ? 'தொலைபேசி' : 'Phone Number'}</label>
                <input style={inputStyle} className="profile-input" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
              </div>
            </div>
          </div>
          <div style={{ background: '#fff', border: '1.5px solid var(--parchment)', borderRadius: 24, padding: 24, boxShadow: '0 4px 12px rgba(59,31,14,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '.8rem', fontWeight: 900, color: 'var(--brown-deep)', textTransform: 'uppercase' }}>Address & Location</div>
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle}><Map size={12} className="text-gold" />{isTa ? 'மாவட்டம்' : 'District'}</label>
                <select style={inputStyle} className="profile-input" value={profileForm.district} onChange={e => setProfileForm({...profileForm, district: e.target.value})}>
                  {TN_DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}><MapPin size={12} className="text-gold" />{isTa ? 'முகவரி' : 'Primary Address'}</label>
                <textarea style={{...inputStyle, height: 90, resize: 'none'}} className="profile-input" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} placeholder={isTa ? 'உங்கள் முகவரியை உள்ளிடவும்...' : 'Enter your address...'}/>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <button 
            onClick={() => { logout(); navigate('/login'); }} 
            style={{ width: '100%', padding: '16px', background: 'var(--rust)', color: '#fff', border: 'none', borderRadius: 16, fontSize: '.9rem', fontWeight: 900, cursor: 'pointer' }}
          >
            {isTa ? 'வெளியேறு' : 'Logout'}
          </button>
        </div>
      </div>

      <style>{`
        .profile-input:focus { border-color: var(--gold) !important; outline: none; box-shadow: 0 0 0 4px var(--gold-pale); }
        .logout-btn:hover { background: #b91c1c !important; transform: translateY(-2px); }
        .logout-btn:active { transform: translateY(0); }
      `}</style>
    </MainLayout>
  );
}
