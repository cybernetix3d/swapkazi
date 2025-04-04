const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    skills: [String],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      address: {
        type: String,
        default: '',
      },
    },
    talentBalance: {
      type: Number,
      default: 10, // Start with 10 Talents as welcome bonus
    },
    reservedTalents: {
      type: Number,
      default: 0, // Talents that are reserved for pending transactions
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for geospatial queries
userSchema.index({ location: '2dsphere' });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to validate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  console.log('Comparing passwords...');
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Method to calculate and update average rating
userSchema.methods.updateAverageRating = function () {
  const totalRatings = this.ratings.length;
  if (totalRatings === 0) {
    this.averageRating = 0;
    return;
  }

  const ratingSum = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
  this.averageRating = Math.round((ratingSum / totalRatings) * 10) / 10; // Round to 1 decimal place
};

const User = mongoose.model('User', userSchema);

module.exports = User;