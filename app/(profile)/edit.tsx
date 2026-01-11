import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/hooks/use-auth';
import { useAdaptiveColors } from '@/hooks/useAdaptiveColors';
import { getImageUrl } from '@/lib/image-utils';
import { tryEndpoints } from '@/lib/http';
import { getAccessToken, storeUser } from '@/lib/auth';
import PlatformUtils from '@/lib/platform-utils';

export default function EditProfileScreen() {
  const { user, refetch: refreshUser } = useAuth();
  const colors = useAdaptiveColors();

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarChanged, setAvatarChanged] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setPhone(user.numtel || '');
      setCountry(user.pays || '');
      setCity(user.ville || '');

      const avatar = user.photo_profil || user.avatar;
      setAvatarUri(avatar ? getImageUrl(avatar) : null);
      setLoading(false);
    }
  }, [user]);

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your photos to change your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setAvatarChanged(true);
    }
  };

  // Upload avatar to server
  const uploadAvatar = async (imageUri: string): Promise<string | null> => {
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const formData = new FormData();

      // Always use .jpg extension and image/jpeg mime type for consistency
      // The backend validates by mime type, not extension
      const fileName = `avatar_${Date.now()}.jpg`;
      const mimeType = 'image/jpeg';

      console.log('📸 Uploading avatar...', { uri: imageUri.substring(0, 50), fileName, mimeType });

      if (PlatformUtils.isWeb) {
        // For web: fetch blob and create a proper File object
        const response = await fetch(imageUri);
        const blob = await response.blob();
        // Create File object with explicit name and type
        const file = new File([blob], fileName, { type: mimeType });
        formData.append('file', file);
        console.log('📸 Web: Created File object', { name: file.name, type: file.type, size: file.size });
      } else {
        // Native formData needs { uri, name, type }
        formData.append('file', {
          uri: imageUri,
          name: fileName,
          type: mimeType,
        } as any);
      }

      const API_URL = PlatformUtils.getApiUrl();
      const response = await fetch(`${API_URL}/api/upload/single`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      console.log('📸 Upload response:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Avatar uploaded:', result.url);
      return result.url || null;
    } catch (error: any) {
      console.error('❌ Upload exception:', error);
      Alert.alert('Upload Failed', 'Could not upload profile picture. Please try again.');
      return null;
    }
  };

  // Save profile
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      let photoUrl: string | undefined;

      // 1. Upload avatar if changed
      if (avatarChanged && avatarUri) {
        const uploadedUrl = await uploadAvatar(avatarUri);
        if (!uploadedUrl) {
          setSaving(false);
          return; // Stop if upload failed
        }
        photoUrl = uploadedUrl;
      }

      // 2. Prepare update data
      const updateData: Record<string, string | undefined> = {
        name: name.trim(),
        bio: bio.trim() || undefined,
        numtel: phone.trim() || undefined,
        pays: country.trim() || undefined,
        ville: city.trim() || undefined,
      };

      if (photoUrl) {
        updateData.photo_profil = photoUrl;
      }

      console.log('💾 Updating profile with:', updateData);

      // 3. Send update request
      const resp = await tryEndpoints<{ success: boolean; user: any }>(
        '/api/user/update-profile',
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          data: updateData,
        }
      );

      console.log('✅ Profile updated successfully');

      // 4. Update local storage
      if (resp.data.user) {
        await storeUser(resp.data.user);
      }

      // 5. Refresh context
      await refreshUser();

      Alert.alert('Success', 'Profile updated!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error: any) {
      console.error('❌ Save error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.cardBackground }}>
        <ActivityIndicator size="large" color="#8e78fb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cardBackground }} edges={['top']}>
      <StatusBar style={colors.isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.primaryText }}>
          Edit Profile
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: saving ? '#ccc' : '#8e78fb',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>

          {/* Avatar */}
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <TouchableOpacity onPress={pickImage} disabled={saving}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                overflow: 'hidden',
                borderWidth: 3,
                borderColor: '#8e78fb',
                backgroundColor: colors.cardBorder,
              }}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <LinearGradient colors={['#8e78fb', '#667eea']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="person" size={40} color="#fff" />
                  </LinearGradient>
                )}
              </View>
              <View style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#ff9b28',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#fff',
              }}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={{ marginTop: 8, color: colors.secondaryText, fontSize: 14 }}>
              Tap to change photo
            </Text>
          </View>

          {/* Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryText, marginBottom: 8 }}>
              Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.secondaryText}
              style={{
                backgroundColor: colors.cardBackground,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.primaryText,
              }}
              editable={!saving}
            />
          </View>

          {/* Bio */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryText, marginBottom: 8 }}>
              Bio
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.secondaryText}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: colors.cardBackground,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.primaryText,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              editable={!saving}
            />
          </View>

          {/* Phone */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryText, marginBottom: 8 }}>
              Phone
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+216 12 345 678"
              placeholderTextColor={colors.secondaryText}
              keyboardType="phone-pad"
              style={{
                backgroundColor: colors.cardBackground,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.primaryText,
              }}
              editable={!saving}
            />
          </View>

          {/* Country */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryText, marginBottom: 8 }}>
              Country
            </Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              placeholder="Tunisia"
              placeholderTextColor={colors.secondaryText}
              style={{
                backgroundColor: colors.cardBackground,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.primaryText,
              }}
              editable={!saving}
            />
          </View>

          {/* City */}
          <View style={{ marginBottom: 40 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primaryText, marginBottom: 8 }}>
              City
            </Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Tunis"
              placeholderTextColor={colors.secondaryText}
              style={{
                backgroundColor: colors.cardBackground,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.primaryText,
              }}
              editable={!saving}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
