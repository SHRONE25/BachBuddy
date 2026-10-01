const express = require('express');
const { addReview, getReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/property/:propertyId', getReviews);
router.post('/property/:propertyId', protect, addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
