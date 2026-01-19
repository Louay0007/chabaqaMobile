import { useAuth } from '@/hooks/use-auth';
import { getImageUrl } from '@/lib/image-utils';
import {
  ImageIcon,
  LinkIcon,
  Send,
  Smile,
  Loader2,
  Camera,
  ImagePlus,
  X,
  FileText,
  AlertCircle
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
  Alert,
  Dimensions
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

const MAX_CHARS = 10000;
const MIN_CHARS = 2;

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
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
  const avatarUrl = displayUser?.profile_picture 
    ? getImageUrl(displayUser.profile_picture)
    : (displayUser?.name 
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name)}&background=8B5CF6&color=fff`
      : "https://ui-avatars.com/api/?name=U&background=8B5CF6&color=fff");
  
  const userName = displayUser?.name || 'User';
  const userRole = displayUser?.role || 'Member';
  const firstName = userName.split(' ')[0] || 'there';

  // Character count
  const charCount = newPost.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isUnderMin = charCount < MIN_CHARS && charCount > 0;
  const canPost = charCount >= MIN_CHARS && charCount <= MAX_CHARS && !creatingPost;

  // Handle image selection
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    setUploadingImage(true);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowImagePicker(false);
    }
    setUploadingImage(false);
  };

  const handleChooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library permission is required');
      return;
    }

    setUploadingImage(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowImagePicker(false);
    }
    setUploadingImage(false);
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
    <View style={[styles.createPostCard, isFocused && styles.createPostCardFocused]}>
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
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            isOverLimit && styles.inputContainerError
          ]}
          placeholderTextColor="#9ca3af"
          editable={!creatingPost}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={MAX_CHARS + 100} // Allow typing a bit over to show error
        />
        
        {/* Character Counter */}
        {charCount > 0 && (
          <View style={styles.charCounterContainer}>
            <Text style={[
              styles.charCounter,
              isOverLimit && styles.charCounterError,
              isUnderMin && styles.charCounterWarning
            ]}>
              {charCount} / {MAX_CHARS}
            </Text>
            {isUnderMin && (
              <View style={styles.warningBadge}>
                <AlertCircle size={12} color="#F59E0B" />
                <Text style={styles.warningText}>Min {MIN_CHARS} characters</Text>
              </View>
            )}
            {isOverLimit && (
              <View style={styles.errorBadge}>
                <AlertCircle size={12} color="#EF4444" />
                <Text style={styles.errorBadgeText}>Character limit exceeded</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Selected Image Preview */}
      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            {!creatingPost && (
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
              >
                <X size={18} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, selectedImage && styles.actionButtonActive]}
            disabled={creatingPost || uploadingImage}
            onPress={() => setShowImagePicker(true)}
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color="#8B5CF6" />
            ) : (
              <ImageIcon size={22} color={selectedImage ? "#8B5CF6" : "#6b7280"} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            disabled={creatingPost}
            onPress={() => setShowLinkInput(true)}
          >
            <LinkIcon size={22} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            disabled={creatingPost}
            onPress={() => setShowEmojiPicker(true)}
          >
            <Smile size={22} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Post Button */}
        <TouchableOpacity
          style={[
            styles.postButton,
            !canPost && styles.postButtonDisabled,
          ]}
          onPress={() => onCreatePost(selectedImage)}
          disabled={!canPost}
        >
          {creatingPost ? (
            <>
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
              <Text style={styles.postButtonText}>Posting...</Text>
            </>
          ) : (
            <>
              <Send size={18} color="white" style={{ marginRight: 8 }} />
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
            
            <Text style={styles.modalTitle}>Add Photo</Text>
            
            <TouchableOpacity 
              style={styles.bottomOptionButton}
              onPress={handleTakePhoto}
            >
              <View style={styles.optionIconContainer}>
                <Camera size={24} color="#8B5CF6" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.bottomOptionText}>Take a photo</Text>
                <Text style={styles.bottomOptionSubtext}>Use your camera</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.bottomOptionButton}
              onPress={handleChooseFromLibrary}
            >
              <View style={styles.optionIconContainer}>
                <ImagePlus size={24} color="#8B5CF6" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.bottomOptionText}>Choose from library</Text>
                <Text style={styles.bottomOptionSubtext}>Select from your photos</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
              style={[styles.addButton, !linkUrl.trim() && styles.addButtonDisabled]}
              onPress={handleAddLink}
              disabled={!linkUrl.trim()}
            >
              <Text style={styles.addButtonText}>Add Link</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
