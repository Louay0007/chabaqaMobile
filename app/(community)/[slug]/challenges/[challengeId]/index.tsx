import { ThemedView } from '@/_components/ThemedView';
import {
    ChallengeTask as MockChallengeTask,
    getChallengeById as getMockChallengeById,
    getChallengeTasks as getMockChallengeTasks
} from '@/lib/challenge-utils';
import {
    getCommunityBySlug as getMockCommunity
} from '@/lib/mock-data';
import { getChallengeById, getChallengeLeaderboard, LeaderboardResponse } from '@/lib/challenge-api';
import { getCommunityBySlug } from '@/lib/communities-api';
import { getCurrentUser } from '@/lib/user-api';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
    ScrollView,
    Text
} from 'react-native';
import { styles } from '../styles';
import ChallengeHeader from './_components/ChallengeHeader';
import LeaderboardTab from './_components/LeaderboardTab';
import OverviewTab from './_components/OverviewTab';
import SubmissionsTab from './_components/SubmissionsTab';
import TabNavigation from './_components/TabNavigation';
import TimelineTab from './_components/TimelineTab';

// Local task type matching UI requirements
interface TaskType {
  id: string;
  day: number;
  title: string;
  description: string;
  deliverable?: string;
  isCompleted: boolean;
  isActive: boolean;
  points: number;
  instructions?: string;
  notes?: string;
  resources?: any[];
  createdAt?: string;
}

export default function ChallengeDetailScreen() {
  const { slug, challengeId } = useLocalSearchParams<{ slug: string, challengeId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTaskDay, setSelectedTaskDay] = useState<number | null>(null);

  // Real data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [community, setCommunity] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [challengeTasks, setChallengeTasks] = useState<TaskType[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    getCurrentUser().then(user => {
      const userId = user?._id || user?.id || user?.sub || null;
      setCurrentUserId(userId);
    }).catch(() => {});
  }, []);

  // Fetch challenge data on mount
  useEffect(() => {
    if (challengeId) {
      fetchChallengeData();
    }
  }, [challengeId]);

  const fetchChallengeData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🏆 [CHALLENGE-DETAIL] Fetching challenge:', challengeId);

      // Fetch community data
      const communityResponse = await getCommunityBySlug(slug as string);
      if (communityResponse.success && communityResponse.data) {
        setCommunity({
          id: communityResponse.data._id || communityResponse.data.id,
          name: communityResponse.data.name,
          slug: communityResponse.data.slug,
        });
      }

      // Fetch challenge from API
      const challengeData = await getChallengeById(challengeId as string);
      console.log('🏆 [CHALLENGE-DETAIL] Challenge fetched:', challengeData?.title);

      if (challengeData) {
        // Calculate duration from start and end dates
        const startDate = new Date(challengeData.startDate || (challengeData as any).start_date);
        const endDate = new Date(challengeData.endDate || (challengeData as any).end_date);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const calculatedDuration = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;

        // Transform API challenge to UI format
        const transformedChallenge = {
          id: challengeData.id || (challengeData as any)._id,
          title: challengeData.title,
          description: challengeData.description,
          thumbnail: challengeData.thumbnail,
          communityId: challengeData.communityId,
          creatorId: challengeData.creatorId,
          creatorName: challengeData.creatorName,
          creatorAvatar: challengeData.creatorAvatar,
          startDate: startDate,
          endDate: endDate,
          isActive: challengeData.isActive,
          difficulty: challengeData.difficulty,
          category: challengeData.category,
          duration: calculatedDuration,
          participantCount: challengeData.participantCount || 0,
          maxParticipants: challengeData.maxParticipants,
          completionReward: challengeData.completionReward,
          depositAmount: challengeData.depositAmount,
          isPremium: challengeData.isPremium,
          premiumFeatures: challengeData.premiumFeatures,
          isFree: challengeData.isFree,
          participationFee: challengeData.participationFee,
          currency: challengeData.currency,
          resources: challengeData.resources || [],
          notes: challengeData.notes,
          participants: challengeData.participants || [],
          posts: challengeData.posts || [],
        };
        setChallenge(transformedChallenge);

        // Transform tasks
        const tasks = (challengeData.tasks || []).map((task: any) => ({
          id: task.id || task._id,
          day: task.day,
          title: task.title || '',
          description: task.description || '',
          deliverable: task.deliverable,
          isCompleted: task.isCompleted || false,
          isActive: task.isActive !== undefined ? task.isActive : true,
          points: task.points || 0,
          instructions: task.instructions || '',
          notes: task.notes,
          resources: task.resources || [],
          createdAt: task.createdAt,
        }));
        setChallengeTasks(tasks);

        // Fetch leaderboard data
        await fetchLeaderboard();
      }
    } catch (err: any) {
      console.error('❌ [CHALLENGE-DETAIL] Error:', err);
      setError(err.message || 'Failed to load challenge');

      if (__DEV__) {
        // Fallback to mock data (dev-only)
        console.log('⚠️ [CHALLENGE-DETAIL] Falling back to mock data (DEV ONLY)');
        const mockCommunity = getMockCommunity(slug as string);
        const mockChallenge = getMockChallengeById(challengeId as string);
        const mockTasks = mockChallenge ? getMockChallengeTasks(mockChallenge.id) : [];

        setCommunity(mockCommunity);
        setChallenge(mockChallenge);
        setChallengeTasks(mockTasks as any);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      console.log('🏅 [CHALLENGE-DETAIL] Fetching leaderboard for:', challengeId);
      
      const leaderboardResponse = await getChallengeLeaderboard(challengeId as string, 500);
      console.log('🏅 [CHALLENGE-DETAIL] Leaderboard response:', leaderboardResponse);
      
      setLeaderboardData(leaderboardResponse);
    } catch (error: any) {
      console.error('❌ [CHALLENGE-DETAIL] Error fetching leaderboard:', error);
      
      // Create fallback data from challenge participants if available
      if (challenge?.participants && challenge.participants.length > 0) {
        const fallbackLeaderboard = challenge.participants
          .filter((p: any) => p.isActive !== false)
          .sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0))
          .slice(0, 50)
          .map((participant: any, index: number) => ({
            rank: index + 1,
            userId: participant.userId || participant.id,
            userName: participant.userName || participant.name || 'Anonymous',
            userAvatar: participant.userAvatar || participant.avatar || null,
            totalPoints: participant.totalPoints || 0,
            completedTasks: participant.completedTasks?.length || 0,
            progress: participant.progress || 0,
            joinedAt: participant.joinedAt || new Date().toISOString(),
            lastActivityAt: participant.lastActivityAt || new Date().toISOString(),
          }));

        setLeaderboardData({
          leaderboard: fallbackLeaderboard,
          totalParticipants: challenge.participants.length,
          activeParticipants: challenge.participants.filter((p: any) => p.isActive !== false).length,
          challengeId: challengeId as string,
          challengeTitle: challenge.title || '',
        });
      } else {
        setLeaderboardData({
          leaderboard: [],
          totalParticipants: 0,
          activeParticipants: 0,
          challengeId: challengeId as string,
          challengeTitle: '',
        });
      }
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Refresh leaderboard when tab changes to leaderboard
  useEffect(() => {
    if (activeTab === 'leaderboard' && challengeId && !leaderboardLoading && !leaderboardData) {
      fetchLeaderboard();
    }
  }, [activeTab, challengeId]);

  // Fetch leaderboard when challenge data is loaded
  useEffect(() => {
    if (challenge && challengeId && !leaderboardData) {
      fetchLeaderboard();
    }
  }, [challenge, challengeId]);

  // Determine the current task based on selection or default to active/first
  const currentTask = selectedTaskDay !== null
    ? challengeTasks.find((t: TaskType) => t.day === selectedTaskDay)
    : challengeTasks.find((t: TaskType) => t.isActive) || challengeTasks[0];

  const completedTasks = challengeTasks.filter((t: TaskType) => t.isCompleted).length;
  const totalPoints = challengeTasks.filter((t: TaskType) => t.isCompleted).reduce((acc: number, task: TaskType) => acc + (task.points || 0), 0);

  // Get current user's rank from leaderboard
  const getUserRank = (): number | null => {
    if (!leaderboardData?.leaderboard || !currentUserId) return null;
    const userEntry = leaderboardData.leaderboard.find(
      entry => entry.userId === currentUserId || entry.userId === currentUserId?.toString()
    );
    return userEntry?.rank || null;
  };
  const userRank = getUserRank();

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8e78fb" />
        <Text style={{ marginTop: 16, opacity: 0.7 }}>Loading challenge...</Text>
      </ThemedView>
    );
  }

  if (error && !challenge) {
    return (
      <ThemedView style={styles.container}>
        <Text style={{ color: '#ef4444', textAlign: 'center', margin: 20 }}>
          {error}
        </Text>
        <Text style={{ textAlign: 'center', opacity: 0.7 }}>
          Challenge ID: {challengeId}
        </Text>
      </ThemedView>
    );
  }

  if (!community || !challenge) {
    return (
      <ThemedView style={styles.container}>
        <Text>Challenge not found</Text>
      </ThemedView>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingTop: Platform.OS === 'ios' ? 8 : 0 }}
          showsVerticalScrollIndicator={false}
        >
        {/* Challenge Header */}
        <ChallengeHeader
          challenge={challenge}
          completedTasks={completedTasks}
          totalTasks={challengeTasks.length}
          totalPoints={totalPoints}
          formatDate={formatDate}
          userRank={userRank}
        />

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            currentTask={currentTask}
            challenge={challenge}
            completedTasks={completedTasks}
            challengeTasks={challengeTasks}
            formatDate={formatDate}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineTab
            challengeTasks={challengeTasks}
            completedTasks={completedTasks}
            formatDate={formatDate}
            onTaskSelect={setSelectedTaskDay}
            selectedTaskDay={selectedTaskDay}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardTab
            leaderboardData={leaderboardData}
            loading={leaderboardLoading}
            onRefresh={fetchLeaderboard}
          />
        )}

        {activeTab === 'submissions' && (
          <SubmissionsTab
            challengeId={challengeId as string}
            tasks={challengeTasks}
            participants={challenge.participants}
            onRefresh={fetchChallengeData}
          />
        )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
