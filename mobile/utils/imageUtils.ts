/**
 * Image Utility Functions
 * 
 * This file contains utility functions for handling images in the app.
 */

import config from '../config';
import { safeGet } from './nullChecks';

/**
 * Get a valid image URL from a listing
 * @param listing The listing object
 * @returns A valid image URL or a placeholder
 */
export const getListingImageUrl = (listing: any): string => {
  if (!listing) {
    return 'https://via.placeholder.com/400?text=No+Image';
  }

  // Try to get the first image from the listing
  const images = safeGet(listing, 'images', []);
  
  if (images.length > 0) {
    // If the image is an object with a url property
    if (typeof images[0] === 'object' && images[0] !== null) {
      return safeGet(images[0], 'url', 'https://via.placeholder.com/400?text=No+Image');
    }
    
    // If the image is a string
    if (typeof images[0] === 'string') {
      return images[0];
    }
  }
  
  // Fallback to placeholder
  return 'https://via.placeholder.com/400?text=No+Image';
};

/**
 * Get a valid avatar URL from a user
 * @param user The user object
 * @returns A valid avatar URL or a placeholder
 */
export const getUserAvatarUrl = (user: any): string => {
  if (!user) {
    return 'https://via.placeholder.com/150?text=User';
  }
  
  const avatar = safeGet(user, 'avatar', null);
  
  if (avatar) {
    return avatar;
  }
  
  // Fallback to placeholder
  return 'https://via.placeholder.com/150?text=User';
};

/**
 * Check if a URL is a valid image URL
 * @param url The URL to check
 * @returns True if the URL is a valid image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check if it's a valid URL
  try {
    new URL(url);
  } catch (e) {
    return false;
  }
  
  // Check if it's an image URL (simple check)
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
  
  // Check if it's from a trusted domain
  const trustedDomains = [
    'firebasestorage.googleapis.com',
    'storage.googleapis.com',
    'via.placeholder.com',
    'images.unsplash.com',
    'picsum.photos'
  ];
  
  const isTrustedDomain = trustedDomains.some(domain => url.includes(domain));
  
  return hasImageExtension || isTrustedDomain;
};
