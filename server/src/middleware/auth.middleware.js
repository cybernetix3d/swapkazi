const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware running');
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);

    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);

    // Find user by id
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log('User not found with id:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('User authenticated:', user._id);
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;