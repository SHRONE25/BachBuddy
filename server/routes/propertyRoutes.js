const express = require('express');
const {
  getProperties, getLocations, getPropertyById, createProperty,
  updateProperty, deleteProperty, getMyProperties,
  toggleSaveProperty, getSavedProperties, reportProperty,
} = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');
const { owner } = require('../middleware/ownerMiddleware');

const router = express.Router();

// Public
router.get('/', getProperties);
router.get('/locations', getLocations);

// Authenticated user routes (must be before /:id)
router.get('/saved/list', protect, getSavedProperties);
router.get('/mine/list', protect, owner, getMyProperties);

router.get('/:id', getPropertyById);

router.post('/', protect, owner, createProperty);
router.put('/:id', protect, owner, updateProperty);
router.delete('/:id', protect, owner, deleteProperty);

router.post('/:id/save', protect, toggleSaveProperty);
router.post('/:id/report', protect, reportProperty);

module.exports = router;
