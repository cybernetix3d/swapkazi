const User = require('../models/user.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    successResponse(res, users);
  } catch (error) {
    console.error('Get users error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      successResponse(res, user);
    } else {
      errorResponse(res, 'User not found', 404);
    }
  } catch (error) {
    console.error('Get user by ID error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
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

    successResponse(res, {
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
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Get nearby users
// @route   GET /api/users/nearby
// @access  Private
const getNearbyUsers = async (req, res) => {
  try {
    const { longitude, latitude, distance = 10000 } = req.query; // distance in meters, default 10km

    if (!longitude || !latitude) {
      return errorResponse(res, 'Longitude and latitude are required', 400);
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

    paginatedResponse(res, users, users.length, 1, users.length);
  } catch (error) {
    console.error('Get nearby users error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Rate a user
// @route   POST /api/users/:id/rate
// @access  Private
const rateUser = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating must be between 1 and 5', 400);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Check if user is trying to rate themselves
    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 'You cannot rate yourself', 400);
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

    successResponse(res, {
      message: 'Rating submitted successfully',
      averageRating: user.averageRating,
    });
  } catch (error) {
    console.error('Rate user error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Get user's talent balance
// @route   GET /api/users/balance
// @access  Private
const getTalentBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('talentBalance');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    successResponse(res, { talentBalance: user.talentBalance });
  } catch (error) {
    console.error('Get talent balance error:', error);
    errorResponse(res, 'Server error', 500, error);
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

    successResponse(res, users);
  } catch (error) {
    console.error('Search users error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required', 400);
    }

    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    successResponse(res, { message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    errorResponse(res, 'Server error', 500, error);
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
  changePassword,
};
