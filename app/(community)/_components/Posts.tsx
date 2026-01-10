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
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { communityStyles } from './community-styles';
import PostMenuOverlay from './modals/PostMenuOverlay';
import { addComment, deletePost, updatePost } from '@/lib/post-api';
import { useAuth } from '@/hooks/use-auth';

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
  onDeletePost?: (postId: string) => void;
  onEditPost?: (postId: string) => void;
}

export default function Posts({ posts, onLike, onBookmark, onDeletePost, onEditPost }: PostsProps) {
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

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleSendComment = async (postId: string) => {
    const comment = commentTexts[postId]?.trim();
    if (!comment || sendingComment[postId]) return;

    try {
      setSendingComment(prev => ({ ...prev, [postId]: true }));
      await addComment(postId, comment);
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      console.log('✅ Comment added successfully');
      Alert.alert('Succès', 'Commentaire ajouté avec succès');
      // TODO: Refresh post comments
    } catch (error: any) {
      console.error('❌ Error adding comment:', error);
      // Display user-friendly error message
      const errorMessage = error.message || 'Impossible d\'ajouter le commentaire';
      Alert.alert('Erreur', errorMessage);
    } finally {
      setSendingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <View style={communityStyles.postCard}>
      <View style={communityStyles.postHeader}>
        <View style={communityStyles.authorContainer}>
          <Image
            source={{ uri: item.author.avatar }}
            style={communityStyles.avatarSmall}
          />
          <View>
            <Text style={communityStyles.authorName}>{item.author.name}</Text>
            <Text style={communityStyles.postMeta}>
              {formatTimeAgo(item.createdAt)} • {item.author.role}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => handleOpenMenu(item.id)}
          style={communityStyles.menuButton}
        >
          <MoreHorizontal size={20} color={colors.gray500} />
        </TouchableOpacity>
      </View>

      {editingPostId === item.id ? (
        <View>
          <TextInput
            style={[
              communityStyles.postContent,
              {
                borderWidth: 1,
                borderColor: colors.primary,
                borderRadius: 8,
                padding: 12,
                minHeight: 100,
                textAlignVertical: 'top',
              }
            ]}
            multiline
            value={editedContent}
            onChangeText={setEditedContent}
            editable={!savingEdit}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.gray200,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                gap: 4,
              }}
              onPress={handleCancelEdit}
              disabled={savingEdit}
            >
              <X size={16} color={colors.gray700} />
              <Text style={{ color: colors.gray700, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: savingEdit ? colors.gray300 : colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                gap: 4,
              }}
              onPress={() => handleSaveEdit(item.id)}
              disabled={!editedContent.trim() || savingEdit}
            >
              <Check size={16} color={colors.white} />
              <Text style={{ color: colors.white, fontWeight: '600' }}>
                {savingEdit ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={communityStyles.postContent}>{item.content}</Text>
      )}

      {item.tags.length > 0 && (
        <View style={communityStyles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={communityStyles.tag}>
              <Text style={communityStyles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {item.images && item.images.length > 0 && (
        <Image
          source={{ uri: item.images[0] }}
          style={communityStyles.postImage}
          resizeMode="contain"
        />
      )}

      <View style={communityStyles.postActions}>
        <View style={communityStyles.leftActions}>
          <TouchableOpacity
            style={communityStyles.actionButton}
            onPress={() => onLike(item.id)}
          >
            <Heart
              size={18}
              color={item.isLiked ? colors.error : colors.gray500}
              fill={item.isLiked ? colors.error : "transparent"}
            />
            <Text style={communityStyles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={communityStyles.actionButton}
            onPress={() => toggleComments(item.id)}
          >
            <MessageSquare size={18} color={colors.gray500} />
            <Text style={communityStyles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={communityStyles.actionButton}>
            <Share size={18} color={colors.gray500} />
            <Text style={communityStyles.actionText}>{item.shares}</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={communityStyles.bookmarkButton}
          onPress={() => onBookmark(item.id)}
        >
          <Bookmark
            size={20}
            color={item.isBookmarked ? colors.warning : colors.gray500}
            fill={item.isBookmarked ? colors.warning : "transparent"}
          />
        </TouchableOpacity>
      </View>
      
      {/* Comments Section */}
      {expandedComments.has(item.id) && (
        <View style={communityStyles.commentsSection}>
          {/* Comment Input */}
          <View style={communityStyles.commentInputContainer}>
            <TextInput
              style={communityStyles.commentInput}
              placeholder="Ajouter un commentaire..."
              placeholderTextColor={colors.gray400}
              value={commentTexts[item.id] || ''}
              onChangeText={(text) => setCommentTexts(prev => ({ ...prev, [item.id]: text }))}
              multiline
              editable={!sendingComment[item.id]}
            />
            <TouchableOpacity
              style={[
                communityStyles.sendButton,
                (!commentTexts[item.id]?.trim() || sendingComment[item.id]) && communityStyles.sendButtonDisabled
              ]}
              onPress={() => handleSendComment(item.id)}
              disabled={!commentTexts[item.id]?.trim() || sendingComment[item.id]}
            >
              <Send size={20} color={commentTexts[item.id]?.trim() ? colors.primary : colors.gray400} />
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

  return (
    <>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={communityStyles.postsList}
      />
    </>
  );
}