const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { owner } = require('../middleware/ownerMiddleware');

const router = express.Router();

// @desc    Upload up to 6 images, returns relative URLs
// @route   POST /api/uploads
router.post('/', protect, owner, upload.array('images', 6), (req, res) => {
  const paths = (req.files || []).map((f) => `/uploads/${f.filename}`);
  res.status(201).json({ paths });
});

module.exports = router;
