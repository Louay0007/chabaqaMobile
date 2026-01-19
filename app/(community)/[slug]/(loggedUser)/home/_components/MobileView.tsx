import React, { useEffect, useRef } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import ActiveMembers from '../../../../_components/ActiveMembers';
import BottomNavigation from '../../../../_components/BottomNavigation';
import Posts from '../../../../_components/Posts';
import { styles } from '../styles';
import CreatePostCard from './ComponentCard';

interface MobileViewProps {
  slug: string;
  community: any;
  activeMembers?: any[];
  newPost: string;
  setNewPost: (text: string) => void;
  onCreatePost: (selectedImage: string | null) => Promise<void>;
  posts: any[];
  onLike: (postId: string) => Promise<void>;
  onBookmark: (postId: string) => Promise<void>;
  onShare: (postId: string) => Promise<void>;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
  creatingPost?: boolean;
  resetImage?: boolean;
  hasMore: boolean; 
  onLoadMore: () => Promise<void>;
  highlightedPostId?: string | null;
}

export default function MobileView({
  slug,
  community,
  activeMembers,
  newPost,
  setNewPost,
  onCreatePost,
  posts,
  onLike,
  onBookmark,
  onShare,
  refreshing,
  onRefresh,
  creatingPost,
  resetImage,
  highlightedPostId,
}: MobileViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const postRefs = useRef<{ [key: string]: View | null }>({});

  // Scroll automatiquement vers le post recherché
  useEffect(() => {
    if (highlightedPostId && posts.length > 0 && postRefs.current[highlightedPostId]) {
      setTimeout(() => {
        const postRef = postRefs.current[highlightedPostId];
        if (postRef && scrollViewRef.current) {
          postRef.measureLayout(
            scrollViewRef.current as any,
            (x, y) => {
              scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
            },
            () => {}
          );
        }
      }, 500);
    }
  }, [highlightedPostId, posts, postRefs]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing || false}
              onRefresh={onRefresh}
              colors={['#8e78fb']}
              tintColor="#8e78fb"
            />
          ) : undefined
        }
      >
        <View style={styles.mobileContent}>
          {/* Active Members */}
          <ActiveMembers members={activeMembers} />

          {/* Create Post */}
          <CreatePostCard
            newPost={newPost}
            setNewPost={setNewPost}
            onCreatePost={onCreatePost}
            creatingPost={creatingPost}
            resetImage={resetImage}
          />

          {/* Posts Feed */}
          <Posts
            posts={posts}
            onLike={onLike}
            onBookmark={onBookmark}
            onShare={onShare}
            highlightedPostId={highlightedPostId}
            postRefs={postRefs}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation slug={slug} currentTab="home" />
    </View>
  );
}
