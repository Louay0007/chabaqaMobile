import { Calendar, CheckCircle, Circle, Clock, Lock, Star, Target } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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

interface TimelineTabProps {
  challengeTasks: TaskType[];
  completedTasks: number;
  formatDate: (date: Date) => string;
  onTaskSelect?: (day: number) => void;
  selectedTaskDay?: number | null;
}

function getTaskStatus(task: TaskType, isSelected: boolean): { 
  icon: React.ReactNode; 
  bgColor: string; 
  borderColor: string;
  textColor: string;
} {
  if (task.isCompleted) {
    return {
      icon: <CheckCircle size={18} color="#10b981" />,
      bgColor: '#ecfdf5',
      borderColor: '#10b981',
      textColor: '#059669',
    };
  }
  if (task.isActive) {
    return {
      icon: <Target size={18} color="#f59e0b" />,
      bgColor: isSelected ? '#fef3c7' : '#fffbeb',
      borderColor: '#f59e0b',
      textColor: '#d97706',
    };
  }
  return {
    icon: <Circle size={18} color="#d1d5db" />,
    bgColor: '#f9fafb',
    borderColor: '#e5e7eb',
    textColor: '#6b7280',
  };
}

export default function TimelineTab({
  challengeTasks,
  completedTasks,
  formatDate,
  onTaskSelect,
  selectedTaskDay,
}: TimelineTabProps) {
  const totalTasks = challengeTasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleTaskSelect = (day: number) => {
    if (onTaskSelect) {
      onTaskSelect(day);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
      {/* Progress Card */}
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
          <Calendar size={20} color="#f59e0b" />
          <Text style={{ color: '#111827', fontSize: 18, fontWeight: '700', marginLeft: 10 }}>
            Timeline
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#6b7280', fontSize: 13 }}>Progress</Text>
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
                {completedTasks}
              </Text>
            </View>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Completed</Text>
          </View>
          <View style={{ width: 1, backgroundColor: '#e5e7eb' }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={14} color="#f59e0b" />
              <Text style={{ color: '#111827', fontSize: 16, fontWeight: '700', marginLeft: 4 }}>
                {totalTasks - completedTasks}
              </Text>
            </View>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Remaining</Text>
          </View>
          <View style={{ width: 1, backgroundColor: '#e5e7eb' }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Target size={14} color="#6b7280" />
              <Text style={{ color: '#111827', fontSize: 16, fontWeight: '700', marginLeft: 4 }}>
                {totalTasks}
              </Text>
            </View>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Total</Text>
          </View>
        </View>
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
        {challengeTasks.length === 0 ? (
          <View style={{ padding: 48, alignItems: 'center' }}>
            <Calendar size={48} color="#d1d5db" />
            <Text style={{ color: '#374151', fontSize: 16, marginTop: 16, fontWeight: '600' }}>
              No tasks yet
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4, textAlign: 'center' }}>
              Tasks will appear here once the challenge starts
            </Text>
          </View>
        ) : (
          challengeTasks.map((task, index) => {
            const isSelected = selectedTaskDay === task.day;
            const status = getTaskStatus(task, isSelected);
            const isLast = index === challengeTasks.length - 1;

            return (
              <TouchableOpacity
                key={task.id}
                onPress={() => handleTaskSelect(task.day)}
                style={{
                  flexDirection: 'row',
                  padding: 16,
                  backgroundColor: status.bgColor,
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: '#f3f4f6',
                  borderLeftWidth: isSelected ? 3 : 0,
                  borderLeftColor: '#f59e0b',
                }}
              >
                {/* Timeline Line */}
                <View style={{ alignItems: 'center', marginRight: 12 }}>
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#ffffff',
                    borderWidth: 2,
                    borderColor: status.borderColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {status.icon}
                  </View>
                  {!isLast && (
                    <View style={{
                      width: 2,
                      flex: 1,
                      backgroundColor: task.isCompleted ? '#10b981' : '#e5e7eb',
                      marginTop: 4,
                      minHeight: 20,
                    }} />
                  )}
                </View>

                {/* Task Content */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{
                      backgroundColor: status.borderColor + '20',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}>
                      <Text style={{ color: status.textColor, fontSize: 12, fontWeight: '600' }}>
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
                      <Star size={12} color="#f59e0b" fill="#f59e0b" />
                      <Text style={{ color: '#b45309', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>
                        {task.points}
                      </Text>
                    </View>
                  </View>

                  <Text style={{
                    color: '#111827',
                    fontSize: 15,
                    fontWeight: '600',
                    marginTop: 8,
                  }} numberOfLines={1}>
                    {task.title}
                  </Text>

                  <Text style={{
                    color: '#6b7280',
                    fontSize: 13,
                    marginTop: 4,
                    lineHeight: 18,
                  }} numberOfLines={2}>
                    {task.description}
                  </Text>

                  {task.deliverable && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 8,
                      backgroundColor: '#f3f4f6',
                      padding: 8,
                      borderRadius: 8,
                    }}>
                      <Target size={12} color="#6b7280" />
                      <Text style={{ color: '#6b7280', fontSize: 12, marginLeft: 6, flex: 1 }} numberOfLines={1}>
                        {task.deliverable}
                      </Text>
                    </View>
                  )}

                  {/* Status Badge */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    {task.isCompleted ? (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#ecfdf5',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                      }}>
                        <CheckCircle size={12} color="#10b981" />
                        <Text style={{ color: '#059669', fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
                          Completed
                        </Text>
                      </View>
                    ) : task.isActive ? (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#fef3c7',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                      }}>
                        <Target size={12} color="#f59e0b" />
                        <Text style={{ color: '#d97706', fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
                          In Progress
                        </Text>
                      </View>
                    ) : (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#f3f4f6',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                      }}>
                        <Lock size={12} color="#9ca3af" />
                        <Text style={{ color: '#6b7280', fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
                          Upcoming
                        </Text>
                      </View>
                    )}

                    {task.resources && task.resources.length > 0 && (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: 8,
                        backgroundColor: '#f3f4f6',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                      }}>
                        <Text style={{ color: '#6b7280', fontSize: 11 }}>
                          {task.resources.length} resources
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
