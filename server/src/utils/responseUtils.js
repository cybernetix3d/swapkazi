/**
 * Response Utilities
 * 
 * This file contains utility functions for standardizing API responses
 * across the application.
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {*} data - Data to send in the response
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Express response
 */
const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} error - Error object or string (optional)
 * @returns {Object} Express response
 */
const errorResponse = (res, message, statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error?.message || error
  });
};

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {number} total - Total number of items (for pagination)
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Express response
 */
const paginatedResponse = (res, data, total, page, limit) => {
  return res.json({
    success: true,
    data,
    count: data.length,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit))
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};
