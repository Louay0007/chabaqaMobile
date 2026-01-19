import {
  mockPosts,
  mockActiveMembers
} from '@/lib/mock-data';
import {
  getCommunityBySlug as getBackendCommunity,
  getActiveMembersByCommunity
} from '@/lib/communities-api';
import {
  getPostsByCommunity,
  createPost,
  uploadPostImage,
  likePost,
  unlikePost,
  bookmarkPost,
  unbookmarkPost,
  convertPostForUI
} from '@/lib/post-api';
import { useAuth } from '@/hooks/use-auth';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
  Alert
} from 'react-native';
import MobileView from "./_components/MobileView";
import { styles } from './styles';

export default function CommunityDashboard() {
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [community, setCommunity] = useState<any>(null);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [resetImage, setResetImage] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const likingPostsRef = useRef<Set<string>>(new Set());
  const { slug } = useLocalSearchParams();
  const { user: currentUser } = useAuth();

  // Fetch community and posts data from backend
  useEffect(() => {
    fetchCommunityData();
    fetchPosts();
    fetchActiveMembers();
  }, [slug]);

  // Fetch posts from backend
  const fetchPosts = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (!community?.id && !isRefresh) return;

      console.log('📝 Fetching posts for community:', community?.id || slug);

      const communityId = community?.id;
      if (!communityId && !isRefresh) {
        // Wait for community to load first
        return;
      }

      let targetCommunityId = communityId;
      if (!targetCommunityId) {
        // Try to get community ID from slug
        const tempCommunity = await getBackendCommunity(slug as string);
        if (tempCommunity.success && tempCommunity.data) {
          targetCommunityId = tempCommunity.data._id || tempCommunity.data.id;
        }
      }

      if (!targetCommunityId) {
        console.warn('⚠️ No community ID available for fetching posts');
        return;
      }

      console.log('🎯 About to fetch posts with communityId:', targetCommunityId);

      // First, let's test if we can reach the debug endpoint
      try {
        const debugResp = await fetch('http://localhost:3000/api/posts/debug/count');
        console.log('🔍 Debug endpoint status:', debugResp.status);
        if (debugResp.ok) {
          const debugData = await debugResp.json();
          console.log('📊 Total posts in database:', debugData);
        }

        // Also call the inspect endpoint
        const inspectResp = await fetch(`http://localhost:3000/api/posts/debug/inspect/${targetCommunityId}`);
        if (inspectResp.ok) {
          const inspectData = await inspectResp.json();
          console.log('🔍 Database inspection:', inspectData);
          console.log('🎯 DIAGNOSIS:', inspectData.data?.diagnosis);
        }

        // Test the complete flow
        const flowResp = await fetch(`http://localhost:3000/api/posts/debug/test-flow/${targetCommunityId}`);
        if (flowResp.ok) {
          const flowData = await flowResp.json();
          console.log('🧪 Complete flow test:', flowData);
          if (flowData.data?.serviceResult?.posts?.length > 0) {
            console.log('👤 First post author:', flowData.data.serviceResult.posts[0].author);
          }
        }
      } catch (debugError) {
        console.warn('⚠️ Debug endpoint failed:', debugError);
      }

      const postsResponse = await getPostsByCommunity(targetCommunityId, {
        page: pageNum,
        limit: 10
      });

      // Transform posts for UI - use backend URLs directly
      const transformedPosts = postsResponse.posts.map((post: any) => {
        return {
          id: post.id,
          content: post.content,
          title: post.title,
          author: {
            id: post.author?.id || post.authorId,
            name: post.author?.name || 'Unknown User',
            avatar: post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=8B5CF6&color=fff`,
            role: post.author?.role || 'member',
          },
          createdAt: new Date(post.createdAt),
          likes: post.likes || 0,
          comments: post.comments?.length || 0,
          shares: 0,
          images: post.thumbnail ? [post.thumbnail] : (post.images || []),
          tags: post.tags || [],
          isLiked: post.isLikedByUser || false,
          isBookmarked: false,
          excerpt: post.excerpt,
          thumbnail: post.thumbnail,
        };
      });

      if (pageNum === 1 || isRefresh) {
        setPosts(transformedPosts);
      } else {
        setPosts(prev => [...prev, ...transformedPosts]);
      }

      setHasMore(postsResponse.pagination.page < postsResponse.pagination.totalPages);
      console.log('✅ Posts loaded:', transformedPosts.length);
    } catch (err: any) {
      console.error('❌ Error fetching posts:', err);

      // Fallback to mock data on first load
      if (pageNum === 1 || posts.length === 0) {
        setPosts([]);
      }
    }
  };

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🏠 Fetching community data for home page:', slug);

      const response = await getBackendCommunity(slug as string);

      if (response.success && response.data) {
        // Extract creator info (backend returns populated createur object)
        const creatorData = response.data.createur;
        const creatorName = creatorData?.name || creatorData?.email?.split('@')[0] || 'Unknown Creator';
        const creatorAvatar = creatorData?.profile_picture || creatorData?.avatar || creatorData?.photo ||
          `https://placehold.co/64x64?text=${encodeURIComponent(creatorName.charAt(0).toUpperCase())}&style=identicon`;

        // Extract member count
        let memberCount = 0;
        if (typeof response.data.members === 'number') {
          memberCount = response.data.members;
        } else if (Array.isArray(response.data.members)) {
          memberCount = response.data.members.length;
        } else if (response.data.membersCount) {
          memberCount = response.data.membersCount;
        }

        // Transform backend data for community home
        const transformedCommunity = {
          id: response.data._id?.toString() || response.data.id,
          slug: response.data.slug,
          name: response.data.name,
          creator: creatorName,
          creatorId: response.data.createur?._id || response.data.creatorId,
          creatorAvatar: creatorAvatar,
          description: response.data.short_description || response.data.description || '',
          longDescription: response.data.longDescription || response.data.long_description || response.data.short_description || '',
          category: response.data.category || 'General',
          members: memberCount,
          rating: response.data.rating || response.data.averageRating || 0,
          price: response.data.price || response.data.fees_of_join || 0,
          priceType: response.data.priceType || 'free',
          currency: response.data.currency || 'TND',
          tags: response.data.tags || [],
          featured: response.data.featured || false,
          verified: response.data.isVerified || false,
          type: response.data.type || 'community',
          settings: response.data.settings || {},
          isPrivate: response.data.isPrivate || false,
        };

        setCommunity(transformedCommunity);
        console.log('✅ Community data loaded for home:', transformedCommunity.name);

        // Fetch posts after community data is loaded
        setTimeout(() => fetchPosts(1, true), 100);
      }
    } catch (err: any) {
      console.error('❌ Error fetching community data:', err);
      setError('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active members from backend
  const fetchActiveMembers = async () => {
    try {
      console.log('👥 [ACTIVE-MEMBERS] Fetching active members for:', slug);

      const response = await getActiveMembersByCommunity(slug as string, 15);

      if (response.success && response.data) {
        console.log('📦 [ACTIVE-MEMBERS] API Response:', {
          total: response.data.total,
          online: response.data.online,
          membersCount: response.data.members.length
        });

        // Transform API data for UI
        const transformedMembers = response.data.members.map((member) => ({
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          isOnline: member.isOnline, // Real online status from backend!
        }));

        console.log('✅ [ACTIVE-MEMBERS] Loaded members:', {
          total: transformedMembers.length,
          online: transformedMembers.filter(m => m.isOnline).length
        });

        setActiveMembers(transformedMembers);
      }
    } catch (error: any) {
      console.error('❌ [ACTIVE-MEMBERS] Error fetching:', error);

      // Fallback to mock data on error
      console.log('⚠️ [ACTIVE-MEMBERS] Using fallback mock data');
      setActiveMembers(mockActiveMembers);
    }
  };


  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await Promise.all([
      fetchPosts(1, true),
      fetchActiveMembers()
    ]);
    setRefreshing(false);
  }, [community]);

  if (loading) {
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

  if (error || !community) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Community not found'}
          </Text>
          <Text style={[styles.errorText, { fontSize: 14, marginTop: 8, opacity: 0.7 }]}>
            Slug: {slug}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleLike = async (postId: string) => {
    // Prevent multiple simultaneous requests for the same post (synchronous check)
    if (likingPostsRef.current.has(postId)) {
      console.log('⏳ [LIKE] Already processing like for post:', postId);
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Save original state before optimistic update
      const wasLiked = post.isLiked;

      // Mark this post as being processed (synchronous)
      likingPostsRef.current.add(postId);
      console.log('🔒 [LIKE] Locked post:', postId, 'wasLiked:', wasLiked);

      // Optimistic update
      setPosts(posts.map((p: any) =>
        p.id === postId
          ? {
            ...p,
            isLiked: !p.isLiked,
            likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          }
          : p
      ));

      // Call backend API using the original state
      let result;
      if (wasLiked) {
        result = await unlikePost(postId);
        console.log('💔 Post unliked:', postId);
      } else {
        result = await likePost(postId);
        console.log('❤️ Post liked:', postId);
      }

      // Sync with backend response to ensure consistency
      if (result) {
        setPosts(posts.map((p: any) =>
          p.id === postId
            ? {
              ...p,
              isLiked: result.isLikedByUser,
              likes: result.totalLikes,
            }
            : p
        ));
        console.log('✅ [LIKE] Synced with backend:', result);
      }
    } catch (err: any) {
      console.error('❌ Error updating like:', err);
      // Revert optimistic update
      setPosts(posts.map((p: any) =>
        p.id === postId
          ? {
            ...p,
            isLiked: !p.isLiked,
            likes: p.isLiked ? p.likes + 1 : p.likes - 1,
          }
          : p
      ));
    } finally {
      // Remove from processing set (synchronous)
      likingPostsRef.current.delete(postId);
      console.log('🔓 [LIKE] Unlocked post:', postId);
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Optimistic update
      setPosts(posts.map((p: any) =>
        p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
      ));

      // Call backend API
      if (post.isBookmarked) {
        await unbookmarkPost(postId);
        console.log('🔖 Post unbookmarked:', postId);
      } else {
        await bookmarkPost(postId);
        console.log('🔖 Post bookmarked:', postId);
      }
    } catch (err: any) {
      console.error('❌ Error updating bookmark:', err);
      // Revert optimistic update
      setPosts(posts.map((p: any) =>
        p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
      ));
    }
  };

  const handleCreatePost = async (selectedImage: string | null) => {
    const trimmedContent = newPost.trim();
    
    // Validate content
    if (!trimmedContent || !community?.id) {
      console.warn('⚠️ Cannot create post: missing content or community', { newPost: trimmedContent, communityId: community?.id });
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    // Better validation: count actual characters using spread operator
    // This handles most emojis correctly
    const visibleChars = [...trimmedContent];
    const charCount = visibleChars.length;
    
    console.log('📊 Content validation:', { 
      content: trimmedContent, 
      stringLength: trimmedContent.length, 
      charCount,
      chars: visibleChars 
    });
    
    // Backend requires minimum 2 characters for title
    // Be strict to avoid backend rejection
    if (charCount < 2) {
      console.warn('⚠️ Content too short:', { content: trimmedContent, charCount });
      Alert.alert(
        'Content Too Short', 
        'Please enter at least 2 characters. A single emoji is not enough.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setCreatingPost(true);
      console.log('✍️ Creating new post...');
      console.log('🏘️ Community data:', community);
      console.log('👤 Current user:', currentUser);
      console.log('🖼️ Selected image:', selectedImage);

      // Upload image if selected
      let imageUrls: string[] = [];
      if (selectedImage) {
        console.log('📤 Uploading image...');
        try {
          const uploadedUrl = await uploadPostImage(selectedImage);
          console.log('✅ Image uploaded:', uploadedUrl);
          imageUrls.push(uploadedUrl);
        } catch (uploadError) {
          console.error('❌ Failed to upload image:', uploadError);
          Alert.alert('Warning', 'Failed to upload image. Post will be created without image.');
        }
      }

      const postData = {
        title: trimmedContent.substring(0, 100), // Use first 100 chars as title
        content: trimmedContent,
        communityId: community.id,
        tags: [],
        images: imageUrls, // Send images array
        thumbnail: imageUrls.length > 0 ? imageUrls[0] : undefined, // Also set thumbnail for backward compatibility
      };

      console.log('📝 Post data being sent:', postData);

      const createdPost = await createPost(postData);
      console.log('✅ Post created successfully:', createdPost);

      // Clear input and UI
      setNewPost("");
      setResetImage(true);
      setTimeout(() => setResetImage(false), 100);
      
      // CRITICAL: Wait for MongoDB to fully commit the post, then refresh
      console.log('⏳ Waiting for database commit...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear all posts and refresh from backend to eliminate any mock data
      console.log('🔄 Clearing all posts and refreshing from backend...');
      setPosts([]); // Clear all posts first
      setPage(1); // Reset to page 1
      setHasMore(true); // Reset pagination
      
      // Fetch fresh posts from backend
      await fetchPosts(1, true);
      
      console.log('✅ Post created and feed refreshed with real data');
      Alert.alert('Success', 'Your post has been created successfully!');
    } catch (err: any) {
      console.error('❌ Error creating post:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error type:', typeof err.message);
      
      // Get the raw error message
      let rawMessage = err.message || 'Unknown error';
      let errorMessage = 'Failed to create post. Please try again.';
      
      console.log('🔍 Raw error message:', rawMessage);
      
      // Make common errors user-friendly
      if (rawMessage.toLowerCase().includes('caractère') || rawMessage.toLowerCase().includes('character')) {
        errorMessage = 'Your post is too short. Please add at least 2 characters.';
      } else if (rawMessage.toLowerCase().includes('authentication') || rawMessage.toLowerCase().includes('login')) {
        errorMessage = 'Please login to create posts.';
      } else if (rawMessage.toLowerCase().includes('url') || rawMessage.toLowerCase().includes('image')) {
        errorMessage = 'There was a problem with the image. Please try again.';
      } else if (rawMessage.toLowerCase().includes('validation')) {
        errorMessage = 'Please check your post content and try again.';
      } else if (rawMessage !== 'Unknown error') {
        // Use the backend message if it's meaningful
        errorMessage = rawMessage;
      }
      
      console.log('💬 Final error message:', errorMessage);
      
      Alert.alert('Cannot Create Post', errorMessage);
    } finally {
      setCreatingPost(false);
    }
  };

  // Application mobile uniquement
  return (
    <MobileView
      slug={slug as string}
      community={community}
      activeMembers={activeMembers}
      newPost={newPost}
      setNewPost={setNewPost}
      onCreatePost={handleCreatePost}
      posts={posts}
      onLike={handleLike}
      onBookmark={handleBookmark}
      refreshing={refreshing}
      onRefresh={onRefresh}
      creatingPost={creatingPost}
      resetImage={resetImage}
    />
  );
}