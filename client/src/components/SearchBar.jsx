import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocations } from '../services/api';

const POPULAR = ['Bhopal', 'Pune', 'Mumbai', 'Delhi', 'Bangalore'];

const SearchBar = ({ initialValue = '' }) => {
  const [q, setQ] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await getLocations(q);
        const combined = [...new Set([...res.data.cities, ...res.data.areas])].slice(0, 8);
        setSuggestions(combined);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timeoutRef.current);
  }, [q]);

  const doSearch = (value) => {
    const term = value ?? q;
    if (!term) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="searchbar-wrap">
      <div className="searchbar">
        <span className="searchbar-icon">🔍</span>
        <input
          type="text"
          placeholder="Search city / area / locality"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch()}
        />
        <button className="btn btn-primary" onClick={() => doSearch()}>Search</button>

        {open && suggestions.length > 0 && (
          <ul className="searchbar-suggestions">
            {suggestions.map((s) => (
              <li key={s} onClick={() => doSearch(s)}>{s}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="searchbar-popular">
        <span>Popular:</span>
        {POPULAR.map((city) => (
          <button key={city} className="chip" onClick={() => doSearch(city)}>{city}</button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
