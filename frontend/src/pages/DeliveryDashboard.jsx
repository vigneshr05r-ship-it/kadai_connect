import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Map as MapIcon, 
  ClipboardList, 
  IndianRupee, 
  User, 
  Package, 
  Star, 
  Truck, 
  Phone, 
  MessageSquare, 
  CheckCircle,
  Navigation,
  Layers,
  ArrowRight,
  TrendingUp,
  Wallet,
  Calendar,
  Settings,
  ChevronRight,
  MapPin,
  Clock,
  ArrowLeft,
  Save,
  Check,
  Store,
  ExternalLink,
  History,
  X,
  AlertCircle,
  RotateCcw,
  PhoneOff,
  Download,
  Share2,
  Bell
} from 'lucide-react';

import LeafletMapView from '../components/LeafletMapView';
import { optimizeRoute, MOCK_STOPS, SHOP_ORIGIN } from '../services/routeService';
import { LocationSimulator } from '../services/locationSimulator';

const GLASS = {
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
  border: '1.5px solid rgba(201, 146, 26, 0.4)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  borderRadius: 20
};

const S = {
  panel: { ...GLASS, padding: window.innerWidth < 480 ? '16px' : '24px', marginBottom: '24px' },
  btnPrimary: { padding: '14px 24px', background: 'var(--brown-deep)', color: 'var(--gold-light)', border: '2px solid var(--gold)', borderRadius: 15, fontFamily: 'var(--font-d)', fontSize: '.85rem', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: '.3s' },
  btnSecondary: { padding: '10px 18px', background: 'var(--cream)', color: 'var(--brown-deep)', border: '1.5px solid var(--parchment)', borderRadius: 12, fontSize: '.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: '.3s' },
  statusBadge: { padding: '6px 14px', borderRadius: 20, fontSize: '.65rem', fontWeight: 900, letterSpacing: '.5px', textTransform: 'uppercase' },
  input: { width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '14px 18px', background: 'rgba(255,255,255,0.6)', border: '1.5px solid var(--parchment)', borderRadius: 12, fontSize: '1rem', color: 'var(--brown-deep)', outline: 'none', transition: '0.3s' }
};

function Toast({ msg, visible }) {
  return (
    <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 50}px)`, background: 'var(--brown-deep)', color: 'var(--gold-light)', padding: '14px 28px', borderRadius: 30, border: '2px solid var(--gold)', opacity: visible ? 1 : 0, transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', zIndex: 11000, fontWeight: 900, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
      {msg}
    </div>
  );
}

export default function DeliveryDashboard() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const { user, logout, apiFetch } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('active'); 
  const [profileView, setProfileView] = useState('menu'); 
  const [isMapMaximized, setIsMapMaximized] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isOnline, setIsOnline] = useState(true);
  
  const [optimizedStops, setOptimizedStops] = useState([]);
  const [routePolyline, setRoutePolyline] = useState(null);
  const [driverPos, setDriverPos] = useState(SHOP_ORIGIN);
  const [simulator, setSimulator] = useState(null);

  const [upcoming, setUpcoming] = useState([]); 
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [loading, setLoading] = useState(true);

  // EARNINGS & HISTORY STATE
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [tripHistory, setTripHistory] = useState([]);

  // STATUS SELECTION STATE
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeTripToComplete, setActiveTripToComplete] = useState(null);

  // Profile Form States
  const [profileData, setProfileData] = useState({
    name: user?.name || user?.username || 'Partner',
    phone: user?.phone || '',
    email: user?.email || '',
    district: user?.district || 'Chennai',
    address: user?.address || '',
    shift: user?.shift || 'Not Set'
  });

  const TN_DISTRICTS = ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Thanjavur", "Dindigul", "Ranipet", "Virudhunagar", "Kanyakumari", "Theni", "Namakkal", "Tiruppur", "Kancheepuram", "Chengalpattu", "Thiruvallur", "Cuddalore", "Nagapattinam", "Pudukkottai", "Sivaganga", "Tiruvarur", "Tiruvannamalai", "Viluppuram", "Ariyalur", "Dharmapuri", "Karur", "Krishnagiri", "Perambalur", "Ramanathapuram", "The Nilgiris", "Tenkasi", "Mayiladuthurai", "Kallakurichi", "Tirupathur"];

  const [vehicleData, setVehicleData] = useState({
    type: user?.vehicle_type || '',
    regNo: user?.vehicle_reg_no || '',
    license: user?.license_number || ''
  });
  const [claimingId, setClaimingId] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || user.username || 'Partner',
        phone: user.phone || '',
        email: user.email || '',
        district: user.district || 'Chennai',
        address: user.address || '',
        shift: user.shift || 'Not Set'
      });
      setVehicleData({
        type: user.vehicle_type || '',
        regNo: user.vehicle_reg_no || '',
        license: user.license_number || ''
      });
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const resp = await apiFetch('/api/delivery/');
      if (resp?.ok) {
        const raw = await resp.json();
        const tasks = Array.isArray(raw) ? raw : (raw.results || []);
        
        // Map tasks to UI format
        const mapped = tasks.map(t => ({
          id: t.id,
          taskType: t.task_type,
          shopName: t.store_details?.name || 'Local Store',
          shopName_ta: t.store_details?.name || 'உள்ளூர் கடை',
          customerName: t.customer_details?.name || 'Customer',
          customerPhone: t.customer_details?.phone || '',
          shopPhone: t.store_details?.phone || '',
          deliveryAddress: t.delivery_address,
          pickupAddress: t.pickup_address,
          payout: 45 + Math.floor(Math.random() * 20),
          status: t.status,
          lat: t.current_lat || 13.04 + (Math.random() * 0.02),
          lng: t.current_lng || 80.23 + (Math.random() * 0.02),
          partner: t.partner
        }));

        setUpcoming(mapped.filter(m => m.status === 'available'));
        const active = mapped.filter(m => m.status === 'assigned' || m.status === 'picked_up');
        setOptimizedStops(active);
        setTripHistory(mapped.filter(m => m.status === 'delivered' || m.status === 'cancelled'));
        setTotalEarnings(mapped.filter(m => m.status === 'delivered').reduce((s, o) => s + o.payout, 0));

        if (active.length > 0) {
          const res = await optimizeRoute(SHOP_ORIGIN, active);
          setRoutePolyline(res.polyline);
          if (simulator) simulator.stop();
          const sim = new LocationSimulator(res.polyline, (newPos) => setDriverPos(newPos));
          sim.start();
          setSimulator(sim);
        }
      }
    } catch (e) {
      console.error("Delivery fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchData();

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (simulator) simulator.stop();
    };
  }, [user]);

  const showToast = (msg) => { setToast({ msg, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000); };

  const claimTask = async (task) => {
    if (claimingId) return;
    setClaimingId(task.id);
    try {
      const resp = await apiFetch(`/api/delivery/${task.id}/claim/`, {
        method: 'POST'
      });
      if (resp?.ok) {
        showToast(isTa ? `🚀 பணி ஏற்கப்பட்டது!` : `🚀 Task Claimed!`);
        await fetchData();
        setSection('active');
      }
    } catch (e) {
      showToast('Error claiming task');
    } finally {
      setClaimingId(null);
    }
  };

  const markDelivered = (id) => {
    const trip = optimizedStops.find(d => d.id === id);
    if (!trip) return;
    setActiveTripToComplete(trip);
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (status) => {
    if (!activeTripToComplete) return;

    try {
      const resp = await apiFetch(`/api/delivery/${activeTripToComplete.id}/update_status/`, {
        method: 'POST',
        body: JSON.stringify({ status: status === 'Delivered' ? 'delivered' : 'picked_up' })
      });
      if (resp?.ok) {
        showToast(isTa ? `✅ நிலை புதுப்பிக்கப்பட்டது!` : `✅ Status Updated!`);
        fetchData();
        setShowStatusModal(false);
        setActiveTripToComplete(null);
      }
    } catch (e) {
      showToast('Error updating task status');
    }
  };

  const saveProfile = async () => {
    try {
      const resp = await apiFetch('/api/users/me/', {
        method: 'PATCH',
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          email: profileData.email,
          district: profileData.district,
          address: profileData.address,
          shift: profileData.shift
        })
      });
      if (resp?.ok) {
        showToast(isTa ? `✅ சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!` : `✅ Profile successfully updated!`);
        setProfileView('menu');
      } else {
        showToast(isTa ? '❌ புதுப்பிக்க முடியவில்லை' : '❌ Update failed');
      }
    } catch (e) {
      showToast('Error saving profile');
    }
  };

  const saveVehicle = async () => {
    try {
      const resp = await apiFetch('/api/users/me/', {
        method: 'PATCH',
        body: JSON.stringify({
          vehicle_type: vehicleData.type,
          vehicle_reg_no: vehicleData.regNo,
          license_number: vehicleData.license
        })
      });
      if (resp?.ok) {
        showToast(isTa ? `✅ வாகன விவரங்கள் சேமிக்கப்பட்டது!` : `✅ Vehicle details saved!`);
        setProfileView('menu');
      } else {
        showToast(isTa ? '❌ சேமிக்க முடியவில்லை' : '❌ Failed to save');
      }
    } catch (e) {
      showToast('Error saving vehicle details');
    }
  };

  // DOWNLOAD & SHARE LOGIC
  const downloadHistory = () => {
    if (tripHistory.length === 0) return;
    const headers = ['Trip ID', 'Date', 'Time', 'Status', 'Shop', 'Customer', 'Phone', 'Payout'];
    const rows = tripHistory.map(t => [
      `KC-${t.id.toString().slice(-6)}`,
      t.date,
      t.time,
      t.status,
      t.shopName,
      t.customerName,
      t.customerPhone,
      t.payout
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `delivery_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isTa ? '📊 வரலாறு பதிவிறக்கம் செய்யப்பட்டது!' : '📊 History downloaded as CSV!');
  };

  const shareTripOnWhatsApp = (trip) => {
    const msg = `📦 *Kadai Connect Delivery Report*\n\n` +
                `*Trip ID:* KC-${trip.id.toString().slice(-6)}\n` +
                `*Status:* ${trip.status === 'Delivered' ? '✅ Delivered' : '❌ ' + trip.status}\n` +
                `*Customer:* ${trip.customerName}\n` +
                `*Shop:* ${trip.shopName}\n` +
                `*Payout:* ₹${trip.payout}\n` +
                `*Time:* ${trip.date} at ${trip.time}\n\n` +
                `_Generated via Kadai Connect Dashboard_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const shareFullHistoryOnWhatsApp = () => {
    if (tripHistory.length === 0) return;
    const totalEarnings = tripHistory.reduce((acc, t) => acc + (t.status === 'Delivered' ? t.payout : 0), 0);
    const completedCount = tripHistory.filter(t => t.status === 'Delivered').length;
    
    let msg = `📊 *Kadai Connect Shift Summary*\n\n` +
                `*Total Trips:* ${tripHistory.length}\n` +
                `*Completed:* ${completedCount}\n` +
                `*Total Earnings:* ₹${totalEarnings}\n\n` +
                `*Recent Logs:*\n`;
    
    tripHistory.slice(0, 3).forEach(t => {
      msg += `• ${t.status === 'Delivered' ? '✅' : '❌'} ${t.customerName} (₹${t.payout})\n`;
    });

    if (tripHistory.length > 3) msg += `_...and ${tripHistory.length - 3} more_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const navItems = [
    { key: 'active', icon: <MapIcon size={24} />, label: isTa ? 'செயலில்' : 'ACTIVE' },
    { key: 'upcoming', icon: <ClipboardList size={24} />, label: isTa ? 'வரவிருக்கும்' : 'UPCOMING' },
    { key: 'earnings', icon: <IndianRupee size={24} />, label: isTa ? 'வருமானம்' : 'EARNINGS' },
    { key: 'history', icon: <History size={24} />, label: isTa ? 'வரலாறு' : 'HISTORY' },
    { key: 'profile', icon: <User size={24} />, label: isTa ? 'சுயவிவரம்' : 'PROFILE' },
  ];

  const renderHistoryView = () => {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 30 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2.5rem', fontWeight: 950, color: 'var(--brown-deep)', marginBottom: 10 }}>{isTa ? 'டெலிவரி வரலாறு' : 'Delivery History'}</h1>
            <p style={{ color: 'var(--brown-mid)', fontWeight: 800 }}>{isTa ? 'உங்கள் நிறைவு செய்யப்பட்ட பயணங்களுக்கான முழு செயல்பாட்டு பதிவுகள்' : 'Full operational logs for your completed shift trips'}</p>
          </div>
          {tripHistory.length > 0 && (
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={downloadHistory} style={{ ...S.btnSecondary, background: 'var(--brown-deep)', color: 'var(--gold-light)', border: 'none', padding: '12px 20px', borderRadius: 15 }}>
                <Download size={18} /> {isTa ? 'பதிவிறக்கம்' : 'DOWNLOAD CSV'}
              </button>
              <button onClick={shareFullHistoryOnWhatsApp} style={{ ...S.btnSecondary, background: 'var(--green)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: 15 }}>
                <Share2 size={18} /> {isTa ? 'பகிரவும்' : 'SHARE SUMMARY'}
              </button>
            </div>
          )}
        </div>
        
        {tripHistory.length === 0 ? (
          <div style={{ ...S.panel, textAlign: 'center', padding: 80, color: 'var(--brown-mid)' }}>
             <History size={64} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
             <h3 style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--brown-deep)' }}>{isTa ? 'வரலாறு எதுவும் இல்லை' : 'No History Found'}</h3>
             <p style={{ fontWeight: 800 }}>{isTa ? 'உங்கள் ஷிப்டைத் தொடங்கி சில ஆர்டர்களை முடிக்கவும்! உங்கள் விவரங்கள் இங்கே தோன்றும்.' : 'Start your shift and complete some cockpits! Your mandatory detailed logs will appear here.'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 30 }}>
             {tripHistory.map(trip => (
                <div key={trip.id} style={{ ...S.panel, padding: 35, borderTop: `8px solid ${trip.status === 'Delivered' ? 'var(--green)' : 'var(--rust)'}` }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 }}>
                      <div>
                         <div style={{ ...S.statusBadge, background: trip.status === 'Delivered' ? 'var(--green)' : 'var(--rust)', color: 'white' }}>{isTa ? (trip.status === 'Delivered' ? 'டெலிவரி செய்யப்பட்டது' : 'தோல்வி') : trip.status}</div>
                         <div style={{ fontSize: '.75rem', fontWeight: 900, color: 'var(--brown-mid)', marginTop: 8 }}>TRIP ID: KC-{trip.id.toString().slice(-6)} • {trip.date} at {trip.time}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginBottom: 8 }}>
                             <button onClick={() => shareTripOnWhatsApp(trip)} style={{ padding: 8, background: 'rgba(34, 197, 94, 0.1)', border: 'none', borderRadius: 8, color: 'var(--green)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                                <Share2 size={16} />
                             </button>
                          </div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--brown-deep)' }}>₹{trip.payout}</div>
                          <div style={{ fontSize: '.6rem', color: trip.status === 'Delivered' ? 'var(--green)' : 'var(--brown-mid)', fontWeight: 950 }}>{isTa ? (trip.status === 'Delivered' ? 'தீர்க்கப்பட்டது' : 'பணம் இல்லை') : (trip.status === 'Delivered' ? 'SETTLED' : 'NO PAYOUT')}</div>
                      </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 30 }}>
                      <div style={{ background: 'rgba(201, 146, 26, 0.05)', padding: 20, borderRadius: 16, border: '1.5px solid rgba(201, 146, 26, 0.1)' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--gold-deep)', fontWeight: 900, fontSize: '.75rem', marginBottom: 12 }}>
                            <Store size={16} /> {isTa ? 'பிக்கப் மையம்' : 'PICKUP ORIGIN'}
                         </div>
                         <div style={{ fontWeight: 950, color: 'var(--brown-deep)', fontSize: '1.1rem' }}>{isTa ? trip.shopName_ta : trip.shopName}</div>
                         <div style={{ fontSize: '.85rem', color: 'var(--brown-mid)', fontWeight: 700, margin: '4px 0' }}>{isTa ? trip.shopkeeperName_ta : trip.shopkeeperName}</div>
                         <div style={{ fontSize: '.8rem', color: 'var(--brown-mid)', fontWeight: 800 }}>📞 {trip.shopPhone}</div>
                      </div>

                      <div style={{ background: 'rgba(59, 31, 14, 0.03)', padding: 20, borderRadius: 16, border: '1.5px solid rgba(59, 31, 14, 0.1)' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--brown-mid)', fontWeight: 900, fontSize: '.75rem', marginBottom: 12 }}>
                            <User size={16} /> {isTa ? 'டெலிவரி சேருமிடம்' : 'DELIVERY DESTINATION'}
                         </div>
                         <div style={{ fontWeight: 950, color: 'var(--brown-deep)', fontSize: '1.1rem' }}>{isTa ? trip.customerName_ta : trip.customerName}</div>
                         <div style={{ fontSize: '.85rem', color: 'var(--brown-mid)', fontWeight: 700, margin: '4px 0' }}>📍 {isTa ? trip.deliveryAddress_ta : trip.deliveryAddress}</div>
                         <div style={{ fontSize: '.8rem', color: 'var(--brown-mid)', fontWeight: 800 }}>📞 {trip.customerPhone}</div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>
    );
  };

  const renderEarningsView = () => {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2.5rem', fontWeight: 950, color: 'var(--brown-deep)', marginBottom: 30 }}>{isTa ? 'நேரடி வருமானம்' : 'Live Earnings'}</h1>
        
        {/* EARNINGS SUMMARY STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 25, marginBottom: 40 }}>
           <div style={{ ...S.panel, background: 'var(--brown-deep)', color: 'white', padding: isMobile ? 30 : 40, border: '3.5px solid var(--gold)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                 <IndianRupee size={200} color="var(--gold)" />
              </div>
              <div style={{ fontSize: '.9rem', color: 'var(--gold)', letterSpacing: 2, fontWeight: 900, position: 'relative', zIndex: 1 }}>{isTa ? 'தற்போதைய ஷிப்ட் பேலன்ஸ்' : 'CURRENT SHIFT BALANCE'}</div>
              <div style={{ fontSize: isMobile ? '3.5rem' : '4.5rem', fontWeight: 950, color: 'var(--gold-light)', margin: '15px 0', position: 'relative', zIndex: 1 }}>₹{totalEarnings}</div>
              <div style={{ display: 'flex', gap: 15, position: 'relative', zIndex: 1 }}>
                 <button onClick={() => showToast(isTa ? '🏦 வங்கிக்கு திரும்பப் பெறும் கோரிக்கை அனுப்பப்பட்டது!' : '🏦 Withdrawal Request Sent to Bank!')} style={{ ...S.btnPrimary, background: 'var(--gold)', color: 'var(--brown-deep)', border: 'none', fontWeight: 950, height: 50 }}>{isTa ? 'வங்கிக்கு மாற்றவும்' : 'WITHDRAW TO BANK'}</button>
              </div>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr', gap: 20 }}>
              <div style={{ ...S.panel, padding: 25, marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 <div style={{ fontSize: '.7rem', fontWeight: 900, color: 'var(--brown-mid)', letterSpacing: 1 }}>{isTa ? 'ஆர்டர்கள் முடிக்கப்பட்டன' : 'TRIPS COMPLETED'}</div>
                 <div style={{ fontSize: '2.2rem', fontWeight: 950, color: 'var(--brown-deep)' }}>{tripHistory.filter(t => t.status === 'Delivered').length}</div>
              </div>
              <div style={{ ...S.panel, padding: 25, marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 <div style={{ fontSize: '.7rem', fontWeight: 900, color: 'var(--brown-mid)', letterSpacing: 1 }}>{isTa ? 'வேலை செய்த நேரம்' : 'SHIFT DURATION'}</div>
                 <div style={{ fontSize: '2.2rem', fontWeight: 950, color: 'var(--gold-deep)' }}>3h 12m</div>
              </div>
           </div>
        </div>

        {/* RECENT SETTLEMENTS LOG */}
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <History size={24} color="var(--brown-deep)" />
              <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '1.6rem', fontWeight: 950 }}>{isTa ? 'சமீபத்திய தீர்வு' : 'Recent Settlements'}</h3>
           </div>

           {tripHistory.length === 0 ? (
             <div style={{ ...S.panel, textAlign: 'center', padding: 60, color: 'var(--brown-mid)' }}>
                <Clock size={48} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
                <p style={{ fontWeight: 800 }}>{isTa ? 'இன்னும் ஆர்டர்கள் எதுவும் முடிக்கப்படவில்லை.' : 'No trips completed this shift yet. Start your cockpit route to see live history!'}</p>
             </div>
           ) : (
             <div style={{ display: 'grid', gap: 18 }}>
                {tripHistory.slice(0, 5).map(trip => (
                   <div key={trip.id} style={{ ...S.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderLeft: `6px solid ${trip.status === 'Delivered' ? 'var(--green)' : 'var(--rust)'}`, marginBottom: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                         <div style={{ width: 44, height: 44, borderRadius: 12, background: trip.status === 'Delivered' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: trip.status === 'Delivered' ? 'var(--green)' : 'var(--rust)', display: 'grid', placeItems: 'center' }}>
                            {trip.status === 'Delivered' ? <Check size={24} strokeWidth={3} /> : <AlertCircle size={24} strokeWidth={3} />}
                         </div>
                         <div>
                            <div style={{ fontWeight: 950, color: 'var(--brown-deep)', fontSize: '1.05rem' }}>{isTa ? trip.shopName_ta : trip.shopName} → {isTa ? trip.customerName_ta : trip.customerName}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--brown-mid)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                               <Clock size={12} /> {isTa ? (trip.status === 'Delivered' ? 'முடிந்தது' : 'தோல்வி') : trip.status} at {trip.time}
                            </div>
                         </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                         <div style={{ fontWeight: 950, fontSize: '1.4rem', color: 'var(--brown-deep)' }}>+₹{trip.status === 'Delivered' ? trip.payout : 0}</div>
                         <div style={{ fontSize: '.6rem', color: trip.status === 'Delivered' ? 'var(--green)' : 'var(--rust)', fontWeight: 900 }}>{(isTa ? (trip.status === 'Delivered' ? 'வெற்றி' : 'தோல்வி') : trip.status).toUpperCase()}</div>
                      </div>
                   </div>
                ))}
             </div>
           )}
        </div>
      </div>
    );
  };

  const renderProfileView = () => {
    switch(profileView) {
      case 'settings':
        return (
          <div style={{ maxWidth: 600, margin: '0 auto', animation: 'fadeUp 0.4s ease-out' }}>
            <button onClick={() => setProfileView('menu')} style={{ background: 'transparent', border: 'none', color: 'var(--brown-mid)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 25, cursor: 'pointer', fontWeight: 800 }}>
              <ArrowLeft size={18} /> {isTa ? 'சுயவிவரத்திற்குத் திரும்பு' : 'BACK TO PROFILE'}
            </button>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2.2rem', fontWeight: 950, color: 'var(--brown-deep)', marginBottom: 30 }}>{isTa ? 'கணக்கு அமைப்புகள்' : 'Account Settings'}</h1>
            
            <div style={{ ...S.panel }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '.75rem', fontWeight: 900, color: 'var(--brown-mid)', display: 'block', marginBottom: 8 }}>{isTa ? 'முழு பெயர்' : 'FULL NAME'}</label>
                <input style={S.input} value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '.75rem', fontWeight: 900, color: 'var(--brown-mid)', display: 'block', marginBottom: 8 }}>{isTa ? 'தொலைபேசி எண்' : 'PHONE NUMBER'}</label>
                <input style={S.input} value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '.75rem', fontWeight: 900, color: 'var(--brown-mid)', display: 'block', marginBottom: 8 }}>{isTa ? 'மின்னஞ்சல் முகவரி' : 'EMAIL ADDRESS'}</label>
                <input style={S.input} value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
              </div>
              <div style={{ marginBottom: 30 }}>
                <label style={{ fontSize: '.75rem', fontWeight: 900, color: 'var(--brown-mid)', display: 'block', marginBottom: 8 }}>{isTa ? 'வேலை ஷிப்ட்' : 'WORK SHIFT'}</label>
                <input style={S.input} value={profileData.shift} onChange={e => setProfileData({...profileData, shift: e.target.value})} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '.75rem', fontWeight: 900, color: 'var(--brown-mid)', display: 'block', marginBottom: 8 }}>{isTa ? 'மாவட்டம்' : 'DISTRICT'}</label>
                <select style={S.input} value={profileData.district} onChange={e => setProfileData({...profileData, district: e.target.value})}>
                  {TN_DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '.75rem', fontWeight: 900, color: 'var(--brown-mid)', display: 'block', marginBottom: 8 }}>{isTa ? 'முகவரி' : 'ADDRESS'}</label>
                <input style={S.input} value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} />
              </div>
              <button onClick={saveProfile} style={{ ...S.btnPrimary, width: '100%', justifyContent: 'center', height: 60, marginBottom: 24 }}>
                <Save size={20} /> {isTa ? 'கணக்கைப் புதுப்பிக்கவும்' : 'UPDATE ACCOUNT'}
              </button>

              {/* ── Danger Zone ── */}
              <div style={{ marginTop: 24, padding: '20px', border: '2px solid var(--rust)', background: '#fff9f9', borderRadius: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', color: 'var(--rust)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={20} /> {isTa ? 'அபாய பகுதி' : 'Danger Zone'}
                </h3>
                <p style={{ fontSize: '.8rem', color: 'var(--brown-mid)', marginBottom: 20, fontWeight: 700, lineHeight: 1.5 }}>
                  {isTa ? 'உங்கள் கணக்கை நீக்கினால், உங்கள் டெலிவரி வரலாறு மற்றும் வருமான விவரங்கள் அனைத்தும் நிரந்தரமாக நீக்கப்படும்.' : 'Deleting your account will permanently remove your delivery history, earnings data, and partner profile.'}
                </p>
                <button onClick={async () => {
                  if (window.confirm(isTa ? 'நிச்சயமாக உங்கள் கணக்கை நீக்க வேண்டுமா? இந்த செயலை மாற்ற முடியாது.' : 'Are you sure you want to delete your partner account? This action is irreversible.')) {
                    try {
                      const res = await apiFetch('/api/users/delete-account/', { method: 'DELETE' });
                      if (res?.ok) {
                        alert(isTa ? 'உங்கள் கணக்கு நீக்கப்பட்டது.' : 'Account deleted successfully.');
                        logout();
                        navigate('/login');
                      } else {
                        showToast(isTa ? 'நீக்க முடியவில்லை' : 'Deletion failed');
                      }
                    } catch (e) {
                      showToast('Error deleting account');
                    }
                  }
                }} style={{ width: '100%', padding: '16px', background: 'var(--rust)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 950, fontSize: '.85rem', cursor: 'pointer', fontFamily: 'var(--font-d)' }}>
                  {isTa ? 'கணக்கை நிரந்தரமாக நீக்கு' : 'PERMANENTLY DELETE ACCOUNT'}
                </button>
              </div>
            </div>
          </div>
        );
      case 'vehicle':
        return (
          <div style={{ maxWidth: 600, margin: '0 auto', animation: 'fadeUp 0.4s ease-out' }}>
            <button onClick={() => setProfileView('menu')} style={{ background: 'transparent', border: 'none', color: 'var(--brown-mid)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 25, cursor: 'pointer', fontWeight: 800 }}>
              <ArrowLeft size={18} /> {isTa ? 'சுயவிவரத்திற்குத் திரும்பு' : 'BACK TO PROFILE'}
            </button>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2.2rem', fontWeight: 950, color: 'var(--brown-deep)', marginBottom: 30 }}>{isTa ? 'வாகன விவரங்கள்' : 'Vehicle Information'}</h1>
            
            <div style={{ ...S.panel }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '.75rem', fontWeight: 900, color: 'var(--brown-mid)', display: 'block', marginBottom: 8 }}>{isTa ? 'வாகன வகை மற்றும் மாடல்' : 'VEHICLE TYPE & MODEL'}</label>
                <input style={S.input} value={vehicleData.type} onChange={e => setVehicleData({...vehicleData, type: e.target.value})} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '.75rem', fontWeight: 900, color: 'var(--brown-mid)', display: 'block', marginBottom: 8 }}>{isTa ? 'பதிவு எண் (TN-XX-XX-XXXX)' : 'REGISTRATION NUMBER (TN-XX-XX-XXXX)'}</label>
                <input style={S.input} value={vehicleData.regNo} onChange={e => setVehicleData({...vehicleData, regNo: e.target.value})} />
              </div>
              <div style={{ marginBottom: 30 }}>
                <label style={{ fontSize: '.75rem', fontWeight: 900, color: 'var(--brown-mid)', display: 'block', marginBottom: 8 }}>{isTa ? 'ஓட்டுநர் உரிம எண்' : 'LICENSE PLATE NUMBER'}</label>
                <input style={S.input} value={vehicleData.license} onChange={e => setVehicleData({...vehicleData, license: e.target.value})} />
              </div>
              <button onClick={saveVehicle} style={{ ...S.btnPrimary, width: '100%', justifyContent: 'center', height: 60 }}>
                <Check size={20} /> {isTa ? 'வாகன விவரங்களைச் சேமிக்கவும்' : 'SAVE VEHICLE DETAILS'}
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div style={{ maxWidth: 800, margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2.5rem', fontWeight: 950, color: 'var(--brown-deep)', marginBottom: 30 }}>{isTa ? 'பார்ட்னர் சுயவிவரம்' : 'Partner Profile'}</h1>
            <div style={{ ...S.panel, display: 'flex', alignItems: 'center', gap: 25, padding: 35 }}>
              <div style={{ width: isMobile ? 80 : 100, height: isMobile ? 80 : 100, borderRadius: '50%', background: 'var(--gold)', display: 'grid', placeItems: 'center', border: '4px solid var(--gold-light)' }}>
                <User size={isMobile ? 40 : 50} color="var(--brown-deep)" />
              </div>
              <div>
                <div style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 950, color: 'var(--brown-deep)' }}>{profileData.name}</div>
                <div style={{ color: 'var(--brown-mid)', fontWeight: 800 }}>{isTa ? 'பிளாட்டினம் ஐடி • 2024 முதல் செயல்படுகிறது' : 'Platinum ID • Active since 2024'}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 20, marginTop: 25 }}>
              <div onClick={() => setProfileView('settings')} style={{ ...S.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 25, cursor: 'pointer', transition: '0.2s', border: '1.5px solid var(--parchment)', marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--cream)', display: 'grid', placeItems: 'center', color: 'var(--brown-deep)' }}>
                    <Settings size={22} />
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--brown-deep)' }}>{isTa ? 'கணக்கு அமைப்புகள்' : 'Account Settings'}</div>
                </div>
                <ChevronRight size={20} color="var(--brown-mid)" />
              </div>
              <div onClick={() => setProfileView('vehicle')} style={{ ...S.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 25, cursor: 'pointer', transition: '0.2s', border: '1.5px solid var(--parchment)', marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--cream)', display: 'grid', placeItems: 'center', color: 'var(--brown-deep)' }}>
                    <Truck size={22} />
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--brown-deep)' }}>{isTa ? 'வாகன விவரங்கள்' : 'Vehicle Information'}</div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '.75rem', color: 'var(--brown-mid)', fontWeight: 700 }}>{vehicleData.regNo}</span>
                  <ChevronRight size={20} color="var(--brown-mid)" />
                </div>
              </div>
              <button onClick={() => { logout(); navigate('/login'); }} style={{ ...S.btnPrimary, background: 'var(--rust)', color: 'white', border: 'none', height: 60, width: '100%', justifyContent: 'center', marginTop: 10 }}>
                {isTa ? 'வெளியேறு' : 'LOGOUT'}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="db-shell" style={{ display: 'flex', flexDirection: 'column', background: '#f5f5f7', minHeight: '100vh', width: '100%', paddingBottom: 80 }}>
      {/* HEADER WITH ONLINE TOGGLE */}
      <header style={{ position: 'sticky', top: 0, zIndex: 11000, width: '100%', background: 'var(--brown-deep)', padding: isMobile ? '12px 20px' : '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3.5px solid var(--gold)', boxShadow: '0 8px 35px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 15 }}>
          <img src="/logo.png" alt="Logo" style={{ height: isMobile ? 32 : 44, border: '2.5px solid var(--gold)', borderRadius: 12 }} />
          <span style={{ fontFamily: 'var(--font-d)', fontWeight: 950, color: 'var(--gold-light)', fontSize: isMobile ? '1.1rem' : '1.6rem', letterSpacing: 0.5 }}>
            Kadai<span style={{ color: 'white' }}>Connect</span>
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 20 }}>
          <button 
            style={{ background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', position: 'relative', display: 'grid', placeItems: 'center', padding: 4 }}
            onClick={() => showToast(isTa ? 'புதிய அறிவிப்புகள் எதுவும் இல்லை' : 'No new notifications')}
          >
            <Bell size={isMobile ? 20 : 26} />
            <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: 'var(--gold)', borderRadius: '50%', border: '1.5px solid var(--brown-deep)' }}></span>
          </button>

          <button 
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en')}
            style={{ background: 'transparent', color: 'var(--gold)', border: '1.5px solid var(--gold)', padding: isMobile ? '4px 6px' : '6px 12px', borderRadius: 8, fontSize: isMobile ? '.6rem' : '.75rem', fontWeight: 950, cursor: 'pointer' }}
          >
            {i18n.language === 'en' ? 'த' : 'EN'}
          </button>

          <button onClick={() => setIsOnline(!isOnline)} style={{ background: isOnline ? 'var(--green)' : 'var(--brown-mid)', color: 'white', border: 'none', padding: isMobile ? '6px 10px' : '8px 16px', borderRadius: 30, fontSize: isMobile ? '.55rem' : '.75rem', fontWeight: 900, cursor: 'pointer', transition: '0.3s', whiteSpace: 'nowrap' }}>
            {isOnline ? (isTa ? 'ஆன்லைனில்' : 'ONLINE') : (isTa ? 'ஆஃப்லைனில்' : 'OFFLINE')}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '20px' : '40px' }}>
        
        {section === 'active' && (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 30 }}>
               <div>
                  <h1 style={{ fontFamily: 'var(--font-d)', fontSize: isMobile ? '1.8rem' : '2.6rem', fontWeight: 950, color: 'var(--brown-deep)' }}>{isTa ? 'நேரடி டிராக்கிங்' : 'Live Tracking'}</h1>
                  <p style={{ color: 'var(--brown-mid)', fontWeight: 800 }}>{optimizedStops.length} {isTa ? 'தற்போதைய பாதையில் நிறுத்தங்கள்' : 'stops in current Cockpit Path'}</p>
               </div>
            </div>

            {optimizedStops.length === 0 && (
              <div style={{ ...S.panel, textAlign: 'center', padding: '60px 20px', background: 'var(--brown-deep)', color: 'white', border: '3px solid var(--gold)', boxShadow: '10px 10px 0 var(--gold)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 20 }}>🛰️</div>
                <h2 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold-light)', fontSize: '1.8rem', fontWeight: 950, marginBottom: 10 }}>{isTa ? 'ஆர்டர்களுக்காக காத்திருக்கிறது...' : 'Waiting for Assignments...'}</h2>
                <p style={{ color: 'var(--parchment)', fontSize: '.95rem', maxWidth: 500, margin: '0 auto 25px', lineHeight: 1.6 }}>
                  {isTa 
                    ? 'நீங்கள் ஆன்லைனில் இருக்கிறீர்கள். உங்கள் பகுதிக்கு அருகிலுள்ள புதிய ஆர்டர்களை லோக்கல் ஸ்டோர்களில் இருந்து நாங்கள் தேடுகிறோம். தயவுசெய்து காத்திருக்கவும்!'
                    : "You're online and visible! We're scanning for local store orders in your vicinity. Keep this page open to receive the next optimized route cockpit."
                  }
                </p>
                <div style={{ display: 'flex', gap: 15, justifyContent: 'center' }}>
                  <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: 12, border: '1px solid var(--parchment)', fontSize: '.8rem' }}>
                    🟢 {isTa ? 'ஜிபிஎஸ் இணைக்கப்பட்டது' : 'GPS Signal Strong'}
                  </div>
                </div>
              </div>
            )}

            <LeafletMapView 
              driverPos={driverPos} 
              route={routePolyline} 
              stops={optimizedStops} 
              origin={SHOP_ORIGIN} 
              isMaximized={isMapMaximized}
              onToggleMaximize={() => setIsMapMaximized(!isMapMaximized)}
            />

            {/* ENRICHED TASK TRAY FOR MAXIMIZED MODE */}
            {isMapMaximized && (
               <div style={{ position: 'fixed', bottom: 100, left: 0, right: 0, zIndex: 10001, display: 'flex', justifyContent: 'center', padding: '10px 20px', overflowX: 'auto', gap: 15 }}>
                  {optimizedStops.map((d, i) => (
                     <div key={d.id} style={{ ...GLASS, flex: '0 0 280px', padding: 18, background: i === 0 ? 'var(--gold-light)' : 'rgba(255,255,255,0.95)', border: i === 0 ? '2.5px solid var(--brown-deep)' : '1.5px solid var(--parchment)' }}>
                        <div style={{ fontWeight: 950, fontSize: '.9rem', color: 'var(--brown-deep)' }}>{i + 1}. {isTa ? d.shopName_ta : d.shopName} → {isTa ? d.customerName_ta : d.customerName}</div>
                        <div style={{ fontSize: '.7rem', color: 'var(--brown-deep)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                           <MapPin size={12} /> {isTa ? d.deliveryAddress_ta : d.deliveryAddress}
                        </div>
                        {i === 0 && <button onClick={() => markDelivered(d.id)} style={{ ...S.btnPrimary, padding: '8px 12px', marginTop: 10, width: '100%', fontSize: '.7rem' }}>{isTa ? 'டெலிவரியை முடிக்கவும்' : 'COMPLETE DELIVERY'}</button>}
                     </div>
                  ))}
               </div>
            )}

            {/* DETAILED ACTIVE CARDS */}
            {!isMapMaximized && (
              <div style={{ marginTop: 40, display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))' }}>
                {optimizedStops.map((d, i) => (
                  <div key={d.id} style={{ ...S.panel, borderLeft: i === 0 ? '12px solid var(--gold)' : '2px solid var(--parchment)', overflow: 'hidden' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                           <div style={{ width: 44, height: 44, background: 'var(--brown-deep)', color: 'var(--gold)', borderRadius: 12, display: 'grid', placeItems: 'center', fontWeight: 950 }}>{i + 1}</div>
                           <div style={{ background: 'var(--brown-deep)', color: 'var(--gold)', padding: '6px 14px', borderRadius: 10, fontWeight: 950, fontSize: '0.9rem' }}>₹{d.payout}</div>
                        </div>
                        <div style={{ ...S.statusBadge, background: i === 0 ? 'var(--gold)' : 'var(--brown-mid)', color: i === 0 ? 'var(--brown-deep)' : 'white' }}>{i === 0 ? (isTa ? 'இப்போது செயலில்' : 'ACTIVE NOW') : (isTa ? 'வழியில்' : 'EN ROUTE')}</div>
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                        {/* PICKUP SECTION */}
                        <div style={{ padding: 15, background: 'rgba(201, 146, 26, 0.08)', borderRadius: 16, border: '1px solid rgba(201, 146, 26, 0.2)' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gold-deep)', fontWeight: 900, fontSize: '.7rem', marginBottom: 10 }}>
                              <Store size={14} /> {isTa ? 'பிக்கப் மையம்' : 'PICKUP FROM'}
                           </div>
                           <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--brown-deep)' }}>{isTa ? d.shopName_ta : d.shopName}</div>
                           <div style={{ fontSize: '.8rem', color: 'var(--brown-mid)', marginTop: 4, fontWeight: 700 }}>{isTa ? d.shopkeeperName_ta : d.shopkeeperName}</div>
                           <a href={`tel:${d.shopPhone}`} style={{ ...S.btnSecondary, marginTop: 12, width: 'max-content' }}>
                              <Phone size={14} /> {isTa ? 'கடைக்கு அழைக்கவும்' : 'CALL SHOP'}
                           </a>
                        </div>

                        {/* DROP-OFF SECTION */}
                        <div style={{ padding: 15, background: 'rgba(59, 31, 14, 0.04)', borderRadius: 16, border: '1px solid rgba(59, 31, 14, 0.1)' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brown-mid)', fontWeight: 900, fontSize: '.7rem', marginBottom: 10 }}>
                              <User size={14} /> {isTa ? 'டெலிவரி செய்ய வேண்டியவர்' : 'DELIVER TO'}
                           </div>
                           <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--brown-deep)' }}>{isTa ? d.customerName_ta : d.customerName}</div>
                           <div style={{ fontSize: '.8rem', color: 'var(--brown-mid)', marginTop: 4, fontWeight: 700 }}>📍 {isTa ? d.deliveryAddress_ta : d.deliveryAddress}</div>
                           <a href={`tel:${d.customerPhone}`} style={{ ...S.btnSecondary, marginTop: 12, width: 'max-content' }}>
                              <Phone size={14} /> {isTa ? 'வாடிக்கையாளரை அழைக்கவும்' : 'CALL CUSTOMER'}
                           </a>
                        </div>
                     </div>

                     {i === 0 && (
                        <button onClick={() => markDelivered(d.id)} style={{ ...S.btnPrimary, width: '100%', marginTop: 25, background: 'var(--green)', border: 'none', color: 'white', height: 55 }}>
                          <CheckCircle size={22} /> {isTa ? 'சரிபார்த்து முடிக்கவும்' : 'VERIFY & COMPLETE'}
                        </button>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {section === 'upcoming' && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2.5rem', fontWeight: 950, color: 'var(--brown-deep)', marginBottom: 30 }}>{isTa ? 'வரவிருக்கும் பணிகள்' : 'Upcoming Assignments'}</h1>
            <p style={{ color: 'var(--brown-mid)', fontWeight: 800, marginBottom: 40 }}>{upcoming.length} {isTa ? 'உடனடி மேம்படுத்தலுக்குத் தயாராக உள்ள ஆர்டர்கள்' : 'batches available for immediate sequence optimization'}</p>
            <div style={{ display: 'grid', gap: 30, gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
              {upcoming.map(u => (
                <div key={u.id} style={{ ...S.panel, padding: 30, borderTop: '8px solid var(--gold)', position: 'relative', overflow: 'hidden' }}>
                   <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--brown-deep)', color: 'var(--gold)', padding: '10px 18px', borderBottomLeftRadius: 20, fontWeight: 950, fontSize: '1.1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                      ₹{u.payout}
                   </div>
                   <div style={{ display: 'flex', gap: 15, marginBottom: 25 }}>
                      <div style={{ width: 50, height: 50, background: 'var(--cream)', borderRadius: 14, display: 'grid', placeItems: 'center', border: '1.5px solid var(--parchment)' }}>
                         <Package size={24} color="var(--brown-deep)" strokeWidth={2} />
                      </div>
                      <div style={{ maxWidth: 'calc(100% - 100px)' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--brown-deep)', marginBottom: 4 }}>{isTa ? u.shopName_ta : u.shopName} {isTa ? 'ஆர்டர்' : 'Batch'}</div>
                        <div style={{ fontSize: '.85rem', color: 'var(--brown-mid)', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isTa ? 'வாடிக்கையாளர்:' : 'Deliver to'} {isTa ? u.customerName_ta : u.customerName}</div>
                      </div>
                   </div>
                   <div style={{ background: 'rgba(59, 31, 14, 0.03)', padding: 18, borderRadius: 16, border: '1.5px solid var(--parchment)', marginBottom: 25 }}>
                      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                         <Store size={16} style={{ marginTop: 2, color: 'var(--gold-deep)' }} />
                         <span style={{ fontSize: '.8rem', color: 'var(--brown-deep)', fontWeight: 800 }}>
                            <strong>{isTa ? 'பிக்கப்:' : 'Pickup:'}</strong> {isTa ? u.pickupAddress_ta : u.pickupAddress}
                         </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                         <MapPin size={16} style={{ marginTop: 2, color: 'var(--brown-mid)' }} />
                         <span style={{ fontSize: '.8rem', color: 'var(--brown-deep)', fontWeight: 800 }}>
                            <strong>{isTa ? 'சேருமிடம்:' : 'Drop:'}</strong> {isTa ? u.deliveryAddress_ta : u.deliveryAddress}
                         </span>
                      </div>
                   </div>
                    <button 
                      disabled={claimingId === u.id}
                      onClick={() => claimTask(u)} 
                      style={{ ...S.btnPrimary, width: '100%', justifyContent: 'center', height: 55, opacity: claimingId === u.id ? 0.7 : 1 }}
                    >
                       {claimingId === u.id ? (isTa ? 'ஏற்கப்படுகிறது...' : 'CLAIMING...') : (
                         <>
                           <Check size={20} /> {isTa ? 'ஏற்றுக்கொள்ளவும்' : 'ACCEPT TO COCKPIT'}
                         </>
                       )}
                    </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'earnings' && renderEarningsView()}
        {section === 'history' && renderHistoryView()}
        {section === 'profile' && renderProfileView()}

      </main>

      {/* MODAL FOR STATUS SELECTION */}
      {showStatusModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 20000, display: 'grid', placeItems: 'center', padding: 20 }}>
           <div style={{ ...S.panel, width: '100%', maxWidth: 500, padding: 40, position: 'relative' }}>
              <button onClick={() => setShowStatusModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', color: 'var(--brown-mid)', cursor: 'pointer' }}>
                 <X size={28} />
              </button>
              <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontWeight: 950, color: 'var(--brown-deep)', marginBottom: 10 }}>{isTa ? 'பயண முடிவு' : 'Trip Outcome'}</h2>
              <p style={{ color: 'var(--brown-mid)', fontWeight: 800, marginBottom: 30 }}>{isTa ? 'தற்போதைய நிலையைப் புதுப்பிக்கவும்:' : 'Update mandatory status for:'} <strong style={{ color: 'var(--brown-deep)' }}>{isTa ? activeTripToComplete?.customerName_ta : activeTripToComplete?.customerName}</strong></p>
              
              <div style={{ display: 'grid', gap: 15 }}>
                 {[
                   { id: 'Delivered', label: isTa ? 'டெலிவரி செய்யப்பட்டது' : 'Successfully Delivered', icon: <CheckCircle size={20} />, color: 'var(--green)' },
                   { id: 'No Answer', label: isTa ? 'அழைப்பை எடுக்கவில்லை' : 'Customer Not Picking Call', icon: <PhoneOff size={20} />, color: 'var(--rust)' },
                   { id: 'Returned', label: isTa ? 'கடைக்கே திருப்பப்பட்டது' : 'Returned to Store', icon: <RotateCcw size={20} />, color: 'var(--gold-deep)' },
                   { id: 'Issue', label: isTa ? 'பிரச்சினை / சேதம்' : 'Issue / Damaged', icon: <AlertCircle size={20} />, color: 'var(--rust)' }
                 ].map(opt => (
                    <button key={opt.id} onClick={() => handleStatusSubmit(opt.id)} style={{ width: '100%', padding: '18px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '2px solid var(--parchment)', borderRadius: 16, cursor: 'pointer', transition: '0.2s', fontWeight: 850 }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 15, color: 'var(--brown-deep)' }}>
                          <div style={{ color: opt.color }}>{opt.icon}</div>
                          {opt.label}
                       </div>
                       <ChevronRight size={18} color="var(--parchment)" />
                    </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* FULL-WIDTH PERSISTENT BOTTOM NAVBAR */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 80, background: 'var(--brown-deep)', borderTop: '3.5px solid var(--gold)', zIndex: 9000, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 10px', boxShadow: '0 -8px 30px rgba(0,0,0,0.2)' }}>
        {navItems.map(n => (
          <button 
            key={n.key} 
            onClick={() => { setSection(n.key); if (n.key === 'profile') setProfileView('menu'); }} 
            style={{ 
              background: section === n.key ? 'var(--gold)' : 'transparent', 
              border: 'none', 
              color: section === n.key ? 'var(--brown-deep)' : 'var(--parchment)', 
              cursor: 'pointer', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '10px 0', 
              width: '20%',
              height: '100%',
              transition: '0.3s'
            }}
          >
            {n.icon}
            <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>{n.label}</span>
          </button>
        ))}
      </nav>

      <Toast msg={toast.msg} visible={toast.visible} />
    </div>
  );
}
