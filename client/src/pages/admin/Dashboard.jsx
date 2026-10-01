import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminSummary } from '../../services/api';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => { getAdminSummary().then((res) => setSummary(res.data)); }, []);

  if (!summary) return <p className="page-loading">Loading...</p>;

  return (
    <div className="section">
      <h2>Admin Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card"><strong>{summary.users}</strong><span>Users</span></div>
        <div className="stat-card"><strong>{summary.owners}</strong><span>Owners</span></div>
        <div className="stat-card"><strong>{summary.properties}</strong><span>Properties</span></div>
        <div className="stat-card"><strong>{summary.pending}</strong><span>Pending review</span></div>
        <div className="stat-card"><strong>{summary.reportedProperties}</strong><span>Reported listings</span></div>
        <div className="stat-card"><strong>{summary.reportedUsers}</strong><span>Reported users</span></div>
      </div>
      <p>
        Go to <Link to="/admin/properties">Properties</Link> to approve/reject listings and handle reports.
      </p>
    </div>
  );
};

export default Dashboard;
