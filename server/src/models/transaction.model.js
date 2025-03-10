const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
    },
    status: {
      type: String,
      enum: [
        'Proposed',   // Initial proposal
        'Accepted',   // Recipient accepted the proposal
        'Rejected',   // Recipient rejected the proposal
        'Completed',  // Both parties confirmed completion
        'Cancelled',  // Transaction was cancelled
        'Disputed',   // Transaction is under dispute
        'Resolved',   // Dispute resolved
      ],
      default: 'Proposed',
    },
    type: {
      type: String,
      enum: ['Talent', 'Direct Swap', 'Combined'],
      required: true,
    },
    talentAmount: {
      type: Number,
      default: 0,
    },
    items: [
      {
        description: String,
        images: [String],
      },
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        content: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    meetupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      address: {
        type: String,
        default: '',
      },
    },
    meetupTime: {
      type: Date,
    },
    initiatorRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      timestamp: Date,
    },
    recipientRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      timestamp: Date,
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add method to update transaction status with history
transactionSchema.methods.updateStatus = function (status, userId) {
  this.status = status;
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: userId,
  });
};

// Add method to transfer talents between users
transactionSchema.statics.transferTalents = async function (
  fromUserId,
  toUserId,
  amount,
  transactionId
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const User = mongoose.model('User');
    
    // Find both users
    const fromUser = await User.findById(fromUserId).session(session);
    const toUser = await User.findById(toUserId).session(session);

    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }

    // Check if sender has enough talents
    if (fromUser.talentBalance < amount) {
      throw new Error('Insufficient talent balance');
    }

    // Perform the transfer
    fromUser.talentBalance -= amount;
    toUser.talentBalance += amount;

    // Save both users
    await fromUser.save();
    await toUser.save();

    // Update transaction if provided
    if (transactionId) {
      const transaction = await this.findById(transactionId).session(session);
      if (transaction) {
        transaction.talentAmount = amount;
        await transaction.save();
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return { success: true };
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;