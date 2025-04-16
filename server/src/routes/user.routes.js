const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUserProfile,
  getNearbyUsers,
  rateUser,
  getTalentBalance,
  searchUsers,
  changePassword,
} = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get('/', auth, getUsers);

// @route   GET /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateUserProfile);

// @route   GET /api/users/nearby
// @desc    Get nearby users
// @access  Private
router.get('/nearby', auth, getNearbyUsers);

// @route   GET /api/users/balance
// @desc    Get user's talent balance
// @access  Private
router.get('/balance', auth, getTalentBalance);

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', auth, searchUsers);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, (req, res) => {
  // Forward to the getCurrentUser function from auth controller
  const { getCurrentUser } = require('../controllers/auth.controller');
  return getCurrentUser(req, res);
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, getUserById);

// @route   POST /api/users/:id/rate
// @desc    Rate a user
// @access  Private
router.post('/:id/rate', auth, rateUser);

// @route   PUT /api/users/password
// @desc    Change user password
// @access  Private
router.put('/password', auth, changePassword);

module.exports = router;