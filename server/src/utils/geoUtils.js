/**
 * Geospatial Utility Functions
 * 
 * This file contains utility functions for geospatial calculations.
 */

/**
 * Calculate the distance between two points using the Haversine formula
 * @param {Array} coords1 - [longitude, latitude] of first point
 * @param {Array} coords2 - [longitude, latitude] of second point
 * @returns {Number} - Distance in kilometers
 */
const calculateDistance = (coords1, coords2) => {
  const [lng1, lat1] = coords1;
  const [lng2, lat2] = coords2;
  
  // Haversine formula
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(1)); // Distance in km with 1 decimal place
};

/**
 * Format a distance for display
 * @param {Number} distance - Distance in kilometers
 * @returns {String} - Formatted distance string
 */
const formatDistance = (distance) => {
  if (distance < 1) {
    // Convert to meters for distances less than 1km
    const meters = Math.round(distance * 1000);
    return `${meters} m`;
  } else if (distance < 10) {
    // Show one decimal place for distances less than 10km
    return `${distance.toFixed(1)} km`;
  } else {
    // Round to nearest km for larger distances
    return `${Math.round(distance)} km`;
  }
};

/**
 * Calculate a bounding box for a point and radius
 * Useful for preliminary filtering before more precise distance calculations
 * @param {Array} center - [longitude, latitude] of center point
 * @param {Number} radiusKm - Radius in kilometers
 * @returns {Object} - Bounding box coordinates
 */
const calculateBoundingBox = (center, radiusKm) => {
  const [lng, lat] = center;
  
  // Earth's radius in km
  const R = 6371;
  
  // Convert radius from km to radians
  const radiusRad = radiusKm / R;
  
  // Convert lat/lng to radians
  const latRad = lat * Math.PI / 180;
  const lngRad = lng * Math.PI / 180;
  
  // Calculate min/max latitudes
  const minLat = latRad - radiusRad;
  const maxLat = latRad + radiusRad;
  
  // Calculate min/max longitudes
  let minLng, maxLng;
  
  // If the bounding box crosses the poles
  if (minLat > -Math.PI/2 && maxLat < Math.PI/2) {
    const deltaLng = Math.asin(Math.sin(radiusRad) / Math.cos(latRad));
    minLng = lngRad - deltaLng;
    maxLng = lngRad + deltaLng;
    
    // Adjust for longitude wrapping
    if (minLng < -Math.PI) minLng += 2 * Math.PI;
    if (maxLng > Math.PI) maxLng -= 2 * Math.PI;
  } else {
    // Near the poles, longitude spans the full range
    minLat = Math.max(minLat, -Math.PI/2);
    maxLat = Math.min(maxLat, Math.PI/2);
    minLng = -Math.PI;
    maxLng = Math.PI;
  }
  
  // Convert back to degrees
  return {
    minLat: minLat * 180 / Math.PI,
    maxLat: maxLat * 180 / Math.PI,
    minLng: minLng * 180 / Math.PI,
    maxLng: maxLng * 180 / Math.PI
  };
};

/**
 * Convert an address to coordinates using a geocoding service
 * This is a placeholder - you would need to implement with a real geocoding service
 * @param {String} address - The address to geocode
 * @returns {Promise<Array>} - Promise resolving to [longitude, latitude]
 */
const geocodeAddress = async (address) => {
  // This is a placeholder - in a real implementation, you would call a geocoding API
  // such as Google Maps Geocoding API, Mapbox Geocoding, or OpenStreetMap Nominatim
  
  throw new Error('Geocoding not implemented. Please provide coordinates directly.');
};

module.exports = {
  calculateDistance,
  formatDistance,
  calculateBoundingBox,
  geocodeAddress
};
