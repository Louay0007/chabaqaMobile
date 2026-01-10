import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View, Modal, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import styles from '../styles';
import CameraIcon from './icons/CameraIcon';

interface UploadImageProps {
  selectedImage: string | null;
  handleImagePicker: (imageUri: string) => void;
}

const UploadImage: React.FC<UploadImageProps> = ({ selectedImage, handleImagePicker }) => {
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
          <LinearGradient colors={['#8e78fb', '#47c7ea']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.photoUploadGradient}>
            {selectedImage ? <Image source={{ uri: selectedImage }} style={styles.selectedImage} /> : <CameraIcon />}
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.photoUploadText}>Add community photo</Text>
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

export default UploadImage;