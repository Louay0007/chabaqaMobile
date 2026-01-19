import { useState, useEffect, useCallback } from 'react';
import { getUnreadNotificationCount } from '@/lib/notification-api';
import { useAuth } from './use-auth';

/**
 * Hook pour récupérer le nombre de notifications non lues depuis le backend
 * Utilise l'endpoint optimisé /api/notifications/unread-count
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
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ [USE-NOTIFICATION-COUNT] Error fetching count:', error);
      setUnreadCount(0);
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
