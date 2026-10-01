import React, { useEffect, useState } from 'react';
import { getAdminProperties, setPropertyStatus, adminRemoveProperty } from '../../services/api';

const statusColor = { approved: 'badge-available', pending: 'badge-pending', rejected: 'badge-unavailable' };

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState('');

  const load = () => {
    const params = filter === 'reported' ? { reported: 'true' } : filter ? { status: filter } : {};
    getAdminProperties(params).then((res) => setProperties(res.data));
  };

  useEffect(() => { load(); }, [filter]);

  const handleStatus = async (id, status) => {
    await setPropertyStatus(id, status);
    load();
  };

  const handleRemove = async (id) => {
    if (!confirm('Permanently remove this listing?')) return;
    await adminRemoveProperty(id);
    load();
  };

  return (
    <div className="section">
      <h2>Manage Properties</h2>

      <div className="admin-filter-tabs">
        {['', 'pending', 'approved', 'rejected', 'reported'].map((f) => (
          <button key={f || 'all'} className={`chip ${filter === f ? 'chip-active' : ''}`} onClick={() => setFilter(f)}>
            {f === '' ? 'All' : f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <table className="data-table">
        <thead>
          <tr><th>Title</th><th>Owner</th><th>City</th><th>Status</th><th>Reported</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {properties.map((p) => (
            <tr key={p._id}>
              <td>{p.title}</td>
              <td>{p.owner?.name}</td>
              <td>{p.city}</td>
              <td><span className={`badge ${statusColor[p.status]}`}>{p.status}</span></td>
              <td>{p.isReported ? `Yes (${p.reportReasons?.length || 0})` : 'No'}</td>
              <td className="table-actions">
                {p.status !== 'approved' && <button className="btn btn-ghost" onClick={() => handleStatus(p._id, 'approved')}>Approve</button>}
                {p.status !== 'rejected' && <button className="btn btn-ghost" onClick={() => handleStatus(p._id, 'rejected')}>Reject</button>}
                <button className="btn btn-danger" onClick={() => handleRemove(p._id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {properties.length === 0 && <p className="empty-state">No properties found for this filter.</p>}
    </div>
  );
};

export default Properties;
