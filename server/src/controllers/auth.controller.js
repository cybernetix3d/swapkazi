const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { username, email, password, fullName } = req.body;

    // Validate required fields
    if (!username || !email || !password || !fullName) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      console.log('User already exists:', userExists.email === email ? 'Email taken' : 'Username taken');
      return res.status(400).json({
        message: userExists.email === email
          ? 'Email already in use'
          : 'Username already taken',
      });
    }

    console.log('Creating new user...');
    // Create user
    const user = await User.create({
      username,
      email,
      password,
      fullName,
    });

    // Return user data with token
    if (user) {
      const token = generateToken(user._id);
      const response = {
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          talentBalance: user.talentBalance,
          skills: user.skills || [],
          location: user.location,
          ratings: user.ratings || [],
          averageRating: user.averageRating || 0,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
      console.log('User created successfully');
      return res.status(201).json(response);
    } else {
      console.log('Failed to create user');
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');

    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id);
      const response = {
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          talentBalance: user.talentBalance,
          skills: user.skills || [],
          location: user.location,
          ratings: user.ratings || [],
          averageRating: user.averageRating || 0,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
      console.log('Login successful, sending response');
      return res.json(response);
    } else {
      console.log('Invalid credentials');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};