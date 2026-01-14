import { ThemedView } from '@/_components/ThemedView';
import { getChallengesByCommunity as getMockChallenges } from '@/lib/challenge-utils';
import {
  Challenge as MockChallenge,
  getCommunityBySlug as getMockCommunity,
  getUserChallengeParticipation
} from '@/lib/mock-data';
import { getChallengesByCommunity, getUserParticipations, Challenge as ApiChallenge } from '@/lib/challenge-api';
import { getCommunityBySlug } from '@/lib/communities-api';
import { getCurrentUser } from '@/lib/user-api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import BottomNavigation from '../../_components/BottomNavigation';
import CommunityHeader from '../../_components/Header';
import ChallengesHeader from './_components/ChallengesHeader';
import ChallengesList from './_components/ChallengesList';
import SearchFilter from './_components/SearchFilter';
import TabsNavigation from './_components/TabsNavigation';
import { styles } from './styles';

export default function ChallengesScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('browse');

  // Real data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [community, setCommunity] = useState<any>(null);
  const [allChallenges, setAllChallenges] = useState<any[]>([]);
  const [userParticipations, setUserParticipations] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    getCurrentUser().then(user => {
      const userId = user?._id || user?.id || user?.sub || null;
      setCurrentUserId(userId);
      console.log('👤 [CHALLENGES] Current user ID:', userId);
    }).catch(() => {});
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchChallengesData();
  }, [slug]);

  const fetchChallengesData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🏆 Fetching challenges for community:', slug);

      // Fetch community data first
      const communityResponse = await getCommunityBySlug(slug || '');
      if (!communityResponse.success || !communityResponse.data) {
        throw new Error('Community not found');
      }

      const communityData = {
        id: communityResponse.data._id || communityResponse.data.id,
        name: communityResponse.data.name,
        slug: communityResponse.data.slug,
      };
      setCommunity(communityData);

      // Fetch challenges for this community
      console.log('🏆 [CHALLENGES] Fetching challenges for slug:', slug);
      const challengesResponse = await getChallengesByCommunity(slug as string, {
        page: 1,
        limit: 50,
        // Remove isActive filter to get all challenges (active, upcoming, completed)
      });

      console.log('📦 [CHALLENGES] Full Response:', JSON.stringify(challengesResponse, null, 2));

      // Handle different response structures
      const challengesData = challengesResponse.challenges || (challengesResponse as any).data?.challenges || (challengesResponse as any).challenges || [];
      console.log('🔄 [CHALLENGES] Transforming', challengesData.length, 'challenges');

      const transformedChallenges = (challengesData || []).map((challenge: any, index: number) => {
        console.log('   → Challenge[' + index + ']:', challenge.title, '| id:', challenge.id, '| _id:', challenge._id);
        return {
          id: challenge.id || challenge._id || `temp-${index}`,
          title: challenge.title || 'Untitled',
          description: challenge.description || '',
          shortDescription: challenge.description || '',
          thumbnail: challenge.thumbnail || challenge.cover_image || 'https://via.placeholder.com/400x300',
          communityId: communityData.id,
          creatorId: challenge.creatorId || challenge.created_by?._id || challenge.created_by || '',
          creator: { name: challenge.creatorName || challenge.created_by?.name || 'Unknown', profile_picture: challenge.creatorAvatar || challenge.created_by?.profile_picture },
          startDate: new Date(challenge.startDate || challenge.start_date || Date.now()),
          endDate: new Date(challenge.endDate || challenge.end_date || Date.now()),
          isActive: challenge.isActive !== undefined ? challenge.isActive : (challenge.is_active !== undefined ? challenge.is_active : true),
          difficulty: challenge.difficulty || 'beginner',
          category: challenge.category,
          participants: challenge.participants || [],
          participantsCount: challenge.participantCount || challenge.participants_count || 0,
          maxParticipants: challenge.maxParticipants || challenge.max_participants,
          tasks: challenge.tasks || [],
          prize: challenge.completionReward || challenge.prize,
          completionReward: challenge.completionReward || 0,
          tags: challenge.tags || [],
          createdAt: new Date(challenge.createdAt || challenge.created_at || Date.now()),
          updatedAt: new Date(challenge.updatedAt || challenge.updated_at || Date.now()),
          // Pricing fields
          participationFee: challenge.participationFee || challenge.finalPrice || challenge.depositAmount || 0,
          finalPrice: challenge.finalPrice || challenge.participationFee || challenge.depositAmount || 0,
          depositAmount: challenge.depositAmount || 0,
          isFree: challenge.isFree === true || (challenge.participationFee || challenge.finalPrice || challenge.depositAmount || 0) === 0,
        };
      });

      console.log('✅ [CHALLENGES] Transformed challenges:', transformedChallenges.length);
      
      // Sort challenges: active first, then upcoming, then completed
      const sortedChallenges = transformedChallenges.sort((a: any, b: any) => {
        const now = new Date();
        const getStatus = (c: any) => {
          if (c.startDate > now) return 'upcoming';
          if (c.endDate < now) return 'completed';
          return 'active';
        };
        const statusOrder: Record<string, number> = { active: 0, upcoming: 1, completed: 2 };
        const statusA = getStatus(a);
        const statusB = getStatus(b);
        
        // First sort by status
        if (statusOrder[statusA] !== statusOrder[statusB]) {
          return statusOrder[statusA] - statusOrder[statusB];
        }
        // Then sort by start date (most recent first for active/upcoming)
        if (statusA === 'completed') {
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
        }
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
      
      setAllChallenges(sortedChallenges);

      // Fetch user's challenge participations
      console.log('📊 [CHALLENGES] Fetching user participations for community:', slug);
      try {
        const participationsResponse = await getUserParticipations(slug as string, 'all');
        console.log('📊 [CHALLENGES] User participations response:', participationsResponse?.length || 0);

        const transformedParticipations = (participationsResponse || []).map((participation: any) => ({
          challengeId: participation.challengeId || participation.challenge?._id || participation.challenge?.id,
          userId: participation.userId || participation.user_id,
          joinedAt: participation.joinedAt || participation.joined_at,
          progress: participation.progress || 0,
          completedTasks: participation.completedTasks || participation.completed_tasks || 0,
          totalTasks: participation.totalTasks || participation.total_tasks || 0,
          isActive: participation.isActive !== undefined ? participation.isActive : true,
          lastActivityAt: participation.lastActivityAt || participation.last_activity_at,
        }));

        console.log('✅ [CHALLENGES] Transformed participations:', transformedParticipations.length);
        setUserParticipations(transformedParticipations);
      } catch (participationError: any) {
        console.warn('⚠️ Could not fetch user participations:', participationError.message);
        setUserParticipations([]);
      }

      console.log('✅ Challenges loaded:', transformedChallenges.length);
    } catch (err: any) {
      console.error('❌ Error fetching challenges:', err);
      setError(err.message || 'Failed to load challenges');

      // Fallback to mock data
      console.log('⚠️ Falling back to mock data');
      const mockCommunity = getMockCommunity(slug as string);
      const mockChallenges = getMockChallenges(mockCommunity?.id || '');

      setCommunity(mockCommunity);
      setAllChallenges(mockChallenges);
      setUserParticipations([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if user is participating in a challenge
  const isUserParticipating = (challengeId: string, challenge?: any) => {
    // Check user participations first
    const inParticipations = userParticipations.some(p => p.challengeId === challengeId);
    if (inParticipations) return true;
    
    // Also check challenge's participants array directly
    if (currentUserId && challenge?.participants) {
      return challenge.participants.some((p: any) => 
        p.userId === currentUserId || 
        p.userId?.toString() === currentUserId ||
        p.userId === currentUserId?.toString()
      );
    }
    return false;
  };

  // Filtrer les challenges
  const filteredChallenges = allChallenges.filter((challenge: any) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase());

    const now = new Date();
    const isParticipating = isUserParticipating(challenge.id, challenge);

    if (activeTab === 'active') {
      return matchesSearch && challenge.startDate <= now && challenge.endDate >= now;
    }
    if (activeTab === 'upcoming') {
      return matchesSearch && challenge.startDate > now;
    }
    if (activeTab === 'completed') {
      return matchesSearch && challenge.endDate < now;
    }
    if (activeTab === 'joined') {
      return matchesSearch && isParticipating;
    }
    return matchesSearch;
  });

  const getChallengeStatus = (challenge: any) => {
    const now = new Date();
    if (challenge.startDate > now) return 'upcoming';
    if (challenge.endDate < now) return 'completed';
    return 'active';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleJoinChallenge = (challengeId: string) => {
    router.push(`/(community)/${slug}/challenges/${challengeId}`);
  };

  const handleChallengePress = (challengeId: string) => {
    router.push(`/(community)/${slug}/challenges/${challengeId}`);
  };

  const handleFilterPress = () => {
    console.log('Filter pressed');
  };

  // Calculs des statistiques
  const activeCount = allChallenges.filter((c: any) => getChallengeStatus(c) === 'active').length;
  const upcomingCount = allChallenges.filter((c: any) => getChallengeStatus(c) === 'upcoming').length;
  const completedCount = allChallenges.filter((c: any) => getChallengeStatus(c) === 'completed').length;
  const joinedCount = allChallenges.filter((c: any) => isUserParticipating(c.id, c)).length;
  const totalParticipants = allChallenges.reduce((total: number, challenge: any) => total + (challenge.participantsCount || 0), 0);

  // Configuration des onglets
  const tabs = [
    { key: 'browse', label: 'Browse' },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { key: 'completed', label: 'Completed', count: completedCount },
    { key: 'joined', label: 'Joined', count: joinedCount },
  ];

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8e78fb" />
        <Text style={{ marginTop: 16, opacity: 0.7 }}>Loading challenges...</Text>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <Text style={{ color: '#ef4444', textAlign: 'center', margin: 20 }}>
          {error}
        </Text>
        <Text style={{ textAlign: 'center', opacity: 0.7 }}>
          Community: {slug}
        </Text>
      </ThemedView>
    );
  }

  if (!community) {
    return (
      <ThemedView style={styles.container}>
        <Text>Community not found</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Community Header */}
      <CommunityHeader showBack communitySlug={slug as string} />
      
      {/* Header */}
      <ChallengesHeader
        allChallenges={allChallenges}
        activeCount={activeCount}
        totalParticipants={totalParticipants}
        joinedCount={joinedCount}
      />

      {/* Search and Filter */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={handleFilterPress}
      />

      {/* Tabs */}
      <TabsNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      {/* Challenge List */}
      <ChallengesList
        challenges={filteredChallenges}
        onChallengePress={handleChallengePress}
        onJoinChallenge={handleJoinChallenge}
        formatDate={formatDate}
        getChallengeStatus={getChallengeStatus}
        getUserParticipation={(challengeId: string) => {
          const challenge = allChallenges.find(c => c.id === challengeId);
          return isUserParticipating(challengeId, challenge);
        }}
      />

      {/* Bottom Navigation */}
      <BottomNavigation slug={slug as string} currentTab="challenges" />
    </ThemedView>
  );
}


