/**
 * Custom Hook: useCommunityData
 * Directly uses API data - no mapper needed
 */

import { getCommunityBySlug } from '@/lib/communities-api';
import { useEffect, useState } from 'react';

interface UseCommunityDataResult {
  community: any | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCommunityData(slug: string): UseCommunityDataResult {
  const [community, setCommunity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCommunityBySlug(slug);

      if (response.success && response.data) {
""        // Normaliser _id -> id pour compatibilité
        const normalizedData = {
          ...response.data,
          id: response.data.id || response.data._id,
        };
        
        setCommunity(normalizedData);
      } else {
        setError('Community not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load community');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchCommunity();
    }
  }, [slug]);

  return {
    community,
    loading,
    error,
    refetch: fetchCommunity,
  };
}