import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const QUICK_CITIES = {
  Bhopal: { lat: 23.2599, lng: 77.4126 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const buildQuery = ({ lat, lng }) => `[out:json][timeout:25];
(
  nwr["tourism"~"^(hostel|guest_house)$"](around:15000,${lat},${lng});
  nwr["amenity"="student_accommodation"](around:15000,${lat},${lng});
);
out center 40;`;

const typeLabel = (t) =>
  t.tourism === 'hostel' ? 'Hostel'
  : t.tourism === 'guest_house' ? 'Guest house'
  : 'Student accommodation';

const fetchPlaces = async (point) => {
  const body = 'data=' + encodeURIComponent(buildQuery(point));
  let lastErr;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.elements
        .map((el) => {
          const t = el.tags || {};
          return {
            id: el.id,
            name: t.name,
            lat: el.lat ?? el.center?.lat,
            lng: el.lon ?? el.center?.lon,
            kind: typeLabel(t),
            address: [t['addr:housenumber'], t['addr:street'], t['addr:suburb'], t['addr:city'], t['addr:postcode']]
              .filter(Boolean).join(', '),
            phone: t.phone || t['contact:phone'] || '',
            email: t.email || t['contact:email'] || '',
            website: t.website || t['contact:website'] || '',
            openingHours: t.opening_hours || '',
            stars: t.stars || '',
            wheelchair: t.wheelchair || '',
            internet: t.internet_access || '',
            operator: t.operator || '',
          };
        })
        .filter((p) => p.name && p.lat != null && p.lng != null);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
};

const geocode = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding failed');
  const results = await res.json();
  if (!results.length) return null;
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
};

const yesNo = (v) => (v === 'yes' ? 'Yes' : v === 'no' ? 'No' : v || '');

const OsmMapSection = () => {
  const mapDiv = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const markersRef = useRef([]);
  const cacheRef = useRef({});

  const [locationLabel, setLocationLabel] = useState('Bhopal');
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const map = L.map(mapDiv.current, { center: [QUICK_CITIES.Bhopal.lat, QUICK_CITIES.Bhopal.lng], zoom: 12 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => map.remove();
  }, []);

  const loadPlacesFor = async (point, label) => {
    setStatus('loading');
    setPlaces([]);
    setSelected(null);
    setLocationLabel(label);

    try {
      const cacheKey = label.toLowerCase();
      if (!cacheRef.current[cacheKey]) cacheRef.current[cacheKey] = await fetchPlaces(point);
      const list = cacheRef.current[cacheKey];

      const map = mapRef.current;
      layerRef.current.clearLayers();
      markersRef.current = [];

      list.forEach((p, i) => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 8, color: '#fff', weight: 2, fillColor: '#ff385c', fillOpacity: 0.95,
        });
        marker.on('click', () => setSelected(list[i]));
        marker.addTo(layerRef.current);
        markersRef.current.push(marker);
      });

      if (list.length) map.fitBounds(list.map((p) => [p.lat, p.lng]), { padding: [40, 40], maxZoom: 15 });
      else map.setView([point.lat, point.lng], 12);

      setPlaces(list);
      setStatus('ready');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (mapRef.current) loadPlacesFor(QUICK_CITIES.Bhopal, 'Bhopal');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef.current]);

  const handleQuickCity = (name) => loadPlacesFor(QUICK_CITIES[name], name);

  const handleSearch = async (e) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    setStatus('loading');
    try {
      const found = await geocode(term);
      if (!found) { setStatus('not-found'); return; }
      await loadPlacesFor(found, term);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const focusPlace = (p) => {
    mapRef.current.setView([p.lat, p.lng], 16);
    setSelected(p);
  };

  return (
    <section className="section">
      <h2>Explore stays on the map</h2>
      <p className="help-text">
        Live results from OpenStreetMap. These are not BachBuddy listings, so booking happens directly with the place.
      </p>

      <form className="osm-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Type any city or area (e.g. Indore, Jaipur, Chennai)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      <div className="type-buttons">
        {Object.keys(QUICK_CITIES).map((c) => (
          <button
            key={c}
            className={`chip chip-lg ${locationLabel === c ? 'chip-active' : ''}`}
            onClick={() => handleQuickCity(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {status === 'not-found' && (
        <div className="notice notice-error" style={{ marginTop: 14 }}>
          Couldn't find "{query}". Try a more specific name, like "Indore, India".
        </div>
      )}
      {status === 'error' && (
        <div className="notice notice-error" style={{ marginTop: 14 }}>
          Couldn't load places right now. The free server may be busy, so try again in a moment.
        </div>
      )}

      <div className="gmap-layout">
        <div ref={mapDiv} className="gmap" />
        <ul className="gmap-list">
          {status === 'loading' && <li>Searching {locationLabel}...</li>}
          {status === 'ready' && places.length === 0 && <li>No places found near {locationLabel} on OpenStreetMap.</li>}
          {places.map((p) => (
            <li key={p.id} onClick={() => focusPlace(p)} className={selected?.id === p.id ? 'active' : ''}>
              <strong>{p.name}</strong>
              <small>{p.kind}</small>
              {p.address && <small>{p.address}</small>}
            </li>
          ))}
        </ul>
      </div>

      {selected && (
        <div className="place-detail-card">
          <button className="place-detail-close" onClick={() => setSelected(null)}>✕</button>
          <h3>{selected.name}</h3>
          <span className="badge">{selected.kind}</span>
          {selected.stars && <span className="badge">★ {selected.stars}-star</span>}

          <div className="place-detail-grid">
            {selected.address && <div><strong>Address</strong><p>{selected.address}</p></div>}
            {selected.phone && <div><strong>Phone</strong><p><a href={`tel:${selected.phone}`}>{selected.phone}</a></p></div>}
            {selected.email && <div><strong>Email</strong><p><a href={`mailto:${selected.email}`}>{selected.email}</a></p></div>}
            {selected.website && (
              <div><strong>Website</strong><p><a href={selected.website} target="_blank" rel="noreferrer">{selected.website}</a></p></div>
            )}
            {selected.openingHours && <div><strong>Hours</strong><p>{selected.openingHours}</p></div>}
            {selected.operator && <div><strong>Operator</strong><p>{selected.operator}</p></div>}
            {selected.wheelchair && <div><strong>Wheelchair access</strong><p>{yesNo(selected.wheelchair)}</p></div>}
            {selected.internet && <div><strong>Internet</strong><p>{selected.internet}</p></div>}
          </div>

          {!selected.phone && !selected.email && !selected.website && (
            <p className="help-text">No contact details are recorded for this place on OpenStreetMap yet.</p>
          )}

          <div className="place-detail-actions">
            <a
              className="btn btn-ghost"
              target="_blank"
              rel="noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
            >
              View & read reviews on Google Maps ↗
            </a>
            <a
              className="btn btn-ghost"
              target="_blank"
              rel="noreferrer"
              href={`https://www.openstreetmap.org/${selected.id}`}
            >
              View on OpenStreetMap ↗
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

export default OsmMapSection;