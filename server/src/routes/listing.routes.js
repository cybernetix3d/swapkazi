const express = require('express');
const router = express.Router();
const {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getUserListings,
  getNearbyListings,
  toggleLikeListing,
  searchListings,
  uploadImage,
} = require('../controllers/listing.controller');
const auth = require('../middleware/auth.middleware');

// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private
router.post('/', auth, createListing);

// @route   GET /api/listings
// @desc    Get all listings
// @access  Public
router.get('/', getListings);

// @route   GET /api/listings/nearby
// @desc    Get nearby listings
// @access  Private
router.get('/nearby', auth, getNearbyListings);

// @route   GET /api/listings/search
// @desc    Search listings
// @access  Public
router.get('/search', searchListings);

// @route   GET /api/listings/user/:userId
// @desc    Get user's listings
// @access  Public
router.get('/user/:userId', getUserListings);

// @route   GET /api/listings/:id
// @desc    Get listing by ID
// @access  Public
router.get('/:id', getListingById);

// @route   PUT /api/listings/:id
// @desc    Update a listing
// @access  Private
router.put('/:id', auth, updateListing);

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private
router.delete('/:id', auth, deleteListing);

// @route   POST /api/listings/:id/like
// @desc    Like/unlike a listing
// @access  Private
router.post('/:id/like', auth, toggleLikeListing);

// @route   POST /api/listings/upload
// @desc    Upload listing image
// @access  Private
router.post('/upload', auth, uploadImage);

module.exports = router;