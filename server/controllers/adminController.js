const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Dashboard summary counts
// @route   GET /api/admin/summary
const getSummary = async (req, res, next) => {
  try {
    const [users, owners, properties, pending, reportedProperties, reportedUsers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'owner' }),
      Property.countDocuments(),
      Property.countDocuments({ status: 'pending' }),
      Property.countDocuments({ isReported: true }),
      User.countDocuments({ isReported: true }),
    ]);

    res.json({ users, owners, properties, pending, reportedProperties, reportedUsers });
  } catch (err) {
    next(err);
  }
};

// @desc    List all users (role=user)
// @route   GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// @desc    List all owners
// @route   GET /api/admin/owners
const getOwners = async (req, res, next) => {
  try {
    const owners = await User.find({ role: 'owner' }).select('-password').sort('-createdAt');
    res.json(owners);
  } catch (err) {
    next(err);
  }
};

// @desc    List all properties (any status), for admin review
// @route   GET /api/admin/properties
const getAllProperties = async (req, res, next) => {
  try {
    const { status, reported } = req.query;
    const query = {};
    if (status) query.status = status;
    if (reported === 'true') query.isReported = true;

    const properties = await Property.find(query).populate('owner', 'name email').sort('-createdAt');
    res.json(properties);
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject a property listing
// @route   PUT /api/admin/properties/:id/status
// body: { status: 'approved' | 'rejected' }
const setPropertyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    property.status = status;
    if (status === 'approved') {
      property.isReported = false;
      property.reportReasons = [];
    }
    await property.save();

    res.json(property);
  } catch (err) {
    next(err);
  }
};

// @desc    Remove a (fake/reported) listing entirely
// @route   DELETE /api/admin/properties/:id
const removeProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    await property.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Block / unblock a user or owner
// @route   PUT /api/admin/users/:id/block
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot block an admin' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: user.isBlocked ? 'User blocked' : 'User unblocked', user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc    List reported properties
// @route   GET /api/admin/reports/properties
const getReportedProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ isReported: true }).populate('owner', 'name email');
    res.json(properties);
  } catch (err) {
    next(err);
  }
};

// @desc    List reported users
// @route   GET /api/admin/reports/users
const getReportedUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isReported: true }).select('-password');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary,
  getUsers,
  getOwners,
  getAllProperties,
  setPropertyStatus,
  removeProperty,
  toggleBlockUser,
  getReportedProperties,
  getReportedUsers,
};
