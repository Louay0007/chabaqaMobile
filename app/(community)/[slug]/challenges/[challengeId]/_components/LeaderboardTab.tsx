import { getCurrentUser } from '@/lib/user-api';
import { getImageUrl } from '@/lib/image-utils';
import { Award, CheckCircle, Crown, Medal, RefreshCw, Star, Trophy, TrendingUp, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LeaderboardResponse } from '@/lib/challenge-api';

interface LeaderboardTabProps {
  leaderboardData: LeaderboardResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fef3c7',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Crown size={18} color="#f59e0b" />
      </View>
    );
  }
  if (rank === 2) {
    return (
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Medal size={18} color="#6b7280" />
      </View>
    );
  }
  if (rank === 3) {
    return (
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fed7aa',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Award size={18} color="#ea580c" />
      </View>
    );
  }
  return (
    <View style={{
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#f9fafb',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600' }}>{rank}</Text>
    </View>
  );
}

export default function LeaderboardTab({ leaderboardData, loading, onRefresh }: LeaderboardTabProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then(user => {
      // User can have _id, id, or sub as their identifier
      const userId = user?._id || user?.id || user?.sub || null;
      console.log('👤 [LEADERBOARD] Current user ID:', userId);
      setCurrentUserId(userId);
    }).catch(() => {});
  }, []);

  if (loading && !leaderboardData) {
    return (
      <View style={{ flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ color: '#6b7280', marginTop: 12, fontSize: 14 }}>Loading leaderboard...</Text>
      </View>
    );
  }

  const leaderboard = leaderboardData?.leaderboard || [];
  const isEmpty = leaderboard.length === 0;

  return (
    <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
      {/* Card Container */}
      <View style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#f3f4f6',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Trophy size={22} color="#f59e0b" />
            <Text style={{ color: '#111827', fontSize: 18, fontWeight: '700', marginLeft: 10 }}>
              Leaderboard
            </Text>
          </View>
          <TouchableOpacity 
            onPress={onRefresh} 
            disabled={loading}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: '#f9fafb',
            }}
          >
            <RefreshCw size={18} color={loading ? '#d1d5db' : '#6b7280'} />
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        {isEmpty ? (
          <View style={{ padding: 48, alignItems: 'center' }}>
            <Users size={48} color="#d1d5db" />
            <Text style={{ color: '#374151', fontSize: 16, marginTop: 16, fontWeight: '600' }}>
              No participants yet
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4, textAlign: 'center' }}>
              Be the first to join this challenge!
            </Text>
          </View>
        ) : (
          /* Leaderboard List */
          <View>
            {leaderboard.map((entry, index) => {
              const isCurrentUser = currentUserId && (
                entry.userId === currentUserId || 
                entry.userId === currentUserId?.toString()
              );
              
              if (index === 0) {
                console.log('👤 [LEADERBOARD] Comparing:', { 
                  entryUserId: entry.userId, 
                  currentUserId,
                  isMatch: isCurrentUser 
                });
              }

              return (
                <View
                  key={entry.userId}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    paddingHorizontal: 16,
                    backgroundColor: isCurrentUser ? '#fffbeb' : '#ffffff',
                    borderBottomWidth: index < leaderboard.length - 1 ? 1 : 0,
                    borderBottomColor: '#f3f4f6',
                    borderLeftWidth: isCurrentUser ? 3 : 0,
                    borderLeftColor: '#f59e0b',
                  }}
                >
                  {/* Rank */}
                  <View style={{ marginRight: 12 }}>
                    <RankBadge rank={entry.rank} />
                  </View>

                  {/* Avatar */}
                  {entry.userAvatar ? (
                    <Image
                      source={{ uri: getImageUrl(entry.userAvatar) }}
                      style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
                    />
                  ) : (
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: '#e5e7eb',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ color: '#6b7280', fontSize: 16, fontWeight: '600' }}>
                        {isCurrentUser ? 'Me' : (entry.userName?.[0]?.toUpperCase() || 'U')}
                      </Text>
                    </View>
                  )}

                  {/* User Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#111827', fontSize: 15, fontWeight: '600' }} numberOfLines={1}>
                      {isCurrentUser ? 'Me' : (entry.userName || 'Anonymous')}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <CheckCircle size={12} color="#9ca3af" />
                      <Text style={{ color: '#6b7280', fontSize: 12, marginLeft: 4 }}>
                        {entry.completedTasks} tasks
                      </Text>
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#d1d5db', marginHorizontal: 8 }} />
                      <TrendingUp size={12} color="#9ca3af" />
                      <Text style={{ color: '#6b7280', fontSize: 12, marginLeft: 4 }}>
                        {entry.progress}%
                      </Text>
                    </View>
                  </View>

                  {/* Points */}
                  <View style={{
                    backgroundColor: '#fef3c7',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Star size={12} color="#f59e0b" fill="#f59e0b" />
                    <Text style={{ color: '#b45309', fontSize: 14, fontWeight: '700', marginLeft: 4 }}>
                      {entry.totalPoints}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Refresh Button */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 14,
          marginTop: 16,
          marginBottom: 32,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        }}
        onPress={onRefresh}
        disabled={loading}
      >
        <RefreshCw size={16} color={loading ? '#d1d5db' : '#6b7280'} />
        <Text style={{ color: loading ? '#d1d5db' : '#6b7280', marginLeft: 8, fontWeight: '600', fontSize: 14 }}>
          {loading ? 'Refreshing...' : 'Refresh Leaderboard'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
