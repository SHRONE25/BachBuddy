import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty, uploadImages } from '../../services/api';

const AMENITIES = ['WiFi', 'Food', 'AC', 'Parking', 'Laundry', 'Power Backup'];

const AddProperty = () => {
  const [form, setForm] = useState({
    title: '', description: '', type: 'PG', genderPreference: 'Any',
    address: '', city: '', area: '', price: '', amenities: [],
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      let images = [];
      if (files.length) {
        const fd = new FormData();
        Array.from(files).forEach((f) => fd.append('images', f));
        const uploadRes = await uploadImages(fd);
        images = uploadRes.data.paths;
      }

      const res = await createProperty({ ...form, price: Number(form.price), images });
      navigate(`/owner/properties/${res.data._id}/edit`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form wide" onSubmit={handleSubmit}>
        <h2>Add New Property</h2>
        {error && <div className="notice notice-error">{error}</div>}

        <label>Title</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

        <label>Description</label>
        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <div className="form-row">
          <div>
            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {['PG', 'Hostel', 'Room', 'Apartment'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label>Gender preference</label>
            <select value={form.genderPreference} onChange={(e) => setForm({ ...form, genderPreference: e.target.value })}>
              {['Any', 'Male', 'Female'].map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <label>Address</label>
        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />

        <div className="form-row">
          <div>
            <label>City</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <div>
            <label>Area / Locality</label>
            <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required />
          </div>
        </div>

        <label>Base price (₹/month)</label>
        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />

        <label>Amenities</label>
        <div className="amenity-toggle">
          {AMENITIES.map((a) => (
            <button
              type="button"
              key={a}
              className={`chip ${form.amenities.includes(a) ? 'chip-active' : ''}`}
              onClick={() => toggleAmenity(a)}
            >
              {a}
            </button>
          ))}
        </div>

        <label>Photos</label>
        <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} />

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Create property'}
        </button>
        <p className="help-text">New listings go through a quick admin review before they appear publicly. You can add rooms right after.</p>
      </form>
    </div>
  );
};

export default AddProperty;
