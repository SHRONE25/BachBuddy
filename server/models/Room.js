const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    roomType: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'Dormitory'],
      required: true,
    },
    price: { type: Number, required: true },
    capacity: { type: Number, default: 1 },
    availableBeds: { type: Number, default: 1 },
    amenities: [{ type: String }],
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
