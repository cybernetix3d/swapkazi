/**
 * Upload Routes
 *
 * API routes for handling file uploads
 */

const express = require('express');
const router = express.Router();
const { multer, uploadFile, deleteFile } = require('../utils/fileUpload');
const auth = require('../middleware/auth.middleware');
const { successResponse, errorResponse } = require('../utils/responseUtils');

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar', auth, multer.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return errorResponse(res, 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed', 400);
    }

    // Upload file to Firebase Storage
    const fileUrl = await uploadFile(req.file, 'avatars');

    // Return the file URL
    successResponse(res, { fileUrl });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    errorResponse(res, 'Error uploading file', 500, error);
  }
});

/**
 * @route   POST /api/upload/listing
 * @desc    Upload listing image
 * @access  Private
 */
router.post('/listing', auth, multer.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return errorResponse(res, 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed', 400);
    }

    // Upload file to Firebase Storage
    const fileUrl = await uploadFile(req.file, 'listings');

    // Return the file URL
    successResponse(res, { fileUrl });
  } catch (error) {
    console.error('Error uploading listing image:', error);
    errorResponse(res, 'Error uploading file', 500, error);
  }
});

/**
 * @route   DELETE /api/upload
 * @desc    Delete a file
 * @access  Private
 */
router.delete('/', auth, async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return errorResponse(res, 'No file URL provided', 400);
    }

    // Delete file from Firebase Storage
    const deleted = await deleteFile(fileUrl);

    if (!deleted) {
      return errorResponse(res, 'File not found or could not be deleted', 404);
    }

    successResponse(res, { message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    errorResponse(res, 'Error deleting file', 500, error);
  }
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files
 * @access  Private
 */
router.post('/multiple', auth, multer.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'No files uploaded', 400);
    }

    // Check file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = req.files.filter(file => !allowedTypes.includes(file.mimetype));

    if (invalidFiles.length > 0) {
      return errorResponse(res, 'Invalid file type(s). Only JPEG, PNG, GIF, and WebP images are allowed', 400);
    }

    // Upload files to Firebase Storage
    const uploadPromises = req.files.map(file => uploadFile(file, 'listings'));
    const fileUrls = await Promise.all(uploadPromises);

    // Return the file URLs
    successResponse(res, { fileUrls });
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    errorResponse(res, 'Error uploading files', 500, error);
  }
});

module.exports = router;
