import React, { useState } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { colors } from '@/lib/design-tokens';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size: number;
  style?: any;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size,
  style,
  borderWidth = 1,
  borderColor = colors.primaryBorder,
  backgroundColor = colors.gray100,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth,
    borderColor,
    backgroundColor,
    overflow: 'hidden' as const, // Ensure image doesn't overflow
    ...style,
  };

  const fallbackStyle = {
    ...avatarStyle,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const textStyle = {
    fontSize: Math.max(size * 0.4, 8), // Minimum 8px font size
    fontWeight: '600' as const,
    color: '#ffffff',
    textAlign: 'center' as const,
  };

  // Generate a consistent color based on name
  const getBackgroundColor = (name: string) => {
    const colors = [
      '#8e78fb', '#3b82f6', '#10b981', '#f59e0b', 
      '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16',
      '#f97316', '#ec4899', '#6366f1', '#14b8a6'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Show fallback if no URI, image error, or still loading and no valid URI
  const showFallback = !uri || imageError || uri.trim() === '' || uri.includes('placeholder');

  if (showFallback) {
    const initial = name.charAt(0).toUpperCase() || '?';
    const bgColor = getBackgroundColor(name);
    
    return (
      <View style={[fallbackStyle, { backgroundColor: bgColor }]}>
        <Text style={textStyle}>{initial}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={avatarStyle}
      onError={() => {
        console.log('❌ [AVATAR] Failed to load image:', uri);
        setImageError(true);
      }}
      onLoad={() => {
        setIsLoading(false);
      }}
      onLoadStart={() => {
        setIsLoading(true);
        setImageError(false);
      }}
      resizeMode="cover"
    />
  );
};

export default Avatar;