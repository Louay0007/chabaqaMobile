import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { ThemedView } from '../../../_components/ThemedView';
import { useAuth } from '../../../hooks/use-auth';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../../../lib/design-tokens';
import {
  DMConversation,
  DMMessage,
  getMessages,
  isMyMessage,
  markConversationRead,
  sendMessage
} from '../../../lib/dm-api';
import ChatHeader from '../_components/ChatHeader';
import MessageBubble from '../_components/MessageBubble';
import MessageInput from '../_components/MessageInput';

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  // State management
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [conversation, setConversation] = useState<DMConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [sending, setSending] = useState(false);

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const hasMarkedRead = useRef(false);

  // Load messages from API
  const loadMessages = useCallback(async (isRefresh = false) => {
    if (!conversationId) return;
    
    // Don't auto-reload if we already have a permission error (but allow manual refresh)
    if (error.includes('permission') && !isRefresh) {
      console.log('⚠️ [CHAT] Skipping auto-reload due to permission error');
      return;
    }

    try {
      if (isRefresh) {
        setPage(1);
      } else if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError('');

      console.log('💬 [CHAT] Loading messages:', { conversationId, page: isRefresh ? 1 : page });
      console.log('👤 [CHAT] Current user ID:', user?._id);

      const response = await getMessages(conversationId as string, isRefresh ? 1 : page, 30);

      if (isRefresh) {
        setMessages(response.messages.reverse()); // Reverse for chat order (newest at bottom)
        setPage(2);
      } else {
        // For pagination, add older messages at the beginning
        setMessages(prev => page === 1 
          ? response.messages.reverse() 
          : [...response.messages.reverse(), ...prev]
        );
        setPage(prev => prev + 1);
      }

      setHasMore(response.hasMore);
      
      // Set conversation object from API response
      if (response.conversation && !conversation) {
        setConversation(response.conversation);
        console.log('📝 [CHAT] Conversation loaded:', {
          id: response.conversation._id,
          type: response.conversation.type,
          participantA: response.conversation.participantA,
          participantB: response.conversation.participantB,
          communityId: response.conversation.communityId
        });
      }
      
      // Mark conversation as read when first loading
      if (!hasMarkedRead.current && response.messages.length > 0) {
        markAsRead();
        hasMarkedRead.current = true;
      }

      console.log('✅ [CHAT] Messages loaded:', response.messages.length);
    } catch (err: any) {
      console.error('💥 [CHAT] Error loading messages:', err);
      const errorMessage = err.message || 'Failed to load messages';
      setError(errorMessage);
      
      // Log errors but don't show alerts - the UI will show error state
      if (errorMessage.includes('permission') || errorMessage.includes('access') || errorMessage.includes('authorized')) {
        console.error('🚫 [CHAT] Permission denied for conversation:', conversationId);
        console.error('   This usually means the backend has not granted access to this conversation');
      } else {
        console.error('❌ [CHAT] General error:', errorMessage);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [conversationId, page, conversation, error]);

  // Initial load
  useEffect(() => {
    if (conversationId && !error.includes('permission')) {
      loadMessages();
    }
  }, [conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && !loading && !loadingMore) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, loading, loadingMore]);

  // Mark conversation as read
  const markAsRead = async () => {
    if (!conversationId) return;

    try {
      await markConversationRead(conversationId as string);
      console.log('✅ [CHAT] Conversation marked as read');
    } catch (error: any) {
      console.error('💥 [CHAT] Error marking as read:', error);
    }
  };

  // Handle send message
  const handleSendMessage = async (text: string) => {
    if (!conversationId || !text.trim() || sending) return;

    try {
      setSending(true);
      console.log('📤 [CHAT] Sending message:', text.substring(0, 50) + '...');

      const newMessage = await sendMessage(conversationId as string, { text: text.trim() });
      
      // Add message to local state immediately
      setMessages(prev => [...prev, newMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      console.log('✅ [CHAT] Message sent successfully');
    } catch (error: any) {
      console.error('💥 [CHAT] Error sending message:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to send message. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSending(false);
    }
  };

  // Handle load more (older messages)
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      loadMessages(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Render message item
  const renderMessage = ({ item, index }: { item: DMMessage; index: number }) => {
    const isFromMe = isMyMessage(item, user?._id || '');
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
    
    const showAvatar = !isFromMe && (
      !nextMessage || 
      isMyMessage(nextMessage, user?._id || '') || 
      nextMessage.senderId !== item.senderId
    );
    
    const showTimestamp = !nextMessage || 
      new Date(nextMessage.createdAt).getTime() - new Date(item.createdAt).getTime() > 300000; // 5 minutes

    // Show sender name for help conversations when it's from admin and different from previous
    const showSenderName = !isFromMe && conversation?.type === 'HELP_DM' && (
      !previousMessage || 
      isMyMessage(previousMessage, user?._id || '') || 
      previousMessage.senderId !== item.senderId
    );

    return (
      <MessageBubble
        message={item}
        isFromMe={isFromMe}
        showAvatar={showAvatar}
        showTimestamp={showTimestamp}
        showSenderName={showSenderName}
        conversation={conversation}
        currentUserId={user?._id || ''}
      />
    );
  };

  // Render loading header for pagination
  const renderLoadingHeader = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingHeader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading older messages...</Text>
      </View>
    );
  };

  // Error state for permission denied
  if (error && (error.includes('permission') || error.includes('access') || error.includes('authorized')) && messages.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ChatHeader
          conversation={conversation}
          onBack={handleBack}
          currentUserId={user?._id || ''}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Cannot Access Conversation</Text>
          <Text style={styles.errorMessage}>
            This conversation appears in your inbox but the backend is denying access.{'\n\n'}
            This is a temporary server issue. The conversation was created but permissions weren't configured properly.{'\n\n'}
            Please try again later or contact support.
          </Text>
          <TouchableOpacity style={styles.errorButton} onPress={handleBack}>
            <Text style={styles.errorButtonText}>Go Back to Messages</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // Loading state
  if (loading && messages.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ChatHeader
          conversation={conversation}
          onBack={handleBack}
          currentUserId={user?._id || ''}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        {/* Header */}
        <ChatHeader
          conversation={conversation}
          onBack={handleBack}
          currentUserId={user?._id || ''}
        />

        {/* Messages List */}
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={renderLoadingHeader}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            inverted={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesList}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
          />
        </View>

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          sending={sending}
          conversationId={conversationId as string}
        />
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  keyboardView: {
    flex: 1,
  },

  // Messages Container
  messagesContainer: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  messagesList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingTop: spacing.xxxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: colors.gray600,
    fontWeight: fontWeight.medium as any,
  },
  loadingHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.md,
  },

  // Error States
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold as any,
    color: colors.gray900,
    marginBottom: spacing.md,
    textAlign: 'center' as const,
  },
  errorMessage: {
    fontSize: fontSize.base,
    color: colors.gray600,
    textAlign: 'center' as const,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  errorButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  errorButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold as any,
    color: colors.white,
  },
};
