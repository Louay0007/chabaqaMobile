/**
 * Wallet API Integration
 * 
 * Provides functions to interact with wallet endpoints
 * Handles balance checking, top-up requests, and purchases
 */

import { tryEndpoints } from './http';
import { getAccessToken } from './auth';
import { Platform } from 'react-native';
import PlatformUtils from './platform-utils';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export type TopUpCurrency = 'DT' | 'USD' | 'EUR';
export type TopUpRequestStatus = 'pending' | 'approved' | 'rejected';
export type WalletTransactionType = 'topup' | 'purchase' | 'refund' | 'transfer' | 'withdrawal';

export interface ExchangeRates {
  DT: number;
  USD: number;
  EUR: number;
}

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface TopUpRequest {
  _id: string;
  userId: string;
  originalAmount: number;
  originalCurrency: TopUpCurrency;
  conversionRate: number;
  amountDT: number;
  status: TopUpRequestStatus;
  paymentProof: string;
  userNotes?: string;
  adminNotes?: string;
  reference: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  _id: string;
  userId: string;
  type: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  contentType?: string;
  contentId?: string;
  reference: string;
  createdAt: string;
}

export interface WalletSummary {
  balance: number;
  currency: string;
  stats: {
    totalTopUp: number;
    totalSpent: number;
    totalRefunded: number;
    transactionCount: number;
  };
  pendingTopUps: TopUpRequest[];
  recentTransactions: WalletTransaction[];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get live exchange rates
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const resp = await tryEndpoints<{
      success: boolean;
      data: { rates: ExchangeRates };
    }>('/api/wallet/exchange-rates', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000,
    });

    if (resp.status >= 200 && resp.status < 300) {
      return resp.data.data?.rates || { DT: 1, USD: 3.1, EUR: 3.4 };
    }

    throw new Error('Failed to fetch exchange rates');
  } catch (error: any) {
    console.error('💥 [WALLET] Error fetching exchange rates:', error);
    // Return fallback rates
    return { DT: 1, USD: 3.1, EUR: 3.4 };
  }
}

/**
 * Check if FREE_MODE is enabled on the backend
 * Used by the mobile app to adapt UI (e.g. hide payments, show "Join for free")
 */
export async function isFreeModeEnabled(): Promise<boolean> {
  try {
    const API_BASE_URL = PlatformUtils.getApiUrl();
    const freeModeCheckUrl = `${API_BASE_URL}/api/wallet/free-mode-check`;

    const response = await fetch(freeModeCheckUrl);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return !!data?.freeMode;
  } catch (error) {
    console.log('⚠️ [WALLET] Failed to check FREE_MODE, assuming disabled:', error);
    return false;
  }
}

/**
 * Get user's wallet balance
 */
export async function getWalletBalance(): Promise<WalletBalance> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const resp = await tryEndpoints<{
    success: boolean;
    data: WalletBalance;
  }>('/api/wallet/balance', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    timeout: 30000,
  });

  if (resp.status >= 200 && resp.status < 300) {
    return resp.data.data || { balance: 0, currency: 'DT' };
  }

  throw new Error('Failed to fetch wallet balance');
}

/**
 * Get wallet summary (balance, stats, recent transactions)
 */
export async function getWalletSummary(): Promise<WalletSummary> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const resp = await tryEndpoints<{
    success: boolean;
    data: WalletSummary;
  }>('/api/wallet/summary', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    timeout: 30000,
  });

  if (resp.status >= 200 && resp.status < 300) {
    return resp.data.data;
  }

  throw new Error('Failed to fetch wallet summary');
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(options?: {
  page?: number;
  limit?: number;
  type?: WalletTransactionType;
}): Promise<{ items: WalletTransaction[]; meta: any }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const params = new URLSearchParams();
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.type) params.append('type', options.type);

  const resp = await tryEndpoints<{
    success: boolean;
    data: WalletTransaction[];
    meta: any;
  }>(`/api/wallet/transactions?${params.toString()}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    timeout: 30000,
  });

  if (resp.status >= 200 && resp.status < 300) {
    return {
      items: resp.data.data || [],
      meta: resp.data.meta,
    };
  }

  throw new Error('Failed to fetch transaction history');
}

/**
 * Submit a top-up request
 */
export async function submitTopUpRequest(
  amount: number,
  currency: TopUpCurrency,
  proofFile: any,
  notes?: string,
): Promise<{ success: boolean; message: string; data: TopUpRequest }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  formData.append('amount', String(amount));
  formData.append('currency', currency);
  if (notes) formData.append('notes', notes);

  // Handle proof file
  const asset = (proofFile?.assets?.[0] || proofFile) as any;
  const uri: string | undefined = asset?.uri;

  if (!uri) {
    throw new Error('Payment proof is required');
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
  const uploadUrl = `${API_BASE_URL}/api/wallet/topup`;

  console.log('📤 [WALLET] Submitting top-up request to:', uploadUrl);

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('❌ [WALLET] Top-up request failed:', uploadResponse.status, errorText);
    throw new Error(`Top-up request failed: ${uploadResponse.status}`);
  }

  const result = await uploadResponse.json();
  console.log('✅ [WALLET] Top-up request submitted:', result);

  return result;
}

/**
 * Get user's top-up request history
 */
export async function getTopUpHistory(options?: {
  page?: number;
  limit?: number;
  status?: TopUpRequestStatus;
}): Promise<{ items: TopUpRequest[]; meta: any }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const params = new URLSearchParams();
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.status) params.append('status', options.status);

  const resp = await tryEndpoints<{
    success: boolean;
    data: TopUpRequest[];
    meta: any;
  }>(`/api/wallet/topup/history?${params.toString()}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    timeout: 30000,
  });

  if (resp.status >= 200 && resp.status < 300) {
    return {
      items: resp.data.data || [],
      meta: resp.data.meta,
    };
  }

  throw new Error('Failed to fetch top-up history');
}

/**
 * Check if user has sufficient balance
 */
export async function checkBalance(amount: number): Promise<{
  hasSufficientBalance: boolean;
  currentBalance: number;
  requiredAmount: number;
  shortfall: number;
}> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const resp = await tryEndpoints<{
    success: boolean;
    data: {
      hasSufficientBalance: boolean;
      currentBalance: number;
      requiredAmount: number;
      shortfall: number;
    };
  }>(`/api/wallet/check-balance/${amount}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    timeout: 30000,
  });

  if (resp.status >= 200 && resp.status < 300) {
    return resp.data.data;
  }

  throw new Error('Failed to check balance');
}

/**
 * Purchase content with wallet
 * Automatically converts price to TND based on the content's currency
 */
export async function purchaseWithWallet(
  contentType: 'community' | 'course' | 'challenge' | 'event' | 'product' | 'session',
  contentId: string,
  amount: number,
  creatorId: string,
  description?: string,
  currency?: string,
): Promise<{ success: boolean; transaction: WalletTransaction; newBalance: number }> {
  // Check if FREE_MODE is enabled - if so, simulate successful purchase without actual payment
  const API_BASE_URL = PlatformUtils.getApiUrl();
  const freeModeCheckUrl = `${API_BASE_URL}/api/wallet/free-mode-check`;
  
  try {
    const freeModeResponse = await fetch(freeModeCheckUrl);
    const freeModeData = await freeModeResponse.json();
    
    if (freeModeData.freeMode === true) {
      console.log('💚 [WALLET] FREE MODE enabled - granting free access');
      
      // Return a mock successful transaction
      return {
        success: true,
        transaction: {
          _id: 'free-mode-transaction',
          userId: 'current-user',
          type: 'purchase',
          amount: 0,
          balanceBefore: 0,
          balanceAfter: 0,
          description: `Free access to ${contentType}`,
          contentType,
          contentId,
          reference: `FREE-${Date.now()}`,
          createdAt: new Date().toISOString(),
        } as any,
        newBalance: 0,
      };
    }
  } catch (error) {
    console.log('⚠️ [WALLET] Could not check FREE_MODE, proceeding with normal payment');
  }

  // Normal payment flow (when FREE_MODE is disabled)
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  // Convert amount to TND if currency is specified and not TND
  let amountInTND = amount;
  const contentCurrency = currency?.toUpperCase() || 'TND';
  
  if (contentCurrency !== 'TND' && contentCurrency !== 'DT' && amount > 0) {
    try {
      const rates = await getExchangeRates();
      // rates.USD = how many TND per 1 USD (e.g., 3.1)
      // rates.EUR = how many TND per 1 EUR (e.g., 3.4)
      const rate = rates[contentCurrency as keyof ExchangeRates] || 1;
      amountInTND = Math.round(amount * rate * 100) / 100; // Round to 2 decimals
      console.log(`💱 [WALLET] Converting ${amount} ${contentCurrency} to ${amountInTND} TND (rate: ${rate})`);
    } catch (error) {
      console.error('Failed to get exchange rates, using fallback:', error);
      // Fallback rates
      const fallbackRates: Record<string, number> = { USD: 3.1, EUR: 3.4, TND: 1, DT: 1 };
      const rate = fallbackRates[contentCurrency] || 1;
      amountInTND = Math.round(amount * rate * 100) / 100;
    }
  }

  const requestData = {
    contentType,
    contentId,
    amount: amountInTND, // Send converted amount in TND
    creatorId,
    description: description || `Purchase ${contentType} (${amount} ${contentCurrency})`,
  };

  console.log('📤 [WALLET] Purchase request:', requestData);

  const resp = await tryEndpoints<{
    success: boolean;
    message: string;
    data: {
      transaction: WalletTransaction;
      newBalance: number;
    };
  }>('/api/wallet/purchase', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: requestData,
    timeout: 30000,
  });

  console.log('📥 [WALLET] Purchase response:', resp.status, resp.data);

  if (resp.status >= 200 && resp.status < 300) {
    return {
      success: true,
      transaction: resp.data.data.transaction,
      newBalance: resp.data.data.newBalance,
    };
  }

  throw new Error(resp.data?.message || 'Purchase failed');
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency amount
 */
export function formatAmount(amount: number, currency: string = 'DT'): string {
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Get status color
 */
export function getStatusColor(status: TopUpRequestStatus): string {
  const colors: Record<TopUpRequestStatus, string> = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
  };
  return colors[status] || '#6b7280';
}

/**
 * Get status label
 */
export function getStatusLabel(status: TopUpRequestStatus): string {
  const labels: Record<TopUpRequestStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };
  return labels[status] || status;
}

/**
 * Get transaction type icon
 */
export function getTransactionIcon(type: WalletTransactionType): string {
  const icons: Record<WalletTransactionType, string> = {
    topup: 'add-circle',
    purchase: 'cart',
    refund: 'refresh-circle',
    transfer: 'swap-horizontal',
    withdrawal: 'arrow-down-circle',
  };
  return icons[type] || 'ellipse';
}

/**
 * Get transaction type color
 */
export function getTransactionColor(type: WalletTransactionType): string {
  const colors: Record<WalletTransactionType, string> = {
    topup: '#10b981',
    purchase: '#ef4444',
    refund: '#3b82f6',
    transfer: '#8b5cf6',
    withdrawal: '#f59e0b',
  };
  return colors[type] || '#6b7280';
}

export default {
  getExchangeRates,
  isFreeModeEnabled,
  getWalletBalance,
  getWalletSummary,
  getTransactionHistory,
  submitTopUpRequest,
  getTopUpHistory,
  checkBalance,
  purchaseWithWallet,
  formatAmount,
  getStatusColor,
  getStatusLabel,
  getTransactionIcon,
  getTransactionColor,
};
