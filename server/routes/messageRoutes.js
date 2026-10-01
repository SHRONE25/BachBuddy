const express = require('express');
const {
  startConversation, getConversations, getMessages, sendMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/conversations', startConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getMessages);
router.post('/conversations/:id', sendMessage);

module.exports = router;
