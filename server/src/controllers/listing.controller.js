const Listing = require('../models/listing.model');
const User = require('../models/user.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');

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
      return errorResponse(res, 'Please provide all required fields', 400);
    }

    // Validate talent price for Talent exchange type
    if ((exchangeType === 'Talent' || exchangeType === 'Both') && (!talentPrice || talentPrice < 0)) {
      return errorResponse(res, 'Please provide a valid talent price', 400);
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

    // Validate that all images are from our Firebase Storage or other trusted sources
    const validImageDomains = [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'via.placeholder.com' // For testing
    ];

    const allImagesValid = formattedImages.every(img => {
      try {
        const url = new URL(img.url);
        return validImageDomains.some(domain => url.hostname.includes(domain));
      } catch (e) {
        return false;
      }
    });

    if (formattedImages.length > 0 && !allImagesValid) {
      return errorResponse(res, 'One or more image URLs are not from trusted sources. Please upload images using the /api/upload endpoints.', 400);
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

    successResponse(res, listing, 201);
  } catch (error) {
    console.error('Create listing error:', error);
    errorResponse(res, 'Something went wrong!', 500, error);
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

    console.log('Sending response with', listings.length, 'listings');
    paginatedResponse(res, listings, total, page, limit);
  } catch (error) {
    console.error('Get listings error:', error);
    errorResponse(res, 'Server error', 500, error);
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
      return errorResponse(res, 'Listing not found', 404);
    }

    // Increment view count
    listing.views += 1;
    await listing.save();

    successResponse(res, listing);
  } catch (error) {
    console.error('Get listing by ID error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return errorResponse(res, 'Listing not found', 404);
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to update this listing', 401);
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
    // Handle images update
    if (images && Array.isArray(images)) {
      // Get the deleteFile utility
      const { deleteFile } = require('../utils/fileUpload');

      // Find images that were removed
      const oldImageUrls = listing.images.map(img => img.url);
      const newImageUrls = images
        .filter(img => img && (typeof img === 'string' || (typeof img === 'object' && img.url)))
        .map(img => typeof img === 'string' ? img : img.url);

      // Identify removed images
      const removedImageUrls = oldImageUrls.filter(url => !newImageUrls.includes(url));

      // Delete removed images from Firebase Storage
      if (removedImageUrls.length > 0) {
        console.log(`Deleting ${removedImageUrls.length} removed images`);

        // Delete each removed image
        const deletePromises = removedImageUrls.map(url => {
          if (url && url.includes('firebasestorage.googleapis.com')) {
            return deleteFile(url).catch(err => {
              console.warn(`Failed to delete image ${url}:`, err);
              return false; // Continue with other deletions even if one fails
            });
          }
          return Promise.resolve(true); // Skip non-Firebase URLs
        });

        // Wait for all image deletions to complete
        await Promise.all(deletePromises);
      }

      // Format new images to match the schema
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
    successResponse(res, updatedListing);
  } catch (error) {
    console.error('Update listing error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return errorResponse(res, 'Listing not found', 404);
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to delete this listing', 401);
    }

    // Delete associated images from Firebase Storage
    if (listing.images && listing.images.length > 0) {
      const { deleteFile } = require('../utils/fileUpload');

      // Delete each image
      const deletePromises = listing.images.map(image => {
        if (image.url && image.url.includes('firebasestorage.googleapis.com')) {
          return deleteFile(image.url).catch(err => {
            console.warn(`Failed to delete image ${image.url}:`, err);
            return false; // Continue with other deletions even if one fails
          });
        }
        return Promise.resolve(true); // Skip non-Firebase URLs
      });

      // Wait for all image deletions to complete
      await Promise.all(deletePromises);
    }

    // Delete the listing from the database
    await listing.deleteOne();
    successResponse(res, { message: 'Listing and associated images removed' });
  } catch (error) {
    console.error('Delete listing error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Get user's listings
// @route   GET /api/listings/user/:userId
// @access  Public
const getUserListings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const listings = await Listing.find({ user: userId, isActive: true }).sort({ createdAt: -1 });
    successResponse(res, listings);
  } catch (error) {
    console.error('Get user listings error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Get nearby listings with advanced filtering
// @route   GET /api/listings/nearby
// @access  Private
const getNearbyListings = async (req, res) => {
  try {
    console.log('Get nearby listings request received');
    console.log('Query params:', req.query);

    const {
      longitude,              // User's longitude
      latitude,               // User's latitude
      distance = 10000,       // Search radius in meters (default 10km)
      category,               // Optional category filter
      subCategory,            // Optional sub-category filter
      exchangeType,           // Optional exchange type filter
      listingType,            // Optional listing type filter
      minPrice,               // Optional minimum price filter
      maxPrice,               // Optional maximum price filter
      sortBy = 'distance',    // Sort field (distance, price, date)
      page = 1,               // Page number
      limit = 20              // Results per page
    } = req.query;

    if (!longitude || !latitude) {
      return errorResponse(res, 'Longitude and latitude are required', 400);
    }

    // Parse coordinates
    const coords = [
      parseFloat(longitude),
      parseFloat(latitude)
    ];

    // Build filter object
    const filter = {
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coords
          },
          $maxDistance: parseInt(distance)
        }
      }
    };

    // Add optional filters
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (exchangeType) filter.exchangeType = exchangeType;
    if (listingType) filter.listingType = listingType;

    // Add price range filter
    if (minPrice || maxPrice) {
      filter.talentPrice = {};
      if (minPrice) filter.talentPrice.$gte = parseInt(minPrice);
      if (maxPrice) filter.talentPrice.$lte = parseInt(maxPrice);
    }

    console.log('Nearby filter:', JSON.stringify(filter, null, 2));

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort options
    let sortOptions = {};

    // When using $near, MongoDB automatically sorts by distance
    // We only need to specify sort if we want a different order
    if (sortBy === 'price_asc') {
      sortOptions.talentPrice = 1;
    } else if (sortBy === 'price_desc') {
      sortOptions.talentPrice = -1;
    } else if (sortBy === 'date') {
      sortOptions.createdAt = -1;
    }
    // For 'distance' sort, we rely on MongoDB's default $near behavior

    // Execute query
    const listings = await Listing.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username fullName avatar location');

    // Get total count for pagination
    const total = await Listing.countDocuments(filter);

    // Import geo utilities
    const { calculateDistance, formatDistance } = require('../utils/geoUtils');

    // Calculate distance for each listing
    const listingsWithDistance = listings.map(listing => {
      const listingObj = listing.toObject();

      // Calculate distance in kilometers
      if (listing.location && listing.location.coordinates) {
        // Calculate actual distance
        const distanceKm = calculateDistance(coords, listing.location.coordinates);

        // Add both numeric and formatted distance to the listing
        listingObj.distance = distanceKm;
        listingObj.distanceFormatted = formatDistance(distanceKm);
      }

      return listingObj;
    });

    console.log(`Found ${listings.length} nearby listings out of ${total} total`);
    paginatedResponse(res, listingsWithDistance, total, page, limit);
  } catch (error) {
    console.error('Get nearby listings error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Like/unlike a listing
// @route   POST /api/listings/:id/like
// @access  Private
const toggleLikeListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return errorResponse(res, 'Listing not found', 404);
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

    successResponse(res, {
      likes: listing.likes.length,
      isLiked: !alreadyLiked,
    });
  } catch (error) {
    console.error('Toggle like listing error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Search listings with advanced filtering
// @route   GET /api/listings/search
// @access  Public
const searchListings = async (req, res) => {
  try {
    console.log('Search listings request received');
    console.log('Query params:', req.query);

    const {
      query,                  // Text search term
      category,               // Category filter
      subCategory,            // Sub-category filter
      exchangeType,           // Exchange type filter
      listingType,            // Listing type filter
      condition,              // Condition filter
      minPrice,               // Minimum talent price
      maxPrice,               // Maximum talent price
      longitude,              // User's longitude for location-based search
      latitude,               // User's latitude for location-based search
      distance = 50000,       // Search radius in meters (default 50km)
      sortBy = 'createdAt',   // Sort field
      order = 'desc',         // Sort order
      page = 1,               // Page number
      limit = 20,             // Results per page
      includeInactive = false // Whether to include inactive listings (admin only)
    } = req.query;

    // Build filter object
    let filter = { isActive: true };

    // Only admins can see inactive listings
    if (includeInactive === 'true' && req.user && req.user.role === 'admin') {
      delete filter.isActive;
    }

    // Text search (title, description, skills)
    if (query) {
      // Use MongoDB text search for better performance and relevance
      if (query.length >= 3) { // Only use text search for queries with 3+ characters
        filter.$text = { $search: query };
      } else {
        // For shorter queries, use regex for more flexible matching
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { swapFor: { $regex: query, $options: 'i' } }
        ];
      }
    }

    // Category filters
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;

    // Type filters
    if (listingType) filter.listingType = listingType;
    if (exchangeType) filter.exchangeType = exchangeType;
    if (condition) filter.condition = condition;

    // Price range filters
    if (minPrice || maxPrice) {
      filter.talentPrice = {};
      if (minPrice) filter.talentPrice.$gte = parseInt(minPrice);
      if (maxPrice) filter.talentPrice.$lte = parseInt(maxPrice);
    }

    // Location-based search
    if (longitude && latitude) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(distance)
        }
      };
    }

    console.log('Search filter:', JSON.stringify(filter, null, 2));

    // Build sort object
    const sortOptions = {};

    // Handle special sort cases
    if (sortBy === 'price') {
      sortOptions.talentPrice = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'distance' && longitude && latitude) {
      // Distance sorting is handled by the $near operator
      // No additional sort needed
    } else if (sortBy === 'relevance' && query && query.length >= 3) {
      // For text search, we can use the text score for relevance sorting
      sortOptions.score = { $meta: 'textScore' };
    } else {
      // Default sorting
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    }

    console.log('Sort options:', sortOptions);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build the query
    let queryBuilder = Listing.find(filter);

    // Add text score projection for relevance sorting
    if (sortBy === 'relevance' && query && query.length >= 3) {
      queryBuilder = queryBuilder.select({ score: { $meta: 'textScore' } });
    }

    // Execute query with pagination, sorting, and population
    const listings = await queryBuilder
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username fullName avatar location');

    // Get total count for pagination
    const total = await Listing.countDocuments(filter);

    console.log(`Found ${listings.length} listings out of ${total} total`);
    paginatedResponse(res, listings, total, page, limit);
  } catch (error) {
    console.error('Search listings error:', error);
    errorResponse(res, 'Server error', 500, error);
  }
};

// @desc    Upload listing image
// @route   POST /api/listings/upload
// @access  Private
// Note: This is a legacy endpoint. Use /api/upload/listing instead.
const uploadImage = async (req, res) => {
  try {
    console.log('Upload image request received');
    console.log('Warning: This endpoint is deprecated. Use /api/upload/listing instead.');

    // Check if image data is provided
    if (!req.body.image) {
      return errorResponse(res, 'No image data provided. Use /api/upload/listing with multipart/form-data instead.', 400);
    }

    // For backward compatibility, we'll still handle base64 images if provided
    // Extract the base64 data and file type
    const matches = req.body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      return errorResponse(res, 'Invalid image format. Expected base64 data URI.', 400);
    }

    // Get the file type and base64 data
    const fileType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Create a temporary file object that mimics multer's file object
    const tempFile = {
      originalname: `listing-${Date.now()}.${fileType.split('/')[1] || 'jpg'}`,
      buffer,
      mimetype: fileType
    };

    // Use our existing uploadFile utility
    const { uploadFile } = require('../utils/fileUpload');
    const fileUrl = await uploadFile(tempFile, 'listings');

    successResponse(res, { url: fileUrl });
  } catch (error) {
    console.error('Upload image error:', error);
    errorResponse(res, 'Failed to upload image', 500, error);
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
