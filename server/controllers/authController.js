const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new user (role: user | owner)
// @route   POST /api/auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Never allow public registration to create an admin
    const safeRole = role === 'owner' ? 'owner' : 'user';

    const user = await User.create({ name, email, password, phone, role: safeRole });

    res.status(201).json({
      user: user.toSafeObject(),
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login
// @route   POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Contact support.' });
    }

    res.json({
      user: user.toSafeObject(),
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user's profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/me
const updateMe = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updated = await user.save();
    res.json(updated.toSafeObject());
  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser, loginUser, getMe, updateMe };
