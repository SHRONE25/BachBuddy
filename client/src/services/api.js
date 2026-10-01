import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('sf_token');
      localStorage.removeItem('sf_user');
    }
    return Promise.reject(err);
  }
);

// ---- Auth ----
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateMe = (data) => api.put('/auth/me', data);

// ---- Properties ----
export const searchProperties = (params) => api.get('/properties', { params });
export const getLocations = (q) => api.get('/properties/locations', { params: { q } });
export const getProperty = (id) => api.get(`/properties/${id}`);
export const createProperty = (data) => api.post('/properties', data);
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/properties/${id}`);
export const getMyProperties = () => api.get('/properties/mine/list');
export const toggleSaveProperty = (id) => api.post(`/properties/${id}/save`);
export const getSavedProperties = () => api.get('/properties/saved/list');
export const reportProperty = (id, reason) => api.post(`/properties/${id}/report`, { reason });

// ---- Rooms ----
export const getRooms = (propertyId) => api.get(`/rooms/property/${propertyId}`);
export const addRoom = (propertyId, data) => api.post(`/rooms/property/${propertyId}`, data);
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`);

// ---- Messages ----
export const startConversation = (data) => api.post('/messages/conversations', data);
export const getConversations = () => api.get('/messages/conversations');
export const getMessages = (conversationId) => api.get(`/messages/conversations/${conversationId}`);
export const sendMessage = (conversationId, text) => api.post(`/messages/conversations/${conversationId}`, { text });

// ---- Reviews ----
export const getReviews = (propertyId) => api.get(`/reviews/property/${propertyId}`);
export const addReview = (propertyId, data) => api.post(`/reviews/property/${propertyId}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// ---- Uploads ----
export const uploadImages = (formData) =>
  api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// ---- Admin ----
export const getAdminSummary = () => api.get('/admin/summary');
export const getAdminUsers = () => api.get('/admin/users');
export const getAdminOwners = () => api.get('/admin/owners');
export const getAdminProperties = (params) => api.get('/admin/properties', { params });
export const setPropertyStatus = (id, status) => api.put(`/admin/properties/${id}/status`, { status });
export const adminRemoveProperty = (id) => api.delete(`/admin/properties/${id}`);
export const toggleBlockUser = (id) => api.put(`/admin/users/${id}/block`);

export default api;
