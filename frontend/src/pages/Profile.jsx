import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { User, Phone, MapPin, Map } from 'lucide-react';
import MainLayout from '../components/MainLayout';

const Toast = ({ msg, visible }) => (
  <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`, background: 'var(--brown-deep)', color: 'var(--gold-light)', padding: '10px 22px', borderRadius: 24, fontSize: '.8rem', border: '1px solid var(--gold)', opacity: visible ? 1 : 0, transition: '.3s', pointerEvents: 'none', zIndex: 600, whiteSpace: 'nowrap' }}>
    {msg}
  </div>
);

export default function Profile() {
  const { apiFetch, user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isTa = i18n.language.startsWith('ta');
  
  const [profileForm, setProfileForm] = useState({ 
    name: user?.first_name || user?.username || '', 
    email: user?.email || '', 
    phone: user?.phone || '', 
    address: user?.address || '',
    district: user?.district || 'Chennai' 
  });
  const [toast, setToast] = useState({ msg: '', visible: false });

  const showToast = (msg) => { setToast({ msg, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000); };

  const TN_DISTRICTS = ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Thanjavur", "Dindigul", "Ranipet", "Virudhunagar", "Kanyakumari", "Theni", "Namakkal", "Tiruppur", "Kancheepuram", "Chengalpattu", "Thiruvallur", "Cuddalore", "Nagapattinam", "Pudukkottai", "Sivaganga", "Tiruvarur", "Tiruvannamalai", "Viluppuram", "Ariyalur", "Dharmapuri", "Karur", "Krishnagiri", "Perambalur", "Ramanathapuram", "The Nilgiris", "Tenkasi", "Mayiladuthurai", "Kallakurichi", "Tirupathur"];

  useEffect(() => {
    if (user) {
      setProfileForm({ 
        name: user?.first_name || user?.username || '', 
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
          first_name: profileForm.name, 
          phone: profileForm.phone, 
          address: profileForm.address,
          district: profileForm.district 
        })
      });
      if (resp?.ok) {
        showToast(isTa ? '✅ சுயவிவரம் புதுப்பிக்கப்பட்டது!' : '✅ Profile Updated!');
      } else showToast('❌ Update Failed');
    } catch (e) { showToast('Error updating profile'); }
  };

  const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--parchment)', borderRadius: 8, fontSize: '.85rem', color: 'var(--brown-deep)' };

  return (
    <MainLayout title={isTa ? 'சுயவிவரம்' : 'My Profile'} showSearch={false}>
      <Toast msg={toast.msg} visible={toast.visible} />
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          <div style={{ background: 'var(--cream)', border: '1.5px solid var(--parchment)', borderRadius: 10, padding: 20, boxShadow: '2px 2px 8px var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--brown-deep)' }}>{t('personal_info')}</div>
              <button onClick={updateProfile} style={{ padding: '6px 12px', background: 'var(--brown-deep)', color: 'var(--gold)', border: 'none', borderRadius: 6, fontSize: '.7rem', fontWeight: 800, cursor: 'pointer' }}>{t('save')}</button>
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: '.7rem', color: 'var(--brown-mid)', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} />{isTa ? 'முழு பெயர்' : 'Full Name'}</label>
                <input style={inputStyle} value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '.7rem', color: 'var(--brown-mid)', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>📧 Email</label>
                <input style={{...inputStyle, opacity: 0.7, cursor: 'not-allowed'}} value={profileForm.email} readOnly />
              </div>
              <div>
                <label style={{ fontSize: '.7rem', color: 'var(--brown-mid)', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} />{t('phone')}</label>
                <input style={inputStyle} value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
              </div>
            </div>
          </div>
          <div style={{ background: 'var(--cream)', border: '1.5px solid var(--parchment)', borderRadius: 10, padding: 20, boxShadow: '2px 2px 8px var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--brown-deep)' }}>{isTa ? 'முகவரி & மாவட்டம்' : 'Address & District'}</div>
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: '.7rem', color: 'var(--brown-mid)', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Map size={14} />{isTa ? 'மாவட்டம்' : 'District'}</label>
                <select style={inputStyle} value={profileForm.district} onChange={e => setProfileForm({...profileForm, district: e.target.value})}>
                  {TN_DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '.7rem', color: 'var(--brown-mid)', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} />{isTa ? 'டெலிவரி முகவரி' : 'Delivery Address'}</label>
                <textarea style={{...inputStyle, height: 80, resize: 'none'}} value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} placeholder={isTa ? 'உங்கள் முழு முகவரியை உள்ளிடவும்...' : 'Enter your full address...'}/>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ width: '100%', padding: 14, background: 'var(--rust)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '.85rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-d)' }}>{t('logout')}</button>
        </div>
      </div>
    </MainLayout>
  );
}
