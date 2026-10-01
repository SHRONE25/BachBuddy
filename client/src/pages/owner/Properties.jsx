import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProperties, deleteProperty } from '../../services/api';

const statusColor = { approved: 'badge-available', pending: 'badge-pending', rejected: 'badge-unavailable' };

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMyProperties().then((res) => setProperties(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this property? This cannot be undone.')) return;
    await deleteProperty(id);
    load();
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>My Properties</h2>
        <Link to="/owner/properties/add" className="btn btn-primary">+ Add Property</Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : properties.length === 0 ? (
        <p className="empty-state">You haven't listed any properties yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr><th>Title</th><th>City</th><th>Price</th><th>Status</th><th>Available</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p._id}>
                <td>{p.title}</td>
                <td>{p.city}</td>
                <td>₹{p.price?.toLocaleString('en-IN')}</td>
                <td><span className={`badge ${statusColor[p.status]}`}>{p.status}</span></td>
                <td>{p.isAvailable ? 'Yes' : 'No'}</td>
                <td className="table-actions">
                  <Link to={`/owner/properties/${p._id}/edit`} className="btn btn-ghost">Edit</Link>
                  <button className="btn btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Properties;
