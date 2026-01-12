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
  productsPurchased: number;
}

export type ActivityType = 
  | 'community_joined' 
  | 'course_enrolled' 
  | 'course_completed' 
  | 'challenge_joined'
  | 'challenge_completed' 
  | 'product_purchased'
  | 'wallet_topup'
  | 'badge_earned' 
  | 'post_created';

export interface UserActivity {
  id: string;
  type: ActivityType;
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
  createdAt?: string;
  joinedAt?: string;
}

export interface ProfileData {
  user: User;
  stats: UserStats;
  joinedCommunities: Community[];
  recentActivities: UserActivity[];
}

// ==================== API FUNCTIONS ====================

/**
 * Get user's joined communities with dates
 */
const getJoinedCommunitiesWithDates = async (accessToken: string): Promise<Community[]> => {
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
    return communities.map((c: any) => ({
      ...c,
      joinedAt: c.joinedAt || c.createdAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.log('⚠️ [PROFILE-API] Could not get communities');
    return [];
  }
};

/**
 * Get user's enrolled courses with dates
 */
const getEnrolledCoursesWithDates = async (accessToken: string): Promise<any[]> => {
  try {
    // Try the course-enrollment endpoint first (more reliable)
    const enrollmentResp = await tryEndpoints<any>(
      '/api/course-enrollment/my-enrollments',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      }
    );
    
    const enrollments = enrollmentResp.data?.enrollments || [];
    if (enrollments.length > 0) {
      console.log(`✅ [PROFILE-API] Found ${enrollments.length} course enrollments`);
      return enrollments.map((e: any) => ({
        _id: e.courseId || e.id,
        id: e.courseId || e.id,
        title: e.courseTitle || e.title || 'Course',
        enrolledAt: e.enrolledAt || new Date().toISOString(),
      }));
    }
    
    // Fallback to mes-cours endpoint
    const resp = await tryEndpoints<any>(
      '/api/cours/user/mes-cours?page=1&limit=50',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      }
    );
    const courses = resp.data?.data?.courses || resp.data?.cours || resp.data?.courses || [];
    console.log(`✅ [PROFILE-API] Found ${courses.length} courses from mes-cours`);
    return courses.map((c: any) => ({
      ...c,
      enrolledAt: c.enrolledAt || c.createdAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.log('⚠️ [PROFILE-API] Could not get courses:', error);
    return [];
  }
};

/**
 * Get user's challenge participations with dates
 */
const getChallengeParticipationsWithDates = async (accessToken: string): Promise<any[]> => {
  try {
    const resp = await tryEndpoints<any>(
      '/api/challenges/user/my-participations?status=all',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      }
    );
    const participations = resp.data?.data?.participations || resp.data?.participations || [];
    return participations.map((p: any) => ({
      ...p,
      joinedAt: p.joinedAt || p.createdAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.log('⚠️ [PROFILE-API] Could not get challenges');
    return [];
  }
};

/**
 * Get user's wallet transactions (for purchase and topup activities)
 */
const getWalletTransactions = async (accessToken: string): Promise<any[]> => {
  try {
    const resp = await tryEndpoints<any>(
      '/api/wallet/transactions?limit=20',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      }
    );
    return resp.data?.data || resp.data?.transactions || [];
  } catch (error) {
    console.log('⚠️ [PROFILE-API] Could not get wallet transactions');
    return [];
  }
};

/**
 * Generate recent activities from real user data with actual timestamps
 */
const generateRecentActivities = async (accessToken: string): Promise<UserActivity[]> => {
  const activities: UserActivity[] = [];
  
  try {
    // Fetch all data in parallel
    const [communities, courses, challenges, transactions] = await Promise.all([
      getJoinedCommunitiesWithDates(accessToken),
      getEnrolledCoursesWithDates(accessToken),
      getChallengeParticipationsWithDates(accessToken),
      getWalletTransactions(accessToken),
    ]);

    // Add community join activities
    communities.forEach((community) => {
      activities.push({
        id: `community_${community._id}`,
        type: 'community_joined',
        title: 'Joined Community',
        description: `Joined ${community.name}`,
        timestamp: community.joinedAt || community.createdAt || new Date().toISOString(),
        relatedId: community._id,
        metadata: { communitySlug: community.slug },
      });
    });

    // Add course enrollment activities
    courses.forEach((course: any) => {
      activities.push({
        id: `course_${course._id || course.id}`,
        type: 'course_enrolled',
        title: 'Enrolled in Course',
        description: `Started learning ${course.title || course.name}`,
        timestamp: course.enrolledAt || course.createdAt || new Date().toISOString(),
        relatedId: course._id || course.id,
      });
    });

    // Add challenge participation activities
    challenges.forEach((participation: any) => {
      const challengeTitle = participation.challenge?.title || participation.title || 'Challenge';
      activities.push({
        id: `challenge_${participation.challengeId || participation._id}`,
        type: 'challenge_joined',
        title: 'Joined Challenge',
        description: `Participating in ${challengeTitle}`,
        timestamp: participation.joinedAt || participation.createdAt || new Date().toISOString(),
        relatedId: participation.challengeId || participation._id,
      });
    });

    // Add wallet transaction activities (purchases and top-ups)
    transactions.forEach((tx: any) => {
      if (tx.type === 'purchase') {
        activities.push({
          id: `purchase_${tx._id || tx.reference}`,
          type: 'product_purchased',
          title: 'Made a Purchase',
          description: tx.description || `Purchased ${tx.contentType || 'content'}`,
          timestamp: tx.createdAt || new Date().toISOString(),
          relatedId: tx.contentId,
          metadata: { amount: Math.abs(tx.amount), contentType: tx.contentType },
        });
      } else if (tx.type === 'topup') {
        activities.push({
          id: `topup_${tx._id || tx.reference}`,
          type: 'wallet_topup',
          title: 'Wallet Top-Up',
          description: tx.description || `Added ${tx.amount} points to wallet`,
          timestamp: tx.createdAt || new Date().toISOString(),
          metadata: { amount: tx.amount },
        });
      }
    });

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return activities.slice(0, 15); // Return max 15 activities
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

    // Fetch all data in parallel
    const [communities, courses, challenges, transactions, recentActivities] = await Promise.all([
      getJoinedCommunitiesWithDates(accessToken),
      getEnrolledCoursesWithDates(accessToken),
      getChallengeParticipationsWithDates(accessToken),
      getWalletTransactions(accessToken),
      generateRecentActivities(accessToken),
    ]);

    // Count purchases from transactions
    const purchaseCount = transactions.filter((tx: any) => tx.type === 'purchase').length;

    const stats: UserStats = {
      communitiesJoined: communities.length,
      coursesEnrolled: courses.length,
      challengesParticipating: challenges.length,
      productsPurchased: purchaseCount,
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
      joinedCommunities: communities,
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
      return { communitiesJoined: 0, coursesEnrolled: 0, challengesParticipating: 0, productsPurchased: 0 };
    }

    const [communities, courses, challenges, transactions] = await Promise.all([
      getJoinedCommunitiesWithDates(accessToken),
      getEnrolledCoursesWithDates(accessToken),
      getChallengeParticipationsWithDates(accessToken),
      getWalletTransactions(accessToken),
    ]);

    const purchaseCount = transactions.filter((tx: any) => tx.type === 'purchase').length;

    return {
      communitiesJoined: communities.length,
      coursesEnrolled: courses.length,
      challengesParticipating: challenges.length,
      productsPurchased: purchaseCount,
    };
  } catch (error) {
    console.error('💥 [PROFILE-API] Error fetching stats:', error);
    return { communitiesJoined: 0, coursesEnrolled: 0, challengesParticipating: 0, productsPurchased: 0 };
  }
};

/**
 * Format activity timestamp with smart relative time
 */
export const formatActivityTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Just now (less than 1 minute)
  if (diffInMinutes < 1) return 'Just now';
  
  // Minutes ago (1-59 minutes)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  // Hours ago (1-23 hours)
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  // Yesterday
  if (diffInDays === 1) return 'Yesterday';
  
  // Days ago (2-6 days)
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  // Weeks ago (1-4 weeks)
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  
  // Months ago (1-11 months)
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  
  // More than a year - show formatted date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Get activity icon based on type
 */
export const getActivityIcon = (type: ActivityType): string => {
  switch (type) {
    case 'community_joined': return 'people-outline';
    case 'course_enrolled': return 'book-outline';
    case 'course_completed': return 'checkmark-done-outline';
    case 'challenge_joined': return 'flag-outline';
    case 'challenge_completed': return 'ribbon-outline';
    case 'product_purchased': return 'cart-outline';
    case 'wallet_topup': return 'wallet-outline';
    case 'badge_earned': return 'star-outline';
    case 'post_created': return 'document-text-outline';
    default: return 'ellipse-outline';
  }
};

/**
 * Get activity color based on type
 */
export const getActivityColor = (type: ActivityType): string => {
  switch (type) {
    case 'community_joined': return '#8e78fb';
    case 'course_enrolled': return '#47c7ea';
    case 'course_completed': return '#10b981';
    case 'challenge_joined': return '#ff9b28';
    case 'challenge_completed': return '#f59e0b';
    case 'product_purchased': return '#ec4899';
    case 'wallet_topup': return '#10b981';
    case 'badge_earned': return '#f65887';
    case 'post_created': return '#3b82f6';
    default: return '#6b7280';
  }
};

/**
 * Get activity title based on type
 */
export const getActivityTitle = (type: ActivityType): string => {
  switch (type) {
    case 'community_joined': return 'Joined Community';
    case 'course_enrolled': return 'Enrolled in Course';
    case 'course_completed': return 'Completed Course';
    case 'challenge_joined': return 'Joined Challenge';
    case 'challenge_completed': return 'Completed Challenge';
    case 'product_purchased': return 'Made a Purchase';
    case 'wallet_topup': return 'Wallet Top-Up';
    case 'badge_earned': return 'Earned Badge';
    case 'post_created': return 'Created Post';
    default: return 'Activity';
  }
};

export default {
  getProfileData,
  getUserStats,
  formatActivityTime,
  getActivityIcon,
  getActivityColor,
  getActivityTitle,
};
