import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoomCard from '../../components/RoomCard';
import {
  getProperty, updateProperty, uploadImages,
  getRooms, addRoom, updateRoom, deleteRoom,
} from '../../services/api';

const AMENITIES = ['WiFi', 'Food', 'AC', 'Parking', 'Laundry', 'Power Backup'];
const emptyRoom = { roomType: 'Single', price: '', capacity: 1, availableBeds: 1, amenities: [] };

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [files, setFiles] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = () => {
    getProperty(id).then((res) => {
      setForm(res.data.property);
      setRooms(res.data.rooms);
    });
  };

  useEffect(() => { load(); }, [id]);

  if (!form) return <p className="page-loading">Loading...</p>;

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let images = form.images || [];
      if (files.length) {
        const fd = new FormData();
        Array.from(files).forEach((f) => fd.append('images', f));
        const uploadRes = await uploadImages(fd);
        images = [...images, ...uploadRes.data.paths];
      }
      const res = await updateProperty(id, { ...form, price: Number(form.price), images });
      setForm(res.data);
      setFiles([]);
      setNotice('Property updated. It will be reviewed by an admin again.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update property');
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...roomForm, price: Number(roomForm.price), capacity: Number(roomForm.capacity), availableBeds: Number(roomForm.availableBeds) };
    if (editingRoomId) {
      await updateRoom(editingRoomId, payload);
    } else {
      await addRoom(id, payload);
    }
    setRoomForm(emptyRoom);
    setEditingRoomId(null);
    const res = await getRooms(id);
    setRooms(res.data);
  };

  const handleEditRoom = (room) => {
    setEditingRoomId(room._id);
    setRoomForm({
      roomType: room.roomType, price: room.price, capacity: room.capacity,
      availableBeds: room.availableBeds, amenities: room.amenities || [],
    });
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Delete this room?')) return;
    await deleteRoom(roomId);
    setRooms((prev) => prev.filter((r) => r._id !== roomId));
  };

  return (
    <div className="edit-property-page">
      <form className="auth-form wide" onSubmit={handleSave}>
        <h2>Edit Property</h2>
        {error && <div className="notice notice-error">{error}</div>}
        {notice && <div className="notice">{notice}</div>}

        <label>Title</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

        <label>Description</label>
        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <div className="form-row">
          <div>
            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {['PG', 'Hostel', 'Room', 'Apartment'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label>Gender preference</label>
            <select value={form.genderPreference} onChange={(e) => setForm({ ...form, genderPreference: e.target.value })}>
              {['Any', 'Male', 'Female'].map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <label>Address</label>
        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />

        <div className="form-row">
          <div>
            <label>City</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <div>
            <label>Area / Locality</label>
            <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required />
          </div>
        </div>

        <label>Base price (₹/month)</label>
        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />

        <label className="filter-checkbox">
          <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />
          Currently available
        </label>

        <label>Amenities</label>
        <div className="amenity-toggle">
          {AMENITIES.map((a) => (
            <button type="button" key={a} className={`chip ${form.amenities.includes(a) ? 'chip-active' : ''}`} onClick={() => toggleAmenity(a)}>
              {a}
            </button>
          ))}
        </div>

        {form.images?.length > 0 && (
          <div className="pd-thumbs">
            {form.images.map((img, i) => <img key={i} src={img} alt="" />)}
          </div>
        )}
        <label>Add more photos</label>
        <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} />

        <button className="btn btn-primary" type="submit">Save changes</button>
      </form>

      <div className="room-manager">
        <h2>Rooms</h2>
        <div className="room-grid">
          {rooms.map((r) => <RoomCard key={r._id} room={r} onEdit={handleEditRoom} onDelete={handleDeleteRoom} />)}
        </div>

        <form className="auth-form" onSubmit={handleRoomSubmit}>
          <h3>{editingRoomId ? 'Edit Room' : 'Add a Room'}</h3>
          <label>Room type</label>
          <select value={roomForm.roomType} onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}>
            {['Single', 'Double', 'Triple', 'Dormitory'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <label>Price (₹/month)</label>
          <input type="number" value={roomForm.price} onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })} required />
          <div className="form-row">
            <div>
              <label>Capacity</label>
              <input type="number" min={1} value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} />
            </div>
            <div>
              <label>Available beds</label>
              <input type="number" min={0} value={roomForm.availableBeds} onChange={(e) => setRoomForm({ ...roomForm, availableBeds: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">{editingRoomId ? 'Update room' : 'Add room'}</button>
          {editingRoomId && (
            <button type="button" className="btn btn-ghost" onClick={() => { setEditingRoomId(null); setRoomForm(emptyRoom); }}>
              Cancel edit
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
