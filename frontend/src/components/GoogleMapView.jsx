import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { Truck, Store, MapPin, Navigation, Maximize, Minimize, X } from 'lucide-react';

const center = { lat: 13.0418, lng: 80.2341 };

export default function GoogleMapView({ apiKey, driverPos, route, stops, origin, isMaximized, onToggleMaximize }) {
  const [loadError, setLoadError] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerStyle = isMaximized 
    ? { position: 'fixed', inset: 0, zIndex: 12000, width: '100vw', height: '100vh', background: '#f8f9fc' } 
    : { width: '100%', height: isMobile ? '320px' : '480px', borderRadius: '24px', border: '3.5px solid var(--parchment)', boxShadow: '0 12px 60px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' };

  // Simulation fallback UI
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div style={containerStyle}>
        {/* Map Visualization Background */}
        <div style={{ position: 'absolute', inset: 0, background: '#f8f9fc', opacity: 1 }}>
          <svg width="100%" height="100%" style={{opacity: 0.15}}>
             <defs>
               <pattern id="city-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                 <path d="M 60 0 L 0 0 0 60" fill="none" stroke="var(--brown-deep)" strokeWidth="0.8"/>
               </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#city-grid)" />
          </svg>
        </div>

        {/* TOP STATUS HUB (When Maximized) */}
        {isMaximized && (
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(59,31,14,0.95)', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid var(--gold)', zIndex: 50 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                 <div style={{ background: 'var(--gold)', color: 'var(--brown-deep)', padding: '5px 12px', borderRadius: 10, fontSize: '.7rem', fontWeight: 950 }}>COCKPIT MODE</div>
                 <div style={{ color: 'var(--gold-light)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, background: 'var(--green)', borderRadius: '50%', animation: 'pulse-live 1s infinite' }} />
                    LIVE OPTIMIZATION ACTIVE
                 </div>
              </div>
              <button 
                onClick={onToggleMaximize}
                style={{ background: 'var(--brown-deep)', color: 'var(--gold)', border: '2px solid var(--gold)', borderRadius: 12, padding: 8, cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
           </div>
        )}

        {/* MINIMIZE/MAXIMIZE BUTTON (When NOT Maximized) */}
        {!isMaximized && (
          <button 
            onClick={onToggleMaximize}
            style={{ position: 'absolute', top: 20, right: 20, zIndex: 100, background: 'var(--brown-deep)', color: 'var(--gold-light)', border: '2px solid var(--gold)', borderRadius: 12, padding: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
          >
            <Maximize size={22} />
          </button>
        )}

        {/* ORIGIN HUB */}
        <div style={{ position: 'absolute', left: `${origin?.x || 15}%`, top: `${origin?.y || 55}%`, transform: 'translate(-50%, -100%)', zIndex: 5 }}>
          <div style={{ background: 'var(--brown-deep)', color: 'var(--gold)', padding: '4px 10px', borderRadius: 8, fontSize: '.6rem', fontWeight: 900, border: '1.5px solid var(--gold)', marginBottom: 4 }}>PICKUP HUB</div>
          <div style={{ width: 14, height: 14, background: 'var(--gold)', borderRadius: '50%', margin: '0 auto', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} />
        </div>

        {/* CUSTOMER STOPS */}
        {stops.map((s, i) => (
          <div key={s.id} style={{ position: 'absolute', left: `${s.lng * 1000 % 100}%`, top: `${s.lat * 1000 % 100}%`, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
            <div style={{ width: 34, height: 34, background: 'var(--gold)', borderRadius: '50%', border: '3px solid var(--brown-deep)', display: 'grid', placeItems: 'center', fontSize: '1rem', fontWeight: 900, color: 'var(--brown-deep)', boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }}>{i + 1}</div>
          </div>
        ))}

        {/* ANIMATED DRIVER BIKE */}
        <div style={{ position: 'absolute', left: `${(driverPos?.lng || 0) * 1000 % 100}%`, top: `${(driverPos?.lat || 0) * 1000 % 100}%`, transform: 'translate(-50%, -50%)', zIndex: 200, transition: '0.6s linear' }}>
            <div style={{ padding: 10, background: 'var(--cream)', borderRadius: '50%', border: '2.5px solid var(--brown-deep)', boxShadow: '0 12px 35px rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center' }}>
              <Truck size={30} fill="var(--gold)" color="var(--brown-deep)" />
            </div>
        </div>

        {styleSheet}
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} onError={() => setLoadError(true)}>
      {loadError ? (
        <div style={containerStyle}>Error loading Google Maps.</div>
      ) : (
        <div style={containerStyle}>
          <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={origin || center} zoom={14}>
            <Marker position={origin} label="Pickup Hub" />
            {stops.map((stop, i) => (
              <Marker key={stop.id} position={{ lat: stop.lat, lng: stop.lng }} label={`${i + 1}`} />
            ))}
            {driverPos && <Marker position={driverPos} icon={{ url: '/bike-icon.png', scaledSize: new window.google.maps.Size(50, 50) }} />}
            {route && <Polyline path={route} options={{ strokeColor: '#C9921A', strokeOpacity: 0.8, strokeWeight: 6 }} />}
          </GoogleMap>
          
          <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 50 }}>
             <button onClick={onToggleMaximize} style={{ background: 'var(--brown-deep)', color: 'var(--gold)', border: '2px solid var(--gold)', borderRadius: 10, padding: 8 }}>
                {isMaximized ? <X size={24} /> : <Maximize size={24} />}
             </button>
          </div>
        </div>
      )}
    </LoadScript>
  );
}

const styleSheet = (
  <style>{`
    @keyframes pulse-live { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
  `}</style>
);
