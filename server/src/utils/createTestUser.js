/**
 * Create a test user with a known password
 * 
 * This script creates a test user with a known password that can be used for testing
 * Run with: node src/utils/createTestUser.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/user.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for creating test user'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const createTestUser = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists, updating password...');
      
      // Update password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      existingUser.password = hashedPassword;
      await existingUser.save();
      
      console.log('Test user password updated successfully!');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      process.exit(0);
    }
    
    // Create test user
    console.log('Creating test user...');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      fullName: 'Test User',
      bio: 'This is a test user account for development purposes.',
      avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
      phoneNumber: '+27 71 123 4567',
      skills: ['Testing', 'Development', 'Debugging'],
      location: {
        type: 'Point',
        coordinates: [18.4241, -33.9249],
        address: 'Cape Town CBD, Cape Town, South Africa'
      },
      talentBalance: 100,
      averageRating: 5.0,
      ratings: [],
      reservedTalents: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.disconnect();
  }
};

createTestUser();
