import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View, Modal, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, Image as ImageIcon, Pencil } from 'lucide-react-native';

interface UploadCoverImageProps {
  selectedImage: string | null;
  handleImagePicker: (imageUri: string) => void;
  title?: string;
}

const UploadCoverImage: React.FC<UploadCoverImageProps> = ({ 
  selectedImage, 
  handleImagePicker, 
  title = "Add cover image" 
}) => {
  const [showImagePicker, setShowImagePicker] = useState(false);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleImagePicker(result.assets[0].uri);
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
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleImagePicker(result.assets[0].uri);
      setShowImagePicker(false);
    }
  };

  return (
    <>
      <View style={coverStyles.coverUploadContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ImageIcon size={16} color="#9ca3af" />
          <Text style={coverStyles.coverUploadLabel}>{title}</Text>
        </View>
        <TouchableOpacity 
          style={[
            coverStyles.coverUploadButton,
            selectedImage && coverStyles.coverUploadButtonSelected
          ]} 
          onPress={() => setShowImagePicker(true)}
          activeOpacity={0.8}
        >
          {selectedImage ? (
            <View style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Image 
                source={{ uri: selectedImage }} 
                style={coverStyles.selectedCoverImage}
                resizeMode="cover"
              />
              <View style={coverStyles.editOverlay}>
                <Pencil size={14} color="#ffffff" />
              </View>
            </View>
          ) : (
            <LinearGradient 
              colors={['#8e78fb', '#47c7ea']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }} 
              style={coverStyles.coverUploadGradient}
            >
              <ImageIcon size={24} color="#ffffff" />
              <Text style={coverStyles.coverUploadText}>Tap to add cover image</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>

      {/* Image Picker Modal - Dark Theme */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <TouchableOpacity 
          style={modalStyles.bottomModalOverlay}
          activeOpacity={1}
          onPress={() => setShowImagePicker(false)}
        >
          <View style={modalStyles.bottomModalContent}>
            <View style={modalStyles.modalHandle} />
            
            <TouchableOpacity 
              style={modalStyles.bottomOptionButton}
              onPress={handleTakePhoto}
            >
              <View style={modalStyles.iconContainer}>
                <Camera size={22} color="#ffffff" />
              </View>
              <Text style={modalStyles.bottomOptionText}>Take a photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={modalStyles.bottomOptionButton}
              onPress={handleChooseFromLibrary}
            >
              <View style={modalStyles.iconContainer}>
                <ImagePlus size={22} color="#ffffff" />
              </View>
              <Text style={modalStyles.bottomOptionText}>Choose from library</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const coverStyles = StyleSheet.create({
  coverUploadContainer: {
    marginBottom: 8,
  },
  coverUploadLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  coverUploadButton: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    backgroundColor: '#1f2937',
  },
  coverUploadButtonSelected: {
    borderColor: '#8e78fb',
    borderStyle: 'solid',
  },
  coverUploadGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  selectedCoverImage: {
    width: '100%',
    height: '100%',
  },
  coverUploadText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
  editOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 6,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const modalStyles = StyleSheet.create({
  bottomModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  bottomModalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingTop: 8,
    borderWidth: 1,
    borderColor: '#374151',
    borderBottomWidth: 0,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#4b5563',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomOptionText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default UploadCoverImage;
