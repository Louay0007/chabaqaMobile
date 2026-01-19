/**
 * Community Dashboard - Home Page
 * 
 * Clean UI component that uses custom hooks for data management.
 * Separation of concerns: UI only, no business logic.
 */

import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, View } from 'react-native';

import { useActiveMembers } from '@/hooks/use-active-members';
import { useCommunityData } from '@/hooks/use-community-data';
import { usePosts } from '@/hooks/use-posts';

import MobileView from "./_components/MobileView";
import { styles } from './styles';

export default function CommunityDashboard() {
  const { slug, postId } = useLocalSearchParams();
  
  // Initialiser directement avec postId
  const initialPostId = postId ? (typeof postId === 'string' ? postId : postId[0]) : null;
  
  const [newPost, setNewPost] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [resetImage, setResetImage] = useState(false);
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(initialPostId);

  // Custom hooks handle all data logic
  const { community, loading: communityLoading, error: communityError } = useCommunityData(slug as string);
  const { members: activeMembers, refetch: refetchMembers } = useActiveMembers(slug as string);
  const {
    posts,
    fetchPosts,
    createNewPost,
    likePostOptimistic,
    bookmarkPostOptimistic,
    sharePostOptimistic,
    refreshPosts,
    creatingPost,
    hasMore,
  } = usePosts(community?.id || '');
  
  // Effet pour gérer le highlight du post depuis la recherche
  useEffect(() => {
    if (highlightedPostId && posts.length > 0) {
      const postExists = posts.find(p => p.id === highlightedPostId);
      if (postExists) {
        // Réinitialiser après 5 secondes (plus de temps pour le scroll)
        setTimeout(() => {
          setHighlightedPostId(null);
        }, 5000);
      }
    }
  }, [highlightedPostId, posts]);

  // UI Event Handlers (no business logic)
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshPosts(),
      refetchMembers()
    ]);
    setRefreshing(false);
  };

  const handleCreatePost = async (selectedImage: string | null) => {
    const content = newPost.trim();
    
    if (!content) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    if (!community?.id) {
      Alert.alert('Error', 'Community not loaded. Please refresh.');
      return;
    }

    try {
      await createNewPost(content, selectedImage);
      
      // Clear UI
      setNewPost("");
      setResetImage(true);
      setTimeout(() => setResetImage(false), 100);
    } catch (err: any) {
      Alert.alert('Cannot Create Post', err.message || 'Failed to create post');
    }
  };

  const handleLoadMore = async () => {
    if (hasMore) {
      await fetchPosts(Math.floor(posts.length / 10) + 1, false);
    }
  };

  // Loading State
  if (communityLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.errorContainer, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color="#8e78fb" />
          <Text style={[styles.errorText, { marginTop: 16, color: '#6b7280' }]}>
            Loading community...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (communityError || !community) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {communityError || 'Community not found'}
          </Text>
          <Text style={[styles.errorText, { fontSize: 14, marginTop: 8, opacity: 0.7 }]}>
            Slug: {slug}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main UI - Clean and Simple
  return (
    <MobileView
      slug={slug as string}
      community={community}
      activeMembers={activeMembers}
      newPost={newPost}
      setNewPost={setNewPost}
      onCreatePost={handleCreatePost}
      posts={posts}
      onLike={likePostOptimistic}
      onBookmark={bookmarkPostOptimistic}
      onShare={sharePostOptimistic}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      creatingPost={creatingPost}
      resetImage={resetImage}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      highlightedPostId={highlightedPostId}
    />
  );
}