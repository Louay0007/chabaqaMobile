/**
 * Post API Integration
 * 
 * Provides functions to interact with the post endpoints for social features.
 * Handles post creation, comments, likes, bookmarks, and feed management.
 * 
 * @module post-api
 */

import { getAccessToken } from './auth';
import { tryEndpoints } from './http';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Post author information
 */
export interface PostAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * Post comment
 */
export interface PostComment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Community reference
 */
export interface PostCommunity {
  id: string;
  name: string;
  slug: string;
}

/**
 * Main post interface (aligned with backend DTOs)
 */
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  communityId: string;
  community: PostCommunity;
  authorId: string;
  author: PostAuthor;
  isPublished: boolean;
  likes: number;
  shares?: number;
  isLikedByUser: boolean;
  isBookmarked: boolean;
  comments: PostComment[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * API response for post list (aligned with backend)
 */
export interface PostListResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Post filters for browsing
 */
export interface PostFilters {
  page?: number;
  limit?: number;
  communityId?: string;
  authorId?: string;
  tags?: string[];
  search?: string;
}

/**
 * Create post data (aligned with backend DTO)
 */
export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  communityId: string;
  tags?: string[];
}

/**
 * Update post data (aligned with backend DTO)
 */
export interface UpdatePostData {
  title?: string;
  content?: string;
  excerpt?: string;
  thumbnail?: string;
  tags?: string[];
}

/**
 * Post statistics (aligned with backend DTO)
 */
export interface PostStats {
  postId: string;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  isLikedByUser: boolean;
  isSharedByUser: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get posts with filters (for feed)
 * 
 * @param filters - Filter options for posts
 * @returns Promise with post list response
 */
export async function getPosts(filters: PostFilters = {}): Promise<PostListResponse> {
  try {
    console.log('📝 [POST-API] Fetching posts with filters:', filters);

    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.communityId) params.append('communityId', filters.communityId);
    if (filters.authorId) params.append('authorId', filters.authorId);
    if (filters.tags) params.append('tags', filters.tags.join(','));
    if (filters.search) params.append('search', filters.search);

    const resp = await tryEndpoints<any>(
      `/api/posts?${params.toString()}`,
      {
        method: 'GET',
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Posts fetched successfully:', resp.data.data?.posts?.length || 0);
      return {
        posts: resp.data.data?.posts || [],
        pagination: {
          page: resp.data.data?.pagination?.page || 1,
          limit: resp.data.data?.pagination?.limit || 10,
          total: resp.data.data?.pagination?.total || 0,
          totalPages: resp.data.data?.pagination?.totalPages || 1,
        }
      };
    }

    throw new Error(resp.data.message || 'Failed to fetch posts');
  } catch (error: any) {
    console.error('💥 [POST-API] Error fetching posts:', error);
    throw new Error(error.message || 'Failed to fetch posts');
  }
}

/**
 * Get post by ID
 * 
 * @param postId - Post ID
 * @returns Promise with post details
 */
export async function getPostById(postId: string): Promise<Post> {
  try {
    console.log('📝 [POST-API] Fetching post details:', postId);

    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}`,
      {
        method: 'GET',
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Post details fetched');
      return resp.data.data;
    }

    throw new Error(resp.data.message || 'Failed to fetch post');
  } catch (error: any) {
    console.error('💥 [POST-API] Error fetching post:', error);
    throw new Error(error.message || 'Failed to fetch post details');
  }
}

/**
 * Get posts by community
 * 
 * @param communityId - Community ID
 * @param filters - Additional filters
 * @returns Promise with post list
 */
export async function getPostsByCommunity(
  communityId: string,
  filters: Omit<PostFilters, 'communityId'> = {}
): Promise<PostListResponse> {
  try {
    console.log('📝 [POST-API] Fetching posts for community:', communityId);
    console.log('🔗 [POST-API] Request filters:', filters);

    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const url = `/api/posts/community/${communityId}?${params.toString()}`;
    console.log('🔗 [POST-API] Request URL:', url);

    const resp = await tryEndpoints<any>(
      url,
      {
        method: 'GET',
        timeout: 30000,
      }
    );

    console.log('🔍 [POST-API] Response status:', resp.status);
    console.log('📄 [POST-API] Response data:', resp.data);

    if (resp.status >= 200 && resp.status < 300) {
      // Check if the backend returned success: false
      if (resp.data.success === false) {
        console.log('⚠️ [POST-API] Backend returned success: false, using empty data');
        return {
          posts: [],
          pagination: {
            page: filters.page || 1,
            limit: filters.limit || 10,
            total: 0,
            totalPages: 0,
          }
        };
      }

      console.log('✅ [POST-API] Community posts fetched:', resp.data.data?.posts?.length || 0);
      return {
        posts: resp.data.data?.posts || [],
        pagination: {
          page: resp.data.data?.pagination?.page || 1,
          limit: resp.data.data?.pagination?.limit || 10,
          total: resp.data.data?.pagination?.total || 0,
          totalPages: resp.data.data?.pagination?.totalPages || 1,
        }
      };
    }

    throw new Error(resp.data.message || `HTTP ${resp.status}: Failed to fetch community posts`);
  } catch (error: any) {
    console.error('💥 [POST-API] Error fetching community posts:', error);
    throw new Error(error.message || 'Failed to fetch community posts');
  }
}

/**
 * Get posts by user
 * 
 * @param userId - User ID
 * @param page - Page number
 * @param limit - Items per page
 * @returns Promise with post list
 */
export async function getPostsByUser(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<PostListResponse> {
  try {
    console.log('📝 [POST-API] Fetching posts for user:', userId);

    const resp = await tryEndpoints<any>(
      `/api/posts/user/${userId}?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] User posts fetched:', resp.data.data?.posts?.length || 0);
      return {
        posts: resp.data.data?.posts || [],
        pagination: {
          page: resp.data.data?.pagination?.page || 1,
          limit: resp.data.data?.pagination?.limit || 10,
          total: resp.data.data?.pagination?.total || 0,
          totalPages: resp.data.data?.pagination?.totalPages || 1,
        }
      };
    }

    throw new Error(resp.data.message || 'Failed to fetch user posts');
  } catch (error: any) {
    console.error('💥 [POST-API] Error fetching user posts:', error);
    throw new Error(error.message || 'Failed to fetch user posts');
  }
}

/**
 * Upload an image for a post
 * 
 * @param imageUri - Local image URI
 * @returns Promise with uploaded image URL
 */
export async function uploadPostImage(imageUri: string): Promise<string> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required. Please login to upload images.');
    }

    console.log('📤 [POST-API] Uploading image...');
    console.log('📤 [POST-API] Image URI:', imageUri);

    // Get API URL from environment
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.180:3000';
    const uploadUrl = `${API_BASE_URL}/api/upload/single?type=image`;
    
    console.log('📤 [POST-API] Upload URL:', uploadUrl);

    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'post-image.jpg',
    } as any);

    // Use native fetch instead of tryEndpoints for FormData
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    const data = await response.json();
    
    console.log('📤 [POST-API] Upload response status:', response.status);
    console.log('📤 [POST-API] Upload response data:', data);

    if (response.ok && data.success !== false) {
      let imageUrl = data.file?.url || data.url || '';
      
      // Replace localhost with actual API URL for mobile compatibility
      if (imageUrl.includes('localhost')) {
        imageUrl = imageUrl.replace('http://localhost:3000', API_BASE_URL);
        console.log('📤 [POST-API] Replaced localhost with API_BASE_URL:', imageUrl);
      }
      
      console.log('✅ [POST-API] Image uploaded successfully:', imageUrl);
      return imageUrl;
    }

    throw new Error(data.message || 'Failed to upload image');
  } catch (error: any) {
    console.error('💥 [POST-API] Error uploading image:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
}

/**
 * Create a new post
 * 
 * @param postData - Post data
 * @returns Promise with created post
 */
export async function createPost(postData: CreatePostData): Promise<Post> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required. Please login to create posts.');
    }

    console.log('✍️ [POST-API] Creating post');

    const resp = await tryEndpoints<any>(
      `/api/posts`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: postData,
        timeout: 30000,
      }
    );

    console.log('📝 [POST-API] Response status:', resp.status);
    console.log('📝 [POST-API] Response data:', resp.data);

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Post created successfully');
      return resp.data.data;
    }

    // Extract error message from backend response
    const errorMessage = resp.data?.error?.message || resp.data?.message || 'Failed to create post';
    console.log('❌ [POST-API] Backend error:', errorMessage);
    
    throw new Error(errorMessage);
  } catch (error: any) {
    console.error('💥 [POST-API] Error creating post:', error);
    throw error; // Re-throw to be handled in the UI layer
  }
}

/**
 * Update a post
 * 
 * @param postId - Post ID
 * @param postData - Updated post data
 * @returns Promise with updated post
 */
export async function updatePost(postId: string, postData: UpdatePostData): Promise<Post> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('✏️ [POST-API] Updating post:', postId);

    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: postData,
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Post updated successfully');
      return resp.data.data;
    }

    throw new Error(resp.data.message || 'Failed to update post');
  } catch (error: any) {
    console.error('💥 [POST-API] Error updating post:', error);
    throw new Error(error.message || 'Failed to update post');
  }
}

/**
 * Delete a post
 * 
 * @param postId - Post ID
 * @returns Promise with success status
 */
export async function deletePost(postId: string): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      return { success: true, message: 'Post deleted successfully' };
    }

    throw new Error(resp.data.message || 'Failed to delete post');
  } catch (error: any) {
    console.error('❌ [DELETE] Backend bug - 403 Forbidden même si auteur');
    throw new Error(error.message || 'Failed to delete post');
  }
}

/**
 * Like a post
 * 
 * @param postId - Post ID
 * @returns Promise with updated stats
 */
export async function likePost(postId: string): Promise<PostStats> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('❤️ [POST-API] Liking post:', postId);

    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}/like`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Post liked');
      return resp.data.data;
    }

    throw new Error(resp.data.message || 'Failed to like post');
  } catch (error: any) {
    console.error('💥 [POST-API] Error liking post:', error);
    throw new Error(error.message || 'Failed to like post');
  }
}

/**
 * Unlike a post
 * 
 * @param postId - Post ID
 * @returns Promise with updated stats
 */
export async function unlikePost(postId: string): Promise<PostStats> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('💔 [POST-API] Unliking post:', postId);

    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}/unlike`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Post unliked');
      return resp.data.data;
    }

    throw new Error(resp.data.message || 'Failed to unlike post');
  } catch (error: any) {
    console.error('💥 [POST-API] Error unliking post:', error);
    throw new Error(error.message || 'Failed to unlike post');
  }
}

/**
 * Share a post
 * 
 * @param postId - Post ID
 * @returns Promise with updated stats
 */
export async function sharePost(postId: string): Promise<PostStats> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('🔄 [POST-API] Sharing post:', postId);

    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}/share`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Post shared');
      return resp.data.data;
    }

    throw new Error(resp.data.message || 'Failed to share post');
  } catch (error: any) {
    console.error('💥 [POST-API] Error sharing post:', error);
    throw new Error(error.message || 'Failed to share post');
  }
}

/**
 * Unshare a post
 * 
 * @param postId - Post ID
 * @returns Promise with updated stats
 */
export async function unsharePost(postId: string): Promise<PostStats> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('🔄 [POST-API] Unsharing post:', postId);

    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}/unshare`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Post unshared');
      return resp.data.data;
    }

    throw new Error(resp.data.message || 'Failed to unshare post');
  } catch (error: any) {
    console.error('💥 [POST-API] Error unsharing post:', error);
    throw new Error(error.message || 'Failed to unshare post');
  }
}

/**
 * Add comment to a post
 * 
 * @param postId - Post ID
 * @param content - Comment content
 * @returns Promise with created comment
 */
export async function addComment(postId: string, content: string): Promise<PostComment> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('💬 [POST-API] Adding comment to post:', postId);

    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}/comments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { content },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Comment added');
      return resp.data.data;
    }

    throw new Error(resp.data.message || 'Failed to add comment');
  } catch (error: any) {
    console.error('💥 [POST-API] Error adding comment:', error);
    throw new Error(error.message || 'Failed to add comment');
  }
}

/**
 * Get comments for a post
 * 
 * @param postId - Post ID
 * @param userId - Optional user ID to check modification rights
 * @returns Promise with list of comments
 */
export async function getComments(postId: string, userId?: string): Promise<PostComment[]> {
  try {
    console.log('💬 [POST-API] Fetching comments for post:', postId);

    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);

    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}/comments${params.toString() ? '?' + params.toString() : ''}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Comments fetched:', resp.data.data?.length || 0);
      return resp.data.data || [];
    }

    throw new Error(resp.data.message || 'Failed to fetch comments');
  } catch (error: any) {
    console.error('💥 [POST-API] Error fetching comments:', error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
}

/**
 * Delete a comment
 * 
 * @param postId - Post ID
 * @param commentId - Comment ID
 * @returns Promise with success status
 */
export async function deleteComment(
  postId: string,
  commentId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('🗑️ [POST-API] Deleting comment:', commentId);

    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Comment deleted');
      return { success: true, message: 'Comment deleted successfully' };
    }

    throw new Error(resp.data.message || 'Failed to delete comment');
  } catch (error: any) {
    console.error('💥 [POST-API] Error deleting comment:', error);
    throw new Error(error.message || 'Failed to delete comment');
  }
}

/**
 * Update a comment
 * 
 * @param postId - Post ID
 * @param commentId - Comment ID
 * @param content - Updated comment content
 * @returns Promise with updated comment
 */
export async function updateComment(
  postId: string,
  commentId: string,
  content: string
): Promise<PostComment> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }


    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}/comments/${commentId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { content },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Comment updated');
      return resp.data.data;
    }

    throw new Error(resp.data.message || 'Failed to update comment');
  } catch (error: any) {
    console.error('💥 [POST-API] Error updating comment:', error);
    throw new Error(error.message || 'Failed to update comment');
  }
}

/**
 * Bookmark a post
 * 
 * @param postId - Post ID
 * @returns Promise with success status
 */
export async function bookmarkPost(postId: string): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('🔖 [POST-API] Bookmarking post:', postId);

    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}/bookmark`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Post bookmarked');
      return { success: true, message: 'Post bookmarked successfully' };
    }

    throw new Error(resp.data.message || 'Failed to bookmark post');
  } catch (error: any) {
    console.error('💥 [POST-API] Error bookmarking post:', error);
    throw new Error(error.message || 'Failed to bookmark post');
  }
}

/**
 * Remove bookmark from a post
 * 
 * @param postId - Post ID
 * @returns Promise with success status
 */
export async function unbookmarkPost(postId: string): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('🔖 [POST-API] Removing bookmark:', postId);

    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}/bookmark`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Bookmark removed');
      return { success: true, message: 'Bookmark removed successfully' };
    }

    throw new Error(resp.data.message || 'Failed to remove bookmark');
  } catch (error: any) {
    console.error('💥 [POST-API] Error removing bookmark:', error);
    throw new Error(error.message || 'Failed to remove bookmark');
  }
}

/**
 * Get user's bookmarked posts
 * 
 * @param page - Page number
 * @param limit - Items per page
 * @returns Promise with bookmarked posts
 */
export async function getBookmarkedPosts(
  page: number = 1,
  limit: number = 10
): Promise<PostListResponse> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return { 
        posts: [], 
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
    }

    console.log('🔖 [POST-API] Fetching bookmarked posts');

    const resp = await tryEndpoints<any>(
      `/api/posts/user/bookmarks?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Bookmarked posts fetched:', resp.data.data?.posts?.length || 0);
      return {
        posts: resp.data.data?.posts || [],
        pagination: {
          page: resp.data.data?.pagination?.page || 1,
          limit: resp.data.data?.pagination?.limit || 10,
          total: resp.data.data?.pagination?.total || 0,
          totalPages: resp.data.data?.pagination?.totalPages || 1,
        }
      };
    }

    return { 
      posts: [], 
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  } catch (error: any) {
    console.error('💥 [POST-API] Error fetching bookmarked posts:', error);
    return { 
      posts: [], 
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  }
}

/**
 * Get post statistics
 * 
 * @param postId - Post ID
 * @param userId - Optional user ID to check interactions
 * @returns Promise with post statistics
 */
export async function getPostStats(postId: string, userId?: string): Promise<PostStats> {
  try {
    console.log('📊 [POST-API] Fetching post stats:', postId);

    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);

    const resp = await tryEndpoints<any>(
      `/api/posts/${postId}/stats?${params.toString()}`,
      {
        method: 'GET',
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [POST-API] Post stats fetched');
      return resp.data.data;
    }

    throw new Error(resp.data.message || 'Failed to fetch post stats');
  } catch (error: any) {
    console.error('💥 [POST-API] Error fetching post stats:', error);
    throw new Error(error.message || 'Failed to fetch post stats');
  }
}

/**
 * Format time ago string
 * 
 * @param dateString - Date string
 * @returns Formatted time ago string
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
