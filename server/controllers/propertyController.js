const Property = require('../models/Property');
const User = require('../models/User');
const Room = require('../models/Room');
const Review = require('../models/Review');

// @desc    Search/filter/list properties (public, only approved + available)
// @route   GET /api/properties
// query params: city, area, keyword, type, gender, minPrice, maxPrice, amenities (comma), roomType, page, limit
const getProperties = async (req, res, next) => {
  try {
    const {
      city,
      area,
      keyword,
      type,
      gender,
      minPrice,
      maxPrice,
      amenities,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const query = { status: 'approved' };

    if (city) query.city = new RegExp(`^${city}$`, 'i');
    if (area) query.area = new RegExp(area, 'i');
    if (type) query.type = type;
    if (gender && gender !== 'Any') query.genderPreference = { $in: [gender, 'Any'] };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (amenities) {
      const list = amenities.split(',').map((a) => a.trim()).filter(Boolean);
      if (list.length) query.amenities = { $all: list };
    }

    if (keyword) {
      query.$or = [
        { title: new RegExp(keyword, 'i') },
        { city: new RegExp(keyword, 'i') },
        { area: new RegExp(keyword, 'i') },
        { address: new RegExp(keyword, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(query).sort(sort).skip(skip).limit(Number(limit)).populate('owner', 'name email phone'),
      Property.countDocuments(query),
    ]);

    res.json({
      properties,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get distinct cities/areas for autocomplete
// @route   GET /api/properties/locations
const getLocations = async (req, res, next) => {
  try {
    const { q } = req.query;
    const match = { status: 'approved' };
    if (q) {
      match.$or = [{ city: new RegExp(q, 'i') }, { area: new RegExp(q, 'i') }];
    }
    const cities = await Property.find(match).distinct('city');
    const areas = await Property.find(match).distinct('area');
    res.json({ cities, areas });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single property with rooms + reviews
// @route   GET /api/properties/:id
const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone avatar');
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const rooms = await Room.find({ property: property._id });
    const reviews = await Review.find({ property: property._id }).populate('user', 'name avatar').sort('-createdAt');

    res.json({ property, rooms, reviews });
  } catch (err) {
    next(err);
  }
};

// @desc    Create property (owner)
// @route   POST /api/properties
const createProperty = async (req, res, next) => {
  try {
    const {
      title, description, type, genderPreference,
      address, city, area, price, amenities, images,
    } = req.body;

    if (!title || !type || !address || !city || !area || !price) {
      return res.status(400).json({ message: 'Missing required property fields' });
    }

    const property = await Property.create({
      owner: req.user._id,
      title,
      description,
      type,
      genderPreference,
      address,
      city,
      area,
      price,
      amenities: amenities || [],
      images: images || [],
      status: 'pending',
    });

    res.status(201).json(property);
  } catch (err) {
    next(err);
  }
};

// @desc    Update property (owner of that property, or admin)
// @route   PUT /api/properties/:id
const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const isOwner = property.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this property' });
    }

    const editable = [
      'title', 'description', 'type', 'genderPreference', 'address',
      'city', 'area', 'price', 'amenities', 'images', 'isAvailable',
    ];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) property[field] = req.body[field];
    });

    // Owner edits should go back to pending review unless admin is editing
    if (isOwner && req.user.role !== 'admin') {
      property.status = 'pending';
    }

    const updated = await property.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete property (owner of that property, or admin)
// @route   DELETE /api/properties/:id
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const isOwner = property.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await Room.deleteMany({ property: property._id });
    await Review.deleteMany({ property: property._id });
    await property.deleteOne();

    res.json({ message: 'Property removed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get properties owned by logged in owner
// @route   GET /api/properties/mine/list
const getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort('-createdAt');
    res.json(properties);
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle save/unsave property
// @route   POST /api/properties/:id/save
const toggleSaveProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const user = await User.findById(req.user._id);
    const idx = user.savedProperties.findIndex((p) => p.toString() === property._id.toString());

    let saved;
    if (idx > -1) {
      user.savedProperties.splice(idx, 1);
      saved = false;
    } else {
      user.savedProperties.push(property._id);
      saved = true;
    }
    await user.save();

    res.json({ saved, savedProperties: user.savedProperties });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user's saved properties
// @route   GET /api/properties/saved/list
const getSavedProperties = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedProperties',
      populate: { path: 'owner', select: 'name email phone' },
    });
    res.json(user.savedProperties);
  } catch (err) {
    next(err);
  }
};

// @desc    Report a property (user)
// @route   POST /api/properties/:id/report
const reportProperty = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    property.isReported = true;
    if (reason) property.reportReasons.push(reason);
    await property.save();

    res.json({ message: 'Property reported. Our team will review it.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProperties,
  getLocations,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  toggleSaveProperty,
  getSavedProperties,
  reportProperty,
};
