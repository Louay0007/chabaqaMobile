import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View, Modal, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import styles from '../styles';
import CameraIcon from './icons/CameraIcon';

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
      aspect: [16, 9], // Cover image aspect ratio
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
      aspect: [16, 9], // Cover image aspect ratio
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
        <Text style={coverStyles.coverUploadLabel}>{title}</Text>
        <TouchableOpacity 
          style={[
            coverStyles.coverUploadButton,
            selectedImage && { borderColor: '#8e78fb', borderStyle: 'solid' }
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
              {/* Edit overlay */}
              <View style={{
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
              }}>
                <Text style={{ color: 'white', fontSize: 12 }}>✏️</Text>
              </View>
            </View>
          ) : (
            <LinearGradient 
              colors={['#8e78fb', '#47c7ea']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }} 
              style={coverStyles.coverUploadGradient}
            >
              <CameraIcon />
              <Text style={coverStyles.coverUploadText}>Tap to add cover image</Text>
            </LinearGradient>
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
              <Camera size={24} color="#374151" />
              <Text style={modalStyles.bottomOptionText}>Take a photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={modalStyles.bottomOptionButton}
              onPress={handleChooseFromLibrary}
            >
              <ImagePlus size={24} color="#374151" />
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
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  coverUploadButton: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(142, 120, 251, 0.2)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(142, 120, 251, 0.05)',
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
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
});

const modalStyles = StyleSheet.create({
  bottomModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingTop: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 16,
  },
  bottomOptionText: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '400',
  },
});

export default UploadCoverImage;