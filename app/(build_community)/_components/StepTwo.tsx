import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { FlatList, Modal, Text, TextInput, TouchableOpacity, View, Switch, ScrollView } from 'react-native';
import { 
  Globe, Lock, Users, DollarSign, ChevronDown, Check, 
  CreditCard, Calendar, Repeat, Gift, Percent, Clock
} from 'lucide-react-native';
import styles from '../styles';

interface PricingConfig {
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
}

interface StepTwoProps {
  formData: {
    status: 'public' | 'private';
    joinFee: 'free' | 'paid';
    feeAmount: string;
    pricing?: PricingConfig;
  };
  updateFormData: (field: string, value: string | PricingConfig) => void;
  selectedCurrency: 'USD' | 'TND' | 'EUR';
  setSelectedCurrency: (currency: 'USD' | 'TND' | 'EUR') => void;
  showCurrencyModal: boolean;
  setShowCurrencyModal: (show: boolean) => void;
  currencies: Array<{ code: 'USD' | 'TND' | 'EUR'; name: string; symbol: string; }>;
}

const priceTypes = [
  { id: 'free', label: 'Free', description: 'No payment required', icon: Gift, colors: ['#10B981', '#059669'] },
  { id: 'one-time', label: 'One-Time', description: 'Single payment to join', icon: CreditCard, colors: ['#3b82f6', '#2563eb'] },
  { id: 'monthly', label: 'Monthly', description: 'Recurring monthly subscription', icon: Calendar, colors: ['#8B5CF6', '#7C3AED'] },
  { id: 'yearly', label: 'Yearly', description: 'Annual subscription (save more)', icon: Repeat, colors: ['#f59e0b', '#d97706'] },
];

const StepTwo = ({ 
  formData, 
  updateFormData, 
  selectedCurrency, 
  setSelectedCurrency, 
  showCurrencyModal, 
  setShowCurrencyModal, 
  currencies 
}: StepTwoProps) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Initialize pricing config
  const pricing: PricingConfig = formData.pricing || {
    price: 0,
    currency: selectedCurrency,
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
  };

  const updatePricing = (updates: Partial<PricingConfig>) => {
    const newPricing = { ...pricing, ...updates };
    
    // Auto-set isRecurring based on priceType
    if (updates.priceType) {
      newPricing.isRecurring = updates.priceType === 'monthly' || updates.priceType === 'yearly';
      if (updates.priceType === 'monthly') {
        newPricing.recurringInterval = 'month';
      } else if (updates.priceType === 'yearly') {
        newPricing.recurringInterval = 'year';
      }
    }
    
    // Update joinFee based on priceType
    if (updates.priceType === 'free') {
      updateFormData('joinFee', 'free');
      newPricing.price = 0;
    } else {
      updateFormData('joinFee', 'paid');
    }
    
    updateFormData('pricing', newPricing);
    updateFormData('feeAmount', String(newPricing.price));
  };

  const updatePaymentOptions = (updates: Partial<PricingConfig['paymentOptions']>) => {
    updatePricing({
      paymentOptions: { ...pricing.paymentOptions, ...updates },
    });
  };

  const isPaid = pricing.priceType !== 'free';

  return (
    <>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Community Settings</Text>
        <Text style={styles.stepSubtitle}>Configure your community access and pricing.</Text>
        
        {/* Community Status */}
        <Text style={styles.sectionTitle}>Community Status</Text>
        <View style={styles.optionSection}>
          <TouchableOpacity 
            style={[styles.optionCard, formData.status === 'public' && styles.optionCardSelected]} 
            onPress={() => updateFormData('status', 'public')}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconContainer}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.optionIcon}>
                <Globe size={24} color="#ffffff" />
              </LinearGradient>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Public</Text>
              <Text style={styles.optionDescription}>Anyone can find and join</Text>
            </View>
            <View style={[styles.radioButton, formData.status === 'public' && styles.radioButtonSelected]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionCard, formData.status === 'private' && styles.optionCardSelected]} 
            onPress={() => updateFormData('status', 'private')}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconContainer}>
              <LinearGradient colors={['#EC4899', '#DB2777']} style={styles.optionIcon}>
                <Lock size={24} color="#ffffff" />
              </LinearGradient>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Private</Text>
              <Text style={styles.optionDescription}>Only invited members can join</Text>
            </View>
            <View style={[styles.radioButton, formData.status === 'private' && styles.radioButtonSelected]} />
          </TouchableOpacity>
        </View>
        
        {/* Pricing Type */}
        <Text style={styles.sectionTitle}>Pricing Model</Text>
        <View style={styles.optionSection}>
          {priceTypes.map((type) => {
            const IconComponent = type.icon;
            const isSelected = pricing.priceType === type.id;
            return (
              <TouchableOpacity 
                key={type.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]} 
                onPress={() => updatePricing({ priceType: type.id as PricingConfig['priceType'] })}
                activeOpacity={0.8}
              >
                <View style={styles.optionIconContainer}>
                  <LinearGradient colors={type.colors as [string, string]} style={styles.optionIcon}>
                    <IconComponent size={24} color="#ffffff" />
                  </LinearGradient>
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{type.label}</Text>
                  <Text style={styles.optionDescription}>{type.description}</Text>
                </View>
                <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Price Input - Only show if paid */}
        {isPaid && (
          <>
            <Text style={styles.sectionTitle}>
              {pricing.priceType === 'monthly' ? 'Monthly Price' : 
               pricing.priceType === 'yearly' ? 'Yearly Price' : 'Price'}
            </Text>
            <View style={styles.membershipFeeContainer}>
              <TouchableOpacity 
                style={styles.currencySelector} 
                onPress={() => setShowCurrencyModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.currencyText}>{selectedCurrency}</Text>
                <ChevronDown size={16} color="#9ca3af" />
              </TouchableOpacity>
              <TextInput 
                style={styles.feeInput} 
                value={String(pricing.price || '')} 
                onChangeText={text => {
                  const numValue = parseFloat(text) || 0;
                  updatePricing({ price: numValue });
                }} 
                placeholder="0" 
                placeholderTextColor="#6b7280" 
                keyboardType="numeric" 
              />
            </View>

            {/* Free Trial Days */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Free Trial</Text>
            <View style={[styles.optionCard, { flexDirection: 'column', alignItems: 'stretch' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={styles.optionIconContainer}>
                  <LinearGradient colors={['#22d3ee', '#06b6d4']} style={styles.optionIcon}>
                    <Clock size={24} color="#ffffff" />
                  </LinearGradient>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.optionTitle}>Free Trial Period</Text>
                  <Text style={styles.optionDescription}>Let users try before they pay</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TextInput 
                  style={[styles.feeInput, { flex: 1 }]} 
                  value={String(pricing.freeTrialDays || '')} 
                  onChangeText={text => {
                    const numValue = Math.min(30, Math.max(0, parseInt(text) || 0));
                    updatePricing({ freeTrialDays: numValue });
                  }} 
                  placeholder="0" 
                  placeholderTextColor="#6b7280" 
                  keyboardType="numeric" 
                />
                <Text style={{ color: '#9ca3af', fontSize: 14 }}>days (max 30)</Text>
              </View>
            </View>

            {/* Advanced Options Toggle */}
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginTop: 20,
                paddingVertical: 12,
              }}
              onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              <Percent size={16} color="#8e78fb" />
              <Text style={{ color: '#8e78fb', marginLeft: 8, fontWeight: '600' }}>
                {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Payment Options
              </Text>
              <ChevronDown 
                size={16} 
                color="#8e78fb" 
                style={{ 
                  marginLeft: 4,
                  transform: [{ rotate: showAdvancedOptions ? '180deg' : '0deg' }]
                }} 
              />
            </TouchableOpacity>

            {/* Advanced Payment Options */}
            {showAdvancedOptions && (
              <View style={{ marginTop: 12 }}>
                {/* Installments - Only for one-time payments */}
                {pricing.priceType === 'one-time' && (
                  <View style={[styles.optionCard, { marginBottom: 12 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>Allow Installments</Text>
                      <Text style={styles.optionDescription}>Let users pay in parts</Text>
                      {pricing.paymentOptions.allowInstallments && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 }}>
                          <TextInput 
                            style={[styles.feeInput, { width: 80 }]} 
                            value={String(pricing.paymentOptions.installmentCount || '')} 
                            onChangeText={text => {
                              const numValue = Math.min(12, Math.max(2, parseInt(text) || 2));
                              updatePaymentOptions({ installmentCount: numValue });
                            }} 
                            placeholder="3" 
                            placeholderTextColor="#6b7280" 
                            keyboardType="numeric" 
                          />
                          <Text style={{ color: '#9ca3af', fontSize: 14 }}>payments (2-12)</Text>
                        </View>
                      )}
                    </View>
                    <Switch
                      value={pricing.paymentOptions.allowInstallments}
                      onValueChange={(value) => updatePaymentOptions({ allowInstallments: value })}
                      trackColor={{ false: '#374151', true: '#8e78fb' }}
                      thumbColor="#ffffff"
                    />
                  </View>
                )}

                {/* Early Bird Discount */}
                <View style={[styles.optionCard, { marginBottom: 12, flexDirection: 'column', alignItems: 'stretch' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={styles.optionTitle}>Early Bird Discount</Text>
                      <Text style={styles.optionDescription}>Discount for early joiners</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 }}>
                    <TextInput 
                      style={[styles.feeInput, { flex: 1 }]} 
                      value={String(pricing.paymentOptions.earlyBirdDiscount || '')} 
                      onChangeText={text => {
                        const numValue = Math.min(100, Math.max(0, parseInt(text) || 0));
                        updatePaymentOptions({ earlyBirdDiscount: numValue });
                      }} 
                      placeholder="0" 
                      placeholderTextColor="#6b7280" 
                      keyboardType="numeric" 
                    />
                    <Text style={{ color: '#9ca3af', fontSize: 14 }}>% off</Text>
                  </View>
                </View>

                {/* Group Discount */}
                <View style={[styles.optionCard, { marginBottom: 12, flexDirection: 'column', alignItems: 'stretch' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={styles.optionTitle}>Group Discount</Text>
                      <Text style={styles.optionDescription}>Discount for group signups</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 }}>
                    <TextInput 
                      style={[styles.feeInput, { flex: 1 }]} 
                      value={String(pricing.paymentOptions.groupDiscount || '')} 
                      onChangeText={text => {
                        const numValue = Math.min(100, Math.max(0, parseInt(text) || 0));
                        updatePaymentOptions({ groupDiscount: numValue });
                      }} 
                      placeholder="0" 
                      placeholderTextColor="#6b7280" 
                      keyboardType="numeric" 
                    />
                    <Text style={{ color: '#9ca3af', fontSize: 14 }}>% off</Text>
                  </View>
                </View>

                {/* Member Discount */}
                <View style={[styles.optionCard, { flexDirection: 'column', alignItems: 'stretch' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={styles.optionTitle}>Member Discount</Text>
                      <Text style={styles.optionDescription}>Discount for existing members</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 }}>
                    <TextInput 
                      style={[styles.feeInput, { flex: 1 }]} 
                      value={String(pricing.paymentOptions.memberDiscount || '')} 
                      onChangeText={text => {
                        const numValue = Math.min(100, Math.max(0, parseInt(text) || 0));
                        updatePaymentOptions({ memberDiscount: numValue });
                      }} 
                      placeholder="0" 
                      placeholderTextColor="#6b7280" 
                      keyboardType="numeric" 
                    />
                    <Text style={{ color: '#9ca3af', fontSize: 14 }}>% off</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </View>

      {/* Currency Selection Modal */}
      <Modal visible={showCurrencyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)} activeOpacity={0.7}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={currencies}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.currencyOption,
                    selectedCurrency === item.code && styles.currencyOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedCurrency(item.code);
                    updatePricing({ currency: item.code });
                    setShowCurrencyModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.currencySymbol}>{item.symbol}</Text>
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyCode}>{item.code}</Text>
                    <Text style={styles.currencyName}>{item.name}</Text>
                  </View>
                  {selectedCurrency === item.code && (
                    <Check size={18} color="#22d3ee" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default StepTwo;
