import { colors } from '@/lib/design-tokens';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getNotificationIcon,
  formatNotificationTime,
  Notification 
} from '@/lib/notification-api';
import { BookOpen, Clock, MessageSquare, Trophy, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { modalStyles } from './modal-styles';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // Charger les notifications depuis le backend
  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(1, 10, false);
      setNotifications(response.notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // En cas d'erreur, on affiche un tableau vide
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications(prev => 
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    // Fermer le modal après avoir cliqué
    onClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingAllRead(false);
    }
  };
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'challenge':
        return '#f59e0b';
      case 'course':
        return '#3b82f6';
      case 'session':
        return '#10b981';
      case 'message':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles.notificationContainer}>
        {/* Header */}
        <View style={modalStyles.modalHeader}>
          <Text style={modalStyles.notificationHeaderTitle}>Notifications</Text>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
            <X size={24} color={colors.gray500} />
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <ScrollView style={modalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: 10, color: colors.gray600 }}>Loading...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: colors.gray600, textAlign: 'center' }}>
                No notifications yet
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification._id}
                style={[
                  modalStyles.listItem,
                  !notification.isRead && modalStyles.notificationUnreadItem
                ]}
                activeOpacity={0.7}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={modalStyles.listItemContent}>
                  <View style={[
                    modalStyles.iconContainer,
                    { backgroundColor: `${getNotificationColor(notification.type)}20` }
                  ]}>
                    <Text style={{ fontSize: 20 }}>
                      {getNotificationIcon(notification.type)}
                    </Text>
                  </View>
                  
                  <View style={modalStyles.notificationTextContainer}>
                    <Text style={modalStyles.notificationTitle}>
                      {notification.title}
                    </Text>
                    <Text style={modalStyles.notificationMessage}>
                      {notification.body}
                    </Text>
                    <Text style={modalStyles.notificationTime}>
                      {formatNotificationTime(notification.createdAt)}
                    </Text>
                  </View>
                  
                  {!notification.isRead && (
                    <View style={[modalStyles.notificationUnreadDot, modalStyles.unreadIndicator]} />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Footer */}
        <View style={modalStyles.notificationFooter}>
          <TouchableOpacity 
            style={modalStyles.notificationMarkAllReadButton}
            onPress={handleMarkAllAsRead}
            disabled={markingAllRead || notifications.every(n => n.isRead)}
          >
            {markingAllRead ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={modalStyles.notificationMarkAllReadText}>Mark all as read</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
