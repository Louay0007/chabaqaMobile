import React from 'react';
import { Text, TextInput, View } from 'react-native';
import styles from '../styles';
import UploadImage from './UploadImage';
import UploadCoverImage from './UploadCoverImage';

interface StepOneProps {
  formData: {
    name: string;
    country: string;
    bio: string;
    longDescription?: string;
    category?: string;
    type?: string;
    tags?: string[];
  };
  updateFormData: (field: string, value: string) => void;
  selectedImage: string | null;
  handleImagePicker: (imageUri: string) => void;
  selectedCoverImage: string | null;
  handleCoverImagePicker: (imageUri: string) => void;
}

const StepOne = ({ formData, updateFormData, selectedImage, handleImagePicker, selectedCoverImage, handleCoverImagePicker }: StepOneProps) => (
  <View style={styles.stepContent}>
    <Text style={styles.stepTitle}>Name your community</Text>
    <Text style={styles.stepSubtitle}>Add images and basic information for your community.</Text>
    
    {/* Images Section */}
    <View style={{ gap: 16, marginBottom: 24 }}>
      {/* Logo Upload */}
      <UploadImage selectedImage={selectedImage} handleImagePicker={handleImagePicker} title="Add community logo" />
      
      {/* Cover Image Upload */}
      <UploadCoverImage selectedImage={selectedCoverImage} handleImagePicker={handleCoverImagePicker} title="Add cover image" />
    </View>
    
    {/* Form Fields */}
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Community Name *</Text>
      <TextInput style={styles.input} value={formData.name} onChangeText={text => updateFormData('name', text)} placeholder="e.g Creators Club" placeholderTextColor="#9CA3AF" />
    </View>
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Country *</Text>
      <TextInput style={styles.input} value={formData.country} onChangeText={text => updateFormData('country', text)} placeholder="e.g Tunisia, France, Morocco..." placeholderTextColor="#9CA3AF" />
    </View>
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Bio (optional)</Text>
      <TextInput style={[styles.input, styles.textArea]} value={formData.bio} onChangeText={text => updateFormData('bio', text)} placeholder="Tell people what your community is about..." placeholderTextColor="#9CA3AF" multiline numberOfLines={4} />
    </View>
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Category (optional)</Text>
      <TextInput style={styles.input} value={formData.category || ''} onChangeText={text => updateFormData('category', text)} placeholder="e.g Technology, Marketing..." placeholderTextColor="#9CA3AF" />
    </View>
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Tags (optional)</Text>
      <TextInput
        style={styles.input}
        value={(formData.tags || []).join(', ')}
        onChangeText={text => updateFormData('tags', text)}
        placeholder="e.g React, JavaScript, AI"
        placeholderTextColor="#9CA3AF"
      />
    </View>
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Long description (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.longDescription || ''}
        onChangeText={text => updateFormData('longDescription', text)}
        placeholder="Write a detailed description of your community..."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={5}
      />
    </View>
  </View>
);

export default StepOne;