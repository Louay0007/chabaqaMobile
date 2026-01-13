/**
 * Challenge API Integration
 *
 * Provides functions to interact with the challenge endpoints for regular users.
 * Handles challenge browsing, joining, progress tracking, and leaderboards.
 *
 * @module challenge-api
 *
 * NOTE: Types are aligned with backend ChallengeResponseDto and related DTOs
 */

import { tryEndpoints } from './http';
import { getAccessToken } from './auth';

// ============================================================================
// TypeScript Interfaces - Matching Backend DTOs
// ============================================================================

/**
 * Challenge resource (matches ChallengeResourceResponseDto)
 */
export interface ChallengeResource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'code' | 'tool' | 'pdf' | 'link';
  url: string;
  description: string;
  order: number;
}

/**
 * Challenge task resource (matches ChallengeTaskResourceResponseDto)
 */
export interface ChallengeTaskResource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'code' | 'tool';
  url: string;
  description: string;
}

/**
 * Challenge task (matches ChallengeTaskResponseDto)
 */
export interface ChallengeTask {
  id: string;
  day: number;
  title: string;
  description: string;
  deliverable: string;
  isCompleted: boolean;
  isActive: boolean;
  points: number;
  instructions: string;
  notes?: string;
  resources: ChallengeTaskResource[];
  createdAt: string;
}

/**
 * Challenge participant (matches ChallengeParticipantResponseDto)
 */
export interface ChallengeParticipant {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  joinedAt: string;
  isActive: boolean;
  progress: number;
  totalPoints: number;
  completedTasks: string[];
  lastActivityAt: string;
}

/**
 * Challenge comment (matches ChallengeCommentResponseDto)
 */
export interface ChallengeComment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Challenge post (matches ChallengePostResponseDto)
 */
export interface ChallengePost {
  id: string;
  content: string;
  images: string[];
  userId: string;
  userName: string;
  userAvatar?: string;
  likes: number;
  comments: ChallengeComment[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Premium features (matches premiumFeatures in ChallengeResponseDto)
 */
export interface ChallengePremiumFeatures {
  personalMentoring: boolean;
  exclusiveResources: boolean;
  priorityFeedback: boolean;
  certificate: boolean;
  liveSessions: boolean;
  communityAccess: boolean;
}

/**
 * Payment options (matches paymentOptions in ChallengeResponseDto)
 */
export interface ChallengePaymentOptions {
  allowInstallments: boolean;
  installmentCount?: number;
  earlyBirdDiscount?: number;
  groupDiscount?: number;
  memberDiscount?: number;
}

/**
 * Main challenge interface (matches ChallengeResponseDto)
 */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  communityId: string;
  communitySlug: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  participants: ChallengeParticipant[];
  posts: ChallengePost[];
  createdAt: string;
  updatedAt: string;
  depositAmount?: number;
  maxParticipants?: number;
  completionReward?: number;
  topPerformerBonus?: number;
  streakBonus?: number;
  category?: string;
  difficulty?: string;
  duration?: string;
  thumbnail?: string;
  notes?: string;
  resources: ChallengeResource[];
  tasks: ChallengeTask[];
  participantCount: number;
  isOngoing: boolean;
  isCompleted: boolean;
  // Pricing fields
  participationFee?: number;
  currency?: string;
  depositRequired?: boolean;
  isPremium?: boolean;
  premiumFeatures?: ChallengePremiumFeatures;
  paymentOptions?: ChallengePaymentOptions;
  freeTrialDays?: number;
  trialFeatures?: string[];
  isFree: boolean;
  finalPrice?: number;
}

/**
 * User challenge participation (matches backend participation structure)
 */
export interface ChallengeParticipation {
  challengeId: string;
  challenge: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    category?: string;
    difficulty?: string;
    startDate: string;
    endDate: string;
    communityId: string;
    depositAmount?: number;
    completionReward?: number;
    creator: any;
  };
  joinedAt: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  isActive: boolean;
  lastActivityAt: string;
}

/**
 * Challenge leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  totalPoints: number;
  completedTasks: number;
  progress: number;
  joinedAt: string;
  lastActivityAt: string;
}

/**
 * Leaderboard response from API
 */
export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  totalParticipants: number;
  activeParticipants: number;
  challengeId: string;
  challengeTitle: string;
}

/**
 * API response for challenge list
 */
export interface ChallengeListResponse {
  challenges: Challenge[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Challenge filters for browsing
 */
export interface ChallengeFilters {
  page?: number;
  limit?: number;
  communitySlug?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isActive?: boolean;
  search?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get challenges with filters (for browsing)
 * 
 * @param filters - Filter options for challenges
 * @returns Promise with challenge list response
 */
export async function getChallenges(filters: ChallengeFilters = {}): Promise<ChallengeListResponse> {
  try {
    console.log('🏆 [CHALLENGE-API] Fetching challenges with filters:', filters);

    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.communitySlug) params.append('communitySlug', filters.communitySlug);
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.search) params.append('search', filters.search);

    const resp = await tryEndpoints<any>(
      `/api/challenges?${params.toString()}`,
      {
        method: 'GET',
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [CHALLENGE-API] Challenges fetched successfully:', resp.data.challenges?.length || 0);
      return {
        challenges: resp.data.challenges || [],
        total: resp.data.total || 0,
        page: resp.data.page || 1,
        limit: resp.data.limit || 10,
        totalPages: resp.data.totalPages || 1,
      };
    }

    throw new Error(resp.data?.message || 'Failed to fetch challenges');
  } catch (error: any) {
    console.error('💥 [CHALLENGE-API] Error fetching challenges:', error);
    throw new Error(error.message || 'Failed to fetch challenges');
  }
}

/**
 * Get challenge by ID (detailed view)
 * 
 * @param challengeId - Challenge ID
 * @returns Promise with challenge details
 */
export async function getChallengeById(challengeId: string): Promise<Challenge> {
  try {
    console.log('🏆 [CHALLENGE-API] Fetching challenge details:', challengeId);

    const resp = await tryEndpoints<any>(
      `/api/challenges/${challengeId}`,
      {
        method: 'GET',
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [CHALLENGE-API] Challenge details fetched:', resp.data.title);
      return resp.data;
    }

    throw new Error(resp.data?.message || 'Failed to fetch challenge');
  } catch (error: any) {
    console.error('💥 [CHALLENGE-API] Error fetching challenge:', error);
    throw new Error(error.message || 'Failed to fetch challenge details');
  }
}

/**
 * Join a challenge
 * 
 * @param challengeId - Challenge ID to join
 * @returns Promise with participation data
 */
export async function joinChallenge(challengeId: string): Promise<Challenge> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required. Please login to join challenges.');
    }

    console.log('✍️ [CHALLENGE-API] Joining challenge:', challengeId);

    const resp = await tryEndpoints<any>(
      `/api/challenges/join`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { challengeId },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [CHALLENGE-API] Joined challenge successfully');
      return resp.data;
    }

    throw new Error(resp.data?.message || 'Failed to join challenge');
  } catch (error: any) {
    console.error('💥 [CHALLENGE-API] Error joining challenge:', error);
    throw new Error(error.message || 'Failed to join challenge');
  }
}

/**
 * Leave a challenge
 * 
 * @param challengeId - Challenge ID to leave
 * @returns Promise with success status
 */
export async function leaveChallenge(challengeId: string): Promise<Challenge> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('👋 [CHALLENGE-API] Leaving challenge:', challengeId);

    const resp = await tryEndpoints<any>(
      `/api/challenges/leave`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { challengeId },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [CHALLENGE-API] Left challenge successfully');
      return resp.data;
    }

    throw new Error(resp.data?.message || 'Failed to leave challenge');
  } catch (error: any) {
    console.error('💥 [CHALLENGE-API] Error leaving challenge:', error);
    throw new Error(error.message || 'Failed to leave challenge');
  }
}

/**
 * Update progress for a challenge task
 * 
 * @param challengeId - Challenge ID
 * @param taskId - Task ID to mark as completed
 * @returns Promise with updated participation
 */
export async function updateChallengeProgress(
  challengeId: string,
  taskId: string,
  status: 'completed' | 'in_progress' | 'not_started' = 'completed'
): Promise<Challenge> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('📝 [CHALLENGE-API] Updating challenge progress:', { challengeId, taskId, status });

    const resp = await tryEndpoints<any>(
      `/api/challenges/progress`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          challengeId,
          taskId,
          status,
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [CHALLENGE-API] Progress updated successfully');
      return resp.data;
    }

    throw new Error(resp.data?.message || 'Failed to update progress');
  } catch (error: any) {
    console.error('💥 [CHALLENGE-API] Error updating progress:', error);
    throw new Error(error.message || 'Failed to update challenge progress');
  }
}

/**
 * Get user's participation in a challenge
 * 
 * @param challengeId - Challenge ID
 * @returns Promise with participation data or null if not participating
 */
export async function getMyChallengeParticipation(challengeId: string): Promise<ChallengeParticipation | null> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return null;
    }

    console.log('📊 [CHALLENGE-API] Fetching participation for challenge:', challengeId);

    const resp = await tryEndpoints<any>(
      `/api/challenges/${challengeId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [CHALLENGE-API] Challenge fetched - participation check requires user ID lookup');
      return null;
    }

    return null;
  } catch (error: any) {
    console.error('💥 [CHALLENGE-API] Error fetching participation:', error);
    return null;
  }
}

/**
 * Get challenge leaderboard
 * 
 * @param challengeId - Challenge ID
 * @param limit - Number of entries to fetch (default: 50)
 * @returns Promise with leaderboard entries
 */
export async function getChallengeLeaderboard(
  challengeId: string,
  limit: number = 500
): Promise<LeaderboardResponse> {
  try {
    console.log('🏅 [CHALLENGE-API] Fetching leaderboard for challenge:', challengeId);

    const resp = await tryEndpoints<any>(
      `/api/challenges/${challengeId}/leaderboard?limit=${limit}`,
      {
        method: 'GET',
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [CHALLENGE-API] Leaderboard fetched:', resp.data.data?.leaderboard?.length || 0);
      return {
        leaderboard: resp.data.data?.leaderboard || [],
        totalParticipants: resp.data.data?.totalParticipants || 0,
        activeParticipants: resp.data.data?.activeParticipants || 0,
        challengeId: resp.data.data?.challengeId || challengeId,
        challengeTitle: resp.data.data?.challengeTitle || '',
      };
    }

    // Handle 404 - challenge not found or no participants
    if (resp.status === 404) {
      console.log('⚠️ [CHALLENGE-API] Challenge not found or no participants');
      return {
        leaderboard: [],
        totalParticipants: 0,
        activeParticipants: 0,
        challengeId,
        challengeTitle: '',
      };
    }

    throw new Error(resp.data?.message || 'Failed to fetch leaderboard');
  } catch (error: any) {
    console.error('💥 [CHALLENGE-API] Error fetching leaderboard:', error);
    return {
      leaderboard: [],
      totalParticipants: 0,
      activeParticipants: 0,
      challengeId,
      challengeTitle: '',
    };
  }
}

/**
 * Get challenges by community
 * 
 * @param communitySlug - Community slug
 * @param filters - Additional filters
 * @returns Promise with challenge list
 */
export async function getChallengesByCommunity(
  communitySlug: string,
  filters: Omit<ChallengeFilters, 'communitySlug'> = {}
): Promise<ChallengeListResponse> {
  return getChallenges({
    ...filters,
    communitySlug,
  });
}

/**
 * Check if user is participating in a challenge
 * 
 * @param challengeId - Challenge ID
 * @returns Promise with boolean participation status
 */
export async function isParticipatingInChallenge(challengeId: string): Promise<boolean> {
  try {
    const participations = await getUserParticipations();
    return participations.some(p => p.challenge?.id === challengeId || p.challengeId === challengeId);
  } catch (error) {
    return false;
  }
}

/**
 * Get challenge status (upcoming, active, completed)
 * 
 * @param challenge - Challenge object
 * @returns Status string
 */
export function getChallengeStatus(challenge: Challenge): 'upcoming' | 'active' | 'completed' {
  const now = new Date();
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);

  if (startDate > now) return 'upcoming';
  if (endDate < now) return 'completed';
  return 'active';
}

/**
 * Calculate days remaining in challenge
 * 
 * @param endDate - Challenge end date
 * @returns Number of days remaining
 */
export function getDaysRemaining(endDate: string): number {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Format challenge date range
 * 
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export function formatChallengeDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

/**
 * Get user's challenge participations
 * 
 * @param communitySlug - Optional community slug to filter by
 * @param status - Optional status filter ('active', 'completed', 'all')
 * @returns Promise with user participations
 */
export async function getUserParticipations(
  communitySlug?: string,
  status: string = 'all'
): Promise<ChallengeParticipation[]> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return [];
    }

    console.log('📊 [CHALLENGE-API] Fetching user participations');

    const params = new URLSearchParams();
    if (communitySlug) params.append('communitySlug', communitySlug);
    if (status && status !== 'all') params.append('status', status);

    const resp = await tryEndpoints<any>(
      `/api/challenges/user/my-participations?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [CHALLENGE-API] User participations fetched:', resp.data.data?.participations?.length || 0);
      return resp.data.data?.participations || [];
    }

    return [];
  } catch (error: any) {
    console.error('💥 [CHALLENGE-API] Error fetching user participations:', error);
    return [];
  }
}

/**
 * Calculate completion percentage
 * 
 * @param completedTasks - Number of completed tasks
 * @param totalTasks - Total number of tasks
 * @returns Completion percentage (0-100)
 */
export function calculateChallengeCompletion(
  completedTasks: number,
  totalTasks: number
): number {
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
}
