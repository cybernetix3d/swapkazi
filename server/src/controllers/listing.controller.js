const Listing = require('../models/listing.model');
const User = require('../models/user.model');

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res) => {
  try {
    console.log('Create listing request received');
    console.log('User:', req.user ? req.user._id : 'No user in request');
    console.log('Request body:', req.body);
    const {
      title,
      description,
      category,
      subCategory,
      images,
      condition,
      listingType,
      exchangeType,
      talentPrice,
      swapFor,
      location,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !listingType || !exchangeType) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate talent price for Talent exchange type
    if ((exchangeType === 'Talent' || exchangeType === 'Both') && (!talentPrice || talentPrice < 0)) {
      return res.status(400).json({ message: 'Please provide a valid talent price' });
    }

    // Format images to match the schema
    let formattedImages = [];
    if (images && Array.isArray(images)) {
      formattedImages = images.map(img => {
        // If image is already in the correct format
        if (typeof img === 'object' && img.url) {
          return img;
        }
        // If image is a string (URL)
        if (typeof img === 'string') {
          return { url: img, caption: '' };
        }
        return null;
      }).filter(img => img !== null);
    }

    console.log('Formatted images:', formattedImages);

    // Create new listing
    const listing = await Listing.create({
      user: req.user._id,
      title,
      description,
      category,
      subCategory: subCategory || '',
      images: formattedImages,
      condition: condition || 'Not Applicable',
      listingType,
      exchangeType,
      talentPrice: talentPrice || 0,
      swapFor: swapFor || '',
      location: location || {
        type: 'Point',
        coordinates: req.user.location.coordinates,
        address: req.user.location.address,
      },
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Something went wrong!', error: error.message });
  }
};

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res) => {
  try {
    console.log('Get listings request received');
    console.log('Query params:', req.query);

    const {
      page = 1,
      limit = 10,
      category,
      listingType,
      exchangeType,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category;
    if (listingType) filter.listingType = listingType;
    if (exchangeType) filter.exchangeType = exchangeType;
    if (minPrice) filter.talentPrice = { $gte: parseInt(minPrice) };
    if (maxPrice) {
      filter.talentPrice = { ...filter.talentPrice, $lte: parseInt(maxPrice) };
    }

    // Only show active listings
    filter.isActive = true;

    console.log('Filter:', filter);

    // Build sort object
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const listings = await Listing.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username fullName avatar location');

    console.log(`Found ${listings.length} listings`);

    // Get total count
    const total = await Listing.countDocuments(filter);

    // Format response to match mobile app expectations
    const response = {
      success: true,
      data: listings,
      count: listings.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    };

    console.log('Sending response with', listings.length, 'listings');
    res.json(response);
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get listing by ID
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'user',
      'username fullName avatar location skills averageRating'
    );

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Increment view count
    listing.views += 1;
    await listing.save();

    res.json(listing);
  } catch (error) {
    console.error('Get listing by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this listing' });
    }

    // Update fields if provided
    const {
      title,
      description,
      category,
      subCategory,
      images,
      condition,
      listingType,
      exchangeType,
      talentPrice,
      swapFor,
      location,
      isActive,
    } = req.body;

    if (title) listing.title = title;
    if (description) listing.description = description;
    if (category) listing.category = category;
    if (subCategory !== undefined) listing.subCategory = subCategory;
    // Format images to match the schema
    if (images && Array.isArray(images)) {
      const formattedImages = images.map(img => {
        // If image is already in the correct format
        if (typeof img === 'object' && img.url) {
          return img;
        }
        // If image is a string (URL)
        if (typeof img === 'string') {
          return { url: img, caption: '' };
        }
        return null;
      }).filter(img => img !== null);

      listing.images = formattedImages;
    }
    if (condition) listing.condition = condition;
    if (listingType) listing.listingType = listingType;
    if (exchangeType) listing.exchangeType = exchangeType;
    if (talentPrice !== undefined) listing.talentPrice = talentPrice;
    if (swapFor !== undefined) listing.swapFor = swapFor;
    if (location) listing.location = location;
    if (isActive !== undefined) listing.isActive = isActive;

    const updatedListing = await listing.save();
    res.json(updatedListing);
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this listing' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's listings
// @route   GET /api/listings/user/:userId
// @access  Public
const getUserListings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const listings = await Listing.find({ user: userId, isActive: true }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get nearby listings
// @route   GET /api/listings/nearby
// @access  Private
const getNearbyListings = async (req, res) => {
  try {
    const { longitude, latitude, distance = 10000 } = req.query; // distance in meters, default 10km

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }

    const listings = await Listing.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(distance),
        },
      },
    }).populate('user', 'username fullName avatar');

    res.json(listings);
  } catch (error) {
    console.error('Get nearby listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/unlike a listing
// @route   POST /api/listings/:id/like
// @access  Private
const toggleLikeListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user has already liked the listing
    const alreadyLiked = listing.likes.includes(req.user._id);

    if (alreadyLiked) {
      // Unlike the listing
      listing.likes = listing.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
    } else {
      // Like the listing
      listing.likes.push(req.user._id);
    }

    await listing.save();

    res.json({
      likes: listing.likes.length,
      isLiked: !alreadyLiked,
    });
  } catch (error) {
    console.error('Toggle like listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search listings
// @route   GET /api/listings/search
// @access  Public
const searchListings = async (req, res) => {
  try {
    const { query, category, exchangeType } = req.query;

    let searchQuery = { isActive: true };

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    if (category) {
      searchQuery.category = category;
    }

    if (exchangeType) {
      searchQuery.exchangeType = exchangeType;
    }

    const listings = await Listing.find(searchQuery)
      .sort({ createdAt: -1 })
      .populate('user', 'username fullName avatar');

    res.json(listings);
  } catch (error) {
    console.error('Search listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload listing image
// @route   POST /api/listings/upload
// @access  Private
const uploadImage = async (req, res) => {
  try {
    console.log('Upload image request received');

    // In a real implementation, you would upload the image to a cloud storage service
    // like AWS S3, Google Cloud Storage, or Cloudinary
    // For now, we'll just return a mock URL

    // Check if image data is provided
    if (!req.body.image) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    // Mock response - in a real app, this would be the URL from the cloud storage
    const imageUrl = `https://via.placeholder.com/400?text=Listing+Image`;

    res.json({
      success: true,
      data: {
        url: imageUrl
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getUserListings,
  getNearbyListings,
  toggleLikeListing,
  searchListings,
  uploadImage,
};
