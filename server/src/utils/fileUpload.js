/**
 * File Upload Utilities
 * 
 * This file contains utility functions for handling file uploads to Firebase Storage.
 */

const { bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const os = require('os');
const fs = require('fs');
const Multer = require('multer');

// Configure multer for handling file uploads
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

/**
 * Upload a file to Firebase Storage
 * @param {Object} file - The file object from multer
 * @param {string} folder - The folder to upload to (e.g., 'avatars', 'listings')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
const uploadFile = async (file, folder = '') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Create a unique filename
    const fileName = `${folder}/${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    
    // Create a new blob in the bucket
    const blob = bucket.file(fileName);
    
    // Create a token to temporarily authenticate the upload
    const token = uuidv4();
    
    // Set up the upload stream
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    // Return a promise that resolves with the file's public URL
    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        reject(error);
      });

      blobStream.on('finish', async () => {
        // Construct the public URL
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
          bucket.name
        }/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`;
        
        // Make the file publicly accessible
        await blob.makePublic();
        
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} fileUrl - The public URL of the file to delete
 * @returns {Promise<boolean>} - Whether the deletion was successful
 */
const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl) {
      return false;
    }

    // Extract the file path from the URL
    const filePathMatch = fileUrl.match(/o\/(.+?)\\?alt=media/);
    if (!filePathMatch || !filePathMatch[1]) {
      return false;
    }

    const filePath = decodeURIComponent(filePathMatch[1]);
    const file = bucket.file(filePath);
    
    // Check if the file exists
    const [exists] = await file.exists();
    if (!exists) {
      return false;
    }

    // Delete the file
    await file.delete();
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  multer,
  uploadFile,
  deleteFile,
};
