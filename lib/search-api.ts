import { getAccessToken } from './auth';
import { tryEndpoints } from './http';
import PlatformUtils from './platform-utils';

const API_BASE_URL = PlatformUtils.getApiUrl();

// Types for search results
export interface SearchUser {
  _id: string;
  name: string;
  handle: string;
  avatar?: string;
  bio?: string;
}

export interface SearchPost {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    handle: string;
  };
  community?: {
    name: string;
    slug: string;
  };
  createdAt: string;
}

export interface SearchCourse {
  _id: string;
  titre: string;
  description: string;
  prix: number;
  devise: string;
  category: string;
  niveau: string;
  creator: {
    name: string;
  };
}

export interface SearchResults {
  users: SearchUser[];
  posts: SearchPost[];
  courses: SearchCourse[];
}

/**
 * Search across users, posts, and courses
 */
export async function globalSearch(
  query: string,
  limit: number = 5
): Promise<SearchResults> {
  if (!query || query.trim().length === 0) {
    return { users: [], posts: [], courses: [] };
  }

  const token = await getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  // Search users by name or handle
  const searchUsers = async (): Promise<SearchUser[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/all-users`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to search users:', response.status);
        return [];
      }

      const data = await response.json();
      console.log('🔍 [SEARCH] Raw API response:', JSON.stringify(data).substring(0, 200));
      
      // Try different response structures
      const allUsers = data.data || data.users || data || [];
      
      console.log('🔍 [SEARCH] All users count:', allUsers.length);
      
      // Filter users by query (case-insensitive)
      const filtered = allUsers.filter((user: any) => 
        user.name?.toLowerCase().includes(query.toLowerCase()) ||
        user.handle?.toLowerCase().includes(query.toLowerCase())
      );

      console.log('🔍 [SEARCH] Filtered users:', filtered.length);

      return filtered.slice(0, limit).map((user: any) => ({
        _id: user._id,
        name: user.name,
        handle: user.handle,
        avatar: user.avatar,
        bio: user.bio,
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  // Search posts
  const searchPosts = async (): Promise<SearchPost[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/posts?search=${encodeURIComponent(query)}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to search posts:', response.status);
        return [];
      }

      const result = await response.json();
      const posts = result.data?.posts || [];

      // Filter out posts with missing data and map to SearchPost format
      return posts
        .filter((post: any) => post._id && post.author && post.author.name)
        .map((post: any) => ({
          _id: post._id,
          title: post.title || 'Untitled Post',
          content: post.content,
          author: {
            name: post.author.name,
            handle: post.author.handle || '',
          },
          community: post.community ? {
            name: post.community.name,
            slug: post.community.slug,
          } : undefined,
          createdAt: post.createdAt,
        }));
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  };

  // Search courses
  const searchCourses = async (): Promise<SearchCourse[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cours?search=${encodeURIComponent(query)}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to search courses:', response.status);
        return [];
      }

      const result = await response.json();
      console.log('🔍 [SEARCH] Raw courses response:', JSON.stringify(result).substring(0, 200));
      
      // Try different response structures
      const courses = result.data?.courses || result.courses || result.data || result || [];

      console.log('🔍 [SEARCH] Courses found:', courses.length);

      return courses.map((course: any) => ({
        _id: course._id,
        titre: course.titre,
        description: course.description,
        prix: course.prix,
        devise: course.devise,
        category: course.category,
        niveau: course.niveau,
        creator: {
          name: course.creator?.name || 'Unknown',
        },
      }));
    } catch (error) {
      console.error('Error searching courses:', error);
      return [];
    }
  };

  // Execute searches in parallel (users and courses only)
  const [users, courses] = await Promise.all([
    searchUsers(),
    searchCourses(),
  ]);

  return { users, posts: [], courses };
}

/**
 * Get recent searches from local storage
 */
export function getRecentSearches(): string[] {
  try {
    // For now, return empty array. Can be implemented with AsyncStorage later
    return [];
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
}

/**
 * Save a search query to recent searches
 */
export function saveRecentSearch(query: string): void {
  try {
    // Can be implemented with AsyncStorage later
    console.log('Saving recent search:', query);
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
}

/**
 * Clear recent searches
 */
export function clearRecentSearches(): void {
  try {
    // Can be implemented with AsyncStorage later
    console.log('Clearing recent searches');
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
}
