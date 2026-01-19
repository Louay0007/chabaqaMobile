import AdaptiveStatusBar from '@/_components/AdaptiveStatusBar';
import BackButton from '@/_components/BackButton';
import { createCommunityAction } from '@/lib/build-community-api';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import StepOne from './_components/StepOne';
import Stepper from './_components/Stepper';
import StepThree from './_components/StepThree';
import StepTwo from './_components/StepTwo';
import Success from './_components/Success';
import styles from './styles';

/**
 * Pricing Configuration - Matches backend CommunityPricingDto
 */
type PricingConfig = {
  price: number;
  currency: 'USD' | 'TND' | 'EUR';
  priceType: 'free' | 'one-time' | 'monthly' | 'yearly';
  isRecurring: boolean;
  recurringInterval?: 'month' | 'year' | 'week';
  freeTrialDays: number;
  paymentOptions: {
    allowInstallments: boolean;
    installmentCount: number;
    earlyBirdDiscount: number;
    groupDiscount: number;
    memberDiscount: number;
  };
};

/**
 * Community Form Data - Matches backend CreateCommunityDto exactly
 */
type CommunityFormData = {
  // REQUIRED FIELDS
  name: string;
  country: string;
  status: 'public' | 'private';
  joinFee: 'free' | 'paid';
  feeAmount: string;
  currency: 'USD' | 'TND' | 'EUR';
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
  
  // OPTIONAL FIELDS
  bio: string;
  longDescription?: string;
  category?: string;
  type?: string;
  tags?: string[];
  coverImage?: string;
  
  // PRICING CONFIGURATION
  pricing?: PricingConfig;
};

export default function BuildCommunityScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    country: '',
    status: 'public',
    joinFee: 'free',
    feeAmount: '0',
    currency: 'TND',
    socialLinks: { 
      instagram: '', 
      tiktok: '', 
      facebook: '', 
      youtube: '', 
      linkedin: '', 
      website: '', 
      twitter: '', 
      discord: '', 
      behance: '', 
      github: '' 
    },
    bio: '',
    longDescription: '',
    category: '',
    type: 'community',
    tags: [],
    coverImage: '',
    pricing: {
      price: 0,
      currency: 'TND',
      priceType: 'free',
      isRecurring: false,
      freeTrialDays: 0,
      paymentOptions: {
        allowInstallments: false,
        installmentCount: 3,
        earlyBirdDiscount: 0,
        groupDiscount: 0,
        memberDiscount: 0,
      },
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [socialLinkErrors, setSocialLinkErrors] = useState<Record<string, string>>({});
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'TND' | 'EUR'>('TND');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const currencies: Array<{ code: 'USD' | 'TND' | 'EUR'; name: string; symbol: string }> = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت' },
    { code: 'EUR', name: 'Euro', symbol: '€' }
  ];

  const updateFormData = (field: string, value: string | PricingConfig) => {
    if (field === 'pricing') {
      setFormData(prev => ({ ...prev, pricing: value as PricingConfig }));
      return;
    }
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'socialLinks') {
        setFormData(prev => ({
          ...prev,
          socialLinks: {
            ...prev.socialLinks,
            [child]: value as string
          }
        }));
        validateAndSetSocialLink(child, value as string);
      }
    } else if (field === 'tags') {
      const tags = (value as string).split(',').map(t => t.trim()).filter(Boolean);
      setFormData(prev => ({ ...prev, tags }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value } as CommunityFormData));
    }
  };

  const validateAndSetSocialLink = (platform: string | number, url: string) => {
    const platformStr = String(platform);
    if (url.trim() && !validateSocialLink(platformStr, url)) {
      setSocialLinkErrors(prev => ({ ...prev, [platformStr]: `Please enter a valid ${platformStr} URL or username` }));
    } else {
      setSocialLinkErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[platformStr];
        return newErrors;
      });
    }
  };

  const validateSocialLink = (platform: string, url: string) => {
    const regexMap = {
      instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?$|^@?[A-Za-z0-9._-]{1,30}$/,
      tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[A-Za-z0-9._-]+\/?$|^@?[A-Za-z0-9._-]{1,24}$/,
      facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/[A-Za-z0-9.\-]+\/?$/,
      youtube: /^(https?:\/\/)?(www\.)?youtube\.com\/(channel|c|user)\/[A-Za-z0-9._-]+\/?$/,
      linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9._-]+\/?$/,
      website: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      twitter: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]+\/?$|^@?[A-Za-z0-9_]{1,15}$/,
      discord: /^(https?:\/\/)?(www\.)?discord\.(gg|com\/invite)\/[A-Za-z0-9]+\/?$/,
      behance: /^(https?:\/\/)?(www\.)?behance\.net\/[A-Za-z0-9._-]+\/?$/,
      github: /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9._-]+\/?$/,
    } as const;
    const key = platform.toLowerCase() as keyof typeof regexMap;
    return !url.trim() || (regexMap[key]?.test(url.trim()) ?? false);
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1: 
        return formData.name.trim() !== '' && formData.country.trim() !== '';
      case 2: {
        // For paid pricing types, require a price > 0
        const pricing = formData.pricing;
        if (pricing && pricing.priceType !== 'free') {
          return pricing.price > 0;
        }
        return true;
      }
      case 3: {
        const hasAtLeastOneLink = Object.values(formData.socialLinks).some(link => link.trim() !== '');
        const hasNoErrors = Object.keys(socialLinkErrors).length === 0;
        return hasAtLeastOneLink && hasNoErrors;
      }
      default: 
        return false;
    }
  };

  const nextStep = () => canContinue() && currentStep < 3 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      currency: selectedCurrency,
      pricing: prev.pricing ? { ...prev.pricing, currency: selectedCurrency } : prev.pricing
    }));
  }, [selectedCurrency]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const hasAtLeastOneLink = Object.values(formData.socialLinks).some(link => link.trim() !== '');
      if (!hasAtLeastOneLink) {
        setError('At least one social link is required');
        setIsSubmitting(false);
        return;
      }

      // Prepare data with pricing configuration
      const pricing = formData.pricing;
      const dataToSubmit: CommunityFormData = { 
        ...formData, 
        joinFee: pricing?.priceType === 'free' ? 'free' : 'paid',
        feeAmount: pricing?.priceType === 'free' ? '0' : String(pricing?.price || 0),
        currency: selectedCurrency,
        pricing: pricing,
      };
      
      console.log('📤 Submitting community data:', JSON.stringify(dataToSubmit, null, 2));
      
      const result = await createCommunityAction(dataToSubmit, selectedImage || undefined, selectedCoverImage || undefined);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          try {
            router.push('/(communities)');
          } catch (error) {
            router.replace('/');
          }
        }, 2000);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagePicker = (imageUri: string) => setSelectedImage(imageUri);
  const handleCoverImagePicker = (imageUri: string) => {
    setSelectedCoverImage(imageUri);
    updateFormData('coverImage', imageUri);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <AdaptiveStatusBar />
      <View style={styles.background}>
        <View style={styles.safeAreaTop} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <BackButton onPress={() => router.back()} color="#000000" size={28} />
            {/* Chabaqa Logo - Top Right */}
            <Image
              source={require('@/assets/images/logo_chabaqa.png')}
              style={{ width: 72, height: 72, borderRadius: 16, position: 'absolute', right: 0, top: 0 }}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.card}>
            {!success ? (
              <View style={styles.form}>
                {error ? (
                  <View style={styles.errorMessage}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
                
                <Stepper currentStep={currentStep} />
                
                {currentStep === 1 && (
                  <StepOne 
                    formData={formData} 
                    updateFormData={updateFormData} 
                    selectedImage={selectedImage} 
                    handleImagePicker={handleImagePicker} 
                    selectedCoverImage={selectedCoverImage} 
                    handleCoverImagePicker={handleCoverImagePicker} 
                  />
                )}
                {currentStep === 2 && (
                  <StepTwo 
                    formData={formData} 
                    updateFormData={updateFormData} 
                    selectedCurrency={selectedCurrency} 
                    setSelectedCurrency={setSelectedCurrency} 
                    showCurrencyModal={showCurrencyModal} 
                    setShowCurrencyModal={setShowCurrencyModal} 
                    currencies={currencies} 
                  />
                )}
                {currentStep === 3 && (
                  <StepThree 
                    formData={formData} 
                    updateFormData={updateFormData} 
                    socialLinkErrors={socialLinkErrors} 
                  />
                )}
                
                <View style={styles.navigation}>
                  {currentStep > 1 && (
                    <TouchableOpacity 
                      style={styles.secondaryButton} 
                      onPress={prevStep} 
                      disabled={isSubmitting}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.secondaryButtonText}>Back</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    onPress={currentStep === 3 ? handleSubmit : nextStep} 
                    disabled={!canContinue() || isSubmitting}
                    activeOpacity={0.8}
                    style={{ flex: currentStep === 1 ? 1 : undefined }}
                  >
                    <LinearGradient 
                      colors={['#8e78fb', '#47c7ea']} 
                      start={{ x: 0, y: 0 }} 
                      end={{ x: 1, y: 0 }} 
                      style={[styles.primaryButton, (!canContinue() || isSubmitting) && styles.disabledButton]}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryButtonText}>
                          {currentStep === 3 ? 'Create Community' : 'Continue'}
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Success 
                communityName={formData.name}
                communityImage={selectedImage}
                communityCoverImage={selectedCoverImage}
                onGoToCommunities={() => {
                  setTimeout(() => {
                    try {
                      router.push('/(communities)');
                    } catch (error) {
                      router.replace('/');
                    }
                  }, 100);
                }}
              />
            )}
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 Chabaqa. Build the future of communities.</Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
