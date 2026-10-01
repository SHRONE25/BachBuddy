// Allows owners (and admins) through
const owner = (req, res, next) => {
  if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Owner access required' });
};

module.exports = { owner };
