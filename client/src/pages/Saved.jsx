import React, { useEffect, useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import { getSavedProperties, toggleSaveProperty } from '../services/api';

const Saved = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getSavedProperties().then((res) => setProperties(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggleSave = async (id) => {
    await toggleSaveProperty(id);
    setProperties((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="section">
      <h2>Saved Properties</h2>
      {loading ? (
        <p>Loading...</p>
      ) : properties.length === 0 ? (
        <p className="empty-state">You haven't saved any properties yet.</p>
      ) : (
        <div className="property-grid">
          {properties.map((p) => (
            <PropertyCard key={p._id} property={p} saved onToggleSave={handleToggleSave} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;
