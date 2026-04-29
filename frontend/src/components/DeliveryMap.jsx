import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const greenIcon = createCustomIcon('green');
const redIcon = createCustomIcon('red');
const blueIcon = createCustomIcon('blue');

const bikeIconHtml = `
  <div class="bike-marker">
    <div class="bike-rider">🛵</div>
    <div class="bike-shadow"></div>
  </div>
`;

const bikeIcon = L.divIcon({
  html: bikeIconHtml,
  className: 'animated-bike-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 35],
});

export default function DeliveryMap({ pickupCoords, deliveryCoords, currentCoords, onRouteUpdate }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const routeRef = useRef(null);
  const markerRefs = useRef([]);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const center = currentCoords ? [currentCoords.lat, currentCoords.lng] : [12.9229, 80.1275];
    mapInstance.current = L.map(mapRef.current).setView(center, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstance.current) return;

    const updateMarker = (key, coords, icon, label) => {
      if (markersRef.current[key]) {
        mapInstance.current.removeLayer(markersRef.current[key]);
      }
      if (coords?.lat && coords?.lng) {
        markersRef.current[key] = L.marker([coords.lat, coords.lng], { icon, zIndexOffset: key === 'driver' ? 1000 : 0 })
          .addTo(mapInstance.current)
          .bindPopup(`<strong>${label}</strong>`);
      }
    };

    updateMarker('pickup', pickupCoords, greenIcon, 'Pickup');
    updateMarker('delivery', deliveryCoords, redIcon, 'Drop Location');
    
    // Smart Bike Positioning: If driver pos is missing but status is picked_up, show at store
    let finalDriverPos = currentCoords;
    if ((!finalDriverPos || !finalDriverPos.lat) && pickupCoords?.lat) {
        finalDriverPos = pickupCoords;
    }
    
    if (finalDriverPos?.lat && finalDriverPos?.lng) {
        updateMarker('driver', finalDriverPos, bikeIcon, 'Delivery Partner');
    }

    // Fit bounds if we have multiple points
    const all = [pickupCoords, deliveryCoords, finalDriverPos].filter(c => c?.lat && c?.lng);
    if (all.length >= 2 && mapInstance.current) {
      const bounds = L.latLngBounds(all.map(c => [c.lat, c.lng]));
      try {
        mapInstance.current.invalidateSize();
        mapInstance.current.fitBounds(bounds, { padding: [50, 50], animate: false });
      } catch (e) {
        console.warn("Leaflet fitBounds error caught", e);
      }
    }
  }, [pickupCoords?.lat, pickupCoords?.lng, deliveryCoords?.lat, deliveryCoords?.lng, currentCoords?.lat, currentCoords?.lng]);

  // Update Route
  useEffect(() => {
    if (!mapInstance.current) return;

    const fetchRoute = async () => {
      if (!deliveryCoords?.lat) return;
      
      const waypoints = [];
      const isValid = (c) => c?.lat && c?.lng && Math.abs(c.lat) > 0.01;
      
      if (isValid(currentCoords)) waypoints.push(`${currentCoords.lng},${currentCoords.lat}`);
      if (isValid(pickupCoords)) waypoints.push(`${pickupCoords.lng},${pickupCoords.lat}`);
      if (isValid(deliveryCoords)) waypoints.push(`${deliveryCoords.lng},${deliveryCoords.lat}`);

      if (waypoints.length < 2) {
        console.warn("Not enough valid waypoints for routing", waypoints);
        return;
      }

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${waypoints.join(';')}?overview=full&geometries=geojson`;
        console.log("Fetching route:", url);
        const res = await fetch(url);
        const data = await res.json();

        if (!mapInstance.current) return;

        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          const path = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

          if (routeRef.current && mapInstance.current.hasLayer(routeRef.current)) {
            mapInstance.current.removeLayer(routeRef.current);
          }
          routeRef.current = L.polyline(path, { color: 'var(--gold)', weight: 6, opacity: 0.8, lineJoin: 'round' }).addTo(mapInstance.current);

          if (onRouteUpdate) {
            onRouteUpdate({
              distance: (route.distance / 1000).toFixed(1),
              duration: Math.round(route.duration / 60)
            });
          }
        } else {
          throw new Error("No OSRM route found");
        }
      } catch (err) {
        console.error("OSRM Error, falling back to straight line", err);
        // Fallback: Straight dashed line
        const fallbackPath = [];
        if (isValid(currentCoords)) fallbackPath.push([currentCoords.lat, currentCoords.lng]);
        if (isValid(pickupCoords)) fallbackPath.push([pickupCoords.lat, pickupCoords.lng]);
        if (isValid(deliveryCoords)) fallbackPath.push([deliveryCoords.lat, deliveryCoords.lng]);
        
        if (fallbackPath.length >= 2) {
          if (routeRef.current && mapInstance.current.hasLayer(routeRef.current)) {
            mapInstance.current.removeLayer(routeRef.current);
          }
          routeRef.current = L.polyline(fallbackPath, { color: 'var(--brown-mid)', weight: 3, opacity: 0.5, dashArray: '10, 10' }).addTo(mapInstance.current);
        }
      }
    };

    fetchRoute();
  }, [pickupCoords?.lat, pickupCoords?.lng, deliveryCoords?.lat, deliveryCoords?.lng, currentCoords?.lat, currentCoords?.lng]);

  return (
    <div 
      ref={mapRef} 
      style={{ height: '100%', width: '100%', borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--gold)', background: '#f8f9fa' }} 
    />
  );
}
