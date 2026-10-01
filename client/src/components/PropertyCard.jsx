import React from 'react';
import { Link } from 'react-router-dom';

const FALLBACK_IMG = 'https://placehold.co/400x260?text=BachBuddy';

const PropertyCard = ({ property, saved, onToggleSave }) => {
  return (
    <div className="property-card">
      <div className="property-card-img-wrap">
        <img src={property.images?.[0] || FALLBACK_IMG} alt={property.title} />
        <span className="property-card-type">{property.type}</span>
        {onToggleSave && (
          <button
            className={`save-btn ${saved ? 'saved' : ''}`}
            onClick={(e) => { e.preventDefault(); onToggleSave(property._id); }}
            title={saved ? 'Remove from saved' : 'Save property'}
          >
            {saved ? '♥' : '♡'}
          </button>
        )}
      </div>

      <Link to={`/property/${property._id}`} className="property-card-body">
        <h4>{property.title}</h4>
        <p className="property-card-location">{property.area}, {property.city}</p>
        <div className="property-card-tags">
          <span>{property.genderPreference}</span>
          {property.amenities?.slice(0, 3).map((a) => <span key={a}>{a}</span>)}
        </div>
        <div className="property-card-footer">
          <strong>₹{property.price?.toLocaleString('en-IN')}/month</strong>
          {property.ratingCount > 0 && (
            <span className="property-card-rating">★ {property.ratingAvg} ({property.ratingCount})</span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;
