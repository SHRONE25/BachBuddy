import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      const redirectTo = location.state?.from
        || (user.role === 'owner' ? '/owner/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/');
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Log in to BachBuddy</h2>
        {error && <div className="notice notice-error">{error}</div>}
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn btn-primary" type="submit">Log in</button>
        <p>New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
};

export default Login;
