import { useRouter } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { communityStyles } from '../_styles';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={communityStyles.header}>
      <Text style={communityStyles.headerTitle}>{title}</Text>
      <Text style={communityStyles.headerSubtitle}>{subtitle}</Text>
      
      {/* Bouton Messages en position absolue */}
      <TouchableOpacity 
        onPress={() => router.push('/(messages)')}
        style={{
          position: 'absolute',
          right: 20,
          top: 20,
          backgroundColor: 'rgba(142, 120, 251, 0.1)',
          borderRadius: 12,
          padding: 12,
          borderWidth: 1,
          borderColor: '#8e78fb',
        }}
      >
        <MessageSquare size={24} color="#8e78fb" />
      </TouchableOpacity>
    </View>
  );
}
