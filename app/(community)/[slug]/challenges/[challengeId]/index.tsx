import { ThemedView } from '@/_components/ThemedView';
import PaymentScreen from '@/app/_components/PaymentScreen';
import {
    getChallengeById as getMockChallengeById,
    getChallengeTasks as getMockChallengeTasks
} from '@/lib/challenge-utils';
import {
    getCommunityBySlug as getMockCommunity
} from '@/lib/mock-data';
import {
    getChallengeById, 
    getChallengeLeaderboard, 
    LeaderboardResponse,
    joinChallenge,
    purchaseChallengeWithWallet,
    getWalletBalance,
    getChallengeStatus
} from '@/lib/challenge-api';
import { getCommunityBySlug } from '@/lib/communities-api';
import { getCurrentUser } from '@/lib/user-api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { UserPlus, CheckCircle, Lock } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
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
  const router = useRouter();
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
  
  // Join/Payment state
  const [isParticipant, setIsParticipant] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [joining, setJoining] = useState(false);

  // Fetch current user on mount
  useEffect(() => {
    getCurrentUser().then(user => {
      const userId = user?._id || user?.id || user?.sub || null;
      setCurrentUserId(userId);
    }).catch(() => {});
    
    // Fetch wallet balance
    getWalletBalance().then(({ balance }) => {
      setWalletBalance(balance);
    }).catch(() => {});
  }, []);

  // Update isParticipant when challenge or currentUserId changes
  useEffect(() => {
    if (currentUserId && challenge?.participants) {
      const userIsParticipant = challenge.participants.some(
        (p: any) => p.userId === currentUserId || 
                   p.userId?.toString() === currentUserId ||
                   p.userId === currentUserId?.toString()
      );
      setIsParticipant(userIsParticipant);
    }
  }, [currentUserId, challenge]);

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
      console.log('💰 [CHALLENGE-DETAIL] Pricing debug:', {
        isFree: challengeData?.isFree,
        participationFee: challengeData?.participationFee,
        finalPrice: challengeData?.finalPrice,
        depositAmount: challengeData?.depositAmount,
        isPremium: challengeData?.isPremium,
      });

      if (challengeData) {
        // Calculate duration from start and end dates
        const startDate = new Date(challengeData.startDate || (challengeData as any).start_date);
        const endDate = new Date(challengeData.endDate || (challengeData as any).end_date);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const calculatedDuration = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;

        // Transform API challenge to UI format
        // Calculate the actual price - check multiple fields for backward compatibility
        const actualPrice = challengeData.participationFee || challengeData.finalPrice || challengeData.depositAmount || 0;
        const actualIsFree = challengeData.isFree === true || actualPrice === 0;
        
        console.log('💰 [CHALLENGE-DETAIL] Price calculation:', {
          actualPrice,
          actualIsFree,
          rawIsFree: challengeData.isFree,
        });

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
          // Use calculated values for pricing
          isFree: actualIsFree,
          participationFee: actualPrice,
          finalPrice: actualPrice,
          currency: challengeData.currency,
          resources: challengeData.resources || [],
          notes: challengeData.notes,
          participants: challengeData.participants || [],
          posts: challengeData.posts || [],
        };
        setChallenge(transformedChallenge);
        
        // Check if current user is a participant
        if (currentUserId && challengeData.participants) {
          const userIsParticipant = challengeData.participants.some(
            (p: any) => p.userId === currentUserId || 
                       p.userId?.toString() === currentUserId ||
                       p.userId === currentUserId?.toString()
          );
          setIsParticipant(userIsParticipant);
        }
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

  // Handle join/pay for challenge
  const handleJoinChallenge = async () => {
    if (!currentUserId) {
      Alert.alert('Login Required', 'Please login to join this challenge.');
      return;
    }

    if (isParticipant) {
      Alert.alert('Already Joined', 'You are already a participant in this challenge.');
      return;
    }

    // Use the calculated price from challenge object
    const price = challenge?.participationFee || challenge?.finalPrice || challenge?.depositAmount || 0;
    const isFree = challenge?.isFree === true || price === 0;

    if (isFree) {
      // Free challenge - join directly
      Alert.alert(
        'Join Challenge',
        'Do you want to join this challenge?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Join',
            onPress: async () => {
              try {
                setJoining(true);
                await joinChallenge(challengeId as string);
                setIsParticipant(true);
                Alert.alert('Success', 'You have joined the challenge!');
                fetchChallengeData(); // Refresh data
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to join challenge');
              } finally {
                setJoining(false);
              }
            },
          },
        ]
      );
    } else {
      // Paid challenge - check wallet balance
      if (walletBalance < price) {
        Alert.alert(
          'Insufficient Balance',
          `You need ${price} DT to join this challenge. Your current balance is ${walletBalance} DT.\n\nWould you like to top up your wallet?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Top Up Wallet',
              onPress: () => router.push('/(profile)/wallet'),
            },
          ]
        );
        return;
      }

      // Confirm payment
      Alert.alert(
        'Join Challenge',
        `This challenge costs ${price} DT.\n\nYour wallet balance: ${walletBalance} DT\nAfter payment: ${walletBalance - price} DT\n\nDo you want to proceed?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Pay & Join',
            onPress: async () => {
              try {
                setJoining(true);
                const result = await purchaseChallengeWithWallet(
                  challenge.id || challengeId as string,
                  price,
                  challenge.creatorId
                );
                setWalletBalance(result.newBalance);
                setIsParticipant(true);
                Alert.alert('Success', 'Payment successful! You have joined the challenge.');
                fetchChallengeData(); // Refresh data
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to process payment');
              } finally {
                setJoining(false);
              }
            },
          },
        ]
      );
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

  // Check if challenge requires payment and user hasn't paid
  // Use finalPrice or participationFee - both should be set correctly now
  const challengePrice = challenge?.participationFee || challenge?.finalPrice || challenge?.depositAmount || 0;
  const isFreeChallenge = challenge?.isFree === true || challengePrice === 0;
  
  // Check if challenge is completed (endDate has passed)
  const challengeStatus = challenge ? getChallengeStatus({
    ...challenge,
    startDate: challenge.startDate?.toISOString?.() || challenge.startDate,
    endDate: challenge.endDate?.toISOString?.() || challenge.endDate,
  }) : 'active';
  const isChallengeCompleted = challengeStatus === 'completed';
  
  // Only show payment screen if challenge is NOT completed and user needs to pay
  const needsPayment = !isChallengeCompleted && !isFreeChallenge && !isParticipant;
  
  console.log('💰 [CHALLENGE-DETAIL] Payment check:', {
    challengePrice,
    isFreeChallenge,
    isParticipant,
    isChallengeCompleted,
    challengeStatus,
    needsPayment,
  });

  // If user needs to pay, show payment screen instead of challenge content
  if (needsPayment) {
    const handlePayment = async () => {
      try {
        setJoining(true);
        const result = await purchaseChallengeWithWallet(
          challenge.id || challengeId as string,
          challengePrice,
          challenge.creatorId
        );
        setWalletBalance(result.newBalance);
        setIsParticipant(true);
        Alert.alert('Success', 'Payment successful! You have joined the challenge.');
        fetchChallengeData();
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to process payment');
      } finally {
        setJoining(false);
      }
    };

    return (
      <PaymentScreen
        contentType="challenge"
        title={challenge?.title || 'Challenge'}
        description={challenge?.description}
        thumbnail={challenge?.thumbnail}
        creatorName={challenge?.creatorName}
        creatorAvatar={challenge?.creatorAvatar}
        price={challengePrice}
        currency="DT"
        walletBalance={walletBalance}
        onBack={() => router.back()}
        onPay={handlePayment}
        onTopUp={() => router.push('/(profile)/wallet')}
        processing={joining}
      />
    );
  }

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
        
        {/* Join Button for FREE challenges - Fixed at bottom (only if not completed) */}
        {!isParticipant && isFreeChallenge && !isChallengeCompleted && (
          <View style={{
            padding: 16,
            paddingBottom: Platform.OS === 'ios' ? 24 : 16,
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
          }}>
            <TouchableOpacity
              onPress={handleJoinChallenge}
              disabled={joining}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: joining ? '#9ca3af' : '#10b981',
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {joining ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <UserPlus size={20} color="#ffffff" />
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: '700',
                    marginLeft: 8,
                  }}>
                    Join Challenge (Free)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {/* Challenge Completed Badge - Show when challenge has ended */}
        {isChallengeCompleted && !isParticipant && (
          <View style={{
            padding: 16,
            paddingBottom: Platform.OS === 'ios' ? 24 : 16,
            backgroundColor: '#f3f4f6',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Lock size={20} color="#6b7280" />
              <Text style={{
                color: '#6b7280',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 8,
              }}>
                Challenge Ended
              </Text>
            </View>
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
