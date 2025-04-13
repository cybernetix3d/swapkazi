/**
 * Utility functions for handling user avatars
 */

// Array of avatar colors for generating default avatars
const AVATAR_COLORS = [
  '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
  '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
  '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12',
  '#d35400', '#c0392b', '#7f8c8d',
];

/**
 * Get initials from a user's name
 * @param name Full name of the user
 * @returns Initials (up to 2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name || name.trim() === '') return '?';

  const parts = name.trim().split(' ').filter(part => part.length > 0);
  if (parts.length === 0) return '?';

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get a consistent color based on a string (user ID or name)
 * @param str String to use for color selection
 * @returns Hex color code
 */
export const getAvatarColor = (str: string): string => {
  if (!str || str.trim() === '') return AVATAR_COLORS[0];

  // Simple hash function to get a consistent color for the same string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the hash to pick a color
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

/**
 * Generate a data URL for a default avatar with initials
 * @param name User's name
 * @param userId User's ID (for consistent color)
 * @returns Data URL for the avatar
 */
export const generateDefaultAvatar = (name: string, userId: string): string => {
  // Use a placeholder if no name is provided
  const initials = name ? getInitials(name) : '?';
  const color = getAvatarColor(userId || name || '');

  // Create a canvas to draw the avatar
  const canvas = document.createElement('canvas');
  const size = 200; // Size of the avatar
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Draw background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  // Draw text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size / 2, size / 2);

  // Convert to data URL
  return canvas.toDataURL('image/png');
};

/**
 * Get avatar URL - either the user's avatar or a default one
 * @param user User object with name, id, and avatar
 * @returns URL for the avatar
 */
export const getAvatarUrl = (user: { fullName?: string; _id?: string; avatar?: string }): string => {
  if (user?.avatar) {
    return user.avatar;
  }

  // For React Native, we can't use canvas directly, so return a placeholder
  // The UI will handle rendering a text-based avatar instead
  return '';
};
