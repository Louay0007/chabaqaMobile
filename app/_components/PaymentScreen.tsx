import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Wallet, 
  PlusCircle, 
  CheckCircle2, 
  Shield,
  Zap,
  Package,
  Users,
} from 'lucide-react-native';
import { getAvatarUrl } from '@/lib/image-utils';
import { getExchangeRates, ExchangeRates } from '@/lib/wallet-api';

export interface PaymentScreenProps {
  // Content info
  contentType: 'challenge' | 'product' | 'community' | 'course' | 'session';
  title: string;
  description?: string;
  thumbnail?: string;
  creatorName?: string;
  creatorAvatar?: string;
  
  // Pricing
  price: number;
  currency?: string;
  
  // Wallet
  walletBalance: number;
  
  // Actions
  onBack: () => void;
  onPay: () => void;
  onTopUp: () => void;
  
  // State
  processing?: boolean;
}

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'challenge':
      return <Zap size={12} color="#9ca3af" />;
    case 'product':
      return <Package size={12} color="#9ca3af" />;
    case 'community':
      return <Users size={12} color="#9ca3af" />;
    default:
      return <Zap size={12} color="#9ca3af" />;
  }
};

const getContentTypeLabel = (type: string) => {
  switch (type) {
    case 'challenge':
      return 'CHALLENGE';
    case 'product':
      return 'DIGITAL PRODUCT';
    case 'community':
      return 'COMMUNITY';
    case 'course':
      return 'COURSE';
    case 'session':
      return 'SESSION';
    default:
      return 'CONTENT';
  }
};

export default function PaymentScreen({
  contentType,
  title,
  description,
  thumbnail,
  creatorName,
  creatorAvatar,
  price,
  currency = 'TND',
  walletBalance,
  onBack,
  onPay,
  onTopUp,
  processing = false,
}: PaymentScreenProps) {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ DT: 1, USD: 3.1, EUR: 3.4 });
  const [loadingRates, setLoadingRates] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Fetch exchange rates on mount
  useEffect(() => {
    const fetchRates = async () => {
      setLoadingRates(true);
      try {
        const rates = await getExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      } finally {
        setLoadingRates(false);
      }
    };
    fetchRates();
  }, []);

  // Convert price to TND
  const normalizedCurrency = currency?.toUpperCase() || 'TND';
  const needsConversion = normalizedCurrency !== 'TND' && normalizedCurrency !== 'DT';
  const exchangeRate = exchangeRates[normalizedCurrency as keyof ExchangeRates] || 1;
  const priceInTND = needsConversion ? Math.round(price * exchangeRate * 100) / 100 : price;
  
  const hasEnoughBalance = walletBalance >= priceInTND;
  const balanceAfter = walletBalance - priceInTND;
  
  // Process creator avatar URL - use getAvatarUrl for better handling
  const avatarUrl = getAvatarUrl(creatorAvatar);
  const hasValidAvatar = avatarUrl && avatarUrl.length > 0 && !avatarUrl.includes('undefined') && !avatarUrl.includes('null');
  
  // Get creator initials for fallback
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Content Info */}
        <View style={styles.contentInfo}>
          <View style={styles.avatarContainer}>
            {hasValidAvatar ? (
              <Image 
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials(creatorName)}</Text>
              </View>
            )}
          </View>
          <View style={styles.contentDetails}>
            <View style={styles.contentTypeRow}>
              {getContentTypeIcon(contentType)}
              <Text style={styles.contentTypeText}>{getContentTypeLabel(contentType)}</Text>
            </View>
            <Text style={styles.contentTitle} numberOfLines={2}>{title}</Text>
            {creatorName && (
              <Text style={styles.creatorName}>by {creatorName}</Text>
            )}
            {description && (
              <Text style={styles.contentDescription} numberOfLines={1}>{description}</Text>
            )}
          </View>
        </View>

        {/* Wallet Section */}
        <View style={styles.card}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIconBox}>
              <Wallet size={20} color="#111827" />
            </View>
            <Text style={styles.walletLabel}>YOUR WALLET</Text>
          </View>
          
          <Text style={styles.walletBalance}>{walletBalance.toFixed(2)}</Text>
          <Text style={styles.walletUnit}>POINTS</Text>
          
          <View style={styles.divider} />
          
          <TouchableOpacity onPress={onTopUp} style={styles.topUpLink}>
            <PlusCircle size={16} color="#9ca3af" />
            <Text style={styles.topUpText}>Top Up Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PAYMENT SUMMARY</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Original Price</Text>
            <Text style={styles.summaryValue}>{price} {normalizedCurrency}</Text>
          </View>
          
          {needsConversion && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Converted to TND</Text>
              <Text style={styles.summaryValueCyan}>
                {loadingRates ? '...' : `${priceInTND.toFixed(2)} DT`}
              </Text>
            </View>
          )}
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Your Balance</Text>
            <Text style={styles.summaryValueCyan}>{walletBalance.toFixed(2)} DT</Text>
          </View>
          
          <View style={styles.dividerLight} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelBold}>Balance After</Text>
            <Text style={[
              styles.summaryValueBold,
              { color: hasEnoughBalance ? '#22d3ee' : '#ef4444' }
            ]}>
              {hasEnoughBalance ? balanceAfter.toFixed(2) : '0.00'} DT
            </Text>
          </View>
          
          {needsConversion && (
            <Text style={styles.conversionNote}>
              💱 Exchange rate: 1 {normalizedCurrency} = {exchangeRate.toFixed(2)} TND
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {hasEnoughBalance ? (
          <TouchableOpacity
            onPress={onPay}
            disabled={processing}
            style={[styles.payButton, processing && styles.payButtonDisabled]}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#111827" />
            ) : (
              <>
                <CheckCircle2 size={20} color="#111827" />
                <Text style={styles.payButtonText}>Pay with Wallet</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onTopUp} style={styles.topUpButton}>
            <PlusCircle size={20} color="#ffffff" />
            <Text style={styles.topUpButtonText}>Top Up Wallet</Text>
          </TouchableOpacity>
        )}
        
        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Shield size={14} color="#6b7280" />
          <Text style={styles.securityText}>
            Your payment is secure. Points will be deducted instantly and access granted immediately.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  safeArea: {
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374151',
    overflow: 'hidden',
  },
  avatar: {
    width: 48,
    height: 48,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
  },
  avatarInitials: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  contentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  contentTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentTypeText: {
    color: '#9ca3af',
    fontSize: 11,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  contentTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  creatorName: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 2,
  },
  contentDescription: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 12,
    letterSpacing: 1,
  },
  walletBalance: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '700',
    marginTop: 16,
  },
  walletUnit: {
    color: '#6b7280',
    fontSize: 12,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 16,
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 12,
  },
  topUpLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topUpText: {
    color: '#9ca3af',
    fontSize: 14,
    marginLeft: 8,
  },
  cardTitle: {
    color: '#9ca3af',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryValueCyan: {
    color: '#22d3ee',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryLabelBold: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: '600',
  },
  conversionNote: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomSection: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 30,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 30,
  },
  topUpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  securityText: {
    color: '#6b7280',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
    textAlign: 'center',
  },
});
