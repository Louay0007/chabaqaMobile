import PlatformUtils from './platform-utils';

/**
 * Image URL utilities for the mobile app
 * Converts relative/localhost URLs to use the correct API server
 */

/**
 * Convert an image URL to use the correct API server
 * Handles various URL formats:
 * - Relative paths: /uploads/image/xxx.jpg
 * - Localhost URLs: http://localhost:3000/uploads/xxx.jpg
 * - Already correct URLs: returns as-is
 * 
 * @param url - The image URL from the API
 * @param addCacheBuster - Optional: add cache-busting query param
 * @returns The corrected URL pointing to the VPS server
 */
export function getImageUrl(url: string | undefined | null, addCacheBuster: boolean = false): string {
  if (!url) {
    return '';
  }

  // Get API URL dynamically to ensure env is loaded
  const API_BASE_URL = PlatformUtils.getApiUrl().replace(/\/$/, ''); // Remove trailing slash

  // Separate URL from any existing query params
  const [baseUrl, existingParams] = url.split('?');

  let result = baseUrl;

  // List of patterns that should be replaced with API_BASE_URL
  const localPatterns = [
    'localhost',
    '127.0.0.1',
    '192.168.',
    '10.0.',
    '172.16.',
    '172.17.',
    '172.18.',
    '172.19.',
    '172.20.',
    '172.21.',
    '172.22.',
    '172.23.',
    '172.24.',
    '172.25.',
    '172.26.',
    '172.27.',
    '172.28.',
    '172.29.',
    '172.30.',
    '172.31.',
  ];

  const isLocalUrl = localPatterns.some(pattern => baseUrl.includes(pattern));

  // CRITICAL: If any URL contains '/uploads/', we MUST force it to use our current API_BASE_URL
  // This handles cases where the DB has 'localhost', '127.0.0.1', or stale IPs
  if (baseUrl.includes('/uploads/')) {
    const pathAfterUploads = baseUrl.split('/uploads/')[1];
    result = `${API_BASE_URL}/uploads/${pathAfterUploads}`;
  }
  // If it's a relative path starting with uploads/ (no leading slash)
  else if (baseUrl.startsWith('uploads/')) {
    result = `${API_BASE_URL}/${baseUrl}`;
  }
  // Handle any localhost or local IP URLs
  else if (isLocalUrl && baseUrl.startsWith('http')) {
    // Extract the path from the URL
    const urlParts = baseUrl.split('://');
    if (urlParts.length > 1) {
      const pathParts = urlParts[1].split('/');
      const path = pathParts.slice(1).join('/');
      if (path) {
        result = `${API_BASE_URL}/${path}`;
      }
    }
  }
  // If it's already a full URL (external like ui-avatars, google, etc.) 
  else if (baseUrl.startsWith('http')) {
    result = baseUrl;
  }
  // Default: assume it's a relative path if it's not empty
  else if (baseUrl.trim().length > 0) {
    result = `${API_BASE_URL}/${baseUrl.startsWith('/') ? baseUrl.slice(1) : baseUrl}`;
  }

  // Re-add existing query params if any
  if (existingParams) {
    result = `${result}?${existingParams}`;
  }

  // Add cache buster if requested and not already present
  if (addCacheBuster && !result.includes('?t=')) {
    const separator = result.includes('?') ? '&' : '?';
    result = `${result}${separator}t=${Date.now()}`;
  }

  return result;
}

/**
 * Get avatar URL with fallback
 * @param avatar - Avatar URL or undefined
 * @param fallback - Optional fallback URL
 * @returns Corrected avatar URL or fallback
 */
export function getAvatarUrl(avatar: string | undefined | null, fallback?: string): string {
  const url = getImageUrl(avatar);
  return url || fallback || '';
}

/**
 * Get community image URL
 * @param community - Community object with image/logo/coverImage fields
 * @returns The best available image URL
 */
export function getCommunityImageUrl(community: {
  image?: string;
  logo?: string;
  coverImage?: string;
  photo_de_couverture?: string;
} | null | undefined): string {
  if (!community) return '';

  const imageUrl = community.image || community.logo || community.coverImage || community.photo_de_couverture;
  return getImageUrl(imageUrl);
}

/**
 * Get user avatar URL from user object
 * @param user - User object with avatar field
 * @returns Corrected avatar URL
 */
export function getUserAvatarUrl(user: { avatar?: string } | null | undefined): string {
  return getImageUrl(user?.avatar);
}

export default {
  getImageUrl,
  getAvatarUrl,
  getCommunityImageUrl,
  getUserAvatarUrl,
};
