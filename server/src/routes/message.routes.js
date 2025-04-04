const express = require('express');
const router = express.Router();
const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteConversation,
} = require('../controllers/message.controller');
const auth = require('../middleware/auth.middleware');

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', auth, getConversations);

// @route   POST /api/messages/conversations
// @desc    Get or create a conversation with another user
// @access  Private
router.post('/conversations', auth, createConversation);

// @route   GET /api/messages/conversations/:id
// @desc    Get messages for a conversation
// @access  Private
router.get('/conversations/:id', auth, getMessages);

// @route   DELETE /api/messages/conversations/:id
// @desc    Delete a conversation
// @access  Private
router.delete('/conversations/:id', auth, deleteConversation);

// @route   GET /api/messages/unread
// @desc    Get unread message count
// @access  Private
router.get('/unread', auth, getUnreadCount);

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', auth, sendMessage);

module.exports = router;