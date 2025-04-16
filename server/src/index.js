const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const listingRoutes = require('./routes/listing.routes');
const transactionRoutes = require('./routes/transaction.routes');
const messageRoutes = require('./routes/message.routes');
const uploadRoutes = require('./routes/upload.routes');
const geocodingRoutes = require('./routes/geocoding.routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));
// Increase payload size limit for JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/geocoding', geocodingRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Test routes for authentication
app.get('/api/test/create-user', async (req, res) => {
  try {
    const User = require('./models/user.model');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });

    if (existingUser) {
      return res.json({
        message: 'Test user already exists',
        user: {
          _id: existingUser._id,
          email: existingUser.email,
          username: existingUser.username
        }
      });
    }

    // Create test user
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    });

    res.json({
      message: 'Test user created successfully',
      user: {
        _id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({ message: 'Error creating test user', error: error.message });
  }
});

// Test route to login
app.get('/api/test/login', async (req, res) => {
  try {
    const User = require('./models/user.model');
    const jwt = require('jsonwebtoken');

    // Find test user
    const user = await User.findOne({ email: 'test@example.com' });

    if (!user) {
      return res.status(404).json({ message: 'Test user not found' });
    }

    // Check password
    const isMatch = await user.comparePassword('password123');

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        talentBalance: user.talentBalance
      }
    });
  } catch (error) {
    console.error('Error logging in test user:', error);
    res.status(500).json({ message: 'Error logging in test user', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));