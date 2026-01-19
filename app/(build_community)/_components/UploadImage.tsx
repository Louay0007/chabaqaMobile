import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View, Modal, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, Upload } from 'lucide-react-native';
import styles from '../styles';

interface UploadImageProps {
  selectedImage: string | null;
  handleImagePicker: (imageUri: string) => void;
  title?: string;
}

const UploadImage: React.FC<UploadImageProps> = ({ selectedImage, handleImagePicker, title = "Add community photo" }) => {
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
      aspect: [1, 1],
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
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleImagePicker(result.assets[0].uri);
      setShowImagePicker(false);
    }
  };

  return (
    <>
      <View style={styles.photoUploadContainer}>
        <TouchableOpacity 
          style={styles.photoUploadButton} 
          onPress={() => setShowImagePicker(true)}
          activeOpacity={0.8}
        >
          <LinearGradient colors={['#8B5CF6', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.photoUploadGradient}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            ) : (
              <Upload size={28} color="#ffffff" />
            )}
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.photoUploadText}>{title}</Text>
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

const modalStyles = StyleSheet.create({
  bottomModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomModalContent: {
    backgroundColor: '#1F2937',
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
    backgroundColor: '#4B5563',
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
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default UploadImage;
