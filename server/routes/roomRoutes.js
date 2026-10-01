const express = require('express');
const { getRoomsByProperty, addRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');
const { owner } = require('../middleware/ownerMiddleware');

const router = express.Router();

router.get('/property/:propertyId', getRoomsByProperty);
router.post('/property/:propertyId', protect, owner, addRoom);
router.put('/:id', protect, owner, updateRoom);
router.delete('/:id', protect, owner, deleteRoom);

module.exports = router;
