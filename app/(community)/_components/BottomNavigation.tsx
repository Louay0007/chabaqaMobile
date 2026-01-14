import { colors } from '@/lib/design-tokens';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BookOpen, Calendar, Home, Package, Sparkles, Zap, Trash2, MoreVertical, Star } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { communityStyles, sectionColors } from './community-styles';
import { useAuth } from '@/hooks/use-auth';
import { getCommunityBySlug, deleteCommunity } from '@/lib/communities-api';

interface BottomNavigationProps {
  slug?: string;
  currentTab?: string;
}

export default function BottomNavigation({ slug, currentTab = 'home' }: BottomNavigationProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug: string }>();
  const communitySlug = slug || params.slug;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [communityName, setCommunityName] = useState<string>('');
  const [deleting, setDeleting] = useState(false);

  // Check if current user is the creator
  useEffect(() => {
    const checkCreatorStatus = async () => {
      if (!communitySlug || !user) return;
      
      try {
        const response = await getCommunityBySlug(communitySlug);
        if (response.success && response.data) {
          const community = response.data;
          setCommunityId(community._id || community.id);
          setCommunityName(community.name);
          
          // Check if current user is the creator
          const creatorId = community.createur?._id || community.createur?.id || community.creatorId;
          const userId = user._id || user.id;
          
          setIsCreator(creatorId === userId);
        }
      } catch (error) {
        console.error('Error checking creator status:', error);
      }
    };
    
    checkCreatorStatus();
  }, [communitySlug, user]);

  const handleDeleteCommunity = () => {
    Alert.alert(
      'Delete Community',
      `Are you sure you want to delete "${communityName}"? This action cannot be undone and all data will be permanently lost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!communityId) return;
            
            setDeleting(true);
            setShowMoreMenu(false);
            
            try {
              const result = await deleteCommunity(communityId);
              if (result.success) {
                Alert.alert(
                  'Community Deleted',
                  'Your community has been successfully deleted.',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.replace('/(communities)'),
                    },
                  ]
                );
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete community');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };
  
  const handleHome = () => {
    router.replace(`/(community)/${communitySlug}/(loggedUser)/home`);
  };
  
  const handleCourses = () => {
    router.replace(`/(community)/${communitySlug}/courses`);
  };
  
  const handleChallenge = () => {
    router.replace(`/(community)/${communitySlug}/challenges`);
  };
  
  const handleSessions = () => {
    router.replace(`/(community)/${communitySlug}/sessions`);
  };
  
  const handleProducts = () => {
    router.replace(`/(community)/${communitySlug}/products`);
  };

  const handleEvents = () => {
    router.replace(`/(community)/${communitySlug}/events`);
  };

  const handleReviews = () => {
    router.replace(`/(community)/${communitySlug}/reviews`);
  };

  const isActive = (tab: string) => currentTab === tab;

  return (
    <>
      <View style={[communityStyles.bottomBarContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={communityStyles.bottomBar}>
          {/* Home */}
          <TouchableOpacity
            style={communityStyles.tabButton}
            onPress={handleHome}
            activeOpacity={0.8}
          >
            <View style={[communityStyles.iconContainer, isActive('home') && styles.activeIconContainer]}>
              <Home 
                size={20} 
                color={isActive('home') ? colors.white : colors.gray500} 
              />
            </View>
            <Text style={[communityStyles.tabText, isActive('home') && styles.activeTabText]}>
              Home
            </Text>
          </TouchableOpacity>

          {/* Courses */}
          <TouchableOpacity
            style={communityStyles.tabButton}
            onPress={handleCourses}
            activeOpacity={0.8}
          >
            <View style={[communityStyles.iconContainer, isActive('courses') && styles.activeIconContainerCourses]}>
              <BookOpen 
                size={20} 
                color={isActive('courses') ? colors.white : sectionColors.courses.primary} 
              />
            </View>
            <Text style={[communityStyles.tabText, isActive('courses') && styles.activeTabTextCourses]}>
              Courses
            </Text>
          </TouchableOpacity>

          {/* Challenge */}
          <TouchableOpacity
            style={communityStyles.tabButton}
            onPress={handleChallenge}
            activeOpacity={0.8}
          >
            <View style={[communityStyles.iconContainer, isActive('challenges') && styles.activeIconContainerChallenge]}>
              <Zap 
                size={20} 
                color={isActive('challenges') ? colors.white : sectionColors.challenges.primary} 
              />
            </View>
            <Text style={[communityStyles.tabText, isActive('challenges') && styles.activeTabTextChallenge]}>
              Challenge
            </Text>
          </TouchableOpacity>

          {/* Sessions */}
          <TouchableOpacity
            style={communityStyles.tabButton}
            onPress={handleSessions}
            activeOpacity={0.8}
          >
            <View style={[communityStyles.iconContainer, isActive('sessions') && styles.activeIconContainerSessions]}>
              <Calendar 
                size={20} 
                color={isActive('sessions') ? colors.white : sectionColors.sessions.primary} 
              />
            </View>
            <Text style={[communityStyles.tabText, isActive('sessions') && styles.activeTabTextSessions]}>
              Sessions
            </Text>
          </TouchableOpacity>

          {/* Products */}
          <TouchableOpacity
            style={communityStyles.tabButton}
            onPress={handleProducts}
            activeOpacity={0.8}
          >
            <View style={[communityStyles.iconContainer, isActive('products') && styles.activeIconContainerProducts]}>
              <Package 
                size={20} 
                color={isActive('products') ? colors.white : sectionColors.products.primary} 
              />
            </View>
            <Text style={[communityStyles.tabText, isActive('products') && styles.activeTabTextProducts]}>
              Products
            </Text>
          </TouchableOpacity>

          {/* Events */}
          <TouchableOpacity
            style={communityStyles.tabButton}
            onPress={handleEvents}
            activeOpacity={0.8}
          >
            <View style={[communityStyles.iconContainer, isActive('events') && styles.activeIconContainerEvents]}>
              <Sparkles 
                size={20} 
                color={isActive('events') ? colors.white : sectionColors.events.primary} 
              />
            </View>
            <Text style={[communityStyles.tabText, isActive('events') && styles.activeTabTextEvents]}>
              Events
            </Text>
          </TouchableOpacity>

          {/* Reviews */}
          <TouchableOpacity
            style={communityStyles.tabButton}
            onPress={handleReviews}
            activeOpacity={0.8}
          >
            <View style={[communityStyles.iconContainer, isActive('reviews') && styles.activeIconContainerReviews]}>
              <Star 
                size={20} 
                color={isActive('reviews') ? colors.white : '#fbbf24'} 
              />
            </View>
            <Text style={[communityStyles.tabText, isActive('reviews') && styles.activeTabTextReviews]}>
              Reviews
            </Text>
          </TouchableOpacity>

          {/* More Menu (only for creators) */}
          {isCreator && (
            <TouchableOpacity
              style={communityStyles.tabButton}
              onPress={() => setShowMoreMenu(true)}
              activeOpacity={0.8}
            >
              <View style={communityStyles.iconContainer}>
                <MoreVertical size={20} color={colors.gray500} />
              </View>
              <Text style={communityStyles.tabText}>More</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* More Menu Modal */}
      <Modal
        visible={showMoreMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoreMenu(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Community Settings</Text>
            </View>
            
            {/* Delete Community Button */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteCommunity}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Trash2 size={20} color="#ef4444" />
              )}
              <Text style={styles.menuItemTextDanger}>
                {deleting ? 'Deleting...' : 'Delete Community'}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowMoreMenu(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Seuls les styles spécifiques qui ne sont pas dans communityStyles
  activeIconContainer: {
    backgroundColor: colors.coursesPrimary,
  },
  activeIconContainerCourses: {
    backgroundColor: sectionColors.courses.primary,
  },
  activeIconContainerChallenge: {
    backgroundColor: sectionColors.challenges.primary,
  },
  activeIconContainerEvents: {
    backgroundColor: sectionColors.events.primary,
  },
  activeIconContainerSessions: {
    backgroundColor: sectionColors.sessions.primary,
  },
  activeIconContainerProducts: {
    backgroundColor: sectionColors.products.primary,
  },
  activeTabText: {
    color: colors.coursesPrimary,
    fontWeight: '600',
  },
  activeTabTextCourses: {
    color: sectionColors.courses.primary,
    fontWeight: '600',
  },
  activeTabTextChallenge: {
    color: sectionColors.challenges.primary,
    fontWeight: '600',
  },
  activeTabTextEvents: {
    color: sectionColors.events.primary,
    fontWeight: '600',
  },
  activeTabTextSessions: {
    color: sectionColors.sessions.primary,
    fontWeight: '600',
  },
  activeTabTextProducts: {
    color: sectionColors.products.primary,
    fontWeight: '600',
  },
  activeIconContainerReviews: {
    backgroundColor: '#fbbf24',
  },
  activeTabTextReviews: {
    color: '#fbbf24',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  menuHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 14,
  },
  menuItemTextDanger: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
  },
  cancelButton: {
    marginTop: 8,
    marginHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#374151',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
