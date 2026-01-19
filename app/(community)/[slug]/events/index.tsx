import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import CommunityHeader from '../../_components/Header';
import { ThemedView } from '../../../../_components/ThemedView';
import { ThemedText } from '../../../../_components/ThemedText';
import { getCommunityBySlug } from '../../../../lib/communities-api';
import { getEventsByCommunity, getMyEventRegistrations, Event as BackendEvent } from '../../../../lib/event-api';
import { getImageUrl } from '../../../../lib/image-utils';
import BottomNavigation from '../../_components/BottomNavigation';
import EventsPageContent from './_components/EventsPageContent';
import { styles } from './styles';

export default function EventsPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [community, setCommunity] = useState<any>(null);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);

  // Fetch community and events data
  useEffect(() => {
    fetchEventsData();
  }, [slug]);

  const fetchEventsData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎉 [EVENTS] Fetching events for community:', slug);

      // Fetch community data first
      const communityResponse = await getCommunityBySlug(slug || '');
      if (!communityResponse.success || !communityResponse.data) {
        throw new Error('Community not found');
      }

      const communityData = {
        id: communityResponse.data._id || communityResponse.data.id,
        name: communityResponse.data.name,
        slug: communityResponse.data.slug,
      };
      setCommunity(communityData);

      // Fetch events for this community
      console.log('🎉 [EVENTS] Fetching events for community ID:', communityData.id);
      const eventsResponse = await getEventsByCommunity(communityData.id, {
        page: 1,
        limit: 50,
        isActive: true,
        isPublished: true
      });

      console.log('📦 [EVENTS] Response:', {
        total: eventsResponse.total,
        count: eventsResponse.events?.length,
        page: eventsResponse.page,
        limit: eventsResponse.limit
      });

      // Transform backend events to match frontend interface
      console.log('🔄 [EVENTS] Transforming', eventsResponse.events.length, 'events');
      const transformedEvents = (eventsResponse.events || []).map((event: BackendEvent) => {
        console.log('   → Event:', event.title, '| Image:', event.image);
        
        // Process image URL using image-utils
        const processedImage = getImageUrl(event.image) || 'https://via.placeholder.com/400x300?text=Event';
        console.log('   → Processed Image:', processedImage);

        return {
          id: event._id || event.id,
          title: event.title,
          description: event.description,
          shortDescription: event.description.substring(0, 100) + '...',
          image: processedImage,
          communityId: communityData.id,
          creatorId: event.creator?.id || event.creatorId,
          creator: {
            id: event.creator?.id || event.creatorId || '',
            name: event.creator?.name || 'Unknown',
            email: event.creator?.email || '',
            avatar: getImageUrl(event.creator?.profile_picture) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(event.creator?.name || 'U')
          },
          startDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          onlineUrl: event.onlineUrl,
          type: event.type,
          isActive: event.isActive,
          isPublished: event.isPublished,
          maxAttendees: event.tickets?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0,
          attendeesCount: event.totalAttendees || 0,
          tickets: event.tickets || [],
          sessions: event.sessions || [],
          speakers: (event.speakers || []).map(speaker => ({
            ...speaker,
            photo: getImageUrl(speaker.photo)
          })),
          tags: event.tags || [],
          category: event.category,
          venue: event.location,
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        };
      });

      console.log('✅ [EVENTS] Transformed events:', transformedEvents.length);
      setAvailableEvents(transformedEvents);

      // Fetch user's registered events
      console.log('📊 [EVENTS] Fetching user registrations');
      try {
        const registeredEvents = await getMyEventRegistrations();
        console.log('📊 [EVENTS] User registrations response:', registeredEvents?.length || 0);

        const transformedTickets = (registeredEvents || []).map(event => {
          // Find the ticket type the user registered with
          const userRegistration = event.user_registration;
          const ticketType = userRegistration?.ticket_type || 'regular';
          const ticket = event.tickets?.find(t => t.type === ticketType) || event.tickets?.[0];

          // Process image URL
          const eventImage = getImageUrl(event.thumbnail || event.cover_image || event.image) || 'https://via.placeholder.com/400x300?text=Event';

          return {
            id: `${event._id || event.id}-${Date.now()}`,
            eventId: event._id || event.id,
            event: {
              id: event._id || event.id,
              title: event.title,
              description: event.description,
              image: eventImage,
              startDate: new Date(event.start_date || event.startDate),
              endDate: event.end_date ? new Date(event.end_date) : event.endDate ? new Date(event.endDate) : undefined,
              startTime: event.start_time || event.startTime,
              endTime: event.end_time || event.endTime,
              location: event.venue || event.location,
              onlineUrl: event.onlineUrl,
              type: event.type,
              creator: event.created_by || event.creator,
            },
            userId: 'current-user',
            ticketId: ticket?.id || 'general',
            ticket: ticket || {
              id: 'general',
              eventId: event._id || event.id,
              name: 'General Admission',
              description: 'Standard event access',
              price: 0,
              currency: 'TND',
              type: 'regular',
              maxQuantity: 100,
              sold: 0,
              isActive: true,
              benefits: ['Event access']
            },
            quantity: 1,
            totalAmount: ticket?.price || 0,
            currency: 'TND',
            status: 'confirmed' as const,
            registeredAt: userRegistration?.registered_at ? new Date(userRegistration.registered_at) : new Date(),
            updatedAt: new Date(),
            notes: ''
          };
        });

        console.log('✅ [EVENTS] Transformed tickets:', transformedTickets.length);
        setMyTickets(transformedTickets);
      } catch (registrationError: any) {
        console.warn('⚠️ Could not fetch user registrations:', registrationError.message);
        setMyTickets([]);
      }

      console.log('✅ [EVENTS] Events loaded:', transformedEvents.length);
    } catch (err: any) {
      console.error('❌ [EVENTS] Error fetching events:', err);
      setError(err.message || 'Failed to load events');
      setAvailableEvents([]);
      setMyTickets([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8e78fb" />
        <ThemedText style={{ marginTop: 16, opacity: 0.7 }}>Loading events...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <CommunityHeader showBack communitySlug={slug as string} />
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ThemedText style={{ color: '#ef4444', textAlign: 'center', marginBottom: 8 }}>
            {error}
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
            No events available for this community yet.
          </ThemedText>
        </ThemedView>
        <BottomNavigation slug={slug as string} currentTab="events" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <CommunityHeader showBack communitySlug={slug as string} />
      
      <EventsPageContent
        availableEvents={availableEvents}
        myTickets={myTickets}
      />
      <BottomNavigation slug={slug as string} currentTab="events" />
    </ThemedView>
  );
}
