import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/use-auth';
import { useAdaptiveColors } from '@/hooks/useAdaptiveColors';
import { enhancedStyles } from './_enhanced-styles';
import LibrarySection from './_components/LibrarySection';
import Sidebar from '../_components/Sidebar';
import { communityStyles } from '../(communities)/_styles';
import { getProfileData, ProfileData, formatActivityTime, getActivityIcon, getActivityColor } from '@/lib/profile-api';
import { getImageUrl } from '@/lib/image-utils';

export default function ProfileScreen() {
  const { user, isAuthenticated } = useAuth();
  const adaptiveColors = useAdaptiveColors();
  const [activeTab, setActiveTab] = useState<'about' | 'library' | 'activity'>('library');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Real API data state
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  // Refresh profile data when screen comes into focus (e.g., returning from edit)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 [PROFILE] Screen focused, forcing fresh profile data load');
      // Force a fresh load by clearing current data first
      setProfileData(null);
      loadProfileData();
    }, [])
  );

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 [PROFILE] Loading profile data...');
      const data = await getProfileData();
      setProfileData(data);
      
      console.log('✅ [PROFILE] Profile data loaded successfully:', {
        userName: data.user?.name,
        userEmail: data.user?.email,
        userBio: data.user?.bio ? 'Has bio' : 'No bio',
        userPhone: data.user?.numtel || 'No phone',
        userCountry: data.user?.pays || 'No country',
        userCity: data.user?.ville || 'No city'
      });
    } catch (error: any) {
      console.error('💥 [PROFILE] Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  // Function to get tab colors based on tab type
  const getTabColors = (tab: string): [string, string] => {
    switch (tab) {
      case 'about':
        return ['#8B5CF6', '#7C3AED']; // Purple like communities
      case 'library':
        return ['#47c7ea', '#3bb5d6']; // Cyan like courses
      case 'activity':
        return ['#ff9b28', '#ff8c1a']; // Orange like challenges
      default:
        return ['#8B5CF6', '#7C3AED'];
    }
  };

  const renderTopBar = () => (
    <View style={[
      communityStyles.topNavBar, 
      { 
        backgroundColor: adaptiveColors.cardBackground, 
        borderBottomColor: adaptiveColors.cardBorder,
      }
    ]}>
      {/* Left section - Menu + Logo */}
      <View style={communityStyles.navLeft}>
        <TouchableOpacity 
          style={communityStyles.menuButton}
          onPress={() => {
            setSidebarVisible(true);
          }}
        >
          <Ionicons name="menu" size={24} color={adaptiveColors.primaryText} />
        </TouchableOpacity>
        <Image
          source={require('@/assets/images/logo_chabaqa.png')}
          style={communityStyles.logo}
        />
      </View>

      {/* Right section - Empty space */}
      <View style={communityStyles.navRight} />
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={enhancedStyles.container}>
        <View style={enhancedStyles.centerContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#8B5CF6" />
          <Text style={enhancedStyles.emptyText}>
            Please login to view your profile
          </Text>
          <TouchableOpacity
            style={enhancedStyles.button}
            onPress={() => router.push('/(auth)/signin')}
          >
            <Text style={enhancedStyles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={enhancedStyles.container}>
        <View style={enhancedStyles.centerContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={enhancedStyles.container} edges={['top']}>
      {/* Top Navigation Bar */}
      {renderTopBar()}
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header with Dark Background */}
        <View style={enhancedStyles.headerWrapper}>
          <View style={enhancedStyles.headerGradient}>
            {/* Avatar with Glow Effect */}
            <View style={enhancedStyles.avatarContainer}>
              <View style={enhancedStyles.avatarGlow}>
                {(profileData?.user?.avatar || profileData?.user?.photo_profil || user?.avatar) ? (
                  <Image 
                    source={{ uri: getImageUrl(profileData?.user?.avatar || profileData?.user?.photo_profil || user?.avatar, true) }} 
                    style={enhancedStyles.avatar}
                    onError={() => {
                      console.log('❌ [PROFILE] Avatar image failed to load:', getImageUrl(profileData?.user?.avatar || profileData?.user?.photo_profil || user?.avatar));
                    }}
                    defaultSource={require('@/assets/images/logo_chabaqa.png')}
                  />
                ) : (
                  <View style={[enhancedStyles.avatar, enhancedStyles.avatarPlaceholder]}>
                    <LinearGradient
                      colors={['#8B5CF6', '#7C3AED']}
                      style={enhancedStyles.avatarGradient}
                    >
                      <Ionicons name="person" size={42} color="#fff" />
                    </LinearGradient>
                  </View>
                )}
              </View>
            </View>

            {/* User Info */}
            <Text style={enhancedStyles.userName}>{profileData?.user?.name || user?.name || 'User'}</Text>
            {(profileData?.user?.role || user?.role) && (
              <View style={enhancedStyles.roleBadge}>
                <Text style={enhancedStyles.roleText}>{profileData?.user?.role || user?.role}</Text>
              </View>
            )}
            <Text style={enhancedStyles.userEmail}>{profileData?.user?.email || user?.email}</Text>
          </View>

          {/* Stats Cards - Normal Flow */}
          <View style={enhancedStyles.statsContainer}>
            <View style={enhancedStyles.statsRow}>
              <View style={enhancedStyles.statCardWrapper}>
                <View style={enhancedStyles.statCard}>
                  <View style={[enhancedStyles.statIcon, { backgroundColor: '#8B5CF6' }]}>
                    <Ionicons name="people-outline" size={18} color="#fff" />
                  </View>
                  <Text style={enhancedStyles.statValue}>{profileData?.stats?.communitiesJoined || 0}</Text>
                  <Text style={enhancedStyles.statLabel}>Communities</Text>
                </View>
              </View>

              <View style={enhancedStyles.statCardWrapper}>
                <View style={enhancedStyles.statCard}>
                  <View style={[enhancedStyles.statIcon, { backgroundColor: '#47c7ea' }]}>
                    <Ionicons name="book-outline" size={18} color="#fff" />
                  </View>
                  <Text style={enhancedStyles.statValue}>{profileData?.stats?.coursesEnrolled || 0}</Text>
                  <Text style={enhancedStyles.statLabel}>Courses</Text>
                </View>
              </View>
            </View>
            
            <View style={enhancedStyles.statsRow}>
              <View style={enhancedStyles.statCardWrapper}>
                <View style={enhancedStyles.statCard}>
                  <View style={[enhancedStyles.statIcon, { backgroundColor: '#ff9b28' }]}>
                    <Ionicons name="flag-outline" size={18} color="#fff" />
                  </View>
                  <Text style={enhancedStyles.statValue}>{profileData?.stats?.challengesParticipating || 0}</Text>
                  <Text style={enhancedStyles.statLabel}>Challenges</Text>
                </View>
              </View>

              <View style={enhancedStyles.statCardWrapper}>
                <View style={enhancedStyles.statCard}>
                  <View style={[enhancedStyles.statIcon, { backgroundColor: '#ec4899' }]}>
                    <Ionicons name="cart-outline" size={18} color="#fff" />
                  </View>
                  <Text style={enhancedStyles.statValue}>{profileData?.stats?.productsPurchased || 0}</Text>
                  <Text style={enhancedStyles.statLabel}>Purchases</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={enhancedStyles.actionsContainer}>
          <TouchableOpacity
            style={[enhancedStyles.actionButtonPrimary, { flex: 1, marginRight: 8 }]}
            onPress={() => router.push('/(profile)/wallet')}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={enhancedStyles.actionButtonGradient}
            >
              <Ionicons name="wallet-outline" size={18} color="#fff" />
              <Text style={enhancedStyles.actionButtonPrimaryText}>Wallet</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={[enhancedStyles.actionButtonSecondary, { flex: 1 }]}
            onPress={() => router.push('/(profile)/edit')}
          >
            <Ionicons name="create-outline" size={18} color="#1F2937" />
            <Text style={enhancedStyles.actionButtonSecondaryText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Bio Section */}
        {(() => {
          const currentBio = profileData?.user?.bio || user?.bio;
          console.log('🔍 [PROFILE] Bio check:', {
            profileDataBio: profileData?.user?.bio || 'No profileData bio',
            userBio: user?.bio || 'No user bio',
            finalBio: currentBio || 'No bio found'
          });
          
          return currentBio ? (
            <View style={enhancedStyles.bioSection}>
              <Text style={enhancedStyles.bioTitle}>About</Text>
              <Text style={enhancedStyles.bioText}>
                {currentBio}
              </Text>
            </View>
          ) : (
            <View style={enhancedStyles.bioSection}>
              <View style={enhancedStyles.bioEmptyState}>
                <View style={enhancedStyles.bioEmptyIcon}>
                  <Ionicons name="document-text-outline" size={24} color="#8B5CF6" />
                </View>
                <Text style={enhancedStyles.bioEmptyText}>No bio added yet</Text>
                <Text style={enhancedStyles.bioEmptySubtext}>Add a bio to tell others about yourself</Text>
              </View>
            </View>
          );
        })()}

        {/* Modern Segmented Control Tabs */}
        <View style={enhancedStyles.tabsWrapper}>
          <View style={enhancedStyles.tabsContainer}>
            <TouchableOpacity
              style={[
                enhancedStyles.tab,
                activeTab === 'about' && enhancedStyles.tabActive
              ]}
              onPress={() => setActiveTab('about')}
            >
              {activeTab === 'about' && (
                <LinearGradient
                  colors={getTabColors('about')}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={enhancedStyles.tabActiveGradient}
                />
              )}
              <Text
                style={[
                  enhancedStyles.tabText,
                  activeTab === 'about' && enhancedStyles.tabTextActive
                ]}
              >
                About
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                enhancedStyles.tab,
                activeTab === 'library' && enhancedStyles.tabActive
              ]}
              onPress={() => setActiveTab('library')}
            >
              {activeTab === 'library' && (
                <LinearGradient
                  colors={getTabColors('library')}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={enhancedStyles.tabActiveGradient}
                />
              )}
              <Text
                style={[
                  enhancedStyles.tabText,
                  activeTab === 'library' && enhancedStyles.tabTextActive
                ]}
              >
                Library
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                enhancedStyles.tab,
                activeTab === 'activity' && enhancedStyles.tabActive
              ]}
              onPress={() => setActiveTab('activity')}
            >
              {activeTab === 'activity' && (
                <LinearGradient
                  colors={getTabColors('activity')}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={enhancedStyles.tabActiveGradient}
                />
              )}
              <Text
                style={[
                  enhancedStyles.tabText,
                  activeTab === 'activity' && enhancedStyles.tabTextActive
                ]}
              >
                Activity
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        <View style={enhancedStyles.tabContent}>
          {activeTab === 'about' && (
            <View style={enhancedStyles.aboutSection}>
              <Text style={enhancedStyles.sectionTitle}>About Me</Text>
              <View style={enhancedStyles.infoCard}>
                <View style={enhancedStyles.infoRow}>
                  <View style={[enhancedStyles.infoIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                    <Ionicons name="mail-outline" size={20} color="#8B5CF6" />
                  </View>
                  <View style={enhancedStyles.infoContent}>
                    <Text style={enhancedStyles.infoLabel}>Email</Text>
                    <Text style={enhancedStyles.infoText}>{profileData?.user?.email || user?.email}</Text>
                  </View>
                </View>
                {(profileData?.user?.numtel || user?.numtel) && (
                  <View style={enhancedStyles.infoRow}>
                    <View style={[enhancedStyles.infoIcon, { backgroundColor: 'rgba(71, 199, 234, 0.15)' }]}>
                      <Ionicons name="call-outline" size={20} color="#47c7ea" />
                    </View>
                    <View style={enhancedStyles.infoContent}>
                      <Text style={enhancedStyles.infoLabel}>Phone</Text>
                      <Text style={enhancedStyles.infoText}>{profileData?.user?.numtel || user?.numtel}</Text>
                    </View>
                  </View>
                )}
                {(profileData?.user?.pays || user?.pays) && (
                  <View style={enhancedStyles.infoRow}>
                    <View style={[enhancedStyles.infoIcon, { backgroundColor: 'rgba(255, 155, 40, 0.15)' }]}>
                      <Ionicons name="earth-outline" size={20} color="#ff9b28" />
                    </View>
                    <View style={enhancedStyles.infoContent}>
                      <Text style={enhancedStyles.infoLabel}>Country</Text>
                      <Text style={enhancedStyles.infoText}>{profileData?.user?.pays || user?.pays}</Text>
                    </View>
                  </View>
                )}
                {(profileData?.user?.ville || user?.ville) && (
                  <View style={enhancedStyles.infoRow}>
                    <View style={[enhancedStyles.infoIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                      <Ionicons name="location-outline" size={20} color="#3b82f6" />
                    </View>
                    <View style={enhancedStyles.infoContent}>
                      <Text style={enhancedStyles.infoLabel}>City</Text>
                      <Text style={enhancedStyles.infoText}>{profileData?.user?.ville || user?.ville}</Text>
                    </View>
                  </View>
                )}
                <View style={enhancedStyles.infoRow}>
                  <View style={[enhancedStyles.infoIcon, { backgroundColor: 'rgba(246, 88, 135, 0.15)' }]}>
                    <Ionicons name="calendar-outline" size={20} color="#f65887" />
                  </View>
                  <View style={enhancedStyles.infoContent}>
                    <Text style={enhancedStyles.infoLabel}>Member Since</Text>
                    <Text style={enhancedStyles.infoText}>
                      {new Date(profileData?.user?.createdAt || user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'library' && <LibrarySection />}

          {activeTab === 'activity' && (
            <View style={enhancedStyles.activitySection}>
              <Text style={enhancedStyles.sectionTitle}>Recent Activity</Text>
              {profileData?.recentActivities && profileData.recentActivities.length > 0 ? (
                <View>
                  {profileData.recentActivities.map((activity, index) => (
                    <View key={activity.id || index} style={enhancedStyles.activityItem}>
                      <View style={[enhancedStyles.activityIcon, { backgroundColor: getActivityColor(activity.type) }]}>
                        <Ionicons name={getActivityIcon(activity.type) as any} size={20} color="#fff" />
                      </View>
                      <View style={enhancedStyles.activityContent}>
                        <Text style={enhancedStyles.activityTitle}>{activity.title}</Text>
                        <Text style={enhancedStyles.activityDescription}>{activity.description}</Text>
                        <Text style={enhancedStyles.activityTime}>{formatActivityTime(activity.timestamp)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={enhancedStyles.emptyStateCard}>
                  <View style={enhancedStyles.emptyStateIcon}>
                    <Ionicons name="time-outline" size={48} color="#8B5CF6" />
                  </View>
                  <Text style={enhancedStyles.emptyStateText}>No recent activity</Text>
                  <Text style={enhancedStyles.emptyStateSubtext}>Your activities will appear here</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sidebar */}
      <Sidebar 
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
    </SafeAreaView>
  );
}
