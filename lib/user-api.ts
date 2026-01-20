import { tryEndpoints } from './http';
import { getAccessToken, storeUser, getStoredUser, User } from './auth';
import { getImageUrl } from './image-utils';
import PlatformUtils from './platform-utils';

/**
 * 👤 User Profile API Client
 * Handles user profile management, settings, and account operations
 */

// Re-export User type for convenience
export type { User } from './auth';

/**
 * Transform user object to fix image URLs
 */
function transformUserImages(user: any): any {
  if (!user) return user;
  return {
    ...user,
    avatar: getImageUrl(user.avatar),
    photo_profil: getImageUrl(user.photo_profil),
  };
}

// ==================== INTERFACES ====================

export interface UpdateProfileData {
  name?: string;
  numtel?: string;
  date_naissance?: string;
  sexe?: string;
  pays?: string;
  ville?: string;
  code_postal?: string;
  adresse?: string;
  bio?: string;
  avatar?: string;
  photo_profil?: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get current user profile (uses auth token)
 * Already exists in auth.ts as getProfile(), this is a wrapper for consistency
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    console.log('👤 [USER-API] Fetching current user profile');
    const accessToken = await getAccessToken();

    if (!accessToken) {
      console.log('⚠️ [USER-API] No access token available');
      return null;
    }

    const resp = await tryEndpoints<{ success?: boolean; data?: any; user?: any; message?: string }>(
      '/api/auth/me',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 30000,
      }
    );

    console.log('✅ [USER-API] User profile fetched successfully');
    // Backend returns { success: true, data: user } from /api/auth/me
    const user = resp.data.data || resp.data.user;
    if (user) {
      const transformedUser = transformUserImages(user);
      await storeUser(transformedUser);
      return transformedUser;
    }
    return null;
  } catch (error: any) {
    console.error('💥 [USER-API] Error fetching user:', error);
    // Return cached user as fallback
    return await getStoredUser();
  }
};

/**
 * Update user profile
 * @param data - Profile data to update
 * @returns Promise with updated user
 */
export const updateProfile = async (data: UpdateProfileData): Promise<UserResponse> => {
  try {
    console.log('🔄 [USER-API] Updating profile:', Object.keys(data));
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const resp = await tryEndpoints<UserResponse>(
      '/api/user/update-profile',
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data,
        timeout: 30000,
      }
    );

    console.log('✅ [USER-API] Profile updated successfully');

    // Update cached user with transformed images
    if (resp.data.user) {
      const transformedUser = transformUserImages(resp.data.user);
      await storeUser(transformedUser);
      return { ...resp.data, user: transformedUser };
    }

    return resp.data;
  } catch (error: any) {
    console.error('💥 [USER-API] Error updating profile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
};

/**
 * Change user password
 * @param newPassword - New password
 * @returns Promise with success response
 */
export const changePassword = async (newPassword: string): Promise<SuccessResponse> => {
  try {
    console.log('🔐 [USER-API] Changing password...');
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const resp = await tryEndpoints<SuccessResponse>(
      '/api/user/change-password',
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: { password: newPassword },
        timeout: 30000,
      }
    );

    console.log('✅ [USER-API] Password changed successfully');
    return resp.data;
  } catch (error: any) {
    console.error('💥 [USER-API] Error changing password:', error);
    throw new Error(error.message || 'Failed to change password');
  }
};

/**
 * Get user by ID
 * @param userId - User ID
 * @returns Promise with user data
 */
export const getUserById = async (userId: string): Promise<User> => {
  try {
    console.log('👤 [USER-API] Fetching user by ID:', userId);

    const resp = await tryEndpoints<{ user: User; message: string }>(
      `/api/user/user/${userId}`,
      {
        method: 'GET',
        timeout: 30000,
      }
    );

    const user = (resp as any)?.data?.user;
    if (!user) {
      throw new Error('Invalid user response');
    }

    console.log('✅ [USER-API] User fetched successfully:', user.name);
    return transformUserImages(user);
  } catch (error: any) {
    console.error('💥 [USER-API] Error fetching user:', error);
    throw new Error(error.message || 'Failed to fetch user');
  }
};

/**
 * Upload user avatar
 * @param imageUri - Local image URI
 * @returns Promise with avatar URL
 */
export const uploadAvatar = async (imageUri: string): Promise<{ avatarUrl: string }> => {
  try {
    console.log('📸 [USER-API] Uploading avatar...');
    console.log('📸 [USER-API] Image URI:', imageUri);
    console.log('📸 [USER-API] Platform:', PlatformUtils.isWeb ? 'Web' : 'Native');
    
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    // Create form data for multipart upload
    const formData = new FormData();
    
    // Get file info from URI
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1].toLowerCase().split('?')[0]; // Remove query params
    const fileName = `avatar_${Date.now()}.${fileType || 'jpg'}`;
    
    // Determine mime type
    let mimeType = 'image/jpeg';
    if (fileType === 'png') mimeType = 'image/png';
    else if (fileType === 'gif') mimeType = 'image/gif';
    else if (fileType === 'webp') mimeType = 'image/webp';
    
    console.log('📸 [USER-API] File details:', { fileName, fileType, mimeType });
    
    if (PlatformUtils.isWeb) {
      // Web platform: need to fetch the blob first
      console.log('📸 [USER-API] Web platform - fetching blob from URI');
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('file', blob, fileName);
      console.log('📸 [USER-API] Blob created, size:', blob.size);
    } else {
      // React Native: use the special object format
      formData.append('file', {
        uri: imageUri,
        name: fileName,
        type: mimeType,
      } as any);
    }

    // Get the API base URL
    const API_BASE_URL = PlatformUtils.getApiUrl();
    // Use /upload/single endpoint like the frontend does
    const uploadUrl = `${API_BASE_URL}/api/upload/single`;
    
    console.log('📤 [USER-API] Uploading to:', uploadUrl);
    
    // Use fetch directly for multipart/form-data
    // IMPORTANT: Do NOT set Content-Type header - let fetch set it with boundary
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // Don't set Content-Type - fetch will set it automatically with boundary for FormData
      },
      body: formData,
    });

    console.log('📤 [USER-API] Response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ [USER-API] Upload failed:', uploadResponse.status, errorText);
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const result = await uploadResponse.json();
    console.log('✅ [USER-API] Avatar uploaded successfully:', JSON.stringify(result, null, 2));
    
    // The backend returns the URL in result.url (from UploadResponseDto)
    const avatarUrl = result.url || result.file?.url || result.filename;
    
    if (!avatarUrl) {
      console.error('❌ [USER-API] No URL in response:', result);
      throw new Error('No URL returned from upload');
    }

    // Make sure we return the full URL
    const fullAvatarUrl = avatarUrl.startsWith('http') ? avatarUrl : `${API_BASE_URL}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
    console.log('✅ [USER-API] Full avatar URL:', fullAvatarUrl);

    return { avatarUrl: fullAvatarUrl };
  } catch (error: any) {
    console.error('💥 [USER-API] Error uploading avatar:', error);
    throw new Error(error.message || 'Failed to upload avatar');
  }
};

/**
 * Update user avatar - uploads image and updates profile
 * @param imageUri - Local image URI from image picker
 * @returns Promise with updated user
 */
export const updateAvatar = async (imageUri: string): Promise<UserResponse> => {
  try {
    console.log('📸 [USER-API] Updating avatar...');
    
    // First upload the image
    const { avatarUrl } = await uploadAvatar(imageUri);
    console.log('✅ [USER-API] Image uploaded, raw URL:', avatarUrl);
    
    // Transform the URL to use VPS instead of localhost
    const transformedUrl = getImageUrl(avatarUrl);
    console.log('✅ [USER-API] Transformed URL:', transformedUrl);
    
    // Then update the profile with the new avatar URL
    // The backend uses 'photo_profil' field
    const result = await updateProfile({ 
      photo_profil: transformedUrl,
    });
    
    console.log('✅ [USER-API] Profile updated with new avatar');
    
    // Ensure the returned user has transformed URLs
    if (result.user) {
      result.user = transformUserImages(result.user);
    }
    
    return result;
  } catch (error: any) {
    console.error('💥 [USER-API] Error updating avatar:', error);
    throw new Error(error.message || 'Failed to update avatar');
  }
};

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * At least 8 characters
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  return { valid: true };
};

/**
 * Validate phone number (basic)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9+\-\s()]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
};

/**
 * Validate name (at least 2 characters)
 */
export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

// ==================== EXPORT ====================

export default {
  getCurrentUser,
  updateProfile,
  changePassword,
  getUserById,
  uploadAvatar,
  updateAvatar,
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
};

/**
 * Delete user account and all associated data
 * This action is permanent and cannot be undone
 * 
 * @returns Promise with success response
 * @throws Error if deletion fails
 */
export const deleteAccount = async (): Promise<SuccessResponse> => {
  try {
    console.log('🗑️ [USER-API] Deleting account...');

    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error('Authentication required');
    }

    const resp = await tryEndpoints<SuccessResponse>(
      '/api/user/delete-account',
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('✅ [USER-API] Account deleted successfully');

    return resp.data;
  } catch (error: any) {
    console.error('💥 [USER-API] Error deleting account:', error);
    throw new Error(error.message || 'Failed to delete account');
  }
};
