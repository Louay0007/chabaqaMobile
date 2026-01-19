import { getCurrentUser } from '@/lib/user-api';
import { updateChallengeProgress } from '@/lib/challenge-api';
import { 
  AlertCircle, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  Circle, 
  Clock, 
  FileText, 
  RefreshCw, 
  Send, 
  Star, 
  Target 
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';

// Task type
interface TaskType {
  id: string;
  backendId?: string;
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

// Participant type from challenge
interface ParticipantType {
  userId: string;
  completedTasks: string[];
  progress: number;
  totalPoints: number;
  joinedAt: string;
  lastActivityAt: string;
  isActive: boolean;
}

interface SubmissionsTabProps {
  challengeId: string;
  tasks: TaskType[];
  participants?: ParticipantType[];
  onRefresh?: () => void;
}

export default function SubmissionsTab({ 
  challengeId, 
  tasks, 
  participants,
  onRefresh 
}: SubmissionsTabProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [userCompletedTasks, setUserCompletedTasks] = useState<string[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  useEffect(() => {
    getCurrentUser().then(user => {
      const userId = user?._id || user?.id || user?.sub || null;
      setCurrentUserId(userId);
      
      // Find user's completed tasks from participants
      if (userId && participants) {
        const userParticipant = participants.find(
          p => p.userId === userId || p.userId === userId?.toString()
        );
        if (userParticipant) {
          setUserCompletedTasks(userParticipant.completedTasks || []);
        }
      }
    }).catch(() => {});
  }, [participants]);

  const handleSubmitTask = async (taskId: string) => {
    if (!currentUserId) {
      Alert.alert('Error', 'Please login to submit your work');
      return;
    }

    Alert.alert(
      'Submit Task',
      'Are you sure you want to mark this task as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              setSubmitting(taskId);
              console.log('📝 [CHALLENGE] Submitting task progress:', {
                challengeId,
                taskId,
                status: 'completed',
              });
              await updateChallengeProgress(challengeId, taskId, 'completed');
              
              // Update local state
              setUserCompletedTasks(prev => [...prev, taskId]);
              
              Alert.alert('Success', 'Task submitted successfully!');
              
              // Refresh parent data
              if (onRefresh) {
                onRefresh();
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to submit task');
            } finally {
              setSubmitting(null);
            }
          },
        },
      ]
    );
  };

  const handleUndoSubmission = async (taskId: string) => {
    if (!currentUserId) return;

    Alert.alert(
      'Undo Submission',
      'Are you sure you want to mark this task as not completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(taskId);
              console.log('📝 [CHALLENGE] Undo task progress:', {
                challengeId,
                taskId,
                status: 'not_started',
              });
              await updateChallengeProgress(challengeId, taskId, 'not_started');
              
              // Update local state
              setUserCompletedTasks(prev => prev.filter(id => id !== taskId));
              
              Alert.alert('Success', 'Task unmarked successfully');
              
              if (onRefresh) {
                onRefresh();
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update task');
            } finally {
              setSubmitting(null);
            }
          },
        },
      ]
    );
  };

  const isTaskCompleted = (taskId?: string) => !!taskId && userCompletedTasks.includes(taskId);
  
  const completedCount = userCompletedTasks.length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const totalPoints = tasks
    .filter(t => t.backendId && userCompletedTasks.includes(t.backendId))
    .reduce((sum, t) => sum + t.points, 0);

  // Check if user is a participant
  const isParticipant = currentUserId && participants?.some(
    p => p.userId === currentUserId || p.userId === currentUserId?.toString()
  );

  return (
    <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
      {/* Progress Summary Card */}
      <View style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <FileText size={20} color="#f59e0b" />
          <Text style={{ color: '#111827', fontSize: 18, fontWeight: '700', marginLeft: 10 }}>
            My Work
          </Text>
        </View>

        {!isParticipant ? (
          <View style={{ 
            backgroundColor: '#fef3c7', 
            padding: 12, 
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <AlertCircle size={16} color="#d97706" />
            <Text style={{ color: '#92400e', fontSize: 13, marginLeft: 8, flex: 1 }}>
              Join this challenge to submit your work
            </Text>
          </View>
        ) : (
          <>
            {/* Progress Bar */}
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: '#6b7280', fontSize: 13 }}>Your Progress</Text>
                <Text style={{ color: '#111827', fontSize: 13, fontWeight: '600' }}>{progress}%</Text>
              </View>
              <View style={{
                height: 8,
                backgroundColor: '#f3f4f6',
                borderRadius: 4,
                overflow: 'hidden',
              }}>
                <View style={{
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: '#10b981',
                  borderRadius: 4,
                }} />
              </View>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CheckCircle size={14} color="#10b981" />
                  <Text style={{ color: '#111827', fontSize: 16, fontWeight: '700', marginLeft: 4 }}>
                    {completedCount}
                  </Text>
                </View>
                <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Submitted</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#e5e7eb' }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Clock size={14} color="#f59e0b" />
                  <Text style={{ color: '#111827', fontSize: 16, fontWeight: '700', marginLeft: 4 }}>
                    {totalTasks - completedCount}
                  </Text>
                </View>
                <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Pending</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#e5e7eb' }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                  <Text style={{ color: '#111827', fontSize: 16, fontWeight: '700', marginLeft: 4 }}>
                    {totalPoints}
                  </Text>
                </View>
                <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Points</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Tasks List */}
      <View style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
        marginBottom: 32,
      }}>
        <View style={{
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#f3f4f6',
        }}>
          <Text style={{ color: '#111827', fontSize: 16, fontWeight: '600' }}>
            Tasks
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
            Submit your completed work for each task
          </Text>
        </View>

        {tasks.length === 0 ? (
          <View style={{ padding: 48, alignItems: 'center' }}>
            <Target size={48} color="#d1d5db" />
            <Text style={{ color: '#374151', fontSize: 16, marginTop: 16, fontWeight: '600' }}>
              No tasks yet
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4, textAlign: 'center' }}>
              Tasks will appear here once added
            </Text>
          </View>
        ) : (
          tasks.map((task, index) => {
            const taskId = task.backendId;
            const completed = isTaskCompleted(taskId);
            const isSubmitting = taskId ? submitting === taskId : false;
            const isLast = index === tasks.length - 1;
            const isExpanded = expandedTasks.includes(task.id);

            return (
              <View
                key={task.id}
                style={{
                  padding: 16,
                  backgroundColor: completed ? '#ecfdf5' : '#ffffff',
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: '#f3f4f6',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  {/* Status Icon */}
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: completed ? '#10b981' : '#f3f4f6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    {completed ? (
                      <CheckCircle size={18} color="#ffffff" />
                    ) : (
                      <Circle size={18} color="#9ca3af" />
                    )}
                  </View>

                  {/* Task Content */}
                  <View style={{ flex: 1 }}>
                    {/* Header Row: Day + Points */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{
                        backgroundColor: completed ? '#d1fae5' : '#f3f4f6',
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}>
                        <Text style={{ 
                          color: completed ? '#059669' : '#6b7280', 
                          fontSize: 11, 
                          fontWeight: '600' 
                        }}>
                          Day {task.day}
                        </Text>
                      </View>
                      <View style={{
                        backgroundColor: '#fef3c7',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                        <Star size={10} color="#f59e0b" fill="#f59e0b" />
                        <Text style={{ color: '#b45309', fontSize: 11, fontWeight: '700', marginLeft: 3 }}>
                          {task.points} pts
                        </Text>
                      </View>
                    </View>

                    {/* Task Title */}
                    <Text style={{
                      color: '#111827',
                      fontSize: 15,
                      fontWeight: '600',
                      marginTop: 8,
                    }}>
                      {task.title}
                    </Text>

                    {/* Description (always visible, truncated if not expanded) */}
                    {task.description && (
                      <Text style={{
                        color: '#4b5563',
                        fontSize: 13,
                        marginTop: 6,
                        lineHeight: 18,
                      }} numberOfLines={isExpanded ? undefined : 2}>
                        {task.description}
                      </Text>
                    )}

                    {/* Expand/Collapse Button */}
                    <TouchableOpacity
                      onPress={() => toggleTaskExpanded(task.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 8,
                        paddingVertical: 4,
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp size={16} color="#6b7280" />
                      ) : (
                        <ChevronDown size={16} color="#6b7280" />
                      )}
                      <Text style={{ color: '#6b7280', fontSize: 12, marginLeft: 4 }}>
                        {isExpanded ? 'Show less' : 'Show more details'}
                      </Text>
                    </TouchableOpacity>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <View style={{ marginTop: 12 }}>
                        {/* Deliverable */}
                        {task.deliverable && (
                          <View style={{
                            backgroundColor: '#f0fdf4',
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 10,
                            borderLeftWidth: 3,
                            borderLeftColor: '#10b981',
                          }}>
                            <Text style={{ color: '#059669', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                              📦 Deliverable
                            </Text>
                            <Text style={{ color: '#374151', fontSize: 13, lineHeight: 18 }}>
                              {task.deliverable}
                            </Text>
                          </View>
                        )}

                        {/* Instructions */}
                        {task.instructions && (
                          <View style={{
                            backgroundColor: '#eff6ff',
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 10,
                            borderLeftWidth: 3,
                            borderLeftColor: '#3b82f6',
                          }}>
                            <Text style={{ color: '#1d4ed8', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                              📋 Instructions
                            </Text>
                            <Text style={{ color: '#374151', fontSize: 13, lineHeight: 18 }}>
                              {task.instructions}
                            </Text>
                          </View>
                        )}

                        {/* Notes */}
                        {task.notes && (
                          <View style={{
                            backgroundColor: '#fefce8',
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 10,
                            borderLeftWidth: 3,
                            borderLeftColor: '#eab308',
                          }}>
                            <Text style={{ color: '#a16207', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                              📝 Notes
                            </Text>
                            <Text style={{ color: '#374151', fontSize: 13, lineHeight: 18 }}>
                              {task.notes}
                            </Text>
                          </View>
                        )}

                        {/* Resources */}
                        {task.resources && task.resources.length > 0 && (
                          <View style={{
                            backgroundColor: '#f5f3ff',
                            padding: 12,
                            borderRadius: 8,
                            borderLeftWidth: 3,
                            borderLeftColor: '#8b5cf6',
                          }}>
                            <Text style={{ color: '#6d28d9', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
                              🔗 Resources ({task.resources.length})
                            </Text>
                            {task.resources.map((resource: any, idx: number) => (
                              <View key={resource.id || `resource-${idx}`} style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 4,
                              }}>
                                <Text style={{ color: '#6b7280', fontSize: 12, marginRight: 6 }}>•</Text>
                                <Text style={{ color: '#374151', fontSize: 13, flex: 1 }}>
                                  {resource.title || resource.url}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                    {isParticipant && !taskId && (
                      <View style={{ marginTop: 12 }}>
                        <View style={{
                          backgroundColor: '#fef2f2',
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: '#fecaca',
                        }}>
                          <Text style={{ color: '#b91c1c', fontSize: 12, fontWeight: '600' }}>
                            Task ID missing. Refresh challenge data.
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Action Button */}
                    {isParticipant && taskId && (
                      <View style={{ marginTop: 12 }}>
                        {completed ? (
                          <TouchableOpacity
                            onPress={() => handleUndoSubmission(taskId)}
                            disabled={isSubmitting}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f3f4f6',
                              paddingVertical: 8,
                              paddingHorizontal: 16,
                              borderRadius: 8,
                            }}
                          >
                            {isSubmitting ? (
                              <ActivityIndicator size="small" color="#6b7280" />
                            ) : (
                              <>
                                <RefreshCw size={14} color="#6b7280" />
                                <Text style={{ color: '#6b7280', fontSize: 13, fontWeight: '600', marginLeft: 6 }}>
                                  Undo Submission
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={() => handleSubmitTask(taskId)}
                            disabled={isSubmitting}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f59e0b',
                              paddingVertical: 10,
                              paddingHorizontal: 16,
                              borderRadius: 8,
                            }}
                          >
                            {isSubmitting ? (
                              <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                              <>
                                <Send size={14} color="#ffffff" />
                                <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600', marginLeft: 6 }}>
                                  Submit Work
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
