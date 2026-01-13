import { User } from '@/lib/mock-data';
import { Award, Calendar, Clock, Crown, Star, Users, Zap } from 'lucide-react-native';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { styles } from '../../styles';

// Extended challenge type with all backend fields
interface ChallengeType {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  communityId: string;
  creatorId: string;
  creatorName?: string;
  creatorAvatar?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  difficulty?: string;
  category?: string;
  duration?: string;
  participantCount?: number;
  maxParticipants?: number;
  completionReward?: number;
  depositAmount?: number;
  isPremium?: boolean;
  isFree?: boolean;
  participationFee?: number;
  currency?: string;
  participants?: any[];
  resources?: any[];
}

interface ChallengeHeaderProps {
  challenge: ChallengeType;
  completedTasks: number;
  totalTasks: number;
  totalPoints: number;
  formatDate: (date: Date) => string;
  userRank?: number | null;
}

const getChallengeStatus = (challenge: ChallengeType) => {
  const now = new Date();
  if (challenge.startDate > now) return 'upcoming';
  if (challenge.endDate < now) return 'completed';
  return 'active';
};

const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case 'beginner': return '#10b981';
    case 'intermediate': return '#f59e0b';
    case 'advanced': return '#ef4444';
    default: return '#6b7280';
  }
};

const formatCurrency = (amount?: number, currency?: string) => {
  if (!amount || !currency) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export default function ChallengeHeader({
  challenge,
  completedTasks,
  totalTasks,
  totalPoints,
  formatDate,
  userRank,
}: ChallengeHeaderProps) {
  const remainingTasks = totalTasks - completedTasks;
  const status = getChallengeStatus(challenge);
  const difficultyColor = getDifficultyColor(challenge.difficulty);

  return (
    <View style={styles.header}>
      {/* Background circles */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />

      <View style={styles.headerTopRow}>
        <View style={styles.headerTitleBlock}>
          <View style={styles.titleContainer}>
            <Zap size={20} color="#fff" />
            <Text style={styles.title} numberOfLines={1}>Challenge</Text>
          </View>
          <Text style={styles.headerChallengeTitle} numberOfLines={2}>{challenge.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{challenge.description}</Text>

          <View style={styles.badgesContainer}>
            <View style={[styles.statusBadge, { backgroundColor: difficultyColor }]}>
              <Text style={styles.statusText}>{challenge.difficulty || 'all levels'}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
            {challenge.isPremium && (
              <View style={[styles.statusBadge, { backgroundColor: '#f59e0b' }]}>
                <Crown size={12} color="#fff" />
                <Text style={styles.statusText}>Premium</Text>
              </View>
            )}
            <View style={styles.priceBadgeCompact}>
              {challenge.isFree ? (
                <Text style={styles.priceText}>FREE</Text>
              ) : (
                <Text style={styles.priceText}>
                  {formatCurrency(challenge.participationFee, challenge.currency) || `${challenge.participationFee} ${challenge.currency || ''}`}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.headerMetaGrid}>
           
            <View style={styles.metaRow}>
              {challenge.category && (
                <View style={styles.metaItem}>
                  <Star size={14} color="#fff" />
                  <Text style={styles.metaText} numberOfLines={1}>{challenge.category}</Text>
                </View>
              )}
              {challenge.duration && (
                <View style={styles.metaItem}>
                  <Clock size={14} color="#fff" />
                  <Text style={styles.metaText} numberOfLines={1}>{challenge.duration}</Text>
                </View>
              )}
            </View>
            <View style={styles.datesRow}>
              <Calendar size={14} color="#fff" />
              <Text style={styles.datesText} numberOfLines={1}>
                {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <Text style={styles.statNumber}>{completedTasks}</Text>
              <Text style={styles.statLabel} numberOfLines={2}>Completed</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statNumber}>{remainingTasks}</Text>
              <Text style={styles.statLabel} numberOfLines={2}>Remaining</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statNumber}>{totalPoints}</Text>
              <Text style={styles.statLabel} numberOfLines={2}>Points</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statNumber}>{userRank ? `#${userRank}` : '-'}</Text>
              <Text style={styles.statLabel} numberOfLines={2}>Rank</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.bottomStat}>
          <Users size={14} color="#fff" />
          <Text style={styles.bottomStatText}>
            {challenge.participantCount || challenge.participants?.length || 0} participants
          </Text>
        </View>
        {typeof challenge.completionReward === 'number' && challenge.completionReward > 0 && (
          <View style={styles.bottomStat}>
            <Award size={14} color="#fff" />
            <Text style={styles.bottomStatText}>
              {challenge.completionReward} reward
            </Text>
          </View>
        )}
        {challenge.maxParticipants ? (
          <Text style={styles.bottomStatText}>
            Max {challenge.maxParticipants}
          </Text>
        ) : (
          <Text style={styles.bottomStatText} />
        )}
      </View>
    </View>
  );
}
