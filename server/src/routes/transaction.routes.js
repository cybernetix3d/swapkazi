const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  updateTransactionStatus,
  addTransactionMessage,
  updateMeetupDetails,
  rateTransaction,
} = require('../controllers/transaction.controller');
const auth = require('../middleware/auth.middleware');

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', auth, createTransaction);

// @route   GET /api/transactions
// @desc    Get all transactions for current user
// @access  Private
router.get('/', auth, getUserTransactions);

// @route   GET /api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', auth, getTransactionById);

// @route   PUT /api/transactions/:id/status
// @desc    Update transaction status
// @access  Private
router.put('/:id/status', auth, updateTransactionStatus);

// @route   POST /api/transactions/:id/messages
// @desc    Add message to transaction
// @access  Private
router.post('/:id/messages', auth, addTransactionMessage);

// @route   PUT /api/transactions/:id/meetup
// @desc    Update meetup details
// @access  Private
router.put('/:id/meetup', auth, updateMeetupDetails);

// @route   POST /api/transactions/:id/rate
// @desc    Rate transaction
// @access  Private
router.post('/:id/rate', auth, rateTransaction);

module.exports = router;