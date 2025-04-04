const User = require('../models/user.model');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      // Format response to match mobile app expectations
      res.json({
        success: true,
        data: user
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided in request body
    user.fullName = req.body.fullName || user.fullName;
    user.bio = req.body.bio || user.bio;
    user.avatar = req.body.avatar || user.avatar;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    // Update skills if provided
    if (req.body.skills) {
      user.skills = req.body.skills;
    }

    // Update location if provided
    if (req.body.location) {
      user.location.coordinates = req.body.location.coordinates || user.location.coordinates;
      user.location.address = req.body.location.address || user.location.address;
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      phoneNumber: updatedUser.phoneNumber,
      skills: updatedUser.skills,
      location: updatedUser.location,
      talentBalance: updatedUser.talentBalance,
      averageRating: updatedUser.averageRating,
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get nearby users
// @route   GET /api/users/nearby
// @access  Private
const getNearbyUsers = async (req, res) => {
  try {
    const { longitude, latitude, distance = 10000 } = req.query; // distance in meters, default 10km

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }

    const users = await User.find({
      _id: { $ne: req.user._id }, // Exclude current user
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(distance),
        },
      },
    }).select('-password');

    // Format response to match mobile app expectations
    res.json({
      success: true,
      data: users,
      count: users.length,
      total: users.length,
      page: 1,
      totalPages: 1
    });
  } catch (error) {
    console.error('Get nearby users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Rate a user
// @route   POST /api/users/:id/rate
// @access  Private
const rateUser = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is trying to rate themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot rate yourself' });
    }

    // Check if user has already rated this user
    const existingRatingIndex = user.ratings.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      user.ratings[existingRatingIndex].rating = rating;
      user.ratings[existingRatingIndex].comment = comment || '';
      user.ratings[existingRatingIndex].createdAt = Date.now();
    } else {
      // Add new rating
      user.ratings.push({
        user: req.user._id,
        rating,
        comment: comment || '',
        createdAt: Date.now(),
      });
    }

    // Update average rating
    user.updateAverageRating();

    await user.save();

    res.json({
      message: 'Rating submitted successfully',
      averageRating: user.averageRating,
    });
  } catch (error) {
    console.error('Rate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's talent balance
// @route   GET /api/users/balance
// @access  Private
const getTalentBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('talentBalance');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ talentBalance: user.talentBalance });
  } catch (error) {
    console.error('Get talent balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { query, skills } = req.query;

    let searchQuery = {};

    if (query) {
      searchQuery = {
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { fullName: { $regex: query, $options: 'i' } },
        ],
      };
    }

    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      searchQuery.skills = { $in: skillsArray };
    }

    const users = await User.find(searchQuery).select('-password');

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserProfile,
  getNearbyUsers,
  rateUser,
  getTalentBalance,
  searchUsers,
};
