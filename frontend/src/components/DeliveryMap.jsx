import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Self-contained emoji icons — no external URLs, never broken
const shopIcon = L.divIcon({
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.45))">🏪</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 28],
  popupAnchor: [0, -28],
});

const homeIcon = L.divIcon({
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.45))">🏠</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 28],
  popupAnchor: [0, -28],
});

const bikeIcon = L.divIcon({
  html: `<div style="font-size:32px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5))">🛵</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 32],
  popupAnchor: [0, -32],
});

// District-center fallbacks for Tamil Nadu
const DISTRICT_CENTERS = {
  'Chennai':      { lat: 13.0827, lng: 80.2707 },
  'Coimbatore':   { lat: 11.0168, lng: 76.9558 },
  'Madurai':      { lat: 9.9252,  lng: 78.1198 },
  'Tambaram':     { lat: 12.9249, lng: 80.1000 },
  'Chengalpattu': { lat: 12.6920, lng: 79.9762 },
  'Vandalur':     { lat: 12.8921, lng: 80.0830 },
  'Maraimalai Nagar': { lat: 12.7958, lng: 80.0269 },
  'default':      { lat: 12.9229, lng: 80.1275 },
};

function getDistrictCenter(address) {
  if (!address) return DISTRICT_CENTERS.default;
  const lower = address.toLowerCase();
  for (const [key, coords] of Object.entries(DISTRICT_CENTERS)) {
    if (key !== 'default' && lower.includes(key.toLowerCase())) return coords;
  }
  return DISTRICT_CENTERS.default;
}

export default function DeliveryMap({ pickupCoords, deliveryCoords, currentCoords, orderAddress, onRouteUpdate }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const routeRef = useRef(null);

  // Always resolve a destination — use geocoded coords or address-based fallback
  const resolvedDelivery = (deliveryCoords?.lat && deliveryCoords?.lng)
    ? deliveryCoords
    : getDistrictCenter(orderAddress);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const center = pickupCoords?.lat
      ? [pickupCoords.lat, pickupCoords.lng]
      : [resolvedDelivery.lat, resolvedDelivery.lng];
    mapInstance.current = L.map(mapRef.current, { zoomControl: true }).setView(center, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers and route line
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const setMarker = (key, coords, icon, label) => {
      if (markersRef.current[key]) { map.removeLayer(markersRef.current[key]); delete markersRef.current[key]; }
      if (coords?.lat && coords?.lng) {
        markersRef.current[key] = L.marker([coords.lat, coords.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${label}</strong>`);
      }
    };

    // Place all three markers
    setMarker('pickup', pickupCoords, shopIcon, '🏪 Shop (Pickup)');
    setMarker('delivery', resolvedDelivery, homeIcon, '🏠 Your Home');
    const driverPos = (currentCoords?.lat && currentCoords?.lng) ? currentCoords : pickupCoords;
    setMarker('driver', driverPos, bikeIcon, '🛵 Delivery Partner');

    // DRAW ROUTE
    if (routeRef.current && map.hasLayer(routeRef.current)) map.removeLayer(routeRef.current);
    const points = [pickupCoords, resolvedDelivery].filter(c => c?.lat && c?.lng);
    if (points.length >= 2) {
      const wp = points.map(c => `${c.lng},${c.lat}`).join(';');
      fetch(`https://router.project-osrm.org/route/v1/driving/${wp}?overview=full&geometries=geojson`)
        .then(r => r.json())
        .then(data => {
          if (!mapInstance.current) return;
          if (data.code === 'Ok' && data.routes?.[0]) {
            const path = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            routeRef.current = L.polyline(path, { color: '#C9921A', weight: 6, opacity: 0.9, lineJoin: 'round' }).addTo(mapInstance.current);
            if (onRouteUpdate) onRouteUpdate({
              distance: (data.routes[0].distance / 1000).toFixed(1),
              duration: Math.round(data.routes[0].duration / 60),
            });
          } else throw new Error('no route');
        })
        .catch(() => {
          if (!mapInstance.current) return;
          routeRef.current = L.polyline(
            points.map(c => [c.lat, c.lng]),
            { color: '#C9921A', weight: 4, opacity: 0.7, dashArray: '10,10' }
          ).addTo(mapInstance.current);
        });

      // Fit map to all markers with a slight delay to ensure container is ready
      setTimeout(() => {
        if (!mapInstance.current) return;
        const allPts = [pickupCoords, resolvedDelivery, driverPos].filter(c => c?.lat && c?.lng);
        if (allPts.length >= 2) {
          mapInstance.current.invalidateSize();
          mapInstance.current.fitBounds(L.latLngBounds(allPts.map(c => [c.lat, c.lng])), { padding: [40, 40], animate: true });
        }
      }, 100);
    }
  }, [
    pickupCoords?.lat, pickupCoords?.lng,
    deliveryCoords?.lat, deliveryCoords?.lng,
    currentCoords?.lat, currentCoords?.lng,
    orderAddress,
  ]);

  return (
    <div
      ref={mapRef}
      style={{ height: '100%', width: '100%', borderRadius: 12, overflow: 'hidden', border: '2px solid #C9921A', background: '#f0f0f0' }}
    />
  );
}
