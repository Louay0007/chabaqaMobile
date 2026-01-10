import { colors, fontSize, fontWeight, spacing } from '@/lib/design-tokens';
import { getCommunityBySlug, getCurrentUser } from '@/lib/mock-data';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Bell, ChevronLeft, Home, Menu, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationModal from './modals/NotificationModal';
import SearchModal from './modals/SearchModal';
import Sidebar from '../../_components/Sidebar';
import { useNotificationCount } from '@/hooks/use-notification-count';

interface CommunityHeaderProps {
  showBack?: boolean;
  title?: string;
  communitySlug?: string;
}

export default function CommunityHeader({ showBack = false, title, communitySlug }: CommunityHeaderProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pathname = usePathname();
  const currentUser = getCurrentUser();
  const [communityName, setCommunityName] = useState<string | undefined>(title);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  
  // Hook pour récupérer le nombre de notifications non lues
  const { unreadCount, refresh: refreshNotifications } = useNotificationCount();
  
  // Get community info if slug is provided or available in params
  useEffect(() => {
    const fetchCommunityName = async () => {
      const slug = communitySlug || params.slug as string;
      if (slug && !title) {
        try {
          console.log('🏷️ [HEADER] Fetching community name for slug:', slug);
          // Importer depuis communities-api pour récupérer du backend
          const { getCommunityBySlug: getRealCommunity } = require('@/lib/communities-api');
          const response = await getRealCommunity(slug);
          
          if (response.success && response.data) {
            setCommunityName(response.data.name);
            console.log('✅ [HEADER] Community name loaded:', response.data.name);
          } else {
            console.warn('⚠️ [HEADER] Community not found, trying mock data');
            // Fallback to mock data
            const community = getCommunityBySlug(slug);
            if (community) {
              setCommunityName(community.name);
            }
          }
        } catch (error) {
          console.error('❌ [HEADER] Error fetching community:', error);
          // Fallback to mock data
          const community = getCommunityBySlug(slug);
          if (community) {
            setCommunityName(community.name);
          }
        }
      }
    };
    
    fetchCommunityName();
  }, [communitySlug, params.slug, title]);
  
  const handleOpenSearch = () => {
    setSearchModalVisible(true);
  };

  const handleCloseSearch = () => {
    setSearchModalVisible(false);
  };
  
  const handleOpenMenu = () => {
    console.log('📱 [HEADER] Opening menu/sidebar');
    setMenuModalVisible(true);
  };
  
  const handleCloseMenu = () => {
    console.log('📱 [HEADER] Closing menu/sidebar');
    setMenuModalVisible(false);
  };

  const handleOpenNotifications = () => {
    setNotificationModalVisible(true);
  };

  const handleCloseNotifications = () => {
    setNotificationModalVisible(false);
    // Rafraîchir le compteur après fermeture des notifications
    refreshNotifications();
  };

  const handleBackToHome = () => {
    const slug = communitySlug || params.slug;
    
    // Si on est dans la section (community), retourner vers la liste des communautés
    if (pathname.includes('/(community)/')) {
      console.log('Navigating to communities list from community section');
      router.replace('/(communities)');
    }
    // Si on est sur une page home d'une communauté spécifique ET qu'on a un slug valide
    else if (pathname.includes('/home') && slug) {
      console.log('Navigating to communities list from community home');
      router.replace('/(communities)');
    }
    // Fallback vers la liste des communautés
    else {
      console.log('Fallback to communities list');
      router.replace('/(communities)');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.headerContainer}>
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity 
              onPress={handleBackToHome} 
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color="#333" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={handleBackToHome} 
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Home size={22} color="#333" />
            </TouchableOpacity>
          )}
          {communityName && (
            <Text style={styles.title} numberOfLines={1}>
              {communityName}
            </Text>
          )}
        </View>

        <View style={styles.spacer} />

        <View style={styles.rightSection}>
          <TouchableOpacity 
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={handleOpenSearch}
          >
            <Search size={22} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            activeOpacity={0.7}
            onPress={handleOpenNotifications}
          >
            <Bell size={22} color="#333" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuButton}
            activeOpacity={0.7}
            onPress={handleOpenMenu}
          >
            <Menu size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Modal de recherche */}
      <SearchModal 
        visible={searchModalVisible}
        onClose={handleCloseSearch}
      />
      
      {/* Modal des notifications */}
      <NotificationModal
        visible={notificationModalVisible}
        onClose={handleCloseNotifications}
      />
      
      {/* Sidebar */}
      <Sidebar
        isVisible={menuModalVisible}
        onClose={handleCloseMenu}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: 20,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray800,
    marginLeft: spacing.md,
  },
  iconButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
    borderRadius: 20,
  },
  notificationButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
    borderRadius: 20,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeight.semibold,
    lineHeight: 12,
  },
  profileButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  profilePic: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  profilePicPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.gray200,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.gray100,
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  }
});