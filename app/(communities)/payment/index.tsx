import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getCommunityForPayment,
  getProductForPayment,
} from '@/lib/manual-payment-api';
import { getEventById } from '@/lib/event-api';
import {
  getWalletBalance,
  purchaseWithWallet,
  checkBalance,
  formatAmount,
  isFreeModeEnabled,
} from '@/lib/wallet-api';
import PaymentScreen from '@/app/_components/PaymentScreen';

export default function PaymentPage() {
  const { communityId, productId, eventId, ticketType, contentType } = useLocalSearchParams<{
    communityId?: string;
    productId?: string;
    eventId?: string;
    ticketType?: string;
    contentType?: string;
  }>();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [community, setCommunity] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [freeMode, setFreeMode] = useState<boolean | null>(null);
  const [autoProcessingFree, setAutoProcessingFree] = useState(false);

  const type = contentType || (productId ? 'product' : eventId ? 'event' : 'community');
  const price = type === 'product' 
    ? (product?.price || 0) 
    : type === 'event'
    ? (selectedTicket?.price || 0)
    : (community?.fees_of_join || 0);

  useEffect(() => {
    loadData();
  }, [communityId, productId, eventId, contentType]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (type === 'event' && eventId) {
        console.log('🎉 [PAYMENT] Loading event:', eventId);
        const eventData = await getEventById(eventId);
        setEvent(eventData);
        
        // Find the selected ticket
        const ticket = eventData.tickets?.find((t: any) => t.type === ticketType);
        if (ticket) {
          setSelectedTicket(ticket);
          console.log('🎫 [PAYMENT] Ticket loaded:', ticket);
        } else {
          throw new Error('Selected ticket not found');
        }
      } else if (type === 'product' && productId) {
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

      const free = await isFreeModeEnabled();
      setFreeMode(free);
      // If FREE_MODE is enabled and we have the necessary data, auto-grant access
      if (free) {
        setAutoProcessingFree(true);
        await handlePayWithWallet();
        return;
      }
    } catch (error: any) {
      console.error('Error loading payment data:', error);
      Alert.alert('Error', error.message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithWallet = async () => {
    try {
      setProcessing(true);

      // Helper to extract clean MongoDB ObjectId from various formats
      const extractId = (value: any): string => {
        if (!value) return '';
        
        if (typeof value === 'string') {
          if (value.includes('ObjectId') || value.includes('{_id:')) {
            const match = value.match(/ObjectId\(['"]([a-f0-9]{24})['"]\)/i) || 
                          value.match(/['"]?([a-f0-9]{24})['"]?/);
            if (match && match[1]) {
              return match[1];
            }
          }
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

      if (type === 'event') {
        const creator = event?.creator;
        const rawCreatorId = event?.creatorId || (typeof creator === 'string' ? creator : (creator?._id || creator?.id || ''));
        creatorId = extractId(rawCreatorId);
        contentId = extractId(event?._id || event?.id || eventId || '');
        contentName = event?.title || 'Event';
      } else if (type === 'product') {
        const creator = product?.creator;
        const rawCreatorId = product?.creatorId || (typeof creator === 'string' ? creator : (creator?._id || creator?.id || ''));
        creatorId = extractId(rawCreatorId);
        contentId = extractId(product?._id || product?.id || productId || '');
        contentName = product?.title || 'Product';
      } else {
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
        const isFree = freeMode === true;
        Alert.alert(
          isFree ? 'Access granted for free 🎉' : 'Payment Successful! 🎉',
          type === 'event'
            ? isFree
              ? `You have successfully registered for "${contentName}" for free.`
              : `You have successfully registered for "${contentName}". Your new balance is ${formatAmount(result.newBalance)}.`
            : type === 'product' 
            ? isFree
              ? `You now have free access to "${contentName}".`
              : `You now have access to "${contentName}". Your new balance is ${formatAmount(result.newBalance)}.`
            : isFree
            ? 'You have successfully joined the community for free.'
            : `You have successfully joined the community. Your new balance is ${formatAmount(result.newBalance)}.`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (type === 'community' && community?.slug) {
                  router.replace(`/(community)/${community.slug}/home`);
                } else if (type === 'event') {
                  // Go back to event detail page
                  router.back();
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
      setAutoProcessingFree(false);
    }
  };

  if (loading || autoProcessingFree) {
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
  const isEvent = type === 'event';
  
  // Creator info
  const creatorObj = isEvent
    ? (typeof event?.creator === 'object' ? event?.creator : {})
    : isProduct 
    ? (typeof product?.creator === 'object' ? product?.creator : {}) 
    : (typeof community?.createur === 'object' ? community?.createur : {});
  
  const creatorAvatarRaw = creatorObj.profile_picture || creatorObj.photo_profil || creatorObj.avatar || null;
  const creatorName = creatorObj.name || 'Creator';
  
  // Content info
  const contentName = isEvent 
    ? event?.title 
    : isProduct 
    ? product?.title 
    : community?.name;
    
  const contentDescription = isEvent
    ? `${selectedTicket?.name || 'Ticket'} - ${selectedTicket?.description || event?.description}`
    : isProduct 
    ? product?.description 
    : community?.description;
  
  // Content image
  const contentImage = isEvent
    ? event?.image
    : isProduct && product?.images?.length > 0 
    ? product.images[0] 
    : null;

  return (
    <PaymentScreen
      contentType={isEvent ? 'event' : isProduct ? 'product' : 'community'}
      title={contentName || (isEvent ? 'Event' : isProduct ? 'Product' : 'Community')}
      description={contentDescription}
      thumbnail={contentImage}
      creatorName={creatorName}
      creatorAvatar={creatorAvatarRaw}
      price={price}
      currency="DT"
      walletBalance={walletBalance}
      freeMode={freeMode === true}
      onBack={() => router.back()}
      onPay={handlePayWithWallet}
      onTopUp={() => router.push('/(profile)/topup')}
      processing={processing}
    />
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
});
