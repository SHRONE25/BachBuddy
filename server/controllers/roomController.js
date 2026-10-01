const Room = require('../models/Room');
const Property = require('../models/Property');

// @desc    Get all rooms for a property
// @route   GET /api/rooms/property/:propertyId
const getRoomsByProperty = async (req, res, next) => {
  try {
    const rooms = await Room.find({ property: req.params.propertyId });
    res.json(rooms);
  } catch (err) {
    next(err);
  }
};

const assertOwnsProperty = async (propertyId, user) => {
  const property = await Property.findById(propertyId);
  if (!property) {
    const err = new Error('Property not found');
    err.statusCode = 404;
    throw err;
  }
  if (property.owner.toString() !== user._id.toString() && user.role !== 'admin') {
    const err = new Error('Not authorized for this property');
    err.statusCode = 403;
    throw err;
  }
  return property;
};

// @desc    Add a room to a property (owner)
// @route   POST /api/rooms/property/:propertyId
const addRoom = async (req, res, next) => {
  try {
    await assertOwnsProperty(req.params.propertyId, req.user);

    const { roomType, price, capacity, availableBeds, amenities, images } = req.body;
    if (!roomType || !price) {
      return res.status(400).json({ message: 'roomType and price are required' });
    }

    const room = await Room.create({
      property: req.params.propertyId,
      roomType,
      price,
      capacity,
      availableBeds,
      amenities: amenities || [],
      images: images || [],
    });

    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a room (owner)
// @route   PUT /api/rooms/:id
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    await assertOwnsProperty(room.property, req.user);

    const editable = ['roomType', 'price', 'capacity', 'availableBeds', 'amenities', 'images', 'isAvailable'];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) room[field] = req.body[field];
    });

    const updated = await room.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a room (owner)
// @route   DELETE /api/rooms/:id
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    await assertOwnsProperty(room.property, req.user);

    await room.deleteOne();
    res.json({ message: 'Room removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRoomsByProperty, addRoom, updateRoom, deleteRoom };
