const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Goods',
        'Services',
        'Food',
        'Crafts',
        'Electronics',
        'Clothing',
        'Furniture',
        'Books',
        'Tools',
        'Education',
        'Transportation',
        'Other',
      ],
    },
    subCategory: {
      type: String,
      default: '',
    },
    images: [
      {
        url: String,
        caption: String,
      },
    ],
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor', 'Not Applicable'],
      default: 'Not Applicable',
    },
    listingType: {
      type: String,
      enum: ['Offer', 'Request'],
      required: true,
    },
    exchangeType: {
      type: String,
      enum: ['Talent', 'Direct Swap', 'Both'],
      required: true,
    },
    talentPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    swapFor: {
      type: String,
      default: '',
    },
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
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    expiresAt: {
      type: Date,
      default: function () {
        // Default expiration is 30 days from creation
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      },
    },
    completedTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
// Text index for search functionality with weights
listingSchema.index(
  {
    title: 'text',
    description: 'text',
    swapFor: 'text',
    subCategory: 'text'
  },
  {
    weights: {
      title: 10,        // Title is most important
      description: 5,   // Description is next
      swapFor: 3,       // What they want to swap for
      subCategory: 2    // Sub-category is least important
    },
    name: 'listing_text_index'
  }
);

// Geospatial index for location-based queries
listingSchema.index({ location: '2dsphere' });

// Other indexes for common query patterns
listingSchema.index({ category: 1 });
listingSchema.index({ user: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ talentPrice: 1 });
listingSchema.index({ exchangeType: 1 });
listingSchema.index({ listingType: 1 });
listingSchema.index({ isActive: 1 });

// Compound indexes for common filter combinations
listingSchema.index({ category: 1, createdAt: -1 });
listingSchema.index({ user: 1, isActive: 1 });
listingSchema.index({ exchangeType: 1, talentPrice: 1 });

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;