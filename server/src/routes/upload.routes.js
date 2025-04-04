/**
 * Upload Routes
 *
 * API routes for handling file uploads
 */

const express = require('express');
const router = express.Router();
const { multer, uploadFile, deleteFile } = require('../utils/fileUpload');
const auth = require('../middleware/auth.middleware');

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar', auth, multer.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed'
      });
    }

    // Upload file to Firebase Storage
    const fileUrl = await uploadFile(req.file, 'avatars');

    // Return the file URL
    res.status(200).json({
      success: true,
      fileUrl
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ success: false, message: 'Error uploading file' });
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
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed'
      });
    }

    // Upload file to Firebase Storage
    const fileUrl = await uploadFile(req.file, 'listings');

    // Return the file URL
    res.status(200).json({
      success: true,
      fileUrl
    });
  } catch (error) {
    console.error('Error uploading listing image:', error);
    res.status(500).json({ success: false, message: 'Error uploading file' });
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
      return res.status(400).json({ success: false, message: 'No file URL provided' });
    }

    // Delete file from Firebase Storage
    const deleted = await deleteFile(fileUrl);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'File not found or could not be deleted' });
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, message: 'Error deleting file' });
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
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Check file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = req.files.filter(file => !allowedTypes.includes(file.mimetype));

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type(s). Only JPEG, PNG, GIF, and WebP images are allowed'
      });
    }

    // Upload files to Firebase Storage
    const uploadPromises = req.files.map(file => uploadFile(file, 'listings'));
    const fileUrls = await Promise.all(uploadPromises);

    // Return the file URLs
    res.status(200).json({
      success: true,
      fileUrls
    });
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    res.status(500).json({ success: false, message: 'Error uploading files' });
  }
});

module.exports = router;
