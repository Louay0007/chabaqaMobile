import { useAuth } from '@/hooks/use-auth';
import { getCommunityBySlug as getRealCommunity, checkCommunityMembership } from '@/lib/communities-api';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import JoinCommunityModal from '../_components/modals/JoinCommunityModal';
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

  useEffect(() => {
    fetchCommunityData();
  }, [slug]);

  useEffect(() => {
    if (community && isAuthenticated) {
      checkMembershipStatus();
    }
  }, [community, isAuthenticated]);

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
      const transformedCommunity = {
        id: response.data._id || response.data.id,
        slug: response.data.slug,
        name: response.data.name,
        description: response.data.description || response.data.short_description || '',
        shortDescription: response.data.short_description || response.data.description || '',
        coverImage: response.data.photo_de_couverture || response.data.coverImage || response.data.settings?.heroBackground || '',
        image: response.data.logo || response.data.image || '',
        category: response.data.category || 'General',
        members: Array.isArray(response.data.members)
          ? response.data.members.length
          : (response.data.membersCount || response.data.members || 0),
        rating: response.data.averageRating || response.data.rating || 0,
        priceType: response.data.priceType || ((response.data.fees_of_join && response.data.fees_of_join > 0) ? 'paid' : 'free'),
        price: response.data.fees_of_join || response.data.price || 0,
        currency: response.data.currency || 'TND',
        creator: response.data.createur?.name || response.data.creator || 'Unknown',
        creatorAvatar: response.data.creatorAvatar || response.data.createur?.avatar || '',
        isVerified: response.data.verified || response.data.isVerified || false,
        tags: response.data.tags || [],
        socialLinks: response.data.socialLinks,
        createdAt: response.data.createdAt || response.data.createdDate,
      };

      console.log('✅ [COMMUNITY-DETAIL] Transformed community:', {
        name: transformedCommunity.name,
        members: transformedCommunity.members,
        rating: transformedCommunity.rating
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
    // Navigate to manual payment page
    router.push(`/(communities)/manual-payment?communityId=${community.id}`);
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