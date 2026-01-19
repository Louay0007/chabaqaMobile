import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdaptiveColors } from '@/hooks/useAdaptiveColors';
import { ExploreData } from '@/lib/data-communities';
import { getCommunities } from '@/lib/communities-api';
import { getImageUrl } from '@/lib/image-utils';
import { communityStyles } from './_styles';
import CommunityCard from './_components/_ComponentCard';
import SearchBar from './_components/SearchBar';
import Sidebar from '../_components/Sidebar';

export default function CommunitiesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [sidebarKey, setSidebarKey] = useState(0);
  const adaptiveColors = useAdaptiveColors();

  useEffect(() => {
    fetchCommunities();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshSidebar();
    }, [])
  );

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching communities...');

      const response = await getCommunities({ page: 1, limit: 50 });

      if (response.success && response.data) {
        const transformedCommunities = response.data.map((community: any) => {
          let creatorName = 'Unknown Creator';
          let rawCreatorAvatar = null;

          if (typeof community.creator === 'object' && community.creator !== null) {
            creatorName = community.creator.name || 'Unknown Creator';
            rawCreatorAvatar = community.creator.avatar || community.creator.profile_picture || community.creator.photo_profil;
          } else if (typeof community.createur === 'object' && community.createur !== null) {
            creatorName = community.createur.name || 'Unknown Creator';
            rawCreatorAvatar = community.createur.profile_picture || community.createur.photo_profil || community.createur.avatar;
          } else if (typeof community.creator === 'string') {
            creatorName = community.creator;
            rawCreatorAvatar = community.creatorAvatar;
          } else {
            creatorName = community.creatorName || 'Unknown Creator';
            rawCreatorAvatar = community.creatorAvatar;
          }

          let creatorAvatar = '';
          if (rawCreatorAvatar && rawCreatorAvatar.trim()) {
            const isPlaceholderAvatar = (url: string) => url.includes('placeholder') || url.includes('placehold.co');
            if (!isPlaceholderAvatar(rawCreatorAvatar)) {
              creatorAvatar = getImageUrl(rawCreatorAvatar);
            }
          }

          const getCategoryImage = (category: string) => {
            const categoryImages: { [key: string]: any } = {
              'Marketing': require('@/assets/images/email-marketing.png'),
              'Design': require('@/assets/images/branding-hero.png'),
              'Fitness': require('@/assets/images/Personal-coaching-fitness.png'),
              'Web Design': require('@/assets/images/website-vitrine.png'),
              'Development': require('@/assets/images/background.png'),
              'Technology': require('@/assets/images/background.png'),
            };
            return categoryImages[category] || require('@/assets/images/email-marketing.png');
          };

          // Priority: coverImage > photo_de_couverture > image > logo
          const rawImageUrl = community.coverImage || community.photo_de_couverture || community.image || community.logo;
          let finalImageUrl: string | number;
          const isPlaceholderUrl = (url: string) => url.includes('placeholder.com') || url.includes('placehold.co') || url.includes('via.placeholder');

          if (rawImageUrl && rawImageUrl.trim() && !isPlaceholderUrl(rawImageUrl)) {
            finalImageUrl = getImageUrl(rawImageUrl);
          } else {
            finalImageUrl = getCategoryImage(community.category || 'General');
          }

          return {
            id: community.id || community._id || '',
            slug: community.slug || '',
            name: community.name || 'Unnamed Community',
            creator: creatorName,
            creatorAvatar: creatorAvatar,
            description: community.description || community.short_description || community.shortDescription || '',
            category: community.category || 'General',
            members: community.members || community.membersCount || 0,
            rating: community.rating || community.averageRating || 0,
            price: community.price || community.fees_of_join || 0,
            priceType: community.priceType || 'free',
            currency: community.currency || community.pricing?.currency || 'TND',
            image: finalImageUrl,
            imageUrl: typeof finalImageUrl === 'string' ? finalImageUrl : '',
            tags: community.tags || [],
            featured: community.featured || false,
            verified: community.verified || community.isVerified || false,
            type: community.type || 'community',
            link: `/(communities)/${community.slug}`,
          };
        });
        setCommunities(transformedCommunities);
        console.log('✅ Communities loaded:', transformedCommunities.length);
      } else {
        setCommunities(ExploreData.communities);
      }
    } catch (error) {
      console.error('❌ Error fetching communities:', error);
      setCommunities(ExploreData.communities);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunities = useMemo(() => {
    let filtered = communities;

    if (searchQuery.trim()) {
      filtered = filtered.filter(community =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort by featured first, then by members
    filtered = [...filtered].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.members - a.members;
    });

    return filtered;
  }, [searchQuery, communities]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommunities();
    setSidebarKey(prev => prev + 1);
    setRefreshing(false);
  };

  const refreshSidebar = () => {
    setSidebarKey(prev => prev + 1);
  };

  const renderCommunityItem = ({ item }: { item: any }) => (
    <CommunityCard community={item} viewMode="list" />
  );

  const renderEmptyState = () => (
    <View style={communityStyles.emptyState}>
      <Ionicons name="search" size={64} color={adaptiveColors.secondaryText} />
      <Text style={[communityStyles.emptyStateText, { color: adaptiveColors.secondaryText }]}>
        No communities found matching your criteria.
        {searchQuery ? ` Try adjusting your search for "${searchQuery}".` : ''}
      </Text>
    </View>
  );

  const renderTopBar = () => (
    <View style={[communityStyles.topNavBar, { backgroundColor: adaptiveColors.background, borderBottomColor: adaptiveColors.cardBorder }]}>
      <View style={communityStyles.navLeft}>
        <TouchableOpacity
          style={communityStyles.menuButton}
          onPress={() => setSidebarVisible(true)}
        >
          <Ionicons name="menu" size={24} color={adaptiveColors.primaryText} />
        </TouchableOpacity>
        <Image
          source={require('@/assets/images/logo_chabaqa.png')}
          style={communityStyles.logo}
        />
      </View>
      <View style={communityStyles.navRight} />
    </View>
  );

  const renderHeader = () => (
    <View style={[communityStyles.header, { backgroundColor: adaptiveColors.background }]}>
      <Text style={[communityStyles.headerTitle, { color: adaptiveColors.primaryText }]}>
        Discover communities
      </Text>
      <Text style={[communityStyles.headerSubtitle, { color: adaptiveColors.secondaryText }]}>
        or{' '}
        <Text
          style={{ color: '#8e78fb', fontWeight: '600' }}
          onPress={() => router.push('/(build_community)')}
        >
          create your own
        </Text>
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[communityStyles.container, { backgroundColor: adaptiveColors.background }]}>
        <View style={communityStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={[communityStyles.emptyStateText, { color: adaptiveColors.secondaryText }]}>Loading communities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[communityStyles.container, { backgroundColor: adaptiveColors.background }]}>
      <StatusBar style={adaptiveColors.isDark ? "light" : "dark"} />
      {renderTopBar()}

      <FlatList
        data={filteredCommunities}
        renderItem={renderCommunityItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={[communityStyles.communitiesList, { paddingBottom: 40 }]}
        numColumns={1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() => (
          <View>
            {renderHeader()}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      <Sidebar
        key={sidebarKey}
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
    </SafeAreaView>
  );
}
