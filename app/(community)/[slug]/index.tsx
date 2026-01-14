import { useAuth } from '@/hooks/use-auth';
import { getCommunityBySlug as getRealCommunity, checkCommunityMembership } from '@/lib/communities-api';
import { getWalletBalance, purchaseWithWallet, formatAmount } from '@/lib/wallet-api';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import JoinCommunityModal from '../_components/modals/JoinCommunityModal';
import PaymentScreen from '../../_components/PaymentScreen';
import { commonStyles, communityDetailStyles } from '../community-detail-styles';
import { getImageUrl } from '@/lib/image-utils';

export default function CommunityDetail() {
  const { slug } = useLocalSearchParams();
  const { isAuthenticated } = useAuth();
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingMembership, setCheckingMembership] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Payment state
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCommunityData();
  }, [slug]);

  useEffect(() => {
    if (community && isAuthenticated) {
      checkMembershipStatus();
      fetchWalletBalance();
    }
  }, [community, isAuthenticated]);

  const fetchWalletBalance = async () => {
    try {
      const { balance } = await getWalletBalance();
      setWalletBalance(balance);
    } catch (e) {
      console.log('⚠️ [COMMUNITY] Failed to fetch wallet balance:', e);
    }
  };

  const checkMembershipStatus = async () => {
    try {
      setCheckingMembership(true);
      const result = await checkCommunityMembership(community.id);
      setIsMember(result.isMember);
    } catch (error) {
      console.error('Error checking membership:', error);
      setIsMember(false);
    } finally {
      setCheckingMembership(false);
    }
  };

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🏘️ [COMMUNITY-DETAIL] Fetching community:', slug);

      const response = await getRealCommunity(slug as string);

      if (!response.success || !response.data) {
        throw new Error('Community not found');
      }

      console.log('📦 [COMMUNITY-DETAIL] Raw response:', {
        id: response.data._id || response.data.id,
        name: response.data.name,
        slug: response.data.slug
      });

      // Transform backend data to match frontend expectations
      // Priority for cover image: coverImage > photo_de_couverture > image > logo (same as community card)
      const rawImageUrl = response.data.coverImage || response.data.photo_de_couverture || response.data.image || response.data.logo || response.data.settings?.logo;
      const isPlaceholderUrl = (url: string) => !url || url.includes('placeholder.com') || url.includes('placehold.co') || url.includes('via.placeholder');
      
      let finalCoverImage = '';
      if (rawImageUrl && rawImageUrl.trim() && !isPlaceholderUrl(rawImageUrl)) {
        finalCoverImage = rawImageUrl;
      }
      
      console.log('🖼️ [COMMUNITY-DETAIL] Image selection:', {
        coverImage: response.data.coverImage,
        photo_de_couverture: response.data.photo_de_couverture,
        image: response.data.image,
        logo: response.data.logo,
        settingsLogo: response.data.settings?.logo,
        rawImageUrl,
        finalCoverImage,
      });

      const transformedCommunity = {
        id: response.data._id || response.data.id,
        slug: response.data.slug,
        name: response.data.name,
        description: response.data.description || response.data.short_description || '',
        shortDescription: response.data.short_description || response.data.description || '',
        coverImage: finalCoverImage,
        image: finalCoverImage,
        logo: response.data.logo || response.data.settings?.logo || '',
        category: response.data.category || 'General',
        members: Array.isArray(response.data.members)
          ? response.data.members.length
          : (response.data.membersCount || response.data.members || 0),
        rating: response.data.averageRating || response.data.rating || 0,
        priceType: response.data.priceType || ((response.data.fees_of_join && response.data.fees_of_join > 0) ? 'paid' : 'free'),
        price: response.data.fees_of_join || response.data.price || 0,
        currency: response.data.currency || 'TND',
        creator: response.data.createur?.name || response.data.creator || 'Unknown',
        creatorId: response.data.createur?._id || response.data.createur?.id || response.data.creatorId || '',
        createur: response.data.createur || null,
        creatorAvatar: response.data.creatorAvatar || response.data.createur?.avatar || response.data.createur?.profile_picture || '',
        isVerified: response.data.verified || response.data.isVerified || false,
        tags: response.data.tags || [],
        socialLinks: response.data.socialLinks,
        createdAt: response.data.createdAt || response.data.createdDate,
      };

      console.log('✅ [COMMUNITY-DETAIL] Transformed community:', {
        name: transformedCommunity.name,
        coverImage: transformedCommunity.coverImage,
        image: transformedCommunity.image,
        logo: transformedCommunity.logo,
      });

      setCommunity(transformedCommunity);
    } catch (err: any) {
      console.error('❌ [COMMUNITY-DETAIL] Error fetching community:', err);
      setError(err.message || 'Failed to load community');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterCommunity = () => {
    if (isMember) {
      // Member: navigate to community home
      router.push(`/(community)/${slug}/(loggedUser)/home`);
    } else {
      // Non-member: navigate to manual payment page
      router.push(`/(communities)/manual-payment?communityId=${community.id}`);
    }
  };

  const handleJoinPress = () => {
    // Check if community is free or paid
    const price = community?.price || 0;
    const isFree = community?.priceType === 'free' || price === 0;
    
    if (isFree) {
      // Free community - join directly via wallet purchase (0 amount)
      handleWalletPayment();
    } else {
      // Paid community - show payment screen
      setShowPaymentScreen(true);
    }
  };

  // Handle wallet payment for community
  const handleWalletPayment = async () => {
    try {
      setProcessing(true);
      const communityId = community?.id || '';
      const creatorId = community?.creatorId || community?.createur?._id || community?.createur?.id || '';
      const price = community?.price || 0;
      const currency = community?.currency || 'TND';
      
      const result = await purchaseWithWallet(
        'community',
        communityId,
        price,
        creatorId,
        `Join ${community?.name || 'Community'}`,
        currency
      );
      
      if (result.success) {
        setWalletBalance(result.newBalance);
        setIsMember(true);
        setShowPaymentScreen(false);
        
        Alert.alert(
          'Welcome! 🎉',
          `You have successfully joined ${community?.name}. Your new balance is ${formatAmount(result.newBalance)}.`,
          [
            {
              text: 'Explore Community',
              onPress: () => router.replace(`/(community)/${slug}/(loggedUser)/home`),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Payment Failed', error.message || 'Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={[communityDetailStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8e78fb" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading community...</Text>
      </View>
    );
  }

  if (error || !community) {
    return (
      <View style={[communityDetailStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: '#ef4444', fontSize: 18, marginBottom: 10 }}>Community not found</Text>
        <Text style={{ color: '#666', textAlign: 'center' }}>{error || `Could not find community: ${slug}`}</Text>
      </View>
    );
  }

  // Determine button text and action based on membership
  const getButtonConfig = () => {
    if (!isAuthenticated) {
      return {
        text: 'Join Community',
        action: () => setJoinModalVisible(true),
        color: '#8e78fb',
      };
    }
    
    if (checkingMembership) {
      return {
        text: 'Checking...',
        action: () => {},
        color: '#9ca3af',
      };
    }
    
    if (isMember) {
      return {
        text: 'Explore Community',
        action: handleEnterCommunity,
        color: '#10b981',
      };
    }
    
    // Not a member, paid community
    return {
      text: 'Join Community',
      action: handleJoinPress,
      color: '#8e78fb',
    };
  };

  const buttonConfig = getButtonConfig();

  // If showing payment screen, render it
  if (showPaymentScreen && !isMember) {
    const price = community?.price || 0;
    const creatorAvatar = community?.creatorAvatar || community?.createur?.avatar || community?.createur?.profile_picture || '';
    const creatorName = community?.creator || community?.createur?.name || 'Creator';
    
    return (
      <PaymentScreen
        contentType="community"
        title={community?.name || 'Community'}
        description={community?.shortDescription || community?.description}
        creatorName={creatorName}
        creatorAvatar={creatorAvatar}
        price={price}
        currency={community?.currency || 'TND'}
        walletBalance={walletBalance}
        onBack={() => setShowPaymentScreen(false)}
        onPay={handleWalletPayment}
        onTopUp={() => router.push('/(profile)/wallet')}
        processing={processing}
      />
    );
  }

  return (
    <ScrollView style={communityDetailStyles.container}>
      {community.coverImage ? (
        <Image
          source={{ uri: getImageUrl(community.coverImage) }}
          style={communityDetailStyles.coverImage}
        />
      ) : null}

      <View style={communityDetailStyles.content}>
        {community.image ? (
          <Image
            source={{ uri: getImageUrl(community.image) }}
            style={communityDetailStyles.communityLogo}
          />
        ) : null}

        <Text style={communityDetailStyles.communityName}>{community.name}</Text>
        <Text style={communityDetailStyles.communityDescription}>
          {community.shortDescription || community.description}
        </Text>

        <View style={communityDetailStyles.statsContainer}>
          <View style={communityDetailStyles.stat}>
            <Text style={communityDetailStyles.statNumber}>
              {typeof community.members === 'number' ? community.members.toLocaleString() : '0'}
            </Text>
            <Text style={communityDetailStyles.statLabel}>Members</Text>
          </View>
          <View style={communityDetailStyles.stat}>
            <Text style={communityDetailStyles.statNumber}>
              {typeof community.rating === 'number' ? community.rating.toFixed(1) : '0.0'}
            </Text>
            <Text style={communityDetailStyles.statLabel}>Rating</Text>
          </View>
          <View style={communityDetailStyles.stat}>
            <Text style={communityDetailStyles.statNumber}>{community.category}</Text>
            <Text style={communityDetailStyles.statLabel}>Category</Text>
          </View>
        </View>

        {/* Membership Status Banner */}
        {isAuthenticated && !checkingMembership && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            backgroundColor: isMember ? '#d1fae5' : '#fef3c7',
            borderRadius: 12,
            marginBottom: 16,
          }}>
            <Ionicons
              name={isMember ? 'checkmark-circle' : 'lock-closed'}
              size={20}
              color={isMember ? '#10b981' : '#f59e0b'}
            />
            <Text style={{
              flex: 1,
              fontSize: 14,
              color: isMember ? '#065f46' : '#92400e',
            }}>
              {isMember
                ? 'You are a member of this community'
                : 'Join this community to access all content'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[commonStyles.primaryButton, { backgroundColor: buttonConfig.color }]}
          onPress={buttonConfig.action}
          disabled={checkingMembership}
        >
          <Text style={commonStyles.primaryButtonText}>{buttonConfig.text}</Text>
        </TouchableOpacity>

        <JoinCommunityModal
          visible={joinModalVisible}
          onClose={() => setJoinModalVisible(false)}
          community={community}
        />
      </View>
    </ScrollView>
  );
}