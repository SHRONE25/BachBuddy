import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';

import Home from './pages/Home';
import Search from './pages/Search';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Saved from './pages/Saved';
import Messages from './pages/Messages';

import OwnerDashboard from './pages/owner/Dashboard';
import OwnerProperties from './pages/owner/Properties';
import AddProperty from './pages/owner/AddProperty';
import EditProperty from './pages/owner/EditProperty';

import AdminDashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/Properties';
import AdminUsers from './pages/admin/Users';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

          <Route path="/owner/dashboard" element={<ProtectedRoute roles={['owner', 'admin']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/properties" element={<ProtectedRoute roles={['owner', 'admin']}><OwnerProperties /></ProtectedRoute>} />
          <Route path="/owner/properties/add" element={<ProtectedRoute roles={['owner', 'admin']}><AddProperty /></ProtectedRoute>} />
          <Route path="/owner/properties/:id/edit" element={<ProtectedRoute roles={['owner', 'admin']}><EditProperty /></ProtectedRoute>} />

          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/properties" element={<ProtectedRoute roles={['admin']}><AdminProperties /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />

          <Route path="*" element={<div className="empty-state">Page not found.</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
