import { Stack } from 'expo-router';

export default function CommunitySlugLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right'
    }}>
      <Stack.Screen name="index" options={{ title: "Détails de la communauté" }} />
      <Stack.Screen name="(loggedUser)" options={{ headerShown: false }} />
    </Stack>
  );
}