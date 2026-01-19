// Re-export types for consistency
// User comes from auth.ts (real backend structure)
export { User } from './auth';
// Community comes from mock-data for now
export { Community } from './mock-data';

// Additional model types can be added here in the future
export interface CommunityStats {
  total: number;
  totalMembers: number;
  avgRating: number;
  freeCount: number;
}

export interface SearchFilters {
  query: string;
  category: string;
  priceType: string;
  sortBy: string;
  quickFilters: string[];
}
