const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

// Register a new user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Get current user profile (protected)
router.get('/me', auth, getCurrentUser);

// Forgot password - request password reset
router.post('/forgot-password', forgotPassword);

// Reset password with token
router.post('/reset-password', resetPassword);

module.exports = router;