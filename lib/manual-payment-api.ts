/**
 * Manual Payment API Integration
 * 
 * Provides functions to interact with manual payment endpoints for communities
 * Handles payment proof upload, verification status checking, and creator banking details
 * 
 * @module manual-payment-api
 */

import { tryEndpoints } from './http';
import { getAccessToken } from './auth';
import { Platform } from 'react-native';
import PlatformUtils from './platform-utils';
import { getUserById } from './user-api';
import { getProductById } from './product-api';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Creator banking details
 */
export interface CreatorBankDetails {
  rib: string;
  bankName?: string;
  ownerName?: string;
}

/**
 * Product with creator info for manual payment
 */
export interface ProductForPayment {
  id: string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  creator: {
    _id: string;
    name: string;
    email?: string;
    profile_picture?: string;
    photo_profil?: string;
    avatar?: string;
    bankDetails?: CreatorBankDetails;
  };
}

/**
 * Community with creator info for manual payment
 */
export interface CommunityForPayment {
  _id: string;
  id: string;
  name: string;
  description: string;
  fees_of_join: number;
  priceType: 'free' | 'paid' | 'monthly' | 'yearly' | 'hourly' | 'one-time';
  createur: {
    _id: string;
    name: string;
    email: string;
    profile_picture?: string;
    bankDetails?: CreatorBankDetails;
  };
}

/**
 * Manual payment request response
 */
export interface ManualPaymentRequest {
  success: boolean;
  message: string;
  orderId: string;
}

/**
 * Payment order status
 */
export type PaymentOrderStatus = 'pending_verification' | 'paid' | 'cancelled' | 'refunded';

/**
 * Payment order info
 */
export interface PaymentOrder {
  _id: string;
  orderId: string;
  buyerId: string;
  creatorId: string;
  communityId?: string;
  contentType: string;
  contentId: string;
  amountDT: number;
  creatorNetDT: number;
  status: PaymentOrderStatus;
  paymentMethod: string;
  paymentProof?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get community details with creator banking info for manual payment
 * 
 * @param communityId - Community ID
 * @returns Promise with community and creator details
 */
export async function getCommunityForPayment(
  communityId: string
): Promise<{ success: boolean; data: CommunityForPayment }> {
  try {
    console.log('💳 [MANUAL-PAYMENT] Fetching community for payment:', communityId);

    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const resp = await tryEndpoints<{
      success: boolean;
      data: CommunityForPayment;
    }>(`/api/community-aff-crea-join/${communityId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000,
    });

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [MANUAL-PAYMENT] Community details fetched');
      return { success: true, data: resp.data.data || resp.data };
    }

    throw new Error('Failed to fetch community details');
  } catch (error: any) {
    console.error('💥 [MANUAL-PAYMENT] Error fetching community:', error);
    throw new Error(error.message || 'Failed to fetch community details');
  }
}

/**
 * Get product details + creator banking info for manual payment
 */
export async function getProductForPayment(
  productId: string
): Promise<{ success: boolean; data: ProductForPayment }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const product: any = await getProductById(productId);

  const normalizeId = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return String(value._id || value.id || value.sub || '');
    }
    return String(value);
  };

  // Prefer populated creator object if present, otherwise fall back to creatorId
  const creatorFromProduct = product?.creator;
  const creatorId = normalizeId(creatorFromProduct?._id || creatorFromProduct?.id || product?.creatorId);

  const creator = creatorId ? await getUserById(creatorId).catch(() => null) : null;

  return {
    success: true,
    data: {
      id: String(product?.id || product?._id || productId),
      title: product?.title || 'Product',
      description: product?.description || '',
      price: Number(product?.price || 0),
      currency: product?.currency,
      creator: {
        _id: creatorId,
        name: (creatorFromProduct?.name || creator?.name || 'Creator') as string,
        email: creatorFromProduct?.email || creator?.email,
        profile_picture: (creatorFromProduct as any)?.profile_picture || (creator as any)?.profile_picture,
        photo_profil: (creatorFromProduct as any)?.photo_profil || (creator as any)?.photo_profil,
        avatar: (creatorFromProduct as any)?.avatar || (creator as any)?.avatar,
        bankDetails: (creator as any)?.bankDetails,
      },
    },
  };
}

/**
 * Submit manual payment proof for community membership
 * 
 * @param communityId - Community ID
 * @param proofFile - File object from image picker
 * @param promoCode - Optional promo code
 * @returns Promise with payment request result
 */
export async function submitManualPaymentProof(
  communityId: string,
  proofFile: any,
  promoCode?: string
): Promise<ManualPaymentRequest> {
  try {
    console.log('📤 [MANUAL-PAYMENT] Submitting payment proof for community:', communityId);

    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Create form data for multipart upload
    const formData = new FormData();
    formData.append('communityId', communityId);

    // Expo ImagePicker provides different shapes across platforms.
    // We expect either an asset object { uri, fileName?, name?, mimeType?, type? }
    // or an object containing assets[0].
    const asset = (proofFile?.assets?.[0] || proofFile) as any;
    const uri: string | undefined = asset?.uri;

    if (!uri) {
      throw new Error('Payment proof file is required');
    }

    const fileNameFromUri = () => {
      const last = uri.split('/').pop() || `proof_${Date.now()}`;
      return last.includes('.') ? last : `${last}.jpg`;
    };

    const name: string = asset?.fileName || asset?.name || fileNameFromUri();
    const mimeType: string = asset?.mimeType || asset?.type || 'image/jpeg';

    if (Platform.OS === 'web') {
      // Web: fetch blob and attach with filename
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('proof', blob, name);
    } else {
      // Native: React Native file object
      formData.append('proof', {
        uri,
        name,
        type: mimeType,
      } as any);
    }

    // Get the API base URL
    const API_BASE_URL = PlatformUtils.getApiUrl();
    const uploadUrl = `${API_BASE_URL}/api/payments/manual/init/community${promoCode ? `?promoCode=${promoCode}` : ''}`;

    console.log('📤 [MANUAL-PAYMENT] Uploading to:', uploadUrl);

    // Use fetch directly for multipart/form-data
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - fetch will set it automatically with boundary for FormData
      },
      body: formData,
    });

    console.log('📤 [MANUAL-PAYMENT] Response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ [MANUAL-PAYMENT] Upload failed:', uploadResponse.status, errorText);
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const result = await uploadResponse.json();
    console.log('✅ [MANUAL-PAYMENT] Payment proof submitted:', JSON.stringify(result, null, 2));

    return {
      success: result.success || true,
      message: result.message || 'Payment submitted for verification',
      orderId: result.orderId || result.order?._id,
    };
  } catch (error: any) {
    console.error('💥 [MANUAL-PAYMENT] Error submitting payment proof:', error);
    throw new Error(error.message || 'Failed to submit payment proof');
  }
}

/**
 * Submit manual payment proof for product purchase
 */
export async function submitManualProductPaymentProof(
  productId: string,
  proofFile: any,
  promoCode?: string
): Promise<ManualPaymentRequest> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  formData.append('productId', productId);

  const asset = (proofFile?.assets?.[0] || proofFile) as any;
  const uri: string | undefined = asset?.uri;
  if (!uri) {
    throw new Error('Payment proof file is required');
  }

  const fileNameFromUri = () => {
    const last = uri.split('/').pop() || `proof_${Date.now()}`;
    return last.includes('.') ? last : `${last}.jpg`;
  };

  const name: string = asset?.fileName || asset?.name || fileNameFromUri();
  const mimeType: string = asset?.mimeType || asset?.type || 'image/jpeg';

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('proof', blob, name);
  } else {
    formData.append('proof', {
      uri,
      name,
      type: mimeType,
    } as any);
  }

  const API_BASE_URL = PlatformUtils.getApiUrl();
  const uploadUrl = `${API_BASE_URL}/api/payments/manual/init/product${promoCode ? `?promoCode=${promoCode}` : ''}`;

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
  }

  const result = await uploadResponse.json();
  return {
    success: result.success || true,
    message: result.message || 'Payment submitted for verification',
    orderId: result.orderId || result.order?._id,
  };
}

/**
 * Check payment order status
 * 
 * @param orderId - Order ID
 * @returns Promise with order status
 */
export async function getPaymentOrderStatus(
  orderId: string
): Promise<PaymentOrder | null> {
  try {
    console.log('🔍 [MANUAL-PAYMENT] Checking order status:', orderId);

    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const resp = await tryEndpoints<{
      success: boolean;
      data: PaymentOrder;
    }>(`/api/payments/order/${orderId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000,
    });

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [MANUAL-PAYMENT] Order status:', resp.data.data?.status);
      return resp.data.data;
    }

    return null;
  } catch (error: any) {
    console.error('💥 [MANUAL-PAYMENT] Error checking order status:', error);
    return null;
  }
}

/**
 * Get pending manual payments for current user (creator view)
 * 
 * @returns Promise with pending payments
 */
export async function getPendingManualPayments(): Promise<PaymentOrder[]> {
  try {
    console.log('📋 [MANUAL-PAYMENT] Fetching pending payments');

    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const resp = await tryEndpoints<{
      success: boolean;
      data: PaymentOrder[];
    }>('/api/payments/manual/pending', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000,
    });

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [MANUAL-PAYMENT] Pending payments fetched:', resp.data.data?.length || 0);
      return resp.data.data || [];
    }

    return [];
  } catch (error: any) {
    console.error('💥 [MANUAL-PAYMENT] Error fetching pending payments:', error);
    return [];
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format price for display
 * 
 * @param price - Price amount
 * @param priceType - Price type
 * @returns Formatted price string
 */
export function formatPrice(price: number, priceType: string): string {
  if (priceType === 'free' || price === 0) {
    return 'Free';
  }

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);

  const suffix = {
    monthly: '/month',
    yearly: '/year',
    hourly: '/hour',
    oneTime: '',
    paid: '',
  }[priceType] || '';

  return `${formatted}${suffix}`;
}

/**
 * Get status label for payment order
 * 
 * @param status - Payment order status
 * @returns Formatted status label
 */
export function getPaymentStatusLabel(status: PaymentOrderStatus): string {
  const labels: Record<PaymentOrderStatus, string> = {
    pending_verification: 'Pending Verification',
    paid: 'Approved',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return labels[status] || status;
}

/**
 * Get status color for payment order
 * 
 * @param status - Payment order status
 * @returns Color hex code
 */
export function getPaymentStatusColor(status: PaymentOrderStatus): string {
  const colors: Record<PaymentOrderStatus, string> = {
    pending_verification: '#f59e0b', // orange
    paid: '#10b981', // green
    cancelled: '#ef4444', // red
    refunded: '#6b7280', // gray
  };
  return colors[status] || '#6b7280';
}

export default {
  getCommunityForPayment,
  getProductForPayment,
  submitManualPaymentProof,
  submitManualProductPaymentProof,
  getPaymentOrderStatus,
  getPendingManualPayments,
  formatPrice,
  getPaymentStatusLabel,
  getPaymentStatusColor,
};
