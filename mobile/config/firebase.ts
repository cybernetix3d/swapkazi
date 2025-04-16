/**
 * Firebase Configuration
 * 
 * This file contains the Firebase configuration for the mobile app.
 */

// Firebase configuration
export const firebaseConfig = {
  storageBucket: 'swapkazi.firebasestorage.app',
  // Add other Firebase config values as needed
};

// Storage URL helpers
export const getStorageUrl = (path: string): string => {
  if (!path) return '';
  
  // If it's already a full URL, return it
  if (path.startsWith('http')) {
    return path;
  }
  
  // Otherwise, construct the Firebase Storage URL
  const bucket = firebaseConfig.storageBucket;
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
};

// Default export
export default firebaseConfig;
