const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const Listing = require('../models/listing.model');
const { Conversation } = require('../models/message.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const {
      recipientId,
      listingId,
      type,
      talentAmount,
      items,
      message,
      meetupLocation,
      meetupTime,
    } = req.body;

    // Validate required fields
    if (!recipientId || !type) {
      return errorResponse(res, 'Recipient and transaction type are required', 400);
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return errorResponse(res, 'Recipient not found', 404);
    }

    // Check if listing exists if provided
    let listing = null;
    if (listingId) {
      listing = await Listing.findById(listingId);
      if (!listing) {
        return errorResponse(res, 'Listing not found', 404);
      }
    }

    // Validate talent amount for Talent transactions
    if ((type === 'Talent' || type === 'Combined') && (!talentAmount || talentAmount <= 0)) {
      return errorResponse(res, 'Please provide a valid talent amount', 400);
    }

    // Check if user has enough talent balance for Talent transactions
    if ((type === 'Talent' || type === 'Combined') && req.user.talentBalance < talentAmount) {
      return errorResponse(res, 'Insufficient talent balance', 400);
    }

    // Create transaction
    const transaction = await Transaction.create({
      initiator: req.user._id,
      recipient: recipientId,
      listing: listingId,
      type,
      talentAmount: talentAmount || 0,
      items: items || [],
      messages: message
        ? [
            {
              sender: req.user._id,
              content: message,
              timestamp: Date.now(),
            },
          ]
        : [],
      meetupLocation: meetupLocation || null,
      meetupTime: meetupTime || null,
      statusHistory: [
        {
          status: 'Proposed',
          timestamp: new Date().toISOString(),
          updatedBy: req.user._id
        }
      ]
    });

    // If this is a direct purchase (not requiring acceptance), handle it immediately
    if (type === 'Talent' && listing && listing.listingType === 'Offer' && listing.exchangeType === 'Talent') {
      console.log('Direct talent purchase detected');

      // Check if user has enough talent balance
      const initiator = await User.findById(req.user._id);

      if (initiator.talentBalance < talentAmount) {
        // Delete the transaction we just created
        await Transaction.findByIdAndDelete(transaction._id);
        return errorResponse(res, 'Insufficient talent balance', 400);
      }

      // Reserve the talents (will be transferred on completion)
      initiator.reservedTalents = (initiator.reservedTalents || 0) + talentAmount;
      await initiator.save();

      console.log(`Reserved ${talentAmount} talents from user ${initiator.username}`);
    }

    // Create a conversation for this transaction if it doesn't exist
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
      listing: listingId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        listing: listingId,
        transaction: transaction._id,
      });
    } else {
      // Update existing conversation with transaction ID
      conversation.transaction = transaction._id;
      await conversation.save();
    }

    // Populate transaction with user and listing details
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('initiator', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .populate('listing', 'title images');

    successResponse(res, populatedTransaction, 201);
  } catch (error) {
    console.error('Create transaction error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Get all transactions for current user
// @route   GET /api/transactions
// @access  Private
const getUserTransactions = async (req, res) => {
  try {
    // Build filter object
    const filter = {
      $or: [{ initiator: req.user._id }, { recipient: req.user._id }],
    };

    // Add status filter if provided
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }

    console.log('Transaction filter:', filter);

    const transactions = await Transaction.find(filter)
      .sort({ updatedAt: -1 })
      .populate('initiator', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .populate('listing', 'title images');

    paginatedResponse(res, transactions, transactions.length, 1, transactions.length);
  } catch (error) {
    console.error('Get user transactions error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('initiator', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .populate('listing', 'title description images exchangeType talentPrice');

    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    // Check if user is part of the transaction
    if (
      transaction.initiator._id.toString() !== req.user._id.toString() &&
      transaction.recipient._id.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 'Not authorized to view this transaction', 401);
    }

    successResponse(res, transaction);
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Update transaction status
// @route   PUT /api/transactions/:id/status
// @access  Private
const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 'Status is required', 400);
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    // Check if user is part of the transaction
    if (
      transaction.initiator.toString() !== req.user._id.toString() &&
      transaction.recipient.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 'Not authorized to update this transaction', 401);
    }

    // Validate status transitions
    const validTransitions = {
      Proposed: ['Accepted', 'Rejected', 'Cancelled'],
      Accepted: ['Completed', 'Cancelled', 'Disputed'],
      Disputed: ['Resolved', 'Cancelled'],
    };

    if (
      !validTransitions[transaction.status] ||
      !validTransitions[transaction.status].includes(status)
    ) {
      return errorResponse(res, `Cannot transition from ${transaction.status} to ${status}`, 400);
    }

    // Special handling for status changes
    if (status === 'Completed') {
      console.log('Completing transaction:', transaction._id);
      console.log('Transaction details:', JSON.stringify(transaction));

      // Get the users involved
      const initiator = await User.findById(transaction.initiator);
      const recipient = await User.findById(transaction.recipient);

      console.log('Initiator before update:', JSON.stringify(initiator));
      console.log('Recipient before update:', JSON.stringify(recipient));

      if (!initiator || !recipient) {
        return errorResponse(res, 'User not found', 404);
      }

      // Handle talent transfer if applicable
      if (transaction.type === 'Talent' || transaction.type === 'Combined') {
        console.log(`Transferring ${transaction.talentAmount} talents from ${initiator.username} to ${recipient.username}`);
        console.log(`Current balances - Initiator: ${initiator.talentBalance}, Recipient: ${recipient.talentBalance}`);

        // Check if initiator has enough talents - but only if the initiator is completing the transaction
        // If the recipient is completing the transaction, we don't need to check the initiator's balance
        // because the recipient is accepting the talents, not sending them
        if (req.user._id.toString() === initiator._id.toString() && initiator.talentBalance < transaction.talentAmount) {
          return errorResponse(res, 'Insufficient talent balance', 400);
        }

        // Transfer talents using the transaction model's static method
        try {
          console.log('Using Transaction.transferTalents method');
          const transferResult = await Transaction.transferTalents(
            transaction.initiator,
            transaction.recipient,
            transaction.talentAmount,
            transaction._id
          );

          console.log('Transfer result:', transferResult);

          // Verify the changes were saved
          const updatedInitiator = await User.findById(transaction.initiator);
          const updatedRecipient = await User.findById(transaction.recipient);

          console.log(`Verified balances - Initiator: ${updatedInitiator.talentBalance}, Recipient: ${updatedRecipient.talentBalance}`);
        } catch (transferError) {
          console.error('Error transferring talents:', transferError);
          return errorResponse(res, 'Failed to transfer talents: ' + transferError.message, 500, transferError);
        }
      } else {
        console.log(`Transaction type is ${transaction.type}, no talent transfer needed`);
      }

      // Update listing status if this transaction is for a listing
      if (transaction.listing) {
        console.log('Updating listing status for listing:', transaction.listing);

        const listing = await Listing.findById(transaction.listing);

        if (listing) {
          // Mark listing as inactive (sold/completed)
          listing.isActive = false;
          listing.completedTransaction = transaction._id;
          await listing.save();
          console.log('Listing marked as inactive');
        }
      }
    }

    // Add system message about status change
    transaction.messages.push({
      sender: req.user._id,
      content: `Transaction status changed to ${status}`,
      timestamp: Date.now(),
      isSystemMessage: true,
    });

    // Update transaction status and add to history
    transaction.updateStatus(status, req.user._id);
    await transaction.save();

    console.log(`Transaction ${transaction._id} status updated to ${status}`);

    // Return updated transaction
    const updatedTransaction = await Transaction.findById(req.params.id)
      .populate('initiator', 'username fullName avatar talentBalance')
      .populate('recipient', 'username fullName avatar talentBalance')
      .populate('listing', 'title images');

    successResponse(res, updatedTransaction);
  } catch (error) {
    console.error('Update transaction status error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Add message to transaction
// @route   POST /api/transactions/:id/messages
// @access  Private
const addTransactionMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return errorResponse(res, 'Message content is required', 400);
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    // Check if user is part of the transaction
    if (
      transaction.initiator.toString() !== req.user._id.toString() &&
      transaction.recipient.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 'Not authorized to message in this transaction', 401);
    }

    // Add message
    transaction.messages.push({
      sender: req.user._id,
      content,
      timestamp: Date.now(),
    });

    await transaction.save();

    // Return updated transaction
    const updatedTransaction = await Transaction.findById(req.params.id)
      .populate('initiator', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .populate('listing', 'title images');

    successResponse(res, updatedTransaction);
  } catch (error) {
    console.error('Add transaction message error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Update meetup details
// @route   PUT /api/transactions/:id/meetup
// @access  Private
const updateMeetupDetails = async (req, res) => {
  try {
    const { meetupLocation, meetupTime } = req.body;

    if (!meetupLocation && !meetupTime) {
      return errorResponse(res, 'Meetup location or time is required', 400);
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    // Check if user is part of the transaction
    if (
      transaction.initiator.toString() !== req.user._id.toString() &&
      transaction.recipient.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 'Not authorized to update this transaction', 401);
    }

    // Update meetup details
    if (meetupLocation) {
      transaction.meetupLocation = meetupLocation;
    }

    if (meetupTime) {
      transaction.meetupTime = new Date(meetupTime);
    }

    // Add system message about meetup update
    transaction.messages.push({
      sender: req.user._id,
      content: 'Meetup details updated',
      timestamp: Date.now(),
      isSystemMessage: true,
    });

    await transaction.save();

    // Return updated transaction
    const updatedTransaction = await Transaction.findById(req.params.id)
      .populate('initiator', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .populate('listing', 'title images');

    successResponse(res, updatedTransaction);
  } catch (error) {
    console.error('Update meetup details error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Rate transaction
// @route   POST /api/transactions/:id/rate
// @access  Private
const rateTransaction = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating must be between 1 and 5', 400);
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    // Check if transaction is completed
    if (transaction.status !== 'Completed') {
      return errorResponse(res, 'Can only rate completed transactions', 400);
    }

    // Check if user is part of the transaction
    const isInitiator = transaction.initiator.toString() === req.user._id.toString();
    const isRecipient = transaction.recipient.toString() === req.user._id.toString();

    if (!isInitiator && !isRecipient) {
      return errorResponse(res, 'Not authorized to rate this transaction', 401);
    }

    // Update the appropriate rating field
    if (isInitiator) {
      // Initiator is rating the recipient
      if (transaction.initiatorRating && transaction.initiatorRating.rating) {
        return errorResponse(res, 'You have already rated this transaction', 400);
      }

      transaction.initiatorRating = {
        rating,
        comment: comment || '',
        timestamp: Date.now(),
      };

      // Add rating to recipient's profile
      const recipient = await User.findById(transaction.recipient);
      if (recipient) {
        recipient.ratings.push({
          user: req.user._id,
          rating,
          comment: comment || '',
          createdAt: Date.now(),
        });
        recipient.updateAverageRating();
        await recipient.save();
      }
    } else {
      // Recipient is rating the initiator
      if (transaction.recipientRating && transaction.recipientRating.rating) {
        return errorResponse(res, 'You have already rated this transaction', 400);
      }

      transaction.recipientRating = {
        rating,
        comment: comment || '',
        timestamp: Date.now(),
      };

      // Add rating to initiator's profile
      const initiator = await User.findById(transaction.initiator);
      if (initiator) {
        initiator.ratings.push({
          user: req.user._id,
          rating,
          comment: comment || '',
          createdAt: Date.now(),
        });
        initiator.updateAverageRating();
        await initiator.save();
      }
    }

    // Add system message about rating
    transaction.messages.push({
      sender: req.user._id,
      content: `Transaction rated ${rating}/5`,
      timestamp: Date.now(),
      isSystemMessage: true,
    });

    await transaction.save();

    successResponse(res, { message: 'Transaction rated successfully' });
  } catch (error) {
    console.error('Rate transaction error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  updateTransactionStatus,
  addTransactionMessage,
  updateMeetupDetails,
  rateTransaction,
};
