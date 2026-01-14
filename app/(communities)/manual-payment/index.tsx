import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdaptiveColors } from '@/hooks/useAdaptiveColors';
import {
  getCommunityForPayment,
  submitManualPaymentProof,
  getProductForPayment,
  submitManualProductPaymentProof,
  formatPrice,
} from '@/lib/manual-payment-api';
import { getImageUrl } from '@/lib/image-utils';
import Avatar from '@/app/(communities)/_components/Avatar';
import { setSecureItem } from '@/lib/secure-storage';

export default function ManualPaymentPage() {
  const { communityId, productId, contentType } = useLocalSearchParams<{ communityId?: string; productId?: string; contentType?: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [community, setCommunity] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [proofFile, setProofFile] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const adaptiveColors = useAdaptiveColors();

  useEffect(() => {
    loadCommunityDetails();
  }, [communityId, productId, contentType]);

  const loadCommunityDetails = async () => {
    try {
      setLoading(true);
      if ((contentType || 'community') === 'product') {
        const result = await getProductForPayment(String(productId || ''));
        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          Alert.alert('Error', 'Failed to load product details');
          router.back();
        }
      } else {
        const result = await getCommunityForPayment(String(communityId || ''));
        if (result.success && result.data) {
          setCommunity(result.data);
        } else {
          Alert.alert('Error', 'Failed to load community details');
          router.back();
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load community details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handlePickProof = async () => {
    try {
      if (submittedOrderId) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets?.[0];
        if (asset?.uri) {
          setProofFile(asset);
        } else {
          Alert.alert('Error', 'Failed to read selected image');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!proofFile) {
      Alert.alert('Required', 'Please upload a payment proof');
      return;
    }

    if (submitting || submittedOrderId) {
      return;
    }

    try {
      setSubmitting(true);
      const result = (contentType || 'community') === 'product'
        ? await submitManualProductPaymentProof(String(productId || ''), proofFile, promoCode || undefined)
        : await submitManualPaymentProof(String(communityId || ''), proofFile, promoCode || undefined);

      if (result?.orderId) {
        setSubmittedOrderId(result.orderId);
        const key = (contentType || 'community') === 'product'
          ? `pending_product_order_${String(productId || '')}`
          : `pending_community_order_${String(communityId || '')}`;
        await setSecureItem(key, String(result.orderId));
      }

      Alert.alert(
        'Payment Submitted',
        'Your payment proof has been submitted for verification. The creator will review it and approve your access.',
        [
          { text: 'OK' },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit payment proof');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: adaptiveColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8e78fb" />
          <Text style={[styles.loadingText, { color: adaptiveColors.secondaryText }]}>
            Loading payment details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!community) {
    if ((contentType || 'community') !== 'product' || !product) return null;
  }

  const creator = (contentType || 'community') === 'product' ? (product?.creator || {}) : (community.createur || {});
  const bankDetails = creator.bankDetails || {};
  const price = (contentType || 'community') === 'product' ? (product?.price || 0) : (community.fees_of_join || 0);
  const priceType = (contentType || 'community') === 'product' ? 'paid' : (community.priceType || 'paid');

  const creatorAvatarRaw =
    creator.profile_picture ||
    creator.photo_profil ||
    creator.avatar ||
    creator.profilePicture ||
    creator.profilePictureUrl ||
    creator.profileImage ||
    null;

  const creatorAvatarUrl = creatorAvatarRaw ? getImageUrl(creatorAvatarRaw) : '';

  // Generate random banking details if not provided
  const getBankName = () => {
    const banks = [
      'Banque Internationale Arabe de Tunisie (BIAT)',
      'Société Tunisienne de Banque (STB)',
      'Banque Nationale Agricole (BNA)',
      'Banque de Tunisie (BT)',
      'Amen Bank',
      'Attijari Bank',
      'BFT (Banque de Financement et de Placement)',
      'QNB Tunisie',
      'Union Internationale de Banques (UIB)',
      'Zitouna Bank',
    ];
    return bankDetails.bankName || banks[Math.floor(Math.random() * banks.length)];
  };

  const getRIB = () => {
    if (bankDetails.rib) return bankDetails.rib;
    // Generate a random 20-digit RIB
    return Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join('');
  };

  const getOwnerName = () => {
    return bankDetails.ownerName || creator.name || 'Community Creator';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: adaptiveColors.background }]}>
      <View style={[styles.header, { backgroundColor: adaptiveColors.cardBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={adaptiveColors.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: adaptiveColors.primaryText }]}>
          Manual Payment
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Community Info */}
        <View style={[styles.card, { backgroundColor: adaptiveColors.cardBorder }]}>
          <View style={styles.communityHeader}>
            <Avatar
              uri={creatorAvatarUrl}
              name={creator.name || 'Creator'}
              size={60}
              style={styles.creatorAvatar}
            />
            <View style={styles.communityInfo}>
              <Text style={[styles.communityName, { color: adaptiveColors.primaryText }]}>
                {(contentType || 'community') === 'product' ? product.title : community.name}
              </Text>
              <Text style={[styles.creatorName, { color: adaptiveColors.secondaryText }]}>
                by {creator.name || 'Unknown Creator'}
              </Text>
              <Text style={[styles.communityDescription, { color: adaptiveColors.secondaryText }]}>
                {(contentType || 'community') === 'product'
                  ? (product.description || 'Purchase this product')
                  : (community.description || 'Join this amazing community')}
              </Text>
            </View>
          </View>
        </View>

        {submittedOrderId ? (
          <View style={[styles.card, { backgroundColor: adaptiveColors.cardBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={18} color="#f59e0b" />
              <Text style={[styles.cardTitle, { color: adaptiveColors.primaryText, marginBottom: 0, marginLeft: 10 }]}>
                Waiting for creator approval
              </Text>
            </View>
            <Text style={[styles.noticeText, { color: adaptiveColors.secondaryText, marginTop: 10 }]}>
              Order: {submittedOrderId}
            </Text>
            <Text style={[styles.noticeText, { color: adaptiveColors.secondaryText, marginTop: 6 }]}>
              Your payment proof was submitted successfully. Access will be granted once the creator approves.
            </Text>
          </View>
        ) : null}

        {/* Price Summary */}
        <View style={[styles.card, { backgroundColor: adaptiveColors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: adaptiveColors.primaryText }]}>
            Payment Summary
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: adaptiveColors.secondaryText }]}>
              Membership Fee
            </Text>
            <Text style={[styles.priceValue, { color: adaptiveColors.primaryText }]}>
              {formatPrice(price, priceType)}
            </Text>
          </View>
          {promoCode && (
            <View style={styles.promoRow}>
              <Text style={[styles.promoLabel, { color: adaptiveColors.secondaryText }]}>
                Promo Code Applied
              </Text>
              <Text style={[styles.promoValue, { color: '#10b981' }]}>
                {promoCode}
              </Text>
            </View>
          )}
        </View>

        {/* Banking Details */}
        <View style={[styles.card, { backgroundColor: adaptiveColors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: adaptiveColors.primaryText }]}>
            Transfer Details
          </Text>
          <View style={styles.bankDetails}>
            <View style={styles.bankRow}>
              <Ionicons name="person-outline" size={20} color="#8e78fb" style={styles.bankIcon} />
              <Text style={[styles.bankLabel, { color: adaptiveColors.secondaryText }]}>
                Account Owner:
              </Text>
              <Text style={[styles.bankValue, { color: adaptiveColors.primaryText }]}>
                {getOwnerName()}
              </Text>
            </View>
            <View style={styles.bankRow}>
              <Ionicons name="card-outline" size={20} color="#8e78fb" style={styles.bankIcon} />
              <Text style={[styles.bankLabel, { color: adaptiveColors.secondaryText }]}>
                Bank Name:
              </Text>
              <Text style={[styles.bankValue, { color: adaptiveColors.primaryText }]}>
                {getBankName()}
              </Text>
            </View>
            <View style={styles.bankRow}>
              <Ionicons name="key-outline" size={20} color="#8e78fb" style={styles.bankIcon} />
              <Text style={[styles.bankLabel, { color: adaptiveColors.secondaryText }]}>
                RIB:
              </Text>
              <Text style={[styles.bankValue, { color: adaptiveColors.primaryText }]}>
                {getRIB()}
              </Text>
            </View>
          </View>
          <View style={styles.noticeBox}>
            <Ionicons name="information-circle-outline" size={16} color="#f59e0b" />
            <Text style={[styles.noticeText, { color: adaptiveColors.secondaryText }]}>
              Please transfer the exact amount to the account above and upload the transfer proof below.
            </Text>
          </View>
        </View>

        {/* Payment Proof */}
        <View style={[styles.card, { backgroundColor: adaptiveColors.cardBorder, opacity: submittedOrderId ? 0.6 : 1 }]}>
          <Text style={[styles.cardTitle, { color: adaptiveColors.primaryText }]}>
            Upload Payment Proof
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickProof}
            disabled={!!submittedOrderId}
          >
            {proofFile ? (
              <>
                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                <Text style={[styles.uploadButtonText, { color: '#10b981' }]}>
                  Proof Selected
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={32} color="#8e78fb" />
                <Text style={[styles.uploadButtonText, { color: '#8e78fb' }]}>
                  Upload Proof
                </Text>
              </>
            )}
          </TouchableOpacity>
          {proofFile && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: proofFile.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setProofFile(null)}
              >
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Optional Notes */}
        <View style={[styles.card, { backgroundColor: adaptiveColors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: adaptiveColors.primaryText }]}>
            Notes (Optional)
          </Text>
          <TextInput
            style={[styles.notesInput, { 
              backgroundColor: adaptiveColors.inputBackground, 
              color: adaptiveColors.primaryText,
              borderColor: adaptiveColors.inputBorder 
            }]}
            placeholder="Add any notes for the creator..."
            placeholderTextColor={adaptiveColors.secondaryText}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Promo Code */}
        <View style={[styles.card, { backgroundColor: adaptiveColors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: adaptiveColors.primaryText }]}>
            Promo Code (Optional)
          </Text>
          <TextInput
            style={[styles.promoInput, { 
              backgroundColor: adaptiveColors.inputBackground, 
              color: adaptiveColors.primaryText,
              borderColor: adaptiveColors.inputBorder 
            }]}
            placeholder="Enter promo code..."
            placeholderTextColor={adaptiveColors.secondaryText}
            value={promoCode}
            onChangeText={setPromoCode}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { opacity: submitting ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={submitting || !proofFile || !!submittedOrderId}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="send-outline" size={20} color="#fff" style={styles.submitIcon} />
              <Text style={styles.submitButtonText}>
                {submittedOrderId ? 'Submitted' : 'Submit Payment Proof'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info Notice */}
        <View style={styles.infoNotice}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#8e78fb" />
          <Text style={[styles.infoNoticeText, { color: adaptiveColors.secondaryText }]}>
            Your payment will be verified by the creator. Once approved, you'll get full access to the community.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  creatorAvatar: {
    borderWidth: 2,
    borderColor: '#8e78fb',
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 14,
    marginBottom: 4,
  },
  communityDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8e78fb',
  },
  promoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  promoLabel: {
    fontSize: 14,
  },
  promoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  bankDetails: {
    gap: 16,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankIcon: {
    width: 24,
  },
  bankLabel: {
    fontSize: 14,
    flex: 1,
  },
  bankValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    marginTop: 8,
  },
  noticeText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#8e78fb',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    position: 'relative',
    marginTop: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  promoInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8e78fb',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 16,
  },
  submitIcon: {},
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    marginBottom: 24,
  },
  infoNoticeText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
});
