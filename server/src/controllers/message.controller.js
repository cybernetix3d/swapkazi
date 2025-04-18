const { Conversation, Message } = require('../models/message.model');
const User = require('../models/user.model');
const Listing = require('../models/listing.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');

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
    const formattedConversations = await Promise.all(conversations.map(async (conv) => {
      // Find the other participant (not the current user)
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      );

      // Get unread count for this conversation
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id },
      });

      console.log(`Conversation ${conv._id} unread count: ${unreadCount}`);

      // Get the last message content if available
      let lastMessageContent = null;
      let lastMessageTime = null;

      if (conv.lastMessage) {
        const message = await Message.findById(conv.lastMessage);
        if (message) {
          lastMessageContent = message.content;
          lastMessageTime = message.createdAt;
        }
      }

      return {
        _id: conv._id,
        otherUser: otherParticipant,
        otherParticipant: otherParticipant, // Add this for backward compatibility
        participants: conv.participants,
        listing: conv.listing,
        lastMessage: conv.lastMessage,
        lastMessageContent,
        lastMessageTime,
        updatedAt: conv.updatedAt,
        unreadCount,
      };
    }));

    successResponse(res, formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    errorResponse(res, 'Server error', 500, error);
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
      return errorResponse(res, 'User ID is required', 400);
    }

    // Check if the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return errorResponse(res, 'User not found', 404);
    }

    // Check if listing exists if provided
    let listing = null;
    if (listingId) {
      listing = await Listing.findById(listingId);
      if (!listing) {
        return errorResponse(res, 'Listing not found', 404);
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
        return errorResponse(res, 'Failed to create conversation', 500, createError);
      }
    }

    // Populate the conversation with user details
    console.log('Populating conversation details for:', conversation._id);
    try {
      const populatedConversation = await Conversation.findById(conversation._id)
        .populate('participants', 'username fullName avatar')
        .populate('listing', 'title images');

      // Find the other participant (not the current user)
      const otherParticipant = populatedConversation.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      );

      console.log('Populated conversation:', {
        id: populatedConversation._id,
        participants: populatedConversation.participants.map(p => p._id),
        otherParticipant: otherParticipant ? otherParticipant.fullName : 'Unknown'
      });

      // Add otherUser field to make it easier for the client
      const responseData = populatedConversation.toObject();
      responseData.otherUser = otherParticipant;

      successResponse(res, responseData);
    } catch (populateError) {
      console.error('Error populating conversation:', populateError);
      return errorResponse(res, 'Failed to retrieve conversation details', 500, populateError);
    }
  } catch (error) {
    console.error('Create conversation error:', error);
    errorResponse(res, 'Server error creating conversation', 500, error);
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
      return errorResponse(res, 'Not authorized to view these messages', 401);
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

    // For backward compatibility, return the messages array directly
    // This is what the client expects
    return res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, attachments } = req.body;

    if (!conversationId || !content) {
      return errorResponse(res, 'Conversation ID and content are required', 400);
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404);
    }

    // Check if user is a participant in the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return errorResponse(res, 'Not authorized to send messages in this conversation', 401);
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

    successResponse(res, populatedMessage, 201);
  } catch (error) {
    console.error('Send message error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
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

    successResponse(res, { count: unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/conversations/:id/read
// @access  Private
const markMessagesAsRead = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404);
    }

    // Check if user is a participant in the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return errorResponse(res, 'Not authorized to access this conversation', 401);
    }

    // Find all unread messages in this conversation that were not sent by the current user
    const unreadMessages = await Message.find({
      conversation: conversationId,
      sender: { $ne: req.user._id },
      'readBy.user': { $ne: req.user._id },
    });

    // Mark each message as read
    const updatePromises = unreadMessages.map((message) => {
      message.readBy.push({
        user: req.user._id,
        timestamp: Date.now(),
      });
      return message.save();
    });

    await Promise.all(updatePromises);

    successResponse(res, { success: true, markedAsRead: unreadMessages.length });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    errorResponse(res, 'Server error', 500, error);
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
      return errorResponse(res, 'Conversation not found', 404);
    }

    // Check if user is a participant in the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return errorResponse(res, 'Not authorized to delete this conversation', 401);
    }

    // Soft delete by marking as inactive
    conversation.isActive = false;
    await conversation.save();

    successResponse(res, { message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

module.exports = {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteConversation,
  markMessagesAsRead,
};
