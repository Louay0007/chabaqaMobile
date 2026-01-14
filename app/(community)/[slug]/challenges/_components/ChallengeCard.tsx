import { Challenge } from '@/lib/mock-data';
import { Calendar, Trophy, Users, ArrowRight, CheckCircle } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';

interface ChallengeCardProps {
  challenge: Challenge & { 
    participationFee?: number;
    finalPrice?: number;
    depositAmount?: number;
    isFree?: boolean;
  };
  isParticipating: boolean;
  onPress: () => void;
  onJoinPress: () => void;
  formatDate: (date: Date) => string;
  getChallengeStatus: (challenge: Challenge) => string;
}

export default function ChallengeCard({
  challenge,
  isParticipating,
  onPress,
  onJoinPress,
  formatDate,
  getChallengeStatus,
}: ChallengeCardProps) {
  const status = getChallengeStatus(challenge);
  const isCompleted = status === 'completed';

  // Get badge color based on status
  const getStatusBadgeColor = () => {
    switch (status) {
      case 'active':
        return '#10b981'; // green
      case 'upcoming':
        return '#3b82f6'; // blue
      case 'completed':
        return '#8b5cf6'; // purple
      default:
        return 'rgba(0,0,0,0.1)';
    }
  };

  // Calculate price
  const price = challenge.participationFee || challenge.finalPrice || challenge.depositAmount || 0;
  const isFree = challenge.isFree === true || price === 0;

  return (
    <TouchableOpacity 
      style={styles.challengeCard}
      onPress={onPress}
    >
      {/* Header gradient */}
      <View style={styles.cardHeader}>
        <View style={[styles.listStatusBadge, { backgroundColor: getStatusBadgeColor() }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
        <Text style={styles.cardTitle}>{challenge.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {challenge.description}
        </Text>
      </View>

      {/* Card content */}
      <View style={styles.cardContent}>
        <View style={styles.cardRow}>
          <View style={styles.cardInfo}>
            <Calendar size={16} color="#6b7280" />
            <Text style={styles.cardInfoText}>{formatDate(challenge.startDate)}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Users size={16} color="#6b7280" />
            <Text style={styles.cardInfoText}>{challenge.participants.length} participants</Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.difficultyBadge}>
            <Trophy size={16} color="#f59e0b" />
            <Text style={styles.pointsText}>{challenge.completionReward} points</Text>
          </View>
          
          {challenge.difficulty && (
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{challenge.difficulty}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Action button */}
      {isCompleted ? (
        // Challenge is completed - show "Completed" button (disabled)
        <View 
          style={[styles.actionButton, { backgroundColor: '#6b7280', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
        >
          <CheckCircle size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>Completed</Text>
        </View>
      ) : isParticipating ? (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#ffffff' }]}
          onPress={onPress}
        >
          <ArrowRight size={18} color="#111827" style={{ marginRight: 6 }} />
          <Text style={[styles.actionButtonText, { color: '#111827' }]}>Explore</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
          onPress={onJoinPress}
        >
          <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>
            {isFree ? 'Join Challenge' : `Join - ${price} DT`}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
