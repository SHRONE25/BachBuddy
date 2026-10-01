const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Start (or fetch existing) conversation with an owner about a property
// @route   POST /api/messages/conversations
// body: { recipientId, propertyId, text }
const startConversation = async (req, res, next) => {
  try {
    const { recipientId, propertyId, text } = req.body;
    if (!recipientId || !text) {
      return res.status(400).json({ message: 'recipientId and text are required' });
    }
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
      ...(propertyId ? { property: propertyId } : {}),
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        property: propertyId || undefined,
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
    });

    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(201).json({ conversation, message });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all conversations for logged in user
// @route   GET /api/messages/conversations
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar role')
      .populate('property', 'title images city')
      .sort('-lastMessageAt');

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversations/:id
const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const isParticipant = conversation.participants.some((p) => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name avatar')
      .sort('createdAt');

    await Message.updateMany(
      { conversation: conversation._id, sender: { $ne: req.user._id } },
      { isRead: true }
    );

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message in an existing conversation
// @route   POST /api/messages/conversations/:id
const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'text is required' });

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const isParticipant = conversation.participants.some((p) => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
    });

    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

module.exports = { startConversation, getConversations, getMessages, sendMessage };
