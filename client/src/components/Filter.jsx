import React from 'react';

const PROPERTY_TYPES = ['PG', 'Hostel', 'Room', 'Apartment'];
const GENDERS = ['Male', 'Female', 'Any'];
const ROOM_TYPES = ['Single', 'Double', 'Triple', 'Dormitory'];
const AMENITIES = ['WiFi', 'Food', 'AC', 'Parking', 'Laundry', 'Power Backup'];

// filters shape:
// { type: [], gender: '', roomType: [], amenities: [], minPrice, maxPrice }
const Filter = ({ filters, onChange }) => {
  const toggleArrayValue = (key, value) => {
    const arr = filters[key] || [];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <aside className="filters">
      <h3>Filters</h3>

      <div className="filter-group">
        <label>Budget (₹/month)</label>
        <div className="filter-range">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
          />
          <span>–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Property type</label>
        {PROPERTY_TYPES.map((t) => (
          <label key={t} className="filter-checkbox">
            <input
              type="checkbox"
              checked={(filters.type || []).includes(t)}
              onChange={() => toggleArrayValue('type', t)}
            />
            {t}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <label>Gender</label>
        {GENDERS.map((g) => (
          <label key={g} className="filter-checkbox">
            <input
              type="radio"
              name="gender"
              checked={filters.gender === g}
              onChange={() => onChange({ ...filters, gender: g })}
            />
            {g}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <label>Room type</label>
        {ROOM_TYPES.map((r) => (
          <label key={r} className="filter-checkbox">
            <input
              type="checkbox"
              checked={(filters.roomType || []).includes(r)}
              onChange={() => toggleArrayValue('roomType', r)}
            />
            {r}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <label>Amenities</label>
        {AMENITIES.map((a) => (
          <label key={a} className="filter-checkbox">
            <input
              type="checkbox"
              checked={(filters.amenities || []).includes(a)}
              onChange={() => toggleArrayValue('amenities', a)}
            />
            {a}
          </label>
        ))}
      </div>

      <button
        className="btn btn-ghost filter-clear"
        onClick={() => onChange({ type: [], gender: '', roomType: [], amenities: [], minPrice: '', maxPrice: '' })}
      >
        Clear filters
      </button>
    </aside>
  );
};

export default Filter;
