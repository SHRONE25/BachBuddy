const express = require('express');
const {
  getSummary, getUsers, getOwners, getAllProperties, setPropertyStatus,
  removeProperty, toggleBlockUser, getReportedProperties, getReportedUsers,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(protect, admin);

router.get('/summary', getSummary);
router.get('/users', getUsers);
router.get('/owners', getOwners);
router.get('/properties', getAllProperties);
router.put('/properties/:id/status', setPropertyStatus);
router.delete('/properties/:id', removeProperty);
router.put('/users/:id/block', toggleBlockUser);
router.get('/reports/properties', getReportedProperties);
router.get('/reports/users', getReportedUsers);

module.exports = router;
