import { useAuth } from '@/hooks/use-auth';
import {
  ImageIcon,
  LinkIcon,
  Send,
  Smile,
  Loader2,
  Camera,
  ImagePlus,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../styles';

interface CreatePostCardProps {
  newPost: string;
  setNewPost: (text: string) => void;
  onCreatePost: (selectedImage: string | null) => void;
  creatingPost?: boolean;
  resetImage?: boolean;
}

export default function CreatePostCard({
  newPost,
  setNewPost,
  onCreatePost,
  creatingPost = false,
  resetImage = false,
}: CreatePostCardProps) {
  const { user: currentUser, isLoading } = useAuth();
  const [displayUser, setDisplayUser] = useState<any>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Common emojis
  const emojis = [
    '😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💪',
    '👏', '🙌', '💯', '🚀', '⭐', '💡', '🎯', '✅',
    '📚', '💻', '🎨', '🎵', '⚡', '🌟', '🎁', '🏆',
    '🤔', '😍', '🥳', '😎', '🤩', '😇', '🙏', '💖'
  ];
  
  // Update display user when auth user changes
  useEffect(() => {
    if (currentUser && !isLoading) {
      console.log('👤 [CREATE-POST] User loaded:', currentUser.name);
      setDisplayUser(currentUser);
    }
  }, [currentUser, isLoading]);
  
  // Reset image when resetImage prop changes
  useEffect(() => {
    if (resetImage) {
      setSelectedImage(null);
    }
  }, [resetImage]);
  
  // Generate avatar URL
  const avatarUrl = displayUser?.profile_picture || 
    (displayUser?.name 
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name)}&background=8e78fb&color=fff`
      : "https://ui-avatars.com/api/?name=U&background=8e78fb&color=fff");
  
  const userName = displayUser?.name || 'User';
  const userRole = displayUser?.role || 'Member';
  const firstName = userName.split(' ')[0] || 'there';

  // Handle image selection
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Keep original size
      quality: 1.0, // Maximum quality (100%)
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowImagePicker(false);
    }
  };

  const handleChooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Keep original size
      quality: 1.0, // Maximum quality (100%)
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowImagePicker(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleAddEmoji = (emoji: string) => {
    setNewPost(newPost + emoji);
    setShowEmojiPicker(false);
  };

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      setNewPost(newPost + (newPost ? '\n' : '') + linkUrl);
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  return (
    <View style={styles.createPostCard}>
      {/* User Profile Section */}
      <View style={styles.createPostHeader}>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.profilePic}
          key={avatarUrl}
        />
        <View style={styles.userInfoSection}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userRole}>{userRole}</Text>
        </View>
      </View>

      {/* Input Area */}
      <View style={styles.inputWrapper}>
        <TextInput
          multiline
          placeholder={`What's on your mind, ${firstName}?`}
          value={newPost}
          onChangeText={setNewPost}
          style={styles.inputContainer}
          placeholderTextColor="#9ca3af"
          editable={!creatingPost}
        />
      </View>

      {/* Selected Image Preview */}
      {selectedImage && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TouchableOpacity 
            style={styles.removeImageButton}
            onPress={handleRemoveImage}
          >
            <X size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            disabled={creatingPost}
            onPress={() => setShowImagePicker(true)}
          >
            <ImageIcon size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            disabled={creatingPost}
            onPress={() => setShowLinkInput(true)}
          >
            <LinkIcon size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            disabled={creatingPost}
            onPress={() => setShowEmojiPicker(true)}
          >
            <Smile size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Post Button */}
        <TouchableOpacity
          style={[
            styles.postButton,
            (!newPost.trim() || creatingPost) && styles.postButtonDisabled,
          ]}
          onPress={() => onCreatePost(selectedImage)}
          disabled={!newPost.trim() || creatingPost}
        >
          {creatingPost ? (
            <>
              <ActivityIndicator size="small" color="white" style={{ marginRight: 6 }} />
              <Text style={styles.postButtonText}>Posting...</Text>
            </>
          ) : (
            <>
              <Send size={16} color="white" style={{ marginRight: 6 }} />
              <Text style={styles.postButtonText}>Post</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <TouchableOpacity 
          style={styles.bottomModalOverlay}
          activeOpacity={1}
          onPress={() => setShowImagePicker(false)}
        >
          <View style={styles.bottomModalContent}>
            <View style={styles.modalHandle} />
            
            <TouchableOpacity 
              style={styles.bottomOptionButton}
              onPress={handleTakePhoto}
            >
              <Camera size={24} color="#374151" />
              <Text style={styles.bottomOptionText}>Take a photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.bottomOptionButton}
              onPress={handleChooseFromLibrary}
            >
              <ImagePlus size={24} color="#374151" />
              <Text style={styles.bottomOptionText}>Choose from library</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEmojiPicker(false)}
        >
          <View style={styles.emojiModalContent}>
            <View style={styles.emojiHeader}>
              <Text style={styles.emojiTitle}>Select Emoji</Text>
              <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.emojiGrid}>
              <View style={styles.emojiContainer}>
                {emojis.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.emojiButton}
                    onPress={() => handleAddEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Link Input Modal */}
      <Modal
        visible={showLinkInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLinkInput(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLinkInput(false)}
        >
          <View style={styles.linkModalContent}>
            <View style={styles.linkHeader}>
              <Text style={styles.linkTitle}>Add Link</Text>
              <TouchableOpacity onPress={() => setShowLinkInput(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.linkInput}
              placeholder="Enter URL (e.g., https://example.com)"
              placeholderTextColor="#9ca3af"
              value={linkUrl}
              onChangeText={setLinkUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddLink}
            >
              <Text style={styles.addButtonText}>Add Link</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
