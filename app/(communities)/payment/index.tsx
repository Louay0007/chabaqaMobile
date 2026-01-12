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
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getCommunityForPayment,
  getProductForPayment,
  formatPrice,
} from '@/lib/manual-payment-api';
import {
  getWalletBalance,
  purchaseWithWallet,
  checkBalance,
  formatAmount,
} from '@/lib/wallet-api';
import { getImageUrl } from '@/lib/image-utils';
import Avatar from '@/app/(communities)/_components/Avatar';

export default function PaymentPage() {
  const { communityId, productId, contentType } = useLocalSearchParams<{
    communityId?: string;
    productId?: string;
    contentType?: string;
  }>();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [community, setCommunity] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [hasSufficientBalance, setHasSufficientBalance] = useState(false);

  const type = contentType || (productId ? 'product' : 'community');
  const price = type === 'product' ? (product?.price || 0) : (community?.fees_of_join || 0);

  useEffect(() => {
    loadData();
  }, [communityId, productId, contentType]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (type === 'product' && productId) {
        console.log('📦 [PAYMENT] Loading product:', productId);
        const result = await getProductForPayment(productId);
        if (result.success && result.data) {
          console.log('📦 [PAYMENT] Product loaded:', result.data);
          setProduct(result.data);
        }
      } else if (communityId) {
        console.log('🏠 [PAYMENT] Loading community:', communityId);
        const result = await getCommunityForPayment(communityId);
        if (result.success && result.data) {
          console.log('🏠 [PAYMENT] Community loaded:', result.data);
          setCommunity(result.data);
        }
      }

      const balance = await getWalletBalance();
      setWalletBalance(balance.balance);
    } catch (error: any) {
      console.error('Error loading payment data:', error);
      Alert.alert('Error', error.message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  // Re-check balance when price changes
  useEffect(() => {
    if (price > 0) {
      checkBalance(price).then(result => {
        setHasSufficientBalance(result.hasSufficientBalance);
      }).catch(console.error);
    } else {
      setHasSufficientBalance(true);
    }
  }, [price]);

  const handlePayWithWallet = async () => {
    if (!hasSufficientBalance) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${formatAmount(price)} but only have ${formatAmount(walletBalance)}. Would you like to top up your wallet?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Top Up', onPress: () => router.push('/(profile)/topup') },
        ]
      );
      return;
    }

    try {
      setProcessing(true);

      // Helper to extract clean MongoDB ObjectId from various formats
      const extractId = (value: any): string => {
        if (!value) return '';
        
        if (typeof value === 'string') {
          // Check if it's a stringified object like "{_id: new ObjectId('...')}"
          if (value.includes('ObjectId') || value.includes('{_id:')) {
            const match = value.match(/ObjectId\(['"]([a-f0-9]{24})['"]\)/i) || 
                          value.match(/['"]?([a-f0-9]{24})['"]?/);
            if (match && match[1]) {
              return match[1];
            }
          }
          // If it's a clean 24-char hex string, return it
          if (/^[a-f0-9]{24}$/i.test(value)) {
            return value;
          }
          return value;
        }
        
        if (typeof value === 'object') {
          const id = value._id || value.id || value.sub;
          if (id) return extractId(id);
        }
        
        return String(value);
      };

      let creatorId: string;
      let contentId: string;
      let contentName: string;

      if (type === 'product') {
        // For products: creatorId is stored as creatorId or in creator object
        const creator = product?.creator;
        const rawCreatorId = product?.creatorId || (typeof creator === 'string' ? creator : (creator?._id || creator?.id || ''));
        creatorId = extractId(rawCreatorId);
        // Use the product's _id or id field
        contentId = extractId(product?._id || product?.id || productId || '');
        contentName = product?.title || 'Product';
      } else {
        // For communities: createur field
        const createur = community?.createur;
        creatorId = extractId(typeof createur === 'string' ? createur : (createur?._id || createur?.id || ''));
        contentId = extractId(community?._id || communityId || '');
        contentName = community?.name || 'Community';
      }

      console.log('🔍 [PAYMENT] Purchase details:', {
        type,
        contentId,
        price,
        creatorId,
        product: product ? { id: product.id, _id: product._id, creatorId: product.creatorId } : null,
      });

      if (!creatorId || !contentId) {
        console.error('❌ [PAYMENT] Missing data:', { creatorId, contentId });
        throw new Error('Missing required information');
      }

      const result = await purchaseWithWallet(
        type as any,
        contentId,
        price,
        creatorId,
        `Purchase ${contentName}`
      );

      if (result.success) {
        Alert.alert(
          'Payment Successful! 🎉',
          type === 'product' 
            ? `You now have access to "${contentName}". Your new balance is ${formatAmount(result.newBalance)}.`
            : `You have successfully joined the community. Your new balance is ${formatAmount(result.newBalance)}.`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (type === 'community' && community?.slug) {
                  router.replace(`/(community)/${community.slug}/home`);
                } else {
                  router.back();
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('❌ [PAYMENT] Error:', error);
      Alert.alert('Payment Failed', error.message || 'Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Image
            source={require('@/assets/images/brandmark_chabaqa.png')}
            style={styles.loadingLogo}
          />
          <ActivityIndicator size="small" color="#fff" style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  // Get display info based on content type
  const isProduct = type === 'product';
  
  // Creator info
  const creatorObj = isProduct 
    ? (typeof product?.creator === 'object' ? product?.creator : {}) 
    : (typeof community?.createur === 'object' ? community?.createur : {});
  
  const creatorAvatarRaw = creatorObj.profile_picture || creatorObj.photo_profil || creatorObj.avatar || null;
  const creatorAvatarUrl = creatorAvatarRaw ? getImageUrl(creatorAvatarRaw) : '';
  const creatorName = creatorObj.name || 'Creator';
  
  // Content info
  const contentName = isProduct ? product?.title : community?.name;
  const contentDescription = isProduct ? product?.description : community?.description;
  const priceType = isProduct ? (product?.pricing?.priceType || 'one-time') : (community?.priceType || 'paid');
  
  // Product image (first image from array)
  const productImage = isProduct && product?.images?.length > 0 
    ? getImageUrl(product.images[0]) 
    : null;

  const shortfall = price - walletBalance;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Content Info Card */}
        <View style={styles.card}>
          {/* Product Image (if available) */}
          {productImage && (
            <Image
              source={{ uri: productImage }}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
          
          <View style={styles.contentHeader}>
            <Avatar
              uri={creatorAvatarUrl}
              name={creatorName}
              size={56}
              style={styles.creatorAvatar}
            />
            <View style={styles.contentInfo}>
              <View style={styles.contentTypeTag}>
                <Ionicons 
                  name={isProduct ? "cube-outline" : "people-outline"} 
                  size={12} 
                  color="#888" 
                />
                <Text style={styles.contentTypeText}>
                  {isProduct ? 'Digital Product' : 'Community'}
                </Text>
              </View>
              <Text style={styles.contentName} numberOfLines={2}>
                {contentName}
              </Text>
              <Text style={styles.creatorName}>
                by {creatorName}
              </Text>
              <Text style={styles.contentDescription} numberOfLines={2}>
                {contentDescription || 'No description'}
              </Text>
            </View>
          </View>
        </View>

        {/* Wallet Balance Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIconBox}>
              <Ionicons name="wallet-outline" size={20} color="#000" />
            </View>
            <Text style={styles.walletTitle}>Your Wallet</Text>
          </View>
          <Text style={styles.walletBalance}>
            {walletBalance.toLocaleString('en-US', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </Text>
          <Text style={styles.walletUnit}>POINTS</Text>
          <TouchableOpacity
            style={styles.topUpLink}
            onPress={() => router.push('/(profile)/topup')}
          >
            <Ionicons name="add-circle-outline" size={16} color="#888" />
            <Text style={styles.topUpLinkText}>Top Up Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price</Text>
            <Text style={styles.summaryValue}>{formatPrice(price, priceType)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Your Balance</Text>
            <Text style={[
              styles.summaryValue, 
              { color: walletBalance >= price ? '#10b981' : '#ef4444' }
            ]}>
              {formatAmount(walletBalance)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelBold}>
              {hasSufficientBalance ? 'Balance After' : 'Shortfall'}
            </Text>
            <Text style={[
              styles.summaryValueBold,
              { color: hasSufficientBalance ? '#10b981' : '#ef4444' }
            ]}>
              {hasSufficientBalance 
                ? formatAmount(walletBalance - price)
                : formatAmount(shortfall)
              }
            </Text>
          </View>
        </View>

        {/* Insufficient Balance Warning */}
        {!hasSufficientBalance && (
          <View style={styles.warningCard}>
            <Ionicons name="alert-circle" size={24} color="#f59e0b" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Insufficient Balance</Text>
              <Text style={styles.warningText}>
                You need {formatAmount(shortfall)} more to complete this purchase.
              </Text>
            </View>
          </View>
        )}

        {/* Pay Button */}
        <TouchableOpacity
          style={[
            styles.payButton,
            !hasSufficientBalance && styles.payButtonAlt,
            { opacity: processing ? 0.7 : 1 },
          ]}
          onPress={hasSufficientBalance ? handlePayWithWallet : () => router.push('/(profile)/topup')}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Ionicons 
                name={hasSufficientBalance ? "checkmark-circle" : "add-circle"} 
                size={20} 
                color="#000" 
              />
              <Text style={styles.payButtonText}>
                {hasSufficientBalance ? 'Pay with Wallet' : 'Top Up Wallet'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#666" />
          <Text style={styles.securityText}>
            Your payment is secure. Points will be deducted instantly and access granted immediately.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  creatorAvatar: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contentInfo: {
    flex: 1,
  },
  contentTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  contentTypeText: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  contentDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  walletCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  walletIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletTitle: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  walletBalance: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },
  walletUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 2,
    marginTop: 4,
  },
  topUpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  topUpLinkText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  summaryLabelBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#d97706',
    lineHeight: 18,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 16,
  },
  payButtonAlt: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  payButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 16,
    marginBottom: 40,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
