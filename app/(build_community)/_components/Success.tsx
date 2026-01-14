import React, { useEffect, useRef } from 'react';
import { Animated, Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { CheckCircle2, ArrowRight, Users, Sparkles } from 'lucide-react-native';

interface SuccessProps {
  communityName?: string;
  communityImage?: string | null;
  communityCoverImage?: string | null;
  onGoToCommunities: () => void;
}

const Success = ({ 
  communityName = "Your Community", 
  communityImage, 
  communityCoverImage, 
  onGoToCommunities 
}: SuccessProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkAnim, {
        toValue: 1,
        tension: 150,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get initials for placeholder
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Chabaqa Logo - Top Right */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo_chabaqa.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Success Icon with Animation */}
      <Animated.View 
        style={[
          styles.successIconContainer,
          { transform: [{ scale: checkAnim }] }
        ]}
      >
        <View style={styles.successIconCircle}>
          <CheckCircle2 size={48} color="#ffffff" />
        </View>
      </Animated.View>

      {/* Cover Image Preview */}
      {communityCoverImage && (
        <View style={styles.coverPreviewContainer}>
          <Image
            source={{ uri: communityCoverImage }}
            style={styles.coverPreview}
            resizeMode="cover"
          />
          <View style={styles.coverOverlay} />
        </View>
      )}

      {/* Community Logo */}
      <View style={styles.communityLogoWrapper}>
        <View style={styles.communityLogoContainer}>
          {communityImage ? (
            <Image
              source={{ uri: communityImage }}
              style={styles.communityLogo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.communityLogoPlaceholder}>
              <Text style={styles.placeholderText}>
                {getInitials(communityName)}
              </Text>
            </View>
          )}
        </View>
        {/* Online indicator */}
        <View style={styles.onlineIndicator} />
      </View>

      {/* Success Text */}
      <View style={styles.textContainer}>
        <Text style={styles.congratsText}>Congratulations!</Text>
        <Text style={styles.communityNameText}>{communityName}</Text>
        <Text style={styles.liveText}>is now live</Text>
      </View>

      {/* Info Cards */}
      <View style={styles.infoCardsContainer}>
        <View style={styles.infoCard}>
          <Users size={20} color="#ffffff" />
          <Text style={styles.infoCardText}>Ready for members</Text>
        </View>
        <View style={styles.infoCard}>
          <Sparkles size={20} color="#ffffff" />
          <Text style={styles.infoCardText}>Start creating content</Text>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={onGoToCommunities}
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText}>Go to My Communities</Text>
        <ArrowRight size={20} color="#111827" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  successIconContainer: {
    marginBottom: 28,
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  coverPreviewContainer: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: -50,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#374151',
  },
  coverPreview: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  communityLogoWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  communityLogoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#374151',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#1f2937',
  },
  communityLogo: {
    width: '100%',
    height: '100%',
  },
  communityLogoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    borderWidth: 4,
    borderColor: '#1f2937',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  congratsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  communityNameText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  liveText: {
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: '500',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    gap: 10,
  },
  infoCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d1d5db',
  },
  continueButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 10,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
});

export default Success;