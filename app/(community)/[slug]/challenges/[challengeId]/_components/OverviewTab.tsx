import { BookOpen, Code, ExternalLink, FileText, PlayCircle, Target } from 'lucide-react-native';
import React from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles';

// Local task type for this screen
interface TaskType {
  id: string;
  day: number;
  title: string;
  description: string;
  deliverable?: string;
  isCompleted: boolean;
  isActive: boolean;
  points: number;
  instructions?: string;
  notes?: string;
  resources?: any[];
  createdAt?: string;
}

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
  posts?: any[];
  resources?: any[];
  notes?: string;
  premiumFeatures?: {
    personalMentoring: boolean;
    exclusiveResources: boolean;
    priorityFeedback: boolean;
    certificate: boolean;
    liveSessions: boolean;
    communityAccess: boolean;
  };
}

interface OverviewTabProps {
  currentTask: TaskType | undefined;
  challenge: ChallengeType;
  completedTasks: number;
  challengeTasks: TaskType[];
  formatDate: (date: Date) => string;
}

const asText = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <PlayCircle size={16} color="#6b7280" />;
    case 'article':
      return <FileText size={16} color="#6b7280" />;
    case 'code':
      return <Code size={16} color="#6b7280" />;
    case 'tool':
      return <ExternalLink size={16} color="#6b7280" />;
    case 'pdf':
      return <FileText size={16} color="#ef4444" />;
    case 'link':
      return <ExternalLink size={16} color="#3b82f6" />;
    default:
      return <BookOpen size={16} color="#6b7280" />;
  }
};

const formatCurrency = (amount?: number, currency?: string) => {
  if (!amount || !currency) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

const handleResourcePress = (url: string) => {
  if (url) {
    Linking.openURL(url).catch(err => console.log('Error opening URL:', err));
  }
};

export default function OverviewTab({
  currentTask,
  challenge,
  completedTasks,
  challengeTasks,
  formatDate,
}: OverviewTabProps) {
  const progress = challengeTasks.length > 0
    ? Math.round((completedTasks / challengeTasks.length) * 100)
    : 0;

  // Calculate total days from challenge duration or tasks
  const totalDays = challengeTasks.length > 0 
    ? Math.max(...challengeTasks.map(t => t.day || 0), challengeTasks.length)
    : 0;

  return (
    <View style={styles.tabContent}>
      {/* Current Task */}
      {currentTask && currentTask.day ? (
        <View style={styles.currentTaskCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Target size={16} color="#f97316" />
              <Text style={styles.cardTitle}>Day {currentTask.day} Challenge</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{currentTask.points || 0} pts</Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.taskCardTitle}>{asText(currentTask.title)}</Text>
            <Text style={styles.taskCardDescription}>{asText(currentTask.description)}</Text>

            {/* Deliverable */}
            {currentTask.deliverable && currentTask.deliverable.length > 0 && (
              <View style={styles.deliverableContainer}>
                <Text style={styles.deliverableTitle}>Deliverable:</Text>
                <Text style={styles.deliverableText}>{asText(currentTask.deliverable)}</Text>
              </View>
            )}

            <Text style={styles.resourcesAndInstructionsTitle}>Resources & Instructions</Text>

            {currentTask.instructions && currentTask.instructions.length > 0 && (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Instructions:</Text>
                <Text style={styles.instructionsText}>{asText(currentTask.instructions)}</Text>
              </View>
            )}

            {currentTask.notes && currentTask.notes.length > 0 && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesTitle}>Notes:</Text>
                <Text style={styles.notesText}>{asText(currentTask.notes)}</Text>
              </View>
            )}

            {currentTask.resources && currentTask.resources.length > 0 && (
              <View style={styles.taskResourcesContainer}>
                <Text style={styles.resourcesSectionTitle}>Task Resources:</Text>
                {currentTask.resources.map((resource: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.taskResourceItem}
                    onPress={() => handleResourcePress(resource.url)}
                  >
                    {getResourceIcon(resource.type)}
                    <View style={styles.resourceInfo}>
                      <Text style={styles.resourceTitle}>{asText(resource.title)}</Text>
                      <Text style={styles.resourceDescription}>
                        {resource.description ? asText(resource.description) : `${asText(resource.type)} resource`}
                      </Text>
                    </View>
                    <ExternalLink size={16} color="#6b7280" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.actionsContainer}>
              {!currentTask.isCompleted && (
                <TouchableOpacity style={styles.submitButton}>
                  <Text style={styles.submitButtonText}>Submit Your Work</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.helpButton}>
                <Text style={styles.helpButtonText}>Get Help</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : challengeTasks.length === 0 ? (
        <View style={styles.currentTaskCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Target size={16} color="#f97316" />
              <Text style={styles.cardTitle}>No Tasks Yet</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.taskCardDescription}>
              This challenge doesn't have any tasks defined yet. Check back later or contact the creator.
            </Text>
          </View>
        </View>
      ) : null}

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <Text style={styles.cardTitle}>Your Progress</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{progress}%</Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progress}%` }
              ]}
            />
          </View>
        </View>
        <View style={styles.progressDetails}>
          <Text style={styles.progressDetailText}>
            {asText(completedTasks)} of {asText(totalDays || challengeTasks.length)} days completed
          </Text>
        </View>
      </View>

      {/* Challenge Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Challenge Details</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoGridItem}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Start Date</Text>
              <Text style={[styles.infoValue, styles.infoValueEmphasis]}>{formatDate(challenge.startDate)}</Text>
            </View>
          </View>
          <View style={styles.infoGridItem}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>End Date</Text>
              <Text style={[styles.infoValue, styles.infoValueEmphasis]}>{formatDate(challenge.endDate)}</Text>
            </View>
          </View>
          <View style={styles.infoGridItem}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Difficulty</Text>
              <Text style={[styles.infoValue, styles.infoValueEmphasis]}>{challenge.difficulty || 'All levels'}</Text>
            </View>
          </View>
          <View style={styles.infoGridItem}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={[styles.infoValue, styles.infoValueEmphasis]}>{challenge.category || 'General'}</Text>
            </View>
          </View>
          <View style={styles.infoGridItem}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={[styles.infoValue, styles.infoValueEmphasis]}>{challenge.duration || `${challengeTasks.length} days`}</Text>
            </View>
          </View>
          <View style={styles.infoGridItem}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Participants</Text>
              <Text style={[styles.infoValue, styles.infoValueEmphasis]}>{asText(challenge.participantCount || 0)}</Text>
            </View>
          </View>
        </View>

        {/* Pricing info */}
        <View style={styles.pricingSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Entry Fee:</Text>
            {challenge.isFree ? (
              <Text style={[styles.priceValue, { color: '#10b981' }]}>FREE</Text>
            ) : (
              <Text style={styles.priceValue}>
                {formatCurrency(challenge.participationFee, challenge.currency) || (challenge.participationFee ? `${asText(challenge.participationFee)} ${asText(challenge.currency || '')}` : 'N/A')}
              </Text>
            )}
          </View>
          {challenge.depositAmount !== undefined && challenge.depositAmount !== null && challenge.depositAmount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Deposit:</Text>
              <Text style={styles.priceValue}>{formatCurrency(challenge.depositAmount, challenge.currency) || `${asText(challenge.depositAmount)} ${asText(challenge.currency || '')}`}</Text>
            </View>
          )}
          {challenge.completionReward !== undefined && challenge.completionReward !== null && challenge.completionReward > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Completion Reward:</Text>
              <Text style={[styles.priceValue, { color: '#10b981' }]}>
                {formatCurrency(challenge.completionReward, challenge.currency) || `${asText(challenge.completionReward)} ${asText(challenge.currency || '')}`}
              </Text>
            </View>
          )}
        </View>

        {/* Premium features */}
        {challenge.isPremium === true && challenge.premiumFeatures && (
          <View style={styles.premiumFeaturesContainer}>
            <Text style={styles.premiumTitle}>Premium Features</Text>
            <View style={styles.premiumFeaturesList}>
              {challenge.premiumFeatures.personalMentoring === true && (
                <Text style={styles.premiumFeature}>- Personal Mentoring</Text>
              )}
              {challenge.premiumFeatures.exclusiveResources === true && (
                <Text style={styles.premiumFeature}>- Exclusive Resources</Text>
              )}
              {challenge.premiumFeatures.priorityFeedback === true && (
                <Text style={styles.premiumFeature}>- Priority Feedback</Text>
              )}
              {challenge.premiumFeatures.certificate === true && (
                <Text style={styles.premiumFeature}>- Certificate</Text>
              )}
              {challenge.premiumFeatures.liveSessions === true && (
                <Text style={styles.premiumFeature}>- Live Sessions</Text>
              )}
              {challenge.premiumFeatures.communityAccess === true && (
                <Text style={styles.premiumFeature}>- Community Access</Text>
              )}
            </View>
          </View>
        )}

        {challenge.notes && challenge.notes.length > 0 && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text style={styles.notesText}>{asText(challenge.notes)}</Text>
          </View>
        )}
      </View>

      {/* Challenge Resources */}
      {challenge.resources && challenge.resources.length > 0 && (
        <View style={styles.resourcesCard}>
          <Text style={styles.cardTitle}>Challenge Resources</Text>
          {challenge.resources.map((resource: any, index: number) => (
            <TouchableOpacity
              key={index}
              style={styles.resourceItem}
              onPress={() => handleResourcePress(resource.url)}
            >
              <View style={styles.resourceRow}>
                <View style={styles.resourceIconContainer}>
                  {getResourceIcon(resource.type)}
                </View>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceText} numberOfLines={1}>{resource.title ? asText(resource.title) : 'Resource'}</Text>
                  {resource.description && resource.description.length > 0 && (
                    <Text style={styles.resourceDescription} numberOfLines={1}>{asText(resource.description)}</Text>
                  )}
                </View>
              </View>
              <ExternalLink size={16} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
