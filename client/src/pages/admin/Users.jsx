import React, { useEffect, useState } from 'react';
import { getAdminUsers, getAdminOwners, toggleBlockUser } from '../../services/api';

const Users = () => {
  const [tab, setTab] = useState('user');
  const [list, setList] = useState([]);

  const load = () => {
    const fetcher = tab === 'user' ? getAdminUsers : getAdminOwners;
    fetcher().then((res) => setList(res.data));
  };

  useEffect(() => { load(); }, [tab]);

  const handleBlock = async (id) => {
    await toggleBlockUser(id);
    load();
  };

  return (
    <div className="section">
      <h2>Manage {tab === 'user' ? 'Users' : 'Owners'}</h2>
      <div className="admin-filter-tabs">
        <button className={`chip ${tab === 'user' ? 'chip-active' : ''}`} onClick={() => setTab('user')}>Users</button>
        <button className={`chip ${tab === 'owner' ? 'chip-active' : ''}`} onClick={() => setTab('owner')}>Owners</button>
      </div>

      <table className="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Reported</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {list.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone || '—'}</td>
              <td>{u.isReported ? 'Yes' : 'No'}</td>
              <td><span className={`badge ${u.isBlocked ? 'badge-unavailable' : 'badge-available'}`}>{u.isBlocked ? 'Blocked' : 'Active'}</span></td>
              <td className="table-actions">
                <button className="btn btn-ghost" onClick={() => handleBlock(u._id)}>{u.isBlocked ? 'Unblock' : 'Block'}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <p className="empty-state">No records found.</p>}
    </div>
  );
};

export default Users;
