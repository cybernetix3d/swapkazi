const { Conversation, Message } = require('../models/message.model');
const User = require('../models/user.model');
const Listing = require('../models/listing.model');

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    // Find all conversations where the current user is a participant
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate('participants', 'username fullName avatar')
      .populate('listing', 'title images')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    // Format the response to be more client-friendly
    const formattedConversations = conversations.map((conv) => {
      // Find the other participant (not the current user)
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      );

      return {
        _id: conv._id,
        otherUser: otherParticipant,
        listing: conv.listing,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt,
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get or create a conversation with another user
// @route   POST /api/messages/conversations
// @access  Private
const createConversation = async (req, res) => {
  try {
    console.log('Create conversation request body:', req.body);
    console.log('Current user:', req.user._id);

    const { userId, listingId } = req.body;

    console.log('Extracted userId:', userId);
    console.log('Extracted listingId:', listingId);

    if (!userId) {
      console.log('Missing userId in request');
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if listing exists if provided
    let listing = null;
    if (listingId) {
      listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
    }

    // Check if a conversation already exists between these users
    console.log('Checking for existing conversation between users:', req.user._id, 'and', userId);
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] },
      listing: listingId || { $exists: false },
    });

    if (conversation) {
      console.log('Found existing conversation:', conversation._id);
    } else {
      console.log('No existing conversation found, creating new one');
    }

    // If no conversation exists, create a new one
    if (!conversation) {
      try {
        conversation = await Conversation.create({
          participants: [req.user._id, userId],
          listing: listingId || null,
        });
        console.log('Created new conversation:', conversation._id);
      } catch (createError) {
        console.error('Error creating conversation:', createError);
        return res.status(500).json({ message: 'Failed to create conversation', error: createError.message });
      }
    }

    // Populate the conversation with user details
    console.log('Populating conversation details for:', conversation._id);
    try {
      const populatedConversation = await Conversation.findById(conversation._id)
        .populate('participants', 'username fullName avatar')
        .populate('listing', 'title images');

      console.log('Populated conversation:', {
        id: populatedConversation._id,
        participants: populatedConversation.participants.map(p => p._id),
      });

      res.status(200).json({
        success: true,
        data: populatedConversation,
        message: 'Conversation retrieved successfully'
      });
    } catch (populateError) {
      console.error('Error populating conversation:', populateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve conversation details',
        error: populateError.message
      });
    }
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating conversation',
      error: error.message
    });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/conversations/:id
// @access  Private
const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant in the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(401).json({ message: 'Not authorized to view these messages' });
    }

    // Get messages for this conversation
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username fullName avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read
    const unreadMessages = messages.filter(
      (msg) =>
        msg.sender._id.toString() !== req.user._id.toString() &&
        !msg.readBy.some((read) => read.user.toString() === req.user._id.toString())
    );

    // Update read status for all unread messages
    await Promise.all(
      unreadMessages.map((msg) => msg.markAsRead(req.user._id))
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, attachments } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ message: 'Conversation ID and content are required' });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant in the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(401).json({ message: 'Not authorized to send messages in this conversation' });
    }

    // Create the message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content,
      attachments: attachments || [],
      readBy: [{ user: req.user._id, timestamp: Date.now() }], // Mark as read by sender
    });

    // Update the conversation's lastMessage
    conversation.lastMessage = message._id;
    await conversation.save();

    // Populate the message with sender details
    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'username fullName avatar'
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    // Find all conversations where the current user is a participant
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true,
    });

    // Get conversation IDs
    const conversationIds = conversations.map((conv) => conv._id);

    // Count unread messages
    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.user._id },
      'readBy.user': { $ne: req.user._id },
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a conversation
// @route   DELETE /api/messages/conversations/:id
// @access  Private
const deleteConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant in the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(401).json({ message: 'Not authorized to delete this conversation' });
    }

    // Soft delete by marking as inactive
    conversation.isActive = false;
    await conversation.save();

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteConversation,
};
