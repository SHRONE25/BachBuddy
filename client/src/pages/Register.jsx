import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'user' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await register(form);
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create your account</h2>
        {error && <div className="notice notice-error">{error}</div>}

        <label>I am a</label>
        <div className="role-toggle">
          <button type="button" className={form.role === 'user' ? 'active' : ''} onClick={() => setForm({ ...form, role: 'user' })}>Looking for a stay</button>
          <button type="button" className={form.role === 'owner' ? 'active' : ''} onClick={() => setForm({ ...form, role: 'owner' })}>Property owner</button>
        </div>

        <label>Full name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />

        <button className="btn btn-primary" type="submit">Sign up</button>
        <p>Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
};

export default Register;
