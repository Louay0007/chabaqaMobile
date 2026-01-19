import { useAuth } from '@/hooks/use-auth';
import { useAdaptiveColors } from '@/hooks/useAdaptiveColors';
import { getCachedUser, logout } from '@/lib/auth';
import { getMyJoinedCommunities } from '@/lib/communities-api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getImageUrl } from '@/lib/image-utils';
import { getWalletBalance, formatAmount } from '@/lib/wallet-api';

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  logo?: string;
  onPress: () => void;
}

export default function Sidebar({ isVisible, onClose }: SidebarProps) {
  const { isAuthenticated, user, refetch } = useAuth();
  const adaptiveColors = useAdaptiveColors();
  const insets = useSafeAreaInsets();
  const [joinedCommunities, setJoinedCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingWallet, setLoadingWallet] = useState(false);

  // Load user data
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    try {
      // Try to get cached user first for immediate display
      const cached = await getCachedUser();
      if (cached) {
        setCurrentUser(cached);
      }
      // Use user from context if available
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Fetch joined communities when sidebar becomes visible
  useEffect(() => {
    if (isVisible && isAuthenticated) {
      fetchJoinedCommunities();
      fetchWalletBalance();
    }
  }, [isVisible, isAuthenticated]);

  const fetchWalletBalance = async () => {
    try {
      setLoadingWallet(true);
      const balance = await getWalletBalance();
      setWalletBalance(balance.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance(0);
    } finally {
      setLoadingWallet(false);
    }
  };

  const fetchJoinedCommunities = async () => {
    try {
      setLoading(true);

      const response = await getMyJoinedCommunities();
      if (response.success && response.data) {
        // Transform communities for sidebar display
        const transformedCommunities = response.data.map((community: any) => ({
          id: community._id || community.id,
          slug: community.slug,
          name: community.name,
          logo: community.logo || community.settings?.logo,
          category: community.category,
          members: community.membersCount || community.members,
        }));

        setJoinedCommunities(transformedCommunities);
      }
    } catch (error) {
      console.error('❌ Error fetching joined communities:', error);
      // Don't show error in sidebar, just log it
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      await logout();
      onClose();
      // Redirect to signin
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'create',
      title: 'Create a community',
      icon: 'add-circle',
      onPress: () => {
        router.push('/(build_community)');
        onClose();
      }
    },
    {
      id: 'discover',
      title: 'Discover communities',
      icon: 'compass',
      onPress: () => {
        router.push('/(communities)');
        onClose();
      }
    }
  ];

  const generateCommunityLogo = (name: string, category?: string) => {
    const firstLetter = name.charAt(0).toUpperCase();
    const colors = {
      'Marketing': '#8e78fb',
      'Design': '#3b82f6',
      'Fitness': '#10b981',
      'Technology': '#f59e0b',
      'Development': '#ef4444',
      'Web Design': '#6366f1',
    };
    const color = colors[category as keyof typeof colors] || '#8e78fb';
    return `https://placehold.co/24x24/${color.slice(1)}/ffffff?text=${firstLetter}`;
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      elevation: 1000,
      flexDirection: 'row',
    }}>
      {/* Sidebar Content */}
      <View style={{
        width: 280,
        backgroundColor: adaptiveColors.isDark ? '#1f2937' : '#ffffff',
        paddingTop: Math.max(insets.top, 20),
        paddingBottom: Math.max(insets.bottom, 24),
        elevation: 1001,
        zIndex: 10000,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        borderRightWidth: 1,
        borderRightColor: adaptiveColors.isDark ? '#374151' : '#e5e7eb',
        flexDirection: 'column',
      }}>
        {/* Header with Logo */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 20,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: adaptiveColors.isDark ? '#374151' : '#f3f4f6',
        }}>
          <Image
            source={require('@/assets/images/logo_chabaqa.png')}
            style={{ width: 100, height: 28, resizeMode: 'contain' }}
          />
        </View>

        {/* User Profile Section */}
        {isAuthenticated && (
          <View style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: adaptiveColors.isDark ? '#374151' : '#f3f4f6',
            backgroundColor: adaptiveColors.isDark ? '#1f2937' : '#ffffff',
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 4,
              }}
              onPress={() => {
                router.push('/(profile)');
                onClose();
              }}
              activeOpacity={0.7}
            >
              <View style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: '#8e78fb',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: '#ffffff',
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}>
                {currentUser?.avatar ? (
                  <Image
                    source={{ uri: getImageUrl(currentUser.avatar) }}
                    style={{ width: 52, height: 52 }}
                  />
                ) : (
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 20,
                    fontWeight: '700',
                  }}>
                    {getUserInitials(currentUser?.name)}
                  </Text>
                )}
              </View>

              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{
                  fontSize: 17,
                  fontWeight: '700',
                  color: adaptiveColors.isDark ? '#ffffff' : '#111827',
                  marginBottom: 4,
                }} numberOfLines={1}>
                  {currentUser?.name || 'User'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 13,
                    color: '#8e78fb',
                    fontWeight: '600',
                  }}>
                    View Profile
                  </Text>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={adaptiveColors.isDark ? '#9ca3af' : '#9ca3af'}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Wallet Section */}
        {isAuthenticated && (
          <View style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: adaptiveColors.isDark ? '#374151' : '#e5e7eb',
            backgroundColor: adaptiveColors.isDark ? '#1f2937' : '#ffffff',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                }}
                onPress={() => {
                  router.push('/(profile)/wallet');
                  onClose();
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: adaptiveColors.isDark ? 'rgba(255, 255, 255, 0.1)' : '#f3f4f6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Ionicons name="wallet" size={20} color={adaptiveColors.isDark ? '#ffffff' : '#111827'} />
                </View>
                <View>
                  <Text style={{
                    fontSize: 12,
                    color: adaptiveColors.isDark ? 'rgba(255, 255, 255, 0.6)' : '#6b7280',
                    marginBottom: 2,
                  }}>
                    Wallet Balance
                  </Text>
                  {loadingWallet ? (
                    <ActivityIndicator size="small" color={adaptiveColors.isDark ? '#ffffff' : '#111827'} />
                  ) : (
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: adaptiveColors.isDark ? '#ffffff' : '#111827',
                    }}>
                      {walletBalance.toFixed(2)} pts
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  backgroundColor: adaptiveColors.isDark ? '#ffffff' : '#111827',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => {
                  router.push('/(profile)/topup');
                  onClose();
                }}
              >
                <Ionicons name="add" size={16} color={adaptiveColors.isDark ? '#111827' : '#ffffff'} />
                <Text style={{
                  color: adaptiveColors.isDark ? '#111827' : '#ffffff',
                  fontSize: 13,
                  fontWeight: '600',
                  marginLeft: 4,
                }}>
                  Top Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Menu Items */}
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 12,
                borderRadius: 10,
                marginBottom: 8,
                backgroundColor: adaptiveColors.isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
              }}
              onPress={item.onPress}
            >
              <View style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 10, 
                backgroundColor: adaptiveColors.isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}>
                {item.logo ? (
                  <Image
                    source={{ uri: getImageUrl(item.logo) }}
                    style={{ width: 20, height: 20, borderRadius: 4 }}
                  />
                ) : (
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={adaptiveColors.isDark ? '#ffffff' : '#374151'}
                  />
                )}
              </View>
              <Text style={{
                fontSize: 15,
                color: adaptiveColors.isDark ? '#ffffff' : '#1f2937',
                fontWeight: '600',
              }}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Joined Communities Section */}
          {isAuthenticated && (
            <>
              <View style={{
                marginTop: 20,
                marginBottom: 12,
                paddingTop: 20,
                borderTopWidth: 1,
                borderTopColor: adaptiveColors.isDark ? '#374151' : '#e5e7eb',
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  paddingHorizontal: 4,
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: adaptiveColors.isDark ? '#9ca3af' : '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}>
                    My Communities
                  </Text>
                  {loading && (
                    <ActivityIndicator size="small" color={adaptiveColors.isDark ? '#9ca3af' : '#6b7280'} />
                  )}
                </View>
              </View>

              {/* Joined Communities List */}
              {joinedCommunities.length > 0 ? (
                joinedCommunities.map((community) => (
                  <TouchableOpacity
                    key={community.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      marginBottom: 6,
                      backgroundColor: adaptiveColors.isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                      borderWidth: 1,
                      borderColor: adaptiveColors.isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                    }}
                    onPress={() => {
                      router.push(`/(community)/${community.slug}/(loggedUser)/home`);
                      onClose();
                    }}
                  >
                    <View style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: 10, 
                      overflow: 'hidden',
                      marginRight: 14,
                      backgroundColor: '#f3f4f6',
                    }}>
                      <Image
                        source={{
                          uri: getImageUrl(community.logo) || generateCommunityLogo(community.name, community.category)
                        }}
                        style={{
                          width: 40,
                          height: 40,
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          color: adaptiveColors.isDark ? '#ffffff' : '#1f2937',
                          fontWeight: '600',
                          marginBottom: 2,
                        }}
                        numberOfLines={1}
                      >
                        {community.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: adaptiveColors.isDark ? '#9ca3af' : '#6b7280',
                        }}
                        numberOfLines={1}
                      >
                        {community.members ? `${community.members} members` : community.category}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={adaptiveColors.isDark ? '#6b7280' : '#9ca3af'}
                    />
                  </TouchableOpacity>
                ))
              ) : (
                !loading && (
                  <View style={{
                    paddingVertical: 24,
                    paddingHorizontal: 16,
                    alignItems: 'center',
                    backgroundColor: adaptiveColors.isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
                    borderRadius: 12,
                  }}>
                    <Ionicons
                      name="people-outline"
                      size={32}
                      color={adaptiveColors.isDark ? '#6b7280' : '#9ca3af'}
                    />
                    <Text style={{
                      fontSize: 13,
                      color: adaptiveColors.isDark ? '#6b7280' : '#9ca3af',
                      textAlign: 'center',
                      marginTop: 12,
                      lineHeight: 18,
                    }}>
                      No communities joined yet.{"\n"}Discover some communities!
                    </Text>
                  </View>
                )
              )}
            </>
          )}

          {/* Refresh Button */}
          {isAuthenticated && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                marginTop: 16,
                backgroundColor: adaptiveColors.isDark ? '#374151' : '#f3f4f6',
              }}
              onPress={fetchJoinedCommunities}
              disabled={loading}
            >
              <Ionicons
                name={loading ? 'hourglass' : 'refresh'}
                size={16}
                color={adaptiveColors.isDark ? '#9ca3af' : '#6b7280'}
              />
              <Text style={{
                fontSize: 13,
                color: adaptiveColors.isDark ? '#9ca3af' : '#6b7280',
                marginLeft: 8,
                fontWeight: '600',
              }}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Logout Button */}
        {isAuthenticated && (
          <View style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: adaptiveColors.isDark ? '#374151' : '#e5e7eb',
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: adaptiveColors.isDark ? '#dc2626' : '#fee2e2',
                borderWidth: 1,
                borderColor: adaptiveColors.isDark ? '#991b1b' : '#fecaca',
              }}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={adaptiveColors.isDark ? '#ffffff' : '#dc2626'}
              />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: adaptiveColors.isDark ? '#ffffff' : '#dc2626',
                marginLeft: 8,
              }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Background Overlay */}
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }}
        onPress={onClose}
        activeOpacity={1}
      />
    </View>
    </Modal>
  );
}
