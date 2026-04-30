import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize, X } from 'lucide-react';

// Self-contained emoji icons — no external URLs, never broken
const DefaultIcon = L.divIcon({
  html: `<div style="font-size:24px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">📍</div>`,
  className: '',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom Truck Icon Creator
const createTruckIcon = () => {
  return L.divIcon({
    html: `<div style="font-size:32px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5))">🛵</div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};


export default function LeafletMapView({ driverPos, route, stops, origin, isMaximized, onToggleMaximize }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layersRef = useRef({
    markers: [],
    polyline: null,
    driverMarker: null
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Sync mobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initialCenter = origin ? [origin.lat, origin.lng] : [13.0418, 80.2341];
    
    const map = L.map(mapRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update Map Content
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // 1. Clear existing layers
    layersRef.current.markers.forEach(m => map.removeLayer(m));
    layersRef.current.markers = [];
    if (layersRef.current.polyline) map.removeLayer(layersRef.current.polyline);
    if (layersRef.current.driverMarker) map.removeLayer(layersRef.current.driverMarker);

    // 2. Add Origin
    if (origin) {
      const m = L.marker([origin.lat, origin.lng], { icon: DefaultIcon })
        .addTo(map)
        .bindPopup('<strong>Pickup Hub</strong>');
      layersRef.current.markers.push(m);
    }

    // 3. Add Stops
    if (stops) {
      stops.forEach((stop, i) => {
        const m = L.marker([stop.lat, stop.lng], {
          icon: L.divIcon({
            html: `<div style="background: var(--gold); width: 30px; height: 30px; border-radius: 50%; border: 3px solid var(--brown-deep); display: flex; align-items: center; justify-content: center; font-weight: 950; color: var(--brown-deep); box-shadow: 0 4px 10px rgba(0,0,0,0.2);">${i + 1}</div>`,
            className: 'stop-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })
        }).addTo(map).bindPopup(`
          <div style="font-family: 'Outfit', sans-serif; padding: 5px;">
            <div style="color: var(--gold-deep); font-weight: 950; font-size: 1.1rem; margin-bottom: 5px;">
              Stop #${i + 1}: ${stop.customerName}
            </div>
            <div style="font-size: 0.85rem; color: var(--brown-deep); line-height: 1.4;">
              <b>Store:</b> ${stop.shopName}<br/>
              <b>Status:</b> <span style="text-transform: capitalize;">${stop.status.replace('_', ' ')}</span><br/>
              <b>Address:</b> ${stop.deliveryAddress}
            </div>
          </div>
        `);
        layersRef.current.markers.push(m);
      });
    }

    // 4. Add Polyline
    if (route && route.length > 0) {
      const positions = route.map(p => [p.lat, p.lng]);
      layersRef.current.polyline = L.polyline(positions, {
        color: '#C9921A',
        weight: 6,
        opacity: 0.8
      }).addTo(map);
    }

    // 5. Add Driver
    if (driverPos) {
      layersRef.current.driverMarker = L.marker([driverPos.lat, driverPos.lng], {
        icon: createTruckIcon(),
        zIndexOffset: 1000
      })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: 'Outfit', sans-serif; padding: 5px; text-align: center;">
          <div style="color: var(--brown-deep); font-weight: 950; font-size: 1.1rem; margin-bottom: 5px;">
            YOU (Pilot)
          </div>
          <div style="font-size: 0.8rem; color: var(--gold-deep); font-weight: 800;">
            Real-time Tracking Active
          </div>
        </div>
      `);
      
      // Auto-center map to driver
      map.setView([driverPos.lat, driverPos.lng], map.getZoom());
    }

  }, [driverPos, route, stops, origin]);

  // Handle Resize
  useEffect(() => {
    if (mapInstance.current) {
      setTimeout(() => {
        mapInstance.current.invalidateSize();
      }, 100);
    }
  }, [isMaximized, isMobile]);

  const containerStyle = isMaximized 
    ? { position: 'fixed', inset: 0, zIndex: 12000, width: '100vw', height: '100vh' } 
    : { 
        width: '100%', 
        height: isMobile ? '320px' : '480px', 
        borderRadius: '24px', 
        border: '3.5px solid var(--parchment)', 
        boxShadow: '0 12px 60px rgba(0,0,0,0.15)', 
        position: 'relative', 
        overflow: 'hidden', 
        zIndex: 1 
      };

  return (
    <div style={containerStyle} className="leaflet-map-wrapper">
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '100%', background: '#f8f9fc' }} 
      />

      {/* Controls */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10000 }}>
         <button 
           onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleMaximize(); }} 
           style={{ background: 'var(--brown-deep)', color: 'var(--gold)', border: '2px solid var(--gold)', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
         >
            {isMaximized ? <X size={24} /> : <Maximize size={24} />}
         </button>
      </div>

      <style>{`
        .leaflet-marker-icon { border: none !important; background: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 12px; border: 2px solid var(--gold); }
      `}</style>
    </div>
  );
}
