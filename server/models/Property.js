const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },

    type: {
      type: String,
      enum: ['PG', 'Hostel', 'Room', 'Apartment'],
      required: true,
    },

    genderPreference: {
      type: String,
      enum: ['Male', 'Female', 'Any'],
      default: 'Any',
    },

    address: { type: String, required: true },
    city: { type: String, required: true, trim: true, index: true },
    area: { type: String, required: true, trim: true, index: true },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // starting/base price shown on cards; actual pricing lives on Room docs too
    price: { type: Number, required: true },

    amenities: [{ type: String }], // e.g. WiFi, Food, AC, Parking, Laundry, Power Backup

    images: [{ type: String }],

    isAvailable: { type: Boolean, default: true },

    // Admin moderation workflow
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isReported: { type: Boolean, default: false },
    reportReasons: [{ type: String }],

    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

propertySchema.index({ title: 'text', city: 'text', area: 'text', description: 'text' });

module.exports = mongoose.model('Property', propertySchema);
