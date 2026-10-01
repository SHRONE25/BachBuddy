import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProperties } from '../../services/api';

const Dashboard = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    getMyProperties().then((res) => setProperties(res.data));
  }, []);

  const counts = {
    total: properties.length,
    approved: properties.filter((p) => p.status === 'approved').length,
    pending: properties.filter((p) => p.status === 'pending').length,
    rejected: properties.filter((p) => p.status === 'rejected').length,
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>Owner Dashboard</h2>
        <Link to="/owner/properties/add" className="btn btn-primary">+ Add Property</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><strong>{counts.total}</strong><span>Total listings</span></div>
        <div className="stat-card"><strong>{counts.approved}</strong><span>Approved</span></div>
        <div className="stat-card"><strong>{counts.pending}</strong><span>Pending review</span></div>
        <div className="stat-card"><strong>{counts.rejected}</strong><span>Rejected</span></div>
      </div>

      <p>
        Manage your listings from <Link to="/owner/properties">Properties</Link> or check{' '}
        <Link to="/messages">Messages</Link> from interested renters.
      </p>
    </div>
  );
};

export default Dashboard;
