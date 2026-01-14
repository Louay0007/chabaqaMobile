import { useState, useEffect, useCallback } from 'react';
import { getNotifications } from '@/lib/notification-api';
import { useAuth } from './use-auth';

/**
 * Hook pour récupérer le nombre de notifications non lues depuis le backend
 */
export function useNotificationCount() {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await getNotifications(1, 50, true);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return { unreadCount, loading, refresh: fetchUnreadCount };
}
