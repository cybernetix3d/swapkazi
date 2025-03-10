const mongoose = require('mongoose');

// Define conversation schema
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Define message schema
const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        type: String, // URL to attachment
      },
    ],
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indices for better query performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

// Middleware to update conversation's lastMessage
messageSchema.post('save', async function (doc) {
  try {
    await mongoose.model('Conversation').findByIdAndUpdate(doc.conversation, {
      lastMessage: doc._id,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating conversation last message:', error);
  }
});

// Method to mark message as read by a user
messageSchema.methods.markAsRead = async function (userId) {
  // Check if the user has already read the message
  const alreadyRead = this.readBy.some((read) => read.user.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      timestamp: new Date(),
    });
    await this.save();
  }
  
  return this;
};

// Static method to get unread count for a user
messageSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    sender: { $ne: userId },
    'readBy.user': { $ne: userId },
  });
};

const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = {
  Conversation,
  Message,
};