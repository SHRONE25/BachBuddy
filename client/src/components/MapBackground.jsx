import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CITIES = [
  [23.2599, 77.4126], // Bhopal
  [18.5204, 73.8567], // Pune
  [19.076, 72.8777],  // Mumbai
  [28.6139, 77.209],  // Delhi
  [12.9716, 77.5946], // Bangalore
];

const MapBackground = () => {
  const ref = useRef(null);

  useEffect(() => {
    const map = L.map(ref.current, {
      center: CITIES[0],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % CITIES.length;
      map.flyTo(CITIES[i], 12, { duration: 6 });
    }, 9000);

    return () => {
      clearInterval(timer);
      map.remove();
    };
  }, []);

  return <div ref={ref} className="map-bg" />;
};

export default MapBackground;