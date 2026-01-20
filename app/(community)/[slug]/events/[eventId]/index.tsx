import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { ThemedView } from '@/_components/ThemedView';
import { ThemedText } from '@/_components/ThemedText';
import { getEventById, registerForEvent, unregisterFromEvent, Event, isRegisteredForEvent } from '@/lib/event-api';
import { getImageUrl } from '@/lib/image-utils';
import { Calendar, MapPin, Clock, Users, Tag, Video, Globe } from 'lucide-react-native';
import { useAuth } from '@/hooks/use-auth';

export default function EventDetailPage() {
  const { slug, eventId } = useLocalSearchParams<{ slug: string; eventId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎉 [EVENT-DETAIL] Fetching event:', eventId);

      const eventData = await getEventById(eventId || '');
      
      // Process images using image-utils
      const processedEvent = {
        ...eventData,
        image: getImageUrl(eventData.image) || 'https://via.placeholder.com/400x300?text=Event',
        creator: {
          ...eventData.creator,
          profile_picture: getImageUrl(eventData.creator.profile_picture) || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(eventData.creator.name)}`
        },
        speakers: (eventData.speakers || []).map(speaker => ({
          ...speaker,
          photo: getImageUrl(speaker.photo) || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}`
        }))
      };
      
      setEvent(processedEvent);

      // Check if user is registered
      if (user) {
        const registered = await isRegisteredForEvent(eventId || '');
        setIsRegistered(registered);
      }

      // Set default ticket type
      if (processedEvent.tickets && processedEvent.tickets.length > 0) {
        setSelectedTicketType(processedEvent.tickets[0].type);
      }

      console.log('✅ [EVENT-DETAIL] Event loaded:', processedEvent.title);
    } catch (err: any) {
      console.error('❌ [EVENT-DETAIL] Error:', err);
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please login to register for events');
      return;
    }

    if (!selectedTicketType) {
      Alert.alert('Select Ticket', 'Please select a ticket type');
      return;
    }

    // Find the selected ticket
    const selectedTicket = event?.tickets.find(t => t.type === selectedTicketType);
    if (!selectedTicket) {
      Alert.alert('Error', 'Selected ticket not found');
      return;
    }

    // Check if ticket has a price
    if (selectedTicket.price > 0) {
      // Redirect to payment screen
      console.log('💰 [EVENT-DETAIL] Ticket requires payment, redirecting to payment screen');
      router.push({
        pathname: '/(communities)/payment',
        params: {
          eventId: eventId,
          ticketType: selectedTicketType,
          contentType: 'event',
        }
      });
      return;
    }

    // Free ticket - register directly
    try {
      setRegistering(true);
      console.log('📝 [EVENT-DETAIL] Registering for free event:', { eventId, ticketType: selectedTicketType });

      await registerForEvent(eventId || '', selectedTicketType);
      
      Alert.alert('Success', 'Successfully registered for event!', [
        { text: 'OK', onPress: () => {
          setIsRegistered(true);
          fetchEventDetails(); // Refresh data
        }}
      ]);
    } catch (err: any) {
      console.error('❌ [EVENT-DETAIL] Registration error:', err);
      Alert.alert('Registration Failed', err.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    Alert.alert(
      'Unregister',
      'Are you sure you want to unregister from this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unregister',
          style: 'destructive',
          onPress: async () => {
            try {
              setRegistering(true);
              await unregisterFromEvent(eventId || '');
              
              Alert.alert('Success', 'Successfully unregistered from event', [
                { text: 'OK', onPress: () => {
                  setIsRegistered(false);
                  fetchEventDetails();
                }}
              ]);
            } catch (err: any) {
              console.error('❌ [EVENT-DETAIL] Unregister error:', err);
              Alert.alert('Error', err.message || 'Failed to unregister');
            } finally {
              setRegistering(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  const getEventTypeIcon = () => {
    if (!event) return null;
    switch (event.type) {
      case 'Online':
        return <Video size={20} color="#8e78fb" />;
      case 'Hybrid':
        return <Globe size={20} color="#8e78fb" />;
      default:
        return <MapPin size={20} color="#8e78fb" />;
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8e78fb" />
        <ThemedText style={styles.loadingText}>Loading event...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !event) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText style={styles.errorText}>{error || 'Event not found'}</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const availableSpots = event.tickets.reduce((total, ticket) => {
    const remaining = (ticket.quantity || 0) - ticket.sold;
    return total + remaining;
  }, 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Event Image */}
        {event.image && (
          <Image source={{ uri: event.image }} style={styles.eventImage} />
        )}

        <View style={styles.content}>
          {/* Event Type Badge */}
          <View style={styles.typeBadge}>
            {getEventTypeIcon()}
            <Text style={styles.typeBadgeText}>{event.type}</Text>
          </View>

          {/* Title */}
          <ThemedText style={styles.title}>{event.title}</ThemedText>

          {/* Description */}
          <ThemedText style={styles.description}>{event.description}</ThemedText>

          {/* Event Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Calendar size={20} color="#6b7280" />
              <ThemedText style={styles.detailText}>
                {formatDate(event.startDate)}
                {event.endDate && ` - ${formatDate(event.endDate)}`}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <Clock size={20} color="#6b7280" />
              <ThemedText style={styles.detailText}>
                {formatTime(event.startTime)} - {formatTime(event.endTime)} ({event.timezone})
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={20} color="#6b7280" />
              <ThemedText style={styles.detailText}>{event.location}</ThemedText>
            </View>

            {event.onlineUrl && (
              <View style={styles.detailRow}>
                <Video size={20} color="#6b7280" />
                <ThemedText style={styles.detailText}>Online event link available</ThemedText>
              </View>
            )}

            <View style={styles.detailRow}>
              <Users size={20} color="#6b7280" />
              <ThemedText style={styles.detailText}>
                {event.totalAttendees} registered · {availableSpots > 0 ? `${availableSpots} spots left` : 'Sold out'}
              </ThemedText>
            </View>
          </View>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Tag size={18} color="#6b7280" />
              <View style={styles.tagsContainer}>
                {event.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tickets */}
          {event.tickets && event.tickets.length > 0 && (
            <View style={styles.ticketsSection}>
              <ThemedText style={styles.sectionTitle}>Tickets</ThemedText>
              {event.tickets.map((ticket) => (
                <TouchableOpacity
                  key={ticket.id}
                  style={[
                    styles.ticketCard,
                    selectedTicketType === ticket.type && styles.selectedTicket
                  ]}
                  onPress={() => setSelectedTicketType(ticket.type)}
                  disabled={isRegistered}
                >
                  <View style={styles.ticketInfo}>
                    <ThemedText style={styles.ticketName}>{ticket.name}</ThemedText>
                    <ThemedText style={styles.ticketDescription}>{ticket.description}</ThemedText>
                    <ThemedText style={styles.ticketAvailability}>
                      {ticket.quantity ? `${ticket.quantity - ticket.sold} / ${ticket.quantity} available` : 'Unlimited'}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.ticketPrice}>
                    {ticket.price === 0 ? 'Free' : `${ticket.price} TND`}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <View style={styles.speakersSection}>
              <ThemedText style={styles.sectionTitle}>Speakers</ThemedText>
              {event.speakers.map((speaker) => (
                <View key={speaker.id} style={styles.speakerCard}>
                  {speaker.photo && (
                    <Image source={{ uri: speaker.photo }} style={styles.speakerPhoto} />
                  )}
                  <View style={styles.speakerInfo}>
                    <ThemedText style={styles.speakerName}>{speaker.name}</ThemedText>
                    <ThemedText style={styles.speakerTitle}>{speaker.title}</ThemedText>
                    <ThemedText style={styles.speakerBio}>{speaker.bio}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Sessions */}
          {event.sessions && event.sessions.length > 0 && (
            <View style={styles.sessionsSection}>
              <ThemedText style={styles.sectionTitle}>Sessions</ThemedText>
              {event.sessions.map((session) => (
                <View key={session.id} style={styles.sessionCard}>
                  <ThemedText style={styles.sessionTitle}>{session.title}</ThemedText>
                  <ThemedText style={styles.sessionDescription}>{session.description}</ThemedText>
                  <View style={styles.sessionDetails}>
                    <ThemedText style={styles.sessionTime}>
                      {formatTime(session.startTime)} - {formatTime(session.endTime)}
                    </ThemedText>
                    <ThemedText style={styles.sessionSpeaker}>Speaker: {session.speaker}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Organizer */}
          <View style={styles.organizerSection}>
            <ThemedText style={styles.sectionTitle}>Organized by</ThemedText>
            <View style={styles.organizerCard}>
              {event.creator.profile_picture && (
                <Image source={{ uri: event.creator.profile_picture }} style={styles.organizerPhoto} />
              )}
              <View style={styles.organizerInfo}>
                <ThemedText style={styles.organizerName}>{event.creator.name}</ThemedText>
                <ThemedText style={styles.organizerEmail}>{event.creator.email}</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Register/Unregister Button */}
      {user && (
        <View style={styles.footer}>
          {isRegistered ? (
            <TouchableOpacity
              style={[styles.registerButton, styles.unregisterButton]}
              onPress={handleUnregister}
              disabled={registering}
            >
              {registering ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Unregister</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.registerButton, availableSpots === 0 && styles.disabledButton]}
              onPress={handleRegister}
              disabled={registering || availableSpots === 0}
            >
              {registering ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>
                  {availableSpots === 0 ? 'Sold Out' : 'Register Now'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    margin: 20,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#8e78fb',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  eventImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
    marginBottom: 24,
  },
  detailsSection: {
    marginBottom: 24,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    flex: 1,
  },
  tagsSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  ticketsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ticketCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTicket: {
    borderColor: '#8e78fb',
    backgroundColor: '#f3f0ff',
  },
  ticketInfo: {
    flex: 1,
    marginRight: 16,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  ticketAvailability: {
    fontSize: 13,
    opacity: 0.6,
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8e78fb',
  },
  speakersSection: {
    marginBottom: 24,
  },
  speakerCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  speakerPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  speakerInfo: {
    flex: 1,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  speakerTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  speakerBio: {
    fontSize: 14,
    opacity: 0.6,
  },
  sessionsSection: {
    marginBottom: 24,
  },
  sessionCard: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  sessionDetails: {
    gap: 4,
  },
  sessionTime: {
    fontSize: 13,
    opacity: 0.6,
  },
  sessionSpeaker: {
    fontSize: 13,
    opacity: 0.6,
  },
  organizerSection: {
    marginBottom: 24,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  organizerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  organizerEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  registerButton: {
    backgroundColor: '#8e78fb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  unregisterButton: {
    backgroundColor: '#ef4444',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
