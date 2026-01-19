/**
 * Notification API Integration
 * 
 * Provides functions to interact with the notification endpoints.
 * Handles in-app notifications, push notifications, and preferences management.
 * 
 * @module notification-api
 */

import { getAccessToken } from './auth';
import { tryEndpoints } from './http';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Notification channel types
 */
export enum NotificationChannel {
  IN_APP = 'in-app',
  EMAIL = 'email',
}

/**
 * Notification priority levels
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Notification object
 */
export interface Notification {
  _id: string;
  recipient: string;
  sender?: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Channel preferences for different notification types
 */
export interface ChannelPreferences {
  inApp: boolean;
  email: boolean;
  push?: boolean;
  sms?: boolean;
}

/**
 * Quiet hours configuration
 */
export interface QuietHours {
  start: string; // e.g., "22:00"
  end: string;   // e.g., "08:00"
  isEnabled: boolean;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  _id?: string;
  user?: string;
  preferences: Map<string, ChannelPreferences>;
  quietHours: QuietHours;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Notification preferences API response
 */
export interface NotificationPreferencesResponse {
  _id: string;
  user: string;
  preferences: Record<string, ChannelPreferences>;
  quietHours: QuietHours;
  createdAt: string;
  updatedAt: string;
}

/**
 * Update notification preferences data
 */
export interface UpdateNotificationPreferencesData {
  preferences?: Array<[string, ChannelPreferences]>;
  quietHours?: QuietHours;
}

/**
 * Notification list response
 */
export interface NotificationsListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get user notifications
 * 
 * @param page - Page number for pagination
 * @param limit - Number of notifications per page
 * @param unreadOnly - Filter to show only unread notifications
 * @returns Promise with notifications list
 */
export async function getNotifications(
  page: number = 1,
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<NotificationsListResponse> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required to access notifications');
    }

    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (unreadOnly) params.append('unreadOnly', 'true');

    const resp = await tryEndpoints<any>(
      `/api/notifications?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      // Backend retourne data:{} au lieu de data:[] si vide
      let notificationsData = resp.data.data || resp.data;
      const notifications = Array.isArray(notificationsData) ? notificationsData : 
                           (Array.isArray(resp.data.notifications) ? resp.data.notifications : []);
      const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
      
      console.log('✅ [NOTIFICATION-API] Notifications fetched:', {
        count: notifications.length,
        unread: unreadCount,
        total: resp.data.total || notifications.length
      });
      
      return {
        notifications,
        total: resp.data.total || notifications.length,
        unreadCount,
        hasMore: notifications.length === limit,
      };
    }

    throw new Error(resp.data.message || 'Failed to fetch notifications');
  } catch (error: any) {
    console.error('💥 [NOTIFICATION-API] Error fetching notifications:', error);
    throw new Error(error.message || 'Failed to fetch notifications');
  }
}

/**
 * Mark a notification as read
 * 
 * @param notificationId - Notification ID to mark as read
 * @returns Promise with updated notification
 */
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required to mark notification as read');
    }

    console.log('👁️ [NOTIFICATION-API] Marking notification as read:', notificationId);

    const resp = await tryEndpoints<any>(
      `/api/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [NOTIFICATION-API] Notification marked as read');
      return resp.data;
    }

    throw new Error(resp.data.message || 'Failed to mark notification as read');
  } catch (error: any) {
    console.error('💥 [NOTIFICATION-API] Error marking as read:', error);
    throw new Error(error.message || 'Failed to mark notification as read');
  }
}

/**
 * Get unread notification count
 * 
 * Compte les notifications non lues en récupérant toutes les notifications
 * 
 * @returns Promise with unread count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.log('⚠️ [NOTIFICATION-API] No token - returning 0 for unread count');
      return 0;
    }

    // Récupère toutes les notifications et compte les non lues
    const response = await getNotifications(1, 100, false);
    const count = response.notifications.filter((n) => !n.isRead).length;
    console.log('✅ [NOTIFICATION-API] Unread count:', count);
    return count;
  } catch (error: any) {
    console.error('💥 [NOTIFICATION-API] Error fetching unread count:', error);
    return 0;
  }
}


/**
 * Get notification icon based on type
 * 
 * @param type - Notification type
 * @returns Icon name or emoji for the notification type
 */
export function getNotificationIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'new_message': '💬',
    'new_dm_message': '📩',
    'course_update': '📚',
    'event_reminder': '📅',
    'challenge_progress': '🏆',
    'session_reminder': '⏰',
    'product_purchase': '🛍️',
    'community_invite': '👥',
    'system_update': '🔔',
    'security_alert': '🔒',
    'achievement': '🎉',
    'feedback_request': '⭐',
  };
  
  return iconMap[type] || '🔔';
}

/**
 * Get notification color based on priority
 * 
 * @param priority - Notification priority
 * @returns Color code for the priority level
 */
export function getNotificationColor(priority: NotificationPriority): string {
  switch (priority) {
    case NotificationPriority.HIGH:
      return '#ff4757'; // Red
    case NotificationPriority.MEDIUM:
      return '#ffa502'; // Orange
    case NotificationPriority.LOW:
      return '#3742fa'; // Blue
    default:
      return '#57606f'; // Gray
  }
}

/**
 * Format notification time display
 * 
 * @param dateString - ISO date string
 * @returns Formatted time string
 */
export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Check if notification should show badge
 * 
 * @param notification - Notification object
 * @returns True if notification should show badge/dot
 */
export function shouldShowNotificationBadge(notification: Notification): boolean {
  return !notification.isRead && notification.priority !== NotificationPriority.LOW;
}

/**
 * Group notifications by date
 * 
 * @param notifications - Array of notifications
 * @returns Grouped notifications by date sections
 */
export function groupNotificationsByDate(notifications: Notification[]): Array<{
  title: string;
  data: Notification[];
}> {
  const groups: Record<string, Notification[]> = {};
  const now = new Date();
  
  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    let groupKey: string;
    if (diffDays === 0) {
      groupKey = 'Today';
    } else if (diffDays === 1) {
      groupKey = 'Yesterday';
    } else if (diffDays < 7) {
      groupKey = date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      groupKey = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });
  
  // Sort groups by recency
  const sortedGroups = Object.entries(groups)
    .sort(([a], [b]) => {
      const order = ['Today', 'Yesterday'];
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return 0; // Keep original order for other dates
    })
    .map(([title, data]) => ({ title, data }));
    
  return sortedGroups;
}

/**
 * Get unread notification count
 * 
 * @param notifications - Array of notifications
 * @returns Number of unread notifications
 */
export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter(notification => !notification.isRead).length;
}

// ============================================================================
// Notification Preferences API
// ============================================================================

/**
 * Get notification preferences for the authenticated user
 * 
 * @returns Promise with notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required to access notification preferences');
    }

    console.log('⚙️ [NOTIFICATION-API] Fetching notification preferences');

    const resp = await tryEndpoints<any>(
      `/api/notifications/preferences`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      const data: NotificationPreferencesResponse = resp.data.data || resp.data;
      
      // Convert preferences object to Map
      const preferencesMap = new Map<string, ChannelPreferences>();
      if (data.preferences) {
        Object.entries(data.preferences).forEach(([key, value]) => {
          preferencesMap.set(key, value);
        });
      }
      
      console.log('✅ [NOTIFICATION-API] Notification preferences fetched');
      
      return {
        _id: data._id,
        user: data.user,
        preferences: preferencesMap,
        quietHours: data.quietHours || {
          start: '22:00',
          end: '08:00',
          isEnabled: false,
        },
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    }

    throw new Error(resp.data.message || 'Failed to fetch notification preferences');
  } catch (error: any) {
    console.error('💥 [NOTIFICATION-API] Error fetching notification preferences:', error);
    throw new Error(error.message || 'Failed to fetch notification preferences');
  }
}

/**
 * Update notification preferences for the authenticated user
 * 
 * @param updates - Partial updates to notification preferences
 * @returns Promise with updated notification preferences
 */
export async function updateNotificationPreferences(
  updates: Partial<UpdateNotificationPreferencesData>
): Promise<NotificationPreferences> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required to update notification preferences');
    }

    console.log('💾 [NOTIFICATION-API] Updating notification preferences', updates);

    // Prepare request body
    const body: any = {};
    
    if (updates.preferences) {
      // Convert preferences to array format for backend
      body.preferences = updates.preferences;
    }
    
    if (updates.quietHours) {
      body.quietHours = updates.quietHours;
    }

    const resp = await tryEndpoints<any>(
      `/api/notifications/preferences`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: body,
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      const data: NotificationPreferencesResponse = resp.data.data || resp.data;
      
      // Convert preferences object to Map
      const preferencesMap = new Map<string, ChannelPreferences>();
      if (data.preferences) {
        Object.entries(data.preferences).forEach(([key, value]) => {
          preferencesMap.set(key, value);
        });
      }
      
      console.log('✅ [NOTIFICATION-API] Notification preferences updated');
      
      return {
        _id: data._id,
        user: data.user,
        preferences: preferencesMap,
        quietHours: data.quietHours || {
          start: '22:00',
          end: '08:00',
          isEnabled: false,
        },
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    }

    throw new Error(resp.data.message || 'Failed to update notification preferences');
  } catch (error: any) {
    console.error('💥 [NOTIFICATION-API] Error updating notification preferences:', error);
    throw new Error(error.message || 'Failed to update notification preferences');
  }
}
