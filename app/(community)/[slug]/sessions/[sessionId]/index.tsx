import BackButton from '@/_components/BackButton';
import { ThemedText } from '@/_components/ThemedText';
import { ThemedView } from '@/_components/ThemedView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import { getSessionById, getAvailableSlots, bookSlot, convertSessionForUI } from '../../../../../lib/session-api';
import { styles } from '../styles';
import { BookingButton } from './_components/BookingButton';
import { DateTimeOption, DateTimeSelector } from './_components/DateTimeSelector';
import { MentorCard } from './_components/MentorCard';
import { SessionDescription } from './_components/SessionDescription';
import { SessionHeader } from './_components/SessionHeader';
import { SessionMetadata } from './_components/SessionMetadata';

export default function SessionDetailScreen() {
  const router = useRouter();
  const { slug, sessionId } = useLocalSearchParams<{ slug: string; sessionId: string }>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Backend state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<any>(null);
  const [dateOptions, setDateOptions] = useState<DateTimeOption[]>([]);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  
  // Fetch session data from backend
  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);
  
  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📚 Fetching session details:', sessionId);
      
      // Fetch session details
      const sessionData = await getSessionById(sessionId as string);
      const transformedSession = convertSessionForUI(sessionData);
      setSessionType(transformedSession);
      
      // Fetch available slots for booking
      const slots = await getAvailableSlots(sessionId as string);
      const transformedSlots: DateTimeOption[] = slots.map((slot) => ({
        id: slot.id,
        date: new Date(slot.start_time).toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        }),
        time: new Date(slot.start_time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        available: slot.is_available,
        startTime: slot.start_time,
        endTime: slot.end_time,
      }));
      setDateOptions(transformedSlots);
      
      console.log('✅ Session data loaded');
    } catch (err: any) {
      console.error('❌ Error fetching session data:', err);
      setError(err.message || 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };
  
  const mentor = sessionType?.mentor;
  
  const handleBackToHome = () => {
    router.replace(`/(community)/${slug}/(loggedUser)/home`);
  };
  
  const handleBookSession = async () => {
    if (!selectedDate) return;
    
    try {
      setBookingInProgress(true);
      console.log('📝 Booking session:', sessionId, 'Slot:', selectedDate);
      
      // Book the selected slot
      await bookSlot(sessionId as string, {
        slot_id: selectedDate,
        notes: '', // Add notes input if needed
      });
      
      console.log('✅ Session booked successfully');
      // Navigate back to sessions list
      router.push(`/(community)/${slug}/sessions`);
    } catch (err: any) {
      console.error('❌ Error booking session:', err);
      setError(err.message || 'Failed to book session');
    } finally {
      setBookingInProgress(false);
    }
  };
  
  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8e78fb" />
        <ThemedText style={{ marginTop: 16, opacity: 0.7 }}>Loading session details...</ThemedText>
      </ThemedView>
    );
  }
  
  if (error || !sessionType || !mentor) {
    return (
      <ThemedView style={styles.container}>
        <BackButton onPress={handleBackToHome} />
        <ThemedText style={styles.notFound}>
          {error || 'Session not found'}
        </ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SessionHeader 
          onBack={handleBackToHome} 
          title={sessionType.title} 
        />
        
        <SessionMetadata 
          duration={sessionType.duration} 
          price={sessionType.price} 
        />
        
        <SessionDescription description={sessionType.description} />
        
        <MentorCard mentor={mentor} />
        
        <DateTimeSelector
          dateOptions={dateOptions}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        
        <BookingButton
          onBook={handleBookSession}
          disabled={!selectedDate || bookingInProgress}
        />
      </ScrollView>
    </ThemedView>
  );
}
