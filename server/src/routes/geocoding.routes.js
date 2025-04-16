const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { reverseGeocode } = require('../controllers/geocoding.controller');

// Geocoding routes
router.get('/reverse', auth, reverseGeocode);

module.exports = router;
