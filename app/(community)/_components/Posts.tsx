import { colors } from '@/lib/design-tokens';
import {
  Bookmark,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Send,
  Share,
  Check,
  X
} from 'lucide-react-native';
import React, { useState, useMemo, useCallback } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { communityStyles } from './community-styles';
import PostMenuOverlay from './modals/PostMenuOverlay';
import { addComment, deletePost, updatePost } from '@/lib/post-api';
import { useAuth } from '@/hooks/use-auth';
import { getImageUrl } from '@/lib/image-utils';

// Import from mock-data
interface PostAuthor {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface Post {
  id: string;
  content: string;
  author: PostAuthor;
  createdAt: Date;
  likes: number;
  comments: number;
  shares: number;
  images: string[];
  tags: string[];
  isLiked: boolean;
  isBookmarked: boolean;
}

interface PostsProps {
  posts: Post[];
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onShare?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (postId: string) => void;
  highlightedPostId?: string | null;
  postRefs?: React.MutableRefObject<{ [key: string]: View | null }>;
}

// Separate component for post image to manage its own loading state
const PostImage = React.memo(({ imageUrl }: { imageUrl: string }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const imageTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (imageTimeoutRef.current) {
        clearTimeout(imageTimeoutRef.current);
      }
    };
  }, []);

  if (imageError) {
    return (
      <View style={styles.imageErrorContainer}>
        <Text style={styles.imageErrorText}>Image unavailable</Text>
      </View>
    );
  }

  return (
    <View style={styles.imageContainer}>
      {imageLoading && (
        <View style={styles.imageLoader}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      )}
      <Image
        source={{ uri: imageUrl }}
        style={styles.postImage}
        resizeMode="cover"
        onLoadStart={() => {
          setImageLoading(true);
          
          if (imageTimeoutRef.current) {
            clearTimeout(imageTimeoutRef.current);
          }
          imageTimeoutRef.current = setTimeout(() => {
            setImageLoading(false);
            setImageError(true);
            imageTimeoutRef.current = null;
          }, 10000);
        }}
        onLoadEnd={() => {
          setImageLoading(false);
          
          if (imageTimeoutRef.current) {
            clearTimeout(imageTimeoutRef.current);
            imageTimeoutRef.current = null;
          }
        }}
        onError={() => {
          setImageLoading(false);
          setImageError(true);
          
          if (imageTimeoutRef.current) {
            clearTimeout(imageTimeoutRef.current);
            imageTimeoutRef.current = null;
          }
        }}
      />
    </View>
  );
});

function Posts({ posts, onLike, onBookmark, onShare, onDeletePost, onEditPost, highlightedPostId, postRefs }: PostsProps) {
  const { user: currentUser } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [menuAnchorPostId, setMenuAnchorPostId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [sendingComment, setSendingComment] = useState<{ [key: string]: boolean }>({});
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [postComments, setPostComments] = useState<{ [key: string]: any[] }>({});
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({});
  const windowWidth = Dimensions.get('window').width;
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };
  
  const handleOpenMenu = (postId: string) => {
    // Store the post ID and show the menu
    const post = posts.find(p => p.id === postId);
    console.log('🔍 [MENU] Current user object:', currentUser);
    console.log('🔍 [MENU] Current user ID:', currentUser?.id);
    console.log('🔍 [MENU] Current user _id:', (currentUser as any)?._id);
    console.log('🔍 [MENU] Post author ID:', post?.author.id);
    console.log('🔍 [MENU] Is author?', currentUser?.id === post?.author.id);
    setMenuAnchorPostId(postId);
    setSelectedPostId(postId);
    setMenuVisible(true);
  };
  
  const handleCloseMenu = () => {
    setMenuVisible(false);
    setSelectedPostId(null);
    setMenuAnchorPostId(null);
  };
  
  const handleDeletePost = async () => {
    if (!selectedPostId) return;
    
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(selectedPostId);
              console.log('✅ Post deleted successfully');
              Alert.alert('Success', 'Post deleted successfully');
              handleCloseMenu();
              if (onDeletePost) {
                onDeletePost(selectedPostId);
              }
            } catch (error: any) {
              console.error('❌ Error deleting post:', error);
              Alert.alert('Error', error.message || 'Failed to delete post');
            }
          },
        },
      ]
    );
  };
  
  const handleEditPost = () => {
    if (!selectedPostId) return;
    const post = posts.find(p => p.id === selectedPostId);
    if (post) {
      setEditingPostId(selectedPostId);
      setEditedContent(post.content);
    }
    handleCloseMenu();
  };
  
  const handleSaveEdit = async (postId: string) => {
    if (!editedContent.trim() || savingEdit) return;
    
    try {
      setSavingEdit(true);
      await updatePost(postId, { content: editedContent });
      console.log('✅ Post updated successfully');
      Alert.alert('Succès', 'Post modifié avec succès');
      setEditingPostId(null);
      setEditedContent('');
      // Refresh posts if callback provided
      if (onEditPost) {
        onEditPost(postId);
      }
    } catch (error: any) {
      console.error('❌ Error updating post:', error);
      Alert.alert('Erreur', error.message || 'Impossible de modifier le post');
    } finally {
      setSavingEdit(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedContent('');
  };

  const toggleComments = async (postId: string) => {
    const isExpanding = !expandedComments.has(postId);
    
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    // Fetch comments if expanding and not already loaded
    if (isExpanding && !postComments[postId]) {
      try {
        setLoadingComments(prev => ({ ...prev, [postId]: true }));
        const { getComments } = await import('@/lib/post-api');
        const comments = await getComments(postId);
        console.log('✅ Comments fetched for post:', postId, comments.length);
        setPostComments(prev => ({ ...prev, [postId]: comments }));
      } catch (error: any) {
        console.error('❌ Error fetching comments:', error);
        Alert.alert('Error', 'Failed to load comments');
      } finally {
        setLoadingComments(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleSendComment = async (postId: string) => {
    const comment = commentTexts[postId]?.trim();
    if (!comment || sendingComment[postId]) return;

    try {
      setSendingComment(prev => ({ ...prev, [postId]: true }));
      const { addComment } = await import('@/lib/post-api');
      const newComment = await addComment(postId, comment);
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      console.log('✅ Comment added successfully');
      
      // Add the new comment to the list
      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      
      Alert.alert('Success', 'Comment added successfully');
    } catch (error: any) {
      console.error('❌ Error adding comment:', error);
      const errorMessage = error.message || 'Failed to add comment';
      Alert.alert('Error', errorMessage);
    } finally {
      setSendingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const renderPostItem = useCallback(({ item }: { item: Post }) => {
    const avatarUrl = item.author.avatar 
      ? getImageUrl(item.author.avatar)
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.author.name)}&background=8B5CF6&color=fff`;

    const postImageUrl = item.images && item.images.length > 0 
      ? getImageUrl(item.images[0])
      : null;

    return (
      <View style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.authorContainer}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{item.author.name}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.postTime}>{formatTimeAgo(item.createdAt)}</Text>
                <View style={styles.metaDot} />
                <Text style={styles.authorRole}>{item.author.role}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => handleOpenMenu(item.id)}
            style={styles.menuButton}
          >
            <MoreHorizontal size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        {editingPostId === item.id ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              multiline
              value={editedContent}
              onChangeText={setEditedContent}
              editable={!savingEdit}
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
                disabled={savingEdit}
              >
                <X size={16} color="#6B7280" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!editedContent.trim() || savingEdit) && styles.saveButtonDisabled
                ]}
                onPress={() => handleSaveEdit(item.id)}
                disabled={!editedContent.trim() || savingEdit}
              >
                {savingEdit ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Check size={16} color="#FFFFFF" />
                )}
                <Text style={styles.saveButtonText}>
                  {savingEdit ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.postContent}>{item.content}</Text>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Post Image */}
        {postImageUrl && <PostImage imageUrl={postImageUrl} />}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <View style={styles.leftActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onLike(item.id)}
            >
              <Heart
                size={20}
                color={item.isLiked ? "#EF4444" : "#6B7280"}
                fill={item.isLiked ? "#EF4444" : "transparent"}
              />
              <Text style={[styles.actionText, item.isLiked && styles.actionTextActive]}>
                {item.likes}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => toggleComments(item.id)}
            >
              <MessageSquare size={20} color="#6B7280" />
              <Text style={styles.actionText}>{item.comments}</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => onBookmark(item.id)}
          >
            <Bookmark
              size={22}
              color={item.isBookmarked ? "#8B5CF6" : "#6B7280"}
              fill={item.isBookmarked ? "#8B5CF6" : "transparent"}
            />
          </TouchableOpacity>
        </View>
        
        {/* Comments Section */}
        {expandedComments.has(item.id) && (
          <View style={styles.commentsSection}>
            {/* Loading indicator */}
            {loadingComments[item.id] && (
              <View style={styles.commentsLoading}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={styles.commentsLoadingText}>Loading comments...</Text>
              </View>
            )}
            
            {/* Comments list */}
            {!loadingComments[item.id] && postComments[item.id] && postComments[item.id].length > 0 && (
              <View style={styles.commentsList}>
                {postComments[item.id].map((comment: any) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Image
                      source={{ 
                        uri: comment.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName || 'U')}&background=8B5CF6&color=fff`
                      }}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentContent}>
                      <Text style={styles.commentAuthor}>{comment.userName || 'Unknown User'}</Text>
                      <Text style={styles.commentText}>{comment.content}</Text>
                      <Text style={styles.commentTime}>{formatTimeAgo(new Date(comment.createdAt))}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {/* No comments message */}
            {!loadingComments[item.id] && (!postComments[item.id] || postComments[item.id].length === 0) && (
              <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
            )}
            
            {/* Comment input */}
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#9CA3AF"
                value={commentTexts[item.id] || ''}
                onChangeText={(text) => setCommentTexts(prev => ({ ...prev, [item.id]: text }))}
                multiline
                editable={!sendingComment[item.id]}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!commentTexts[item.id]?.trim() || sendingComment[item.id]) && styles.sendButtonDisabled
                ]}
                onPress={() => handleSendComment(item.id)}
                disabled={!commentTexts[item.id]?.trim() || sendingComment[item.id]}
              >
                {sendingComment[item.id] ? (
                  <ActivityIndicator size="small" color="#8B5CF6" />
                ) : (
                  <Send size={18} color={commentTexts[item.id]?.trim() ? "#8B5CF6" : "#9CA3AF"} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Overlay menu for this specific post */}
        {menuVisible && menuAnchorPostId === item.id && (
          <PostMenuOverlay
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            isAuthor={(currentUser as any)?._id === item.author.id}
            onClose={handleCloseMenu}
          />
        )}
      </View>
    );
  }, [currentUser, menuVisible, menuAnchorPostId, expandedComments, commentTexts, sendingComment, editingPostId, editedContent, savingEdit, handleOpenMenu, toggleComments, handleSendComment, onLike, onBookmark]);

  return (
    <>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={communityStyles.postsList}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export default React.memo(Posts, (prevProps, nextProps) => {
  // Only re-render if posts array reference changes or length changes
  return prevProps.posts === nextProps.posts && 
         prevProps.posts.length === nextProps.posts.length;
});

// Professional light mode styles
const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postTime: {
    fontSize: 13,
    color: '#6B7280',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 6,
  },
  authorRole: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  menuButton: {
    padding: 4,
    marginTop: -4,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#000000',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  imageContainer: {
    position: 'relative',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  postImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#F9FAFB',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    zIndex: 1,
  },
  imageErrorContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageErrorText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  actionTextActive: {
    color: '#EF4444',
  },
  bookmarkButton: {
    padding: 4,
  },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  commentsLoadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  commentsList: {
    marginBottom: 12,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  noCommentsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000000',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  editContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  editInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    lineHeight: 22,
    color: '#000000',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});