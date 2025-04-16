const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendEmail } = require('../utils/emailService');
const { successResponse, errorResponse } = require('../utils/responseUtils');

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
      return errorResponse(res, 'All fields are required', 400);
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      console.log('User already exists:', userExists.email === email ? 'Email taken' : 'Username taken');
      return errorResponse(res, userExists.email === email
        ? 'Email already in use'
        : 'Username already taken', 400);
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
      return successResponse(res, response, 201);
    } else {
      console.log('Failed to create user');
      return errorResponse(res, 'Invalid user data', 400);
    }
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 'Server error during registration', 500, error);
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
      return errorResponse(res, 'Email and password are required', 400);
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
      return successResponse(res, response);
    } else {
      console.log('Invalid credentials');
      return errorResponse(res, 'Invalid email or password', 401);
    }
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Server error during login', 500, error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      successResponse(res, user);
    } else {
      errorResponse(res, 'User not found', 404);
    }
  } catch (error) {
    console.error('Get current user error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      // Just return success message as if email was sent
      return successResponse(res, { message: 'If your email is registered, you will receive a password reset link' });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:19006'}/(auth)/reset-password?token=${resetToken}`;

    // Create email content
    const message = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
      <p>Please click on the following link to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'SwapKazi Password Reset',
        text: `Reset your password by visiting: ${resetUrl}`,
        html: message,
      });

      // Log the reset URL for development
      console.log(`Reset URL for ${email}: ${resetUrl}`);

      successResponse(res, {
        message: 'If your email is registered, you will receive a password reset link',
        // In development, return the token and URL for testing
        ...(process.env.NODE_ENV === 'development' && { resetToken, resetUrl })
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);

      // Remove the reset token from the user
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return errorResponse(res, 'Could not send reset email. Please try again.', 500, emailError);
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return errorResponse(res, 'Token and new password are required', 400);
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return errorResponse(res, 'Invalid or expired token', 400, error);
    }

    // Find user by id and token
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired token', 400);
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    successResponse(res, { message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword
};