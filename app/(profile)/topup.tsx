import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getExchangeRates,
  submitTopUpRequest,
  TopUpCurrency,
  ExchangeRates,
} from '@/lib/wallet-api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CURRENCIES: { value: TopUpCurrency; label: string; symbol: string }[] = [
  { value: 'DT', label: 'TND', symbol: 'DT' },
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'EUR', label: 'EUR', symbol: '€' },
];

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

const ADMIN_BANK_DETAILS = {
  bankName: 'BIAT - Banque Internationale Arabe de Tunisie',
  accountOwner: 'Chabaqa Platform',
  rib: '08 006 0001234567890 12',
};

export default function TopUpPage() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<TopUpCurrency>('DT');
  const [notes, setNotes] = useState('');
  const [proofFile, setProofFile] = useState<any>(null);
  const [rates, setRates] = useState<ExchangeRates>({ DT: 1, USD: 3.1, EUR: 3.4 });
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    loadExchangeRates();
  }, []);

  const loadExchangeRates = async () => {
    try {
      const fetchedRates = await getExchangeRates();
      setRates(fetchedRates);
    } catch (error) {
      console.error('Failed to load exchange rates:', error);
    }
  };

  const calculatePoints = (): number => {
    const amountNum = parseFloat(amount) || 0;
    if (currency === 'DT') return amountNum;
    return amountNum * (rates[currency] || 1);
  };

  const handlePickProof = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setProofFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleNext = () => {
    if (step === 1) {
      const amountNum = parseFloat(amount);
      if (!amountNum || amountNum <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!proofFile) {
      Alert.alert('Required', 'Please upload payment proof');
      return;
    }

    try {
      setSubmitting(true);
      await submitTopUpRequest(parseFloat(amount), currency, proofFile, notes);
      
      Alert.alert(
        '✅ Request Submitted Successfully',
        `Your top-up request for ${amount} ${selectedCurrency?.symbol} has been submitted.\n\n⏳ Your payment is now under review by our admin team. You will receive ${points.toFixed(2)} points once your payment is verified and approved.\n\nThis usually takes 24-48 hours.`,
        [{ 
          text: 'Got it', 
          onPress: () => router.back() 
        }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCurrency = CURRENCIES.find(c => c.value === currency);
  const points = calculatePoints();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => step > 1 ? setStep((step - 1) as 1 | 2) : router.back()} 
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Top Up</Text>
          <Text style={styles.headerStep}>Step {step} of 3</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Step 1: Amount */}
          {step === 1 && (
            <>
              <View style={styles.amountSection}>
                <Text style={styles.sectionLabel}>Enter Amount</Text>
                <View style={styles.amountInputRow}>
                  <Text style={styles.currencyPrefix}>{selectedCurrency?.symbol}</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={setAmount}
                    autoFocus
                  />
                </View>

                {/* Currency Toggle */}
                <View style={styles.currencyToggle}>
                  {CURRENCIES.map((c) => (
                    <TouchableOpacity
                      key={c.value}
                      style={[
                        styles.currencyButton,
                        currency === c.value && styles.currencyButtonActive,
                      ]}
                      onPress={() => setCurrency(c.value)}
                    >
                      <Text style={[
                        styles.currencyButtonText,
                        currency === c.value && styles.currencyButtonTextActive,
                      ]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Conversion */}
                {amount && parseFloat(amount) > 0 && (
                  <View style={styles.conversionBox}>
                    <Ionicons name="swap-horizontal" size={16} color="#6b7280" />
                    <Text style={styles.conversionText}>
                      You'll receive <Text style={styles.conversionValue}>{points.toFixed(2)}</Text> points
                    </Text>
                  </View>
                )}
              </View>

              {/* Quick Amounts */}
              <View style={styles.quickSection}>
                <Text style={styles.sectionLabel}>Quick Select</Text>
                <View style={styles.quickGrid}>
                  {QUICK_AMOUNTS.map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.quickButton,
                        amount === value.toString() && styles.quickButtonActive,
                      ]}
                      onPress={() => setAmount(value.toString())}
                    >
                      <Text style={[
                        styles.quickButtonText,
                        amount === value.toString() && styles.quickButtonTextActive,
                      ]}>
                        {value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Step 2: Bank Details */}
          {step === 2 && (
            <>
              <View style={styles.summarySection}>
                <Text style={styles.sectionLabel}>Order Summary</Text>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Amount</Text>
                    <Text style={styles.summaryValue}>{amount} {selectedCurrency?.symbol}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Points</Text>
                    <Text style={styles.summaryValueBold}>{points.toFixed(2)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.bankSection}>
                <Text style={styles.sectionLabel}>Transfer To</Text>
                <View style={styles.bankCard}>
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Bank</Text>
                    <Text style={styles.bankValue}>{ADMIN_BANK_DETAILS.bankName}</Text>
                  </View>
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Account</Text>
                    <Text style={styles.bankValue}>{ADMIN_BANK_DETAILS.accountOwner}</Text>
                  </View>
                  <View style={styles.bankRow}>
                    <View style={styles.ribContainer}>
                      <Text style={styles.bankLabel}>RIB</Text>
                      <Text style={styles.ribValue}>{ADMIN_BANK_DETAILS.rib}</Text>
                    </View>
                    <TouchableOpacity style={styles.copyButton}>
                      <Ionicons name="copy-outline" size={18} color="#111827" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.noticeBox}>
                  <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
                  <Text style={styles.noticeText}>
                    Transfer exactly {amount} {selectedCurrency?.symbol} to this account
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Step 3: Upload Proof */}
          {step === 3 && (
            <>
              <View style={styles.uploadSection}>
                <Text style={styles.sectionLabel}>Payment Proof</Text>
                <Text style={styles.sectionHint}>Upload a screenshot of your transfer</Text>

                <TouchableOpacity
                  style={[styles.uploadArea, proofFile && styles.uploadAreaDone]}
                  onPress={handlePickProof}
                >
                  {proofFile ? (
                    <View style={styles.uploadedPreview}>
                      <Image source={{ uri: proofFile.uri }} style={styles.uploadedImage} />
                      <View style={styles.uploadedOverlay}>
                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                        <Text style={styles.uploadedText}>Proof uploaded</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <View style={styles.uploadIconBox}>
                        <Ionicons name="cloud-upload-outline" size={28} color="#111827" />
                      </View>
                      <Text style={styles.uploadTitle}>Tap to upload</Text>
                      <Text style={styles.uploadHint}>JPG, PNG up to 10MB</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.notesSection}>
                <Text style={styles.sectionLabel}>Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add a note..."
                  placeholderTextColor="#666"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          {step < 3 ? (
            <TouchableOpacity
              style={[styles.primaryButton, (!amount || parseFloat(amount) <= 0) && styles.primaryButtonDisabled]}
              onPress={handleNext}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <Text style={styles.primaryButtonText}>
                {step === 1 ? 'Continue' : 'I\'ve Made the Transfer'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryButton, (!proofFile || submitting) && styles.primaryButtonDisabled]}
              onPress={handleSubmit}
              disabled={!proofFile || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Submit Request</Text>
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  headerStep: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#111827',
    borderRadius: 2,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  sectionHint: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: -12,
    marginBottom: 16,
  },
  amountSection: {
    marginBottom: 32,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  currencyPrefix: {
    fontSize: 32,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 52,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    minWidth: 100,
  },
  currencyToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  currencyButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  currencyButtonActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  currencyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  currencyButtonTextActive: {
    color: '#ffffff',
  },
  conversionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  conversionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  conversionValue: {
    fontWeight: '700',
    color: '#111827',
  },
  quickSection: {
    marginBottom: 32,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickButton: {
    width: (SCREEN_WIDTH - 40 - 20) / 3,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickButtonActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  quickButtonTextActive: {
    color: '#ffffff',
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  summaryValueBold: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  bankSection: {
    marginBottom: 24,
  },
  bankCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bankLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  bankValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  ribContainer: {
    flex: 1,
  },
  ribValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  uploadAreaDone: {
    borderStyle: 'solid',
    borderColor: '#111827',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  uploadIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 13,
    color: '#6b7280',
  },
  uploadedPreview: {
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
  },
  uploadedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  uploadedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#cbd5f5',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
