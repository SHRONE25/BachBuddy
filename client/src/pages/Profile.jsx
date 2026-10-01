import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', password: '' });
  const [notice, setNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, phone: form.phone };
    if (form.password) payload.password = form.password;
    const res = await updateMe(payload);
    updateUser(res.data);
    setForm({ ...form, password: '' });
    setNotice('Profile updated.');
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>My Profile</h2>
        {notice && <div className="notice">{notice}</div>}
        <label>Email</label>
        <input value={user.email} disabled />
        <label>Role</label>
        <input value={user.role} disabled />
        <label>Full name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label>Phone</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <label>New password (optional)</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn-primary" type="submit">Save changes</button>
      </form>
    </div>
  );
};

export default Profile;
