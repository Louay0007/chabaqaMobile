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
  const API_BASE_URL = PlatformUtils.getApiUrl();
  
  // Separate URL from any existing query params
  const [baseUrl, existingParams] = url.split('?');
  
  console.log('🔗 [IMAGE-UTILS] Transforming URL:', { input: baseUrl, apiBase: API_BASE_URL });

  let result = baseUrl;

  // If it's already a full URL with the correct server, keep the base
  if (baseUrl.startsWith(API_BASE_URL)) {
    console.log('🔗 [IMAGE-UTILS] URL already correct:', baseUrl);
    result = baseUrl;
  }
  // If it's a relative path starting with /uploads
  else if (baseUrl.startsWith('/uploads')) {
    result = `${API_BASE_URL}${baseUrl}`;
    console.log('🔗 [IMAGE-UTILS] Relative path transformed:', result);
  }
  // If it's a localhost URL (any port), replace with API URL
  else if (baseUrl.includes('localhost:')) {
    // Extract the path after the port
    const match = baseUrl.match(/localhost:\d+(\/.*)/);
    if (match && match[1]) {
      result = `${API_BASE_URL}${match[1]}`;
      console.log('🔗 [IMAGE-UTILS] Localhost URL transformed:', result);
    }
  }
  // Handle http://localhost:3000 specifically
  else if (baseUrl.startsWith('http://localhost:3000')) {
    result = baseUrl.replace('http://localhost:3000', API_BASE_URL);
    console.log('🔗 [IMAGE-UTILS] localhost:3000 transformed:', result);
  }
  // Handle http://localhost (without port)
  else if (baseUrl.startsWith('http://localhost')) {
    result = baseUrl.replace(/http:\/\/localhost(:\d+)?/, API_BASE_URL);
    console.log('🔗 [IMAGE-UTILS] localhost transformed:', result);
  }
  // If it's just the path without leading slash
  else if (baseUrl.startsWith('uploads/')) {
    result = `${API_BASE_URL}/${baseUrl}`;
    console.log('🔗 [IMAGE-UTILS] uploads path transformed:', result);
  }
  // If it's an external URL (https://...), return as-is
  else if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    console.log('🔗 [IMAGE-UTILS] External URL unchanged:', baseUrl);
    result = baseUrl;
  }
  // Default: assume it's a relative path
  else {
    result = `${API_BASE_URL}/${baseUrl}`;
    console.log('🔗 [IMAGE-UTILS] Default transform:', result);
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
