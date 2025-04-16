const axios = require('axios');
const { successResponse, errorResponse } = require('../utils/responseUtils');

// Get the Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * @desc    Reverse geocode coordinates to address
 * @route   GET /api/geocoding/reverse
 * @access  Private
 */
const reverseGeocode = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return errorResponse(res, 'Latitude and longitude are required', 400);
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return errorResponse(res, 'Google Maps API key is not configured', 500);
    }

    // Call Google Maps Geocoding API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);

    if (response.data.status !== 'OK') {
      return errorResponse(res, `Geocoding failed: ${response.data.status}`, 400);
    }

    // Process the response to extract relevant address components
    const result = response.data.results[0];
    let city, region, country, formattedAddress;

    formattedAddress = result.formatted_address;

    // Extract address components
    for (const component of result.address_components) {
      if (component.types.includes('locality')) {
        city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        region = component.long_name;
      } else if (component.types.includes('country')) {
        country = component.long_name;
      }
    }

    // Return the processed address data
    successResponse(res, {
      address: formattedAddress,
      city,
      region,
      country,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    errorResponse(res, 'Failed to reverse geocode coordinates', 500, error);
  }
};

module.exports = {
  reverseGeocode
};
