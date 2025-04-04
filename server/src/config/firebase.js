/**
 * Firebase Configuration
 *
 * This file contains the Firebase configuration for storage functionality.
 * You'll need to replace the placeholder values with your actual Firebase project details.
 */

const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');

// You'll need to create a service account in the Firebase console and download the JSON file
// For development, you can place it in the config directory (but don't commit it to version control)
// For production, use environment variables instead

// Initialize Firebase Admin SDK
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require('./serviceAccountKey.json');

// Initialize the app if it hasn't been initialized yet
let firebaseApp;
try {
  firebaseApp = admin.app();
} catch (e) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'swapkazi.firebasestorage.app'
  });
}

// Get a reference to the storage service
const bucket = getStorage().bucket();

module.exports = {
  admin,
  bucket,
  firebaseApp
};
