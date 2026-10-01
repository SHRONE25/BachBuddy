import React from 'react';

const RoomCard = ({ room, onEdit, onDelete }) => {
  return (
    <div className="room-card">
      <div className="room-card-header">
        <h4>{room.roomType} Room</h4>
        <span className={room.isAvailable ? 'badge badge-available' : 'badge badge-unavailable'}>
          {room.isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <p>₹{room.price?.toLocaleString('en-IN')}/month · Capacity {room.capacity} · {room.availableBeds} bed(s) open</p>
      {room.amenities?.length > 0 && (
        <div className="property-card-tags">
          {room.amenities.map((a) => <span key={a}>{a}</span>)}
        </div>
      )}
      {(onEdit || onDelete) && (
        <div className="room-card-actions">
          {onEdit && <button className="btn btn-ghost" onClick={() => onEdit(room)}>Edit</button>}
          {onDelete && <button className="btn btn-danger" onClick={() => onDelete(room._id)}>Delete</button>}
        </div>
      )}
    </div>
  );
};

export default RoomCard;
