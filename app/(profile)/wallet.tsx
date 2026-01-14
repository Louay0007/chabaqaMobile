import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/use-auth';
import {
  getWalletSummary,
  WalletSummary,
  WalletTransaction,
  TopUpRequest,
  formatAmount,
  getStatusLabel,
} from '@/lib/wallet-api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - 60) * 0.56;

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'pending'>('transactions');
  const { user } = useAuth();

  const loadWalletData = useCallback(async () => {
    try {
      const data = await getWalletSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Error loading wallet:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadWalletData();
  }, [loadWalletData]);

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      topup: 'Top Up',
      purchase: 'Purchase',
      refund: 'Refund',
      transfer: 'Transfer',
      withdrawal: 'Withdrawal',
    };
    return labels[type] || type;
  };

  const renderTransaction = ({ item }: { item: WalletTransaction }) => {
    const isCredit = item.amount >= 0;
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={styles.transactionIconBox}>
            <Ionicons
              name={isCredit ? 'arrow-down' : 'arrow-up'}
              size={16}
              color="#fff"
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>
              {item.description || getTransactionTypeLabel(item.type)}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, { opacity: isCredit ? 1 : 0.6 }]}>
          {isCredit ? '+' : ''}{item.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  const renderPendingTopUp = ({ item }: { item: TopUpRequest }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={styles.transactionIconBox}>
          <Ionicons name="time-outline" size={16} color="#fff" />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>
            {item.originalAmount} {item.originalCurrency}
          </Text>
          <Text style={styles.transactionDate}>
            ≈ {item.amountDT.toFixed(2)} pts
          </Text>
        </View>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
      </View>
    </View>
  );

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'transactions' ? (summary?.recentTransactions || []) : (summary?.pendingTopUps || [])}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }: { item: any }) => 
          activeTab === 'transactions' ? renderTransaction({ item }) : renderPendingTopUp({ item })
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        ListHeaderComponent={
          <>
            {/* Balance Section - Card Left, Balance Right */}
            <View style={styles.balanceSection}>
              {/* Card Image */}
              <View style={styles.cardWrapper}>
                <Image
                  source={require('@/assets/images/card.png')}
                  style={styles.cardImage}
                />
              </View>

              {/* Balance Info */}
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>
                  {(summary?.balance || 0).toLocaleString('en-US', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </Text>
                <Text style={styles.balanceUnit}>POINTS</Text>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/(profile)/topup')}
              >
                <View style={styles.actionIconBox}>
                  <Ionicons name="add" size={22} color="#000" />
                </View>
                <Text style={styles.actionLabel}>Top Up</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/(communities)')}
              >
                <View style={styles.actionIconBox}>
                  <Ionicons name="bag-outline" size={20} color="#000" />
                </View>
                <Text style={styles.actionLabel}>Shop</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={onRefresh}
              >
                <View style={styles.actionIconBox}>
                  <Ionicons name="refresh-outline" size={20} color="#000" />
                </View>
                <Text style={styles.actionLabel}>Refresh</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIconBox}>
                  <Ionicons name="stats-chart-outline" size={20} color="#000" />
                </View>
                <Text style={styles.actionLabel}>Stats</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatAmount(summary?.stats?.totalTopUp || 0)}</Text>
                <Text style={styles.statLabel}>Total In</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatAmount(summary?.stats?.totalSpent || 0)}</Text>
                <Text style={styles.statLabel}>Total Out</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{summary?.stats?.transactionCount || 0}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'transactions' && styles.tabActive]}
                onPress={() => setActiveTab('transactions')}
              >
                <Text style={[styles.tabText, activeTab === 'transactions' && styles.tabTextActive]}>
                  History
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
                onPress={() => setActiveTab('pending')}
              >
                <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
                  Pending
                </Text>
                {summary?.pendingTopUps && summary.pendingTopUps.length > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{summary.pendingTopUps.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={activeTab === 'transactions' ? 'receipt-outline' : 'time-outline'}
              size={40}
              color="#444"
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'transactions' ? 'No transactions yet' : 'No pending requests'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'transactions'
                ? 'Your activity will appear here'
                : 'Top up requests will appear here'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    paddingBottom: 100,
  },
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 8,
  },
  cardWrapper: {
    width: CARD_SIZE,
    height: CARD_SIZE * 0.7,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  balanceInfo: {
    flex: 1,
    marginLeft: 20,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -1,
  },
  balanceUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 2,
    marginTop: 4,
    marginBottom: 12,
  },
  userName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  tabBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});
