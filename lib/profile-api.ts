import { tryEndpoints } from './http';
import { getAccessToken, User } from './auth';
import { getCurrentUser } from './user-api';
import { getImageUrl } from './image-utils';

/**
 * 👤 Profile API Client
 * Comprehensive profile data management for the profile screen
 */

// ==================== INTERFACES ====================

export interface UserStats {
  communitiesJoined: number;
  coursesEnrolled: number;
  challengesParticipating: number;
}

export interface UserActivity {
  id: string;
  type: 'community_joined' | 'course_completed' | 'challenge_completed' | 'badge_earned' | 'post_created';
  title: string;
  description: string;
  timestamp: string;
  relatedId?: string;
  metadata?: any;
}

export interface Community {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  logo?: string;
  coverImage?: string;
  membersCount?: number;
}

export interface ProfileData {
  user: User;
  stats: UserStats;
  joinedCommunities: Community[];
  recentActivities: UserActivity[];
}

// ==================== API FUNCTIONS ====================

/**
 * Get user's joined communities count
 * Uses: GET /api/community-aff-crea-join/my-joined
 */
const getCommunitiesCount = async (accessToken: string): Promise<number> => {
  try {
    const resp = await tryEndpoints<any>(
      '/api/community-aff-crea-join/my-joined',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      }
    );
    const communities = resp.data?.communities || resp.data?.data || [];
    return communities.length;
  } catch (error) {
    console.log('⚠️ [PROFILE-API] Could not get communities count');
    return 0;
  }
};

/**
 * Get user's enrolled courses count
 * Uses: GET /api/cours/user/mes-cours
 */
const getCoursesCount = async (accessToken: string): Promise<number> => {
  try {
    const resp = await tryEndpoints<any>(
      '/api/cours/user/mes-cours?page=1&limit=1',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      }
    );
    // Response has pagination.total or total field
    return resp.data?.pagination?.total || resp.data?.total || resp.data?.data?.pagination?.total || 0;
  } catch (error) {
    console.log('⚠️ [PROFILE-API] Could not get courses count');
    return 0;
  }
};

/**
 * Get user's challenge participations count
 * Uses: GET /api/challenges/user/my-participations
 */
const getChallengesCount = async (accessToken: string): Promise<number> => {
  try {
    const resp = await tryEndpoints<any>(
      '/api/challenges/user/my-participations?status=all',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      }
    );
    // Response has data.total or data.participations.length
    return resp.data?.data?.total || resp.data?.data?.participations?.length || resp.data?.total || 0;
  } catch (error) {
    console.log('⚠️ [PROFILE-API] Could not get challenges count');
    return 0;
  }
};

/**
 * Get user's joined communities list
 * Uses: GET /api/community-aff-crea-join/my-joined
 */
const getJoinedCommunities = async (accessToken: string): Promise<Community[]> => {
  try {
    const resp = await tryEndpoints<any>(
      '/api/community-aff-crea-join/my-joined',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      }
    );
    return resp.data?.communities || resp.data?.data || [];
  } catch (error) {
    console.log('⚠️ [PROFILE-API] Could not get joined communities');
    return [];
  }
};

/**
 * Generate recent activities based on user data
 * Since there's no dedicated activities API, we'll create activities from user's data
 */
const generateRecentActivities = async (accessToken: string, userData: any): Promise<UserActivity[]> => {
  const activities: UserActivity[] = [];
  
  try {
    // Get joined communities and create activities
    const communities = await getJoinedCommunities(accessToken);
    communities.slice(0, 3).forEach((community, index) => {
      activities.push({
        id: `community_${community._id}`,
        type: 'community_joined',
        title: 'Joined Community',
        description: `Joined ${community.name}`,
        timestamp: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(), // Mock dates
        relatedId: community._id,
      });
    });

    // Get enrolled courses and create activities
    try {
      const coursesResp = await tryEndpoints<any>(
        '/api/cours/user/mes-cours?page=1&limit=3',
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 5000,
        }
      );
      const courses = coursesResp.data?.data?.courses || [];
      courses.forEach((course: any, index: number) => {
        activities.push({
          id: `course_${course._id}`,
          type: 'course_completed',
          title: 'Enrolled in Course',
          description: `Started learning ${course.title}`,
          timestamp: new Date(Date.now() - (index + 4) * 24 * 60 * 60 * 1000).toISOString(),
          relatedId: course._id,
        });
      });
    } catch (error) {
      console.log('⚠️ [PROFILE-API] Could not get courses for activities');
    }

    // Get challenge participations and create activities
    try {
      const challengesResp = await tryEndpoints<any>(
        '/api/challenges/user/my-participations?status=all',
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 5000,
        }
      );
      const challenges = challengesResp.data?.data?.participations || [];
      challenges.slice(0, 2).forEach((participation: any, index: number) => {
        activities.push({
          id: `challenge_${participation.challengeId}`,
          type: 'challenge_completed',
          title: 'Joined Challenge',
          description: `Participating in ${participation.challenge?.title || 'Challenge'}`,
          timestamp: new Date(Date.now() - (index + 7) * 24 * 60 * 60 * 1000).toISOString(),
          relatedId: participation.challengeId,
        });
      });
    } catch (error) {
      console.log('⚠️ [PROFILE-API] Could not get challenges for activities');
    }

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return activities.slice(0, 10); // Return max 10 activities
  } catch (error) {
    console.log('⚠️ [PROFILE-API] Error generating activities:', error);
    return [];
  }
};

/**
 * Get comprehensive profile data
 */
export const getProfileData = async (): Promise<ProfileData> => {
  try {
    console.log('📆 [PROFILE-API] Fetching profile data');
    
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    // Fetch user data first
    const userData = await getCurrentUser();
    if (!userData) {
      throw new Error('User data not available');
    }

    // Fetch stats and activities in parallel
    const [communitiesCount, coursesCount, challengesCount, joinedCommunities, recentActivities] = await Promise.all([
      getCommunitiesCount(accessToken),
      getCoursesCount(accessToken),
      getChallengesCount(accessToken),
      getJoinedCommunities(accessToken),
      generateRecentActivities(accessToken, userData),
    ]);

    const stats: UserStats = {
      communitiesJoined: communitiesCount,
      coursesEnrolled: coursesCount,
      challengesParticipating: challengesCount,
    };

    console.log('✅ [PROFILE-API] Stats fetched:', stats);
    console.log('✅ [PROFILE-API] Activities generated:', recentActivities.length);

    // Transform avatar URL
    const transformedUser = {
      ...userData,
      avatar: getImageUrl(userData.avatar || userData.photo_profil),
    };
    
    return {
      user: transformedUser,
      stats,
      joinedCommunities,
      recentActivities,
    };
  } catch (error: any) {
    console.error('💥 [PROFILE-API] Error:', error);
    throw new Error(error.message || 'Failed to fetch profile data');
  }
};

/**
 * Get user statistics only
 */
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { communitiesJoined: 0, coursesEnrolled: 0, challengesParticipating: 0 };
    }

    const [communitiesCount, coursesCount, challengesCount] = await Promise.all([
      getCommunitiesCount(accessToken),
      getCoursesCount(accessToken),
      getChallengesCount(accessToken),
    ]);

    return {
      communitiesJoined: communitiesCount,
      coursesEnrolled: coursesCount,
      challengesParticipating: challengesCount,
    };
  } catch (error) {
    console.error('💥 [PROFILE-API] Error fetching stats:', error);
    return { communitiesJoined: 0, coursesEnrolled: 0, challengesParticipating: 0 };
  }
};

/**
 * Format activity timestamp
 */
export const formatActivityTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  return date.toLocaleDateString();
};

/**
 * Get activity icon based on type
 */
export const getActivityIcon = (type: UserActivity['type']): string => {
  switch (type) {
    case 'community_joined': return 'people';
    case 'course_completed': return 'school';
    case 'challenge_completed': return 'trophy';
    case 'badge_earned': return 'medal';
    case 'post_created': return 'create';
    default: return 'ellipse';
  }
};

/**
 * Get activity color based on type
 */
export const getActivityColor = (type: UserActivity['type']): string => {
  switch (type) {
    case 'community_joined': return '#8e78fb';
    case 'course_completed': return '#47c7ea';
    case 'challenge_completed': return '#ff9b28';
    case 'badge_earned': return '#f65887';
    case 'post_created': return '#10b981';
    default: return '#6b7280';
  }
};

export default {
  getProfileData,
  getUserStats,
  formatActivityTime,
  getActivityIcon,
  getActivityColor,
};
