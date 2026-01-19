/**
 * Custom Hook: useActiveMembers
 * Directly uses API data - no mapper, no transformation
 */

import { getActiveMembersByCommunity } from '@/lib/communities-api';
import { useEffect, useState } from 'react';

interface UseActiveMembersResult {
  members: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useActiveMembers(slug: string): UseActiveMembersResult {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getActiveMembersByCommunity(slug, 15);

      if (response.success && response.data) {
        // Use API response directly - all members shown with isOnline: true
        const apiMembers = response.data.members.map(m => ({ ...m, isOnline: true }));
        setMembers(apiMembers);
      } else {
        setMembers([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchMembers();
    }
  }, [slug]);

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
  };
}