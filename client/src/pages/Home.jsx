import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { searchProperties } from '../services/api';
import HeroBackground from '../components/HeroBackground';
import MapModal from '../components/MapModal';
import OsmMapSection from '../components/OsmMapSection';

const TYPES = ['PG', 'Hostel', 'Room', 'Apartment'];
const PRICE_RANGES = [
  { label: 'Any price', min: '', max: '' },
  { label: 'Under ₹5,000', min: '', max: '5000' },
  { label: '₹5,000 - ₹8,000', min: '5000', max: '8000' },
  { label: '₹8,000 - ₹12,000', min: '8000', max: '12000' },
  { label: 'Above ₹12,000', min: '12000', max: '' },
];
const ROOM_TYPES = ['Any', 'Single', 'Double', 'Triple', 'Dormitory'];
const LISTING_LIMIT = 12;

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({ type: '', priceIdx: 0, city: '', roomType: 'Any' });

  useEffect(() => {
    searchProperties({ limit: LISTING_LIMIT, sort: '-ratingAvg' })
      .then((res) => setFeatured(res.data.properties))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  const handleQuickType = (t) => setForm((f) => ({ ...f, type: f.type === t ? '' : t }));

  const handleSearch = (e) => {
    e.preventDefault();
    const range = PRICE_RANGES[form.priceIdx];
    const params = new URLSearchParams();
    if (form.city) params.set('q', form.city);
    if (form.type) params.set('type', form.type);
    if (range.min) params.set('minPrice', range.min);
    if (range.max) params.set('maxPrice', range.max);
    if (form.roomType && form.roomType !== 'Any') params.set('roomType', form.roomType);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      <div className="hero-v2">
        <HeroBackground />
        <div className="hero-v2-overlay" />

        <div className="hero-v2-content">
          <div className="hero-tags">
            {TYPES.map((t) => (
              <button key={t} type="button" className={`hero-tag ${form.type === t ? 'active' : ''}`} onClick={() => handleQuickType(t)}>
                {t}
              </button>
            ))}
          </div>
          <h1>Find Your Perfect<br />Stay, One Room at a Time.</h1>
          <p className="hero-v2-sub">PGs • Hostels • Rooms across India — find your next place easily.</p>
        </div>

        <div className="hero-search-row">
          <form className="search-card" onSubmit={handleSearch}>
            <h3>Find the best place</h3>
            <div className="search-card-row">
              <div className="search-field">
                <label>Looking for</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="">Any type</option>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="search-field">
                <label>Price</label>
                <select value={form.priceIdx} onChange={(e) => setForm({ ...form, priceIdx: Number(e.target.value) })}>
                  {PRICE_RANGES.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
                </select>
              </div>
              <div className="search-field">
                <label>Location</label>
                <input type="text" placeholder="City or area" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="search-field">
                <label>Room type</label>
                <select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}>
                  {ROOM_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button className="btn btn-dark search-card-btn" type="submit">Search Properties</button>
            </div>
          </form>

          <div className="map-panel" onClick={() => setMapOpen(true)}>
            <div className="map-panel-icon">🗺️</div>
            <h3>Search On  map</h3>
            <p>Browse PGs, hostels and guest houses visually.</p>
            <button className="btn btn-accent" type="button" onClick={(e) => { e.stopPropagation(); setMapOpen(true); }}>
              Open Map
            </button>
          </div>
        </div>
      </div>

      <section className="section listed-section">
        <h2>Top Rated Properties</h2>
        {loading ? (
          <div className="property-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img" />
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="empty-state">No listings yet. Be the first owner to add one!</p>
        ) : (
          <div className="property-grid">
            {featured.map((p) => <PropertyCard key={p._id} property={p} />)}
          </div>
        )}
      </section>

      <MapModal open={mapOpen} onClose={() => setMapOpen(false)}>
        <OsmMapSection />
      </MapModal>
    </div>
  );
};

export default Home;