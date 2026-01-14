import { getCommunityBySlug } from '@/lib/communities-api';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, StatusBar } from 'react-native';
import CommunityHeader from '../../_components/Header';

export default function LoggedUserLayout() {
  const { slug } = useLocalSearchParams();
  
  // Set status bar to light content for dark background
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
    StatusBar.setBarStyle('dark-content');
  }, []);
  
  return (
    <Stack screenOptions={{ 
      header: () => <CommunityHeader showBack communitySlug={slug as string} />,
      animation: 'slide_from_right',
      contentStyle: { backgroundColor: '#f9fafb' },
      headerShown: true, // Show the header but we're using a custom component with custom styling
    }}>
      <Stack.Screen 
        name="home/index" 
        options={{ 
          title: "Accueil",
        }} 
      />
    </Stack>
  );
}