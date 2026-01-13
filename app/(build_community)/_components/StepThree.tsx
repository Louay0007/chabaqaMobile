import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { Instagram, Facebook, Youtube, Linkedin, Globe, Github } from 'lucide-react-native';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';
import styles from '../styles';

interface StepThreeProps {
  formData: {
    socialLinks: {
      instagram: string;
      tiktok: string;
      facebook: string;
      youtube: string;
      linkedin: string;
      website: string;
      twitter?: string;
      discord?: string;
      behance?: string;
      github?: string;
    };
  };
  updateFormData: (field: string, value: string) => void;
  socialLinkErrors: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
    website?: string;
    twitter?: string;
    discord?: string;
    behance?: string;
    github?: string;
  };
}

// TikTok icon component
const TikTokIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"
      fill="#ffffff"
    />
  </Svg>
);

// X (Twitter) icon component
const XIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      fill="#ffffff"
    />
  </Svg>
);

// Discord icon component
const DiscordIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
      fill="#ffffff"
    />
  </Svg>
);

// Behance icon component
const BehanceIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"
      fill="#ffffff"
    />
  </Svg>
);

const StepThree = ({ formData, updateFormData, socialLinkErrors }: StepThreeProps) => (
  <View style={styles.stepContent}>
    <Text style={styles.stepTitle}>Connect Your Social Media</Text>
    <Text style={styles.stepSubtitle}>Link your social accounts to help people find your community. At least one link is required.</Text>
    
    <View style={styles.socialLinksContainer}>
      {/* Instagram */}
      <View style={styles.socialLinkRow}>
        <View style={styles.socialIconContainer}>
          <LinearGradient colors={['#E1306C', '#C13584']} style={styles.socialIcon}>
            <Instagram size={22} color="#ffffff" />
          </LinearGradient>
        </View>
        <TextInput 
          style={[styles.socialInput, socialLinkErrors.instagram && styles.inputError]} 
          value={formData.socialLinks.instagram} 
          onChangeText={text => updateFormData('socialLinks.instagram', text)} 
          placeholder="Instagram username or URL" 
          placeholderTextColor="#6b7280" 
        />
      </View>
      {socialLinkErrors.instagram && <Text style={styles.errorText}>{socialLinkErrors.instagram}</Text>}
      
      {/* TikTok */}
      <View style={styles.socialLinkRow}>
        <View style={styles.socialIconContainer}>
          <LinearGradient colors={['#000000', '#000000']} style={styles.socialIcon}>
            <TikTokIcon />
          </LinearGradient>
        </View>
        <TextInput 
          style={[styles.socialInput, socialLinkErrors.tiktok && styles.inputError]} 
          value={formData.socialLinks.tiktok} 
          onChangeText={text => updateFormData('socialLinks.tiktok', text)} 
          placeholder="TikTok username or URL" 
          placeholderTextColor="#6b7280" 
        />
      </View>
      {socialLinkErrors.tiktok && <Text style={styles.errorText}>{socialLinkErrors.tiktok}</Text>}
      
      {/* Facebook */}
      <View style={styles.socialLinkRow}>
        <View style={styles.socialIconContainer}>
          <LinearGradient colors={['#1877F2', '#1565C0']} style={styles.socialIcon}>
            <Facebook size={22} color="#ffffff" />
          </LinearGradient>
        </View>
        <TextInput 
          style={[styles.socialInput, socialLinkErrors.facebook && styles.inputError]} 
          value={formData.socialLinks.facebook} 
          onChangeText={text => updateFormData('socialLinks.facebook', text)} 
          placeholder="Facebook page URL" 
          placeholderTextColor="#6b7280" 
        />
      </View>
      {socialLinkErrors.facebook && <Text style={styles.errorText}>{socialLinkErrors.facebook}</Text>}
      
      {/* YouTube */}
      <View style={styles.socialLinkRow}>
        <View style={styles.socialIconContainer}>
          <LinearGradient colors={['#FF0000', '#CC0000']} style={styles.socialIcon}>
            <Youtube size={22} color="#ffffff" />
          </LinearGradient>
        </View>
        <TextInput 
          style={[styles.socialInput, socialLinkErrors.youtube && styles.inputError]} 
          value={formData.socialLinks.youtube} 
          onChangeText={text => updateFormData('socialLinks.youtube', text)} 
          placeholder="YouTube channel URL" 
          placeholderTextColor="#6b7280" 
        />
      </View>
      {socialLinkErrors.youtube && <Text style={styles.errorText}>{socialLinkErrors.youtube}</Text>}
      
      {/* LinkedIn */}
      <View style={styles.socialLinkRow}>
        <View style={styles.socialIconContainer}>
          <LinearGradient colors={['#0077B5', '#005885']} style={styles.socialIcon}>
            <Linkedin size={22} color="#ffffff" />
          </LinearGradient>
        </View>
        <TextInput 
          style={[styles.socialInput, socialLinkErrors.linkedin && styles.inputError]} 
          value={formData.socialLinks.linkedin} 
          onChangeText={text => updateFormData('socialLinks.linkedin', text)} 
          placeholder="LinkedIn page URL" 
          placeholderTextColor="#6b7280" 
        />
      </View>
      {socialLinkErrors.linkedin && <Text style={styles.errorText}>{socialLinkErrors.linkedin}</Text>}
      
      {/* Website */}
      <View style={styles.socialLinkRow}>
        <View style={styles.socialIconContainer}>
          <LinearGradient colors={['#6B7280', '#4B5563']} style={styles.socialIcon}>
            <Globe size={22} color="#ffffff" />
          </LinearGradient>
        </View>
        <TextInput 
          style={[styles.socialInput, socialLinkErrors.website && styles.inputError]} 
          value={formData.socialLinks.website} 
          onChangeText={text => updateFormData('socialLinks.website', text)} 
          placeholder="Your website URL" 
          placeholderTextColor="#6b7280" 
        />
      </View>
      {socialLinkErrors.website && <Text style={styles.errorText}>{socialLinkErrors.website}</Text>}

      {/* X (Twitter) */}
      <View style={styles.socialLinkRow}>
        <View style={styles.socialIconContainer}>
          <LinearGradient colors={['#000000', '#000000']} style={styles.socialIcon}>
            <XIcon />
          </LinearGradient>
        </View>
        <TextInput 
          style={[styles.socialInput, socialLinkErrors.twitter && styles.inputError]} 
          value={formData.socialLinks.twitter || ''} 
          onChangeText={text => updateFormData('socialLinks.twitter', text)} 
          placeholder="X (Twitter) username or URL" 
          placeholderTextColor="#6b7280" 
        />
      </View>
      {socialLinkErrors.twitter && <Text style={styles.errorText}>{socialLinkErrors.twitter}</Text>}

      {/* Discord */}
      <View style={styles.socialLinkRow}>
        <View style={styles.socialIconContainer}>
          <LinearGradient colors={['#5865F2', '#4752C4']} style={styles.socialIcon}>
            <DiscordIcon />
          </LinearGradient>
        </View>
        <TextInput 
          style={[styles.socialInput, socialLinkErrors.discord && styles.inputError]} 
          value={formData.socialLinks.discord || ''} 
          onChangeText={text => updateFormData('socialLinks.discord', text)} 
          placeholder="Discord invite link" 
          placeholderTextColor="#6b7280" 
        />
      </View>
      {socialLinkErrors.discord && <Text style={styles.errorText}>{socialLinkErrors.discord}</Text>}

      {/* Behance */}
      <View style={styles.socialLinkRow}>
        <View style={styles.socialIconContainer}>
          <LinearGradient colors={['#1769FF', '#0057D9']} style={styles.socialIcon}>
            <BehanceIcon />
          </LinearGradient>
        </View>
        <TextInput 
          style={[styles.socialInput, socialLinkErrors.behance && styles.inputError]} 
          value={formData.socialLinks.behance || ''} 
          onChangeText={text => updateFormData('socialLinks.behance', text)} 
          placeholder="Behance profile URL" 
          placeholderTextColor="#6b7280" 
        />
      </View>
      {socialLinkErrors.behance && <Text style={styles.errorText}>{socialLinkErrors.behance}</Text>}

      {/* GitHub */}
      <View style={styles.socialLinkRow}>
        <View style={styles.socialIconContainer}>
          <LinearGradient colors={['#333333', '#24292e']} style={styles.socialIcon}>
            <Github size={22} color="#ffffff" />
          </LinearGradient>
        </View>
        <TextInput 
          style={[styles.socialInput, socialLinkErrors.github && styles.inputError]} 
          value={formData.socialLinks.github || ''} 
          onChangeText={text => updateFormData('socialLinks.github', text)} 
          placeholder="GitHub profile URL" 
          placeholderTextColor="#6b7280" 
        />
      </View>
      {socialLinkErrors.github && <Text style={styles.errorText}>{socialLinkErrors.github}</Text>}
    </View>
  </View>
);

export default StepThree;
