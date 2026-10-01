import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import { useAuth } from '../context/AuthContext';
import {
  getProperty, toggleSaveProperty, getSavedProperties,
  startConversation, addReview, reportProperty,
} from '../services/api';

const FALLBACK_IMG = 'https://placehold.co/800x500?text=BachBuddy';

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [notice, setNotice] = useState('');

  const load = () => {
    setLoading(true);
    getProperty(id).then((res) => setData(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (!user) return;
    getSavedProperties().then((res) => setSaved(res.data.some((p) => p._id === id))).catch(() => {});
  }, [user, id]);

  if (loading) return <p className="page-loading">Loading...</p>;
  if (!data) return <p className="empty-state">Property not found.</p>;

  const { property, rooms, reviews } = data;
  const images = property.images?.length ? property.images : [FALLBACK_IMG];

  const handleSave = async () => {
    if (!user) return navigate('/login');
    const res = await toggleSaveProperty(id);
    setSaved(res.data.saved);
  };

  const handleContact = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!msgText.trim()) return;
    await startConversation({ recipientId: property.owner._id, propertyId: property._id, text: msgText });
    setMsgText('');
    setNotice('Message sent! Check your Messages tab.');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await addReview(id, { rating: Number(reviewRating), comment: reviewComment });
      setReviewComment('');
      load();
    } catch (err) {
      setNotice(err.response?.data?.message || 'Could not submit review');
    }
  };

  const handleReport = async () => {
    if (!user) return navigate('/login');
    const reason = prompt('Why are you reporting this listing?') || '';
    await reportProperty(id, reason);
    setNotice('Thanks — this listing has been reported to our team.');
  };

  return (
    <div className="property-details">
      {notice && <div className="notice">{notice}</div>}

      <div className="pd-gallery">
        <img src={images[activeImg]} alt={property.title} className="pd-main-img" />
        {images.length > 1 && (
          <div className="pd-thumbs">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                className={i === activeImg ? 'active' : ''}
                onClick={() => setActiveImg(i)}
                alt=""
              />
            ))}
          </div>
        )}
      </div>

      <div className="pd-main">
        <div className="pd-header">
          <div>
            <h1>{property.title}</h1>
            <p className="property-card-location">{property.address}, {property.area}, {property.city}</p>
          </div>
          <div className="pd-header-actions">
            <button className={`btn ${saved ? 'btn-primary' : 'btn-ghost'}`} onClick={handleSave}>
              {saved ? '♥ Saved' : '♡ Save'}
            </button>
            <button className="btn btn-ghost" onClick={handleReport}>Report</button>
          </div>
        </div>

        <div className="pd-tags">
          <span className="badge">{property.type}</span>
          <span className="badge">{property.genderPreference}</span>
          {property.ratingCount > 0 && <span className="badge">★ {property.ratingAvg} ({property.ratingCount} reviews)</span>}
        </div>

        <h3>₹{property.price?.toLocaleString('en-IN')}/month</h3>

        <p>{property.description || 'No description provided.'}</p>

        <h3>Amenities</h3>
        <div className="property-card-tags">
          {property.amenities?.length ? property.amenities.map((a) => <span key={a}>{a}</span>) : <span>None listed</span>}
        </div>

        <h3>Rooms</h3>
        {rooms.length === 0 ? (
          <p className="empty-state">No specific rooms listed yet.</p>
        ) : (
          <div className="room-grid">
            {rooms.map((r) => <RoomCard key={r._id} room={r} />)}
          </div>
        )}

        <h3>Reviews</h3>
        {user && (
          <form className="review-form" onSubmit={handleReview}>
            <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
            </select>
            <input
              type="text"
              placeholder="Share your experience..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">Post review</button>
          </form>
        )}
        {reviews.length === 0 ? (
          <p className="empty-state">No reviews yet.</p>
        ) : (
          <ul className="review-list">
            {reviews.map((r) => (
              <li key={r._id}>
                <strong>{r.user?.name || 'User'}</strong> — {'★'.repeat(r.rating)}
                <p>{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="pd-sidebar">
        <h3>Contact owner</h3>
        <p><strong>{property.owner?.name}</strong></p>
        {property.owner?.phone && <p>📞 {property.owner.phone}</p>}
        <form onSubmit={handleContact}>
          <textarea
            rows={4}
            placeholder="Hi, I'm interested in this property..."
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Send message</button>
        </form>
      </aside>
    </div>
  );
};

export default PropertyDetails;
