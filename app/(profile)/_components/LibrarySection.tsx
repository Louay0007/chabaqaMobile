import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

import { getMyJoinedCommunities } from '@/lib/communities-api';
import { spacing, fontSize, fontWeight, borderRadius } from '@/lib/design-tokens';
import { getImageUrl } from '@/lib/image-utils';
import { tryEndpoints } from '@/lib/http';
import { getAccessToken } from '@/lib/auth';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LibrarySection() {
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    communities: false,
    courses: false,
    challenges: false,
    products: false,
  });

  useEffect(() => {
    loadLibraryData();
  }, []);

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const loadLibraryData = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      
      const [communitiesResult, coursesResult, challengesResult, productsResult] = await Promise.all([
        getMyJoinedCommunities().catch(() => ({ data: [] })),
        fetchEnrolledCourses(token),
        fetchChallenges(token),
        fetchPurchasedProducts(token),
      ]);

      setCommunities(communitiesResult.data || []);
      setCourses(coursesResult);
      setChallenges(challengesResult);
      setProducts(productsResult);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async (token: string | null): Promise<any[]> => {
    if (!token) return [];
    try {
      const resp = await tryEndpoints<any>('/api/cours/user/mes-cours?page=1&limit=50', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      return resp.data?.cours || resp.data?.data?.courses || [];
    } catch {
      return [];
    }
  };

  const fetchChallenges = async (token: string | null): Promise<any[]> => {
    if (!token) return [];
    try {
      const resp = await tryEndpoints<any>('/api/challenges/user/my-participations?status=all', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      return resp.data?.data?.participations || resp.data?.participations || [];
    } catch {
      return [];
    }
  };

  const fetchPurchasedProducts = async (token: string | null): Promise<any[]> => {
    if (!token) return [];
    try {
      const resp = await tryEndpoints<any>('/api/wallet/transactions?limit=50', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      const transactions = resp.data?.data || resp.data?.transactions || resp.data || [];
      console.log('📦 [LIBRARY] All transactions:', transactions.length);
      
      // Filter for all purchases (any content type)
      const purchases = transactions.filter((tx: any) => tx.type === 'purchase');
      console.log('📦 [LIBRARY] Purchases found:', purchases.length);
      console.log('📦 [LIBRARY] Purchase details:', purchases.map((p: any) => ({ 
        type: p.type, 
        contentType: p.contentType, 
        description: p.description,
        amount: p.amount 
      })));
      
      return purchases;
    } catch (error) {
      console.log('Error fetching purchased products:', error);
      return [];
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading your library...</Text>
      </View>
    );
  }

  const renderSectionHeader = (
    icon: string,
    title: string,
    count: number,
    color: string,
    sectionKey: string,
    hasMoreItems: boolean
  ) => (
    <TouchableOpacity 
      style={styles.sectionHeader}
      onPress={() => hasMoreItems && toggleSection(sectionKey)}
      activeOpacity={hasMoreItems ? 0.7 : 1}
    >
      <View style={styles.sectionTitleRow}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.headerRight}>
        <View style={[styles.countBadge, { borderColor: color }]}>
          <Text style={[styles.countText, { color }]}>{count}</Text>
        </View>
        {hasMoreItems && (
          <Ionicons 
            name={expandedSections[sectionKey] ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#6B7280" 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  // Community Card Component
  const renderCommunityCard = (community: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.communityCard}
      onPress={() => router.push(`/(community)/${community.slug || community._id}/home`)}
    >
      {community.coverImage || community.logo ? (
        <Image
          source={{ uri: getImageUrl(community.coverImage || community.logo) }}
          style={styles.communityImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.communityImage, styles.communityImagePlaceholder]}>
          <Ionicons name="people-outline" size={28} color="#6b7280" />
        </View>
      )}
      <View style={styles.communityContent}>
        <Text style={styles.communityName} numberOfLines={1}>{community.name}</Text>
        <Text style={styles.communityMeta}>{community.membersCount || 0} members</Text>
      </View>
    </TouchableOpacity>
  );

  // List Item Component for courses, challenges, products
  const renderListItem = (item: any, index: number, icon: string, color: string, title: string, meta: string) => (
    <View key={index} style={styles.listItem}>
      <View style={[styles.itemIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.listItemMeta}>{meta}</Text>
      </View>
    </View>
  );

  const communitiesToShow = expandedSections.communities ? communities : communities.slice(0, 2);
  const coursesToShow = expandedSections.courses ? courses : courses.slice(0, 2);
  const challengesToShow = expandedSections.challenges ? challenges : challenges.slice(0, 2);
  const productsToShow = expandedSections.products ? products : products.slice(0, 2);

  return (
    <View style={styles.container}>
      {/* Communities Section - Cards */}
      <View style={styles.section}>
        {renderSectionHeader('people-outline', 'Joined Communities', communities.length, '#8B5CF6', 'communities', communities.length > 2)}
        
        {communities.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={40} color="#6b7280" />
            <Text style={styles.emptyText}>No communities joined yet</Text>
            <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(communities)')}>
              <Text style={styles.exploreButtonText}>Explore Communities</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.communityGrid}>
            {communitiesToShow.map((community, index) => renderCommunityCard(community, index))}
          </View>
        )}
      </View>

      {/* Courses Section - List */}
      <View style={styles.section}>
        {renderSectionHeader('book-outline', 'Enrolled Courses', courses.length, '#47c7ea', 'courses', courses.length > 2)}

        {courses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="book-outline" size={40} color="#6b7280" />
            <Text style={styles.emptyText}>No courses enrolled yet</Text>
            <Text style={styles.emptySubtext}>Join a community to access courses</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {coursesToShow.map((course, index) => 
              renderListItem(
                course, 
                index, 
                'book-outline', 
                '#47c7ea',
                course.titre || course.title || 'Untitled Course',
                course.progress !== undefined ? `${course.progress}% complete` : 'In progress'
              )
            )}
          </View>
        )}
      </View>

      {/* Challenges Section - List */}
      <View style={styles.section}>
        {renderSectionHeader('flag-outline', 'Active Challenges', challenges.length, '#ff9b28', 'challenges', challenges.length > 2)}

        {challenges.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="flag-outline" size={40} color="#6b7280" />
            <Text style={styles.emptyText}>No active challenges</Text>
            <Text style={styles.emptySubtext}>Participate in challenges to test your skills</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {challengesToShow.map((challenge, index) => 
              renderListItem(
                challenge, 
                index, 
                'flag-outline', 
                '#ff9b28',
                challenge.challenge?.title || challenge.title || 'Challenge',
                challenge.status || 'Active'
              )
            )}
          </View>
        )}
      </View>

      {/* Purchases Section - List */}
      <View style={styles.section}>
        {renderSectionHeader('cart-outline', 'Purchases', products.length, '#ec4899', 'products', products.length > 2)}

        {products.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="cart-outline" size={40} color="#6b7280" />
            <Text style={styles.emptyText}>No purchases yet</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {productsToShow.map((purchase, index) => 
              renderListItem(
                purchase, 
                index, 
                purchase.contentType === 'product' ? 'cart-outline' : 
                purchase.contentType === 'course' ? 'book-outline' :
                purchase.contentType === 'challenge' ? 'flag-outline' :
                purchase.contentType === 'community' ? 'people-outline' :
                purchase.contentType === 'session' ? 'calendar-outline' : 'cart-outline', 
                purchase.contentType === 'product' ? '#ec4899' : 
                purchase.contentType === 'course' ? '#47c7ea' :
                purchase.contentType === 'challenge' ? '#ff9b28' :
                purchase.contentType === 'community' ? '#8B5CF6' :
                purchase.contentType === 'session' ? '#10b981' : '#ec4899',
                purchase.description || `${purchase.contentType || 'Purchase'}`,
                `${Math.abs(purchase.amount)} points`
              )
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },

  loadingText: {
    fontSize: fontSize.base,
    marginTop: spacing.lg,
    color: '#6B7280',
  },

  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: '#000000',
  },

  countBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    minWidth: 36,
    alignItems: 'center',
  },

  countText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  // Community Cards Grid
  communityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  communityCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  communityImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#F3F4F6',
  },

  communityImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  communityContent: {
    padding: spacing.sm,
    backgroundColor: '#FFFFFF',
  },

  communityName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#000000',
    marginBottom: 2,
  },

  communityMeta: {
    fontSize: fontSize.xs,
    color: '#6B7280',
  },

  // List styles
  listContainer: {
    gap: spacing.sm,
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  listItemContent: {
    flex: 1,
  },

  listItemTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: '#000000',
    marginBottom: 2,
  },

  listItemMeta: {
    fontSize: fontSize.xs,
    color: '#6B7280',
  },

  // Empty State
  emptyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  emptyText: {
    fontSize: fontSize.sm,
    marginTop: spacing.md,
    textAlign: 'center',
    color: '#6B7280',
  },

  emptySubtext: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
    color: '#9CA3AF',
  },

  exploreButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },

  exploreButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#ffffff',
  },
});
