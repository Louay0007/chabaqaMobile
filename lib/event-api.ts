/**
 * Event API Integration
 * 
 * Provides functions to interact with the event endpoints for regular users.
 * Handles event browsing, registration, ticket purchasing, and management.
 * 
 * @module event-api
 */

import { tryEndpoints } from './http';
import { getAccessToken } from './auth';

// ============================================================================
// TypeScript Interfaces - Matching Backend DTOs
// ============================================================================

/**
 * Event session (matches backend EventSession)
 */
export interface EventSession {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  speaker: string;
  notes?: string;
  isActive: boolean;
  attendance: number;
}

/**
 * Event ticket type (matches backend EventTicket)
 */
export interface EventTicket {
  id: string;
  type: 'regular' | 'vip' | 'early-bird' | 'student' | 'free';
  name: string;
  price: number;
  description: string;
  quantity?: number;
  sold: number;
}

/**
 * Event speaker (matches backend EventSpeaker)
 */
export interface EventSpeaker {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo?: string;
}

/**
 * Event attendee (matches backend EventAttendee)
 */
export interface EventAttendee {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  ticketType: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
}

/**
 * Main event interface (matches backend EventResponseDto)
 */
export interface Event {
  // MongoDB _id (for compatibility with backend responses)
  _id?: string;
  
  // Custom ID field
  id: string;
  
  // Basic info
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location: string;
  onlineUrl?: string;
  category: string;
  type: 'In-person' | 'Online' | 'Hybrid';
  isActive: boolean;
  isPublished: boolean;
  notes?: string;
  image?: string;
  
  // Relations (support both formats)
  communityId?: string;
  creatorId?: string;
  community: {
    id: string;
    name: string;
    slug: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
  };
  
  // Sub-entities
  sessions: EventSession[];
  tickets: EventTicket[];
  speakers: EventSpeaker[];
  attendees: EventAttendee[];
  
  // Computed
  totalRevenue: number;
  totalAttendees: number;
  averageAttendance: number;
  tags: string[];
  
  // Timestamps
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User event registration (matches backend registration structure)
 */
export interface EventRegistration {
  eventId: string;
  event: Event;
  ticketType: string;
  registeredAt: string;
  checkedIn: boolean;
}

/**
 * API response for event list
 */
export interface EventListResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Event filters for browsing (matches backend filter parameters)
 */
export interface EventFilters {
  page?: number;
  limit?: number;
  communityId?: string;
  communitySlug?: string;
  category?: string;
  type?: 'In-person' | 'Online' | 'Hybrid';
  isActive?: boolean;
  isPublished?: boolean;
  search?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get events with filters (for browsing)
 * 
 * @param filters - Filter options for events
 * @returns Promise with event list response
 */
export async function getEvents(filters: EventFilters = {}): Promise<EventListResponse> {
  try {
    console.log('🎉 [EVENT-API] Fetching events with filters:', filters);

    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.communityId) params.append('communityId', filters.communityId);
    if (filters.category) params.append('category', filters.category);
    if (filters.type) params.append('type', filters.type);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.isPublished !== undefined) params.append('isPublished', filters.isPublished.toString());
    if (filters.search) params.append('search', filters.search);

    const resp = await tryEndpoints<any>(
      `/api/events?${params.toString()}`,
      {
        method: 'GET',
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [EVENT-API] Events fetched successfully:', resp.data.data?.events?.length || 0);
      return {
        events: resp.data.data?.events || [],
        total: resp.data.data?.total || 0,
        page: resp.data.data?.page || 1,
        limit: resp.data.data?.limit || 10,
        totalPages: resp.data.data?.totalPages || 1,
      };
    }

    throw new Error(resp.data?.message || 'Failed to fetch events');
  } catch (error: any) {
    console.error('💥 [EVENT-API] Error fetching events:', error);
    throw new Error(error.message || 'Failed to fetch events');
  }
}

/**
 * Get event by ID (detailed view)
 * 
 * @param eventId - Event ID
 * @returns Promise with event details
 */
export async function getEventById(eventId: string): Promise<Event> {
  try {
    console.log('🎉 [EVENT-API] Fetching event details:', eventId);

    const resp = await tryEndpoints<any>(
      `/api/events/${eventId}`,
      {
        method: 'GET',
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [EVENT-API] Event details fetched:', resp.data.data?.title);
      return resp.data.data;
    }

    throw new Error(resp.data.message || 'Failed to fetch event');
  } catch (error: any) {
    console.error('💥 [EVENT-API] Error fetching event:', error);
    throw new Error(error.message || 'Failed to fetch event details');
  }
}

/**
 * Register for an event
 * 
 * @param eventId - Event ID to register for
 * @param ticketType - Ticket type to register with (e.g., 'regular', 'vip', 'early-bird', 'student', 'free')
 * @param promoCode - Optional promo code for discount
 * @returns Promise with success message
 */
export async function registerForEvent(
  eventId: string,
  ticketType: string,
  promoCode?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required. Please login to register for events.');
    }

    console.log('📝 [EVENT-API] Registering for event:', { eventId, ticketType, promoCode });

    // Build the URL with promo code if provided
    const url = promoCode 
      ? `/api/events/${eventId}/register?promoCode=${encodeURIComponent(promoCode)}`
      : `/api/events/${eventId}/register`;

    const resp = await tryEndpoints<any>(
      url,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { ticketType },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [EVENT-API] Registration successful');
      return {
        success: resp.data.success || true,
        message: resp.data.message || 'Successfully registered for event'
      };
    }

    throw new Error(resp.data.message || 'Failed to register for event');
  } catch (error: any) {
    console.error('💥 [EVENT-API] Error registering for event:', error);
    throw new Error(error.message || 'Failed to register for event');
  }
}

/**
 * Unregister from an event
 * 
 * @param eventId - Event ID to unregister from
 * @returns Promise with success status
 */
export async function unregisterFromEvent(eventId: string): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('👋 [EVENT-API] Unregistering from event:', eventId);

    const resp = await tryEndpoints<any>(
      `/api/events/${eventId}/unregister`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [EVENT-API] Unregistered successfully');
      return { success: true, message: 'Successfully unregistered from event' };
    }

    throw new Error(resp.data.message || 'Failed to unregister from event');
  } catch (error: any) {
    console.error('💥 [EVENT-API] Error unregistering from event:', error);
    throw new Error(error.message || 'Failed to unregister from event');
  }
}

/**
 * Get events by community ID
 * 
 * @param communityId - Community ID
 * @param filters - Additional filters (category, type, search, etc.)
 * @returns Promise with event list response
 */
export async function getEventsByCommunity(
  communityId: string,
  filters: Omit<EventFilters, 'communityId'> = {}
): Promise<EventListResponse> {
  return getEvents({
    ...filters,
    communityId,
  });
}

/**
 * Get events by community slug (alternative method)
 * 
 * @param communitySlug - Community slug (URL-friendly identifier)
 * @param filters - Additional filters (category, type, search, etc.)
 * @returns Promise with event list response
 */
export async function getEventsByCommunitySlug(
  communitySlug: string,
  filters: Omit<EventFilters, 'communitySlug'> = {}
): Promise<EventListResponse> {
  return getEvents({
    ...filters,
    communitySlug,
  });
}

/**
 * Get user's event registrations
 * 
 * @returns Promise with list of events the user is registered for
 */
export async function getMyEventRegistrations(): Promise<Event[]> {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.log('⚠️ [EVENT-API] No auth token - returning empty registrations');
      return [];
    }

    console.log('📊 [EVENT-API] Fetching my event registrations');
    
    const resp = await tryEndpoints<any>(
      `/api/events/my-registrations`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [EVENT-API] Event registrations fetched:', resp.data.events?.length || 0);
      return resp.data.events || [];
    }

    return [];
  } catch (error: any) {
    console.error('💥 [EVENT-API] Error fetching event registrations:', error);
    return [];
  }
}

/**
 * Get user's registered events (alias for getMyEventRegistrations)
 * 
 * @returns Promise with list of registered events
 * @deprecated Use getMyEventRegistrations() instead
 */
export async function getMyRegisteredEvents(): Promise<Event[]> {
  return getMyEventRegistrations();
}

/**
 * Purchase event with wallet
 * 
 * @param eventId - Event ID to purchase
 * @param amount - Amount to pay (in the event's currency)
 * @param creatorId - Creator ID (event owner)
 * @returns Promise with purchase result including new balance
 */
export async function purchaseEventWithWallet(
  eventId: string,
  amount: number,
  creatorId: string
): Promise<{ success: boolean; newBalance: number; message?: string }> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Authentication required. Please login to purchase events.');
    }

    console.log('💳 [EVENT-API] Purchasing event with wallet:', { eventId, amount, creatorId });

    const resp = await tryEndpoints<any>(
      '/api/wallet/purchase',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          contentType: 'event',
          contentId: eventId,
          amount,
          creatorId,
          description: 'Event registration',
        },
        timeout: 30000,
      }
    );

    if (resp.status >= 200 && resp.status < 300) {
      console.log('✅ [EVENT-API] Event purchased successfully');
      return {
        success: true,
        newBalance: resp.data.data?.newBalance || 0,
        message: resp.data.message || 'Purchase successful',
      };
    }

    throw new Error(resp.data?.message || 'Failed to purchase event');
  } catch (error: any) {
    console.error('💥 [EVENT-API] Error purchasing event:', error);
    throw new Error(error.message || 'Failed to purchase event');
  }
}

/**
 * Check if user is registered for an event
 * 
 * @param eventId - Event ID (can be either _id or id field)
 * @returns Promise with boolean registration status
 */
export async function isRegisteredForEvent(eventId: string): Promise<boolean> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return false;
    }

    const registeredEvents = await getMyEventRegistrations();
    return registeredEvents.some(event => event._id === eventId || event.id === eventId);
  } catch (error) {
    return false;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get event status based on current date
 * 
 * @param event - Event object
 * @returns Status: 'upcoming', 'active', or 'completed'
 */
export function getEventStatus(event: Event): 'upcoming' | 'active' | 'completed' {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate || event.startDate);
  
  if (startDate > now) return 'upcoming';
  if (endDate < now) return 'completed';
  return 'active';
}

/**
 * Calculate days until event starts
 * 
 * @param startDate - Event start date (ISO string)
 * @returns Number of days until event (0 if event has started or passed)
 */
export function getDaysUntilEvent(startDate: string): number {
  const now = new Date();
  const start = new Date(startDate);
  const diffTime = start.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Format event date range for display
 * 
 * @param startDate - Event start date (ISO string)
 * @param endDate - Event end date (ISO string, optional)
 * @returns Formatted date range string (e.g., "Jan 15, 2024" or "Jan 15 - Jan 17, 2024")
 */
export function formatEventDateRange(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  
  // Same day event
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('en-US', options);
  }
  
  // Multi-day event
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

/**
 * Get the minimum price from available event tickets
 * 
 * @param event - Event object
 * @returns Minimum ticket price (0 if all tickets are free or no tickets)
 */
export function getEventPrice(event: Event): number {
  if (!event.tickets || event.tickets.length === 0) return 0;
  const prices = event.tickets.map(t => t.price).filter(p => p > 0);
  return prices.length > 0 ? Math.min(...prices) : 0;
}

/**
 * Check if event is free (all tickets are free or no tickets)
 * 
 * @param event - Event object
 * @returns True if event is free, false otherwise
 */
export function isEventFree(event: Event): boolean {
  return getEventPrice(event) === 0;
}

/**
 * Check if user is registered for an event
 * 
 * @param event - Event object
 * @param userId - User ID to check (null if not logged in)
 * @returns True if user is registered, false otherwise
 */
export function isUserRegistered(event: Event, userId: string | null): boolean {
  if (!userId || !event.attendees) return false;
  return event.attendees.some(a => a.user.id === userId);
}

/**
 * Format event time for display
 * 
 * @param startTime - Start time string (e.g., "14:00")
 * @param endTime - End time string (e.g., "16:00")
 * @returns Formatted time range (e.g., "2:00 PM - 4:00 PM")
 */
export function formatEventTime(startTime: string, endTime: string): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

/**
 * Get event duration in hours
 * 
 * @param startTime - Start time string (e.g., "14:00")
 * @param endTime - End time string (e.g., "16:00")
 * @returns Duration in hours
 */
export function getEventDuration(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  return (endTotalMinutes - startTotalMinutes) / 60;
}

/**
 * Get available spots remaining for an event
 * 
 * @param event - Event object
 * @returns Number of available spots (null if unlimited)
 */
export function getAvailableSpots(event: Event): number | null {
  if (!event.tickets || event.tickets.length === 0) return null;
  
  const totalCapacity = event.tickets.reduce((sum, ticket) => {
    return sum + (ticket.quantity || 0);
  }, 0);
  
  const totalSold = event.tickets.reduce((sum, ticket) => {
    return sum + ticket.sold;
  }, 0);
  
  if (totalCapacity === 0) return null; // Unlimited
  return Math.max(0, totalCapacity - totalSold);
}

/**
 * Check if event is sold out
 * 
 * @param event - Event object
 * @returns True if event is sold out, false otherwise
 */
export function isEventSoldOut(event: Event): boolean {
  const availableSpots = getAvailableSpots(event);
  return availableSpots !== null && availableSpots === 0;
}

/**
 * Get event type icon name (for UI display)
 * 
 * @param type - Event type
 * @returns Icon name string
 */
export function getEventTypeIcon(type: 'In-person' | 'Online' | 'Hybrid'): string {
  switch (type) {
    case 'In-person':
      return 'map-pin';
    case 'Online':
      return 'video';
    case 'Hybrid':
      return 'globe';
    default:
      return 'calendar';
  }
}

/**
 * Get event status badge color
 * 
 * @param status - Event status
 * @returns Color string for badge
 */
export function getEventStatusColor(status: 'upcoming' | 'active' | 'completed'): string {
  switch (status) {
    case 'upcoming':
      return '#3b82f6'; // Blue
    case 'active':
      return '#10b981'; // Green
    case 'completed':
      return '#6b7280'; // Gray
    default:
      return '#6b7280';
  }
}
