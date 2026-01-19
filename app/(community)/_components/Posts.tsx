import { useAuth } from '@/hooks/use-auth';
import { UIPost } from '@/hooks/use-posts';
import { colors } from '@/lib/design-tokens';
import { addComment, deleteComment, deletePost, getComments, PostComment, updateComment, updatePost } from '@/lib/post-api';
import {
    Bookmark,
    Check,
    Edit2,
    Heart,
    MessageSquare,
    MoreHorizontal,
    Send,
    Share,
    Trash2,
    X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { communityStyles } from './community-styles';
import PostMenuOverlay from './modals/PostMenuOverlay';

interface PostsProps {
  posts: UIPost[];
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onShare: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (postId: string) => void;
  highlightedPostId?: string | null;
  postRefs?: React.MutableRefObject<{ [key: string]: View | null }>;
}

export default function Posts({ posts, onLike, onBookmark, onShare, onDeletePost, onEditPost, highlightedPostId, postRefs }: PostsProps) {
  const { user: currentUser } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [menuAnchorPostId, setMenuAnchorPostId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [sendingComment, setSendingComment] = useState<{ [key: string]: boolean }>({});
  const [loadedComments, setLoadedComments] = useState<{ [key: string]: PostComment[] }>({});
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({});

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState<string>('');
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
    const isExpanded = expandedComments.has(postId);
    
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    // Charger les commentaires si on les ouvre et qu'ils ne sont pas déjà chargés
    if (!isExpanded && !loadedComments[postId]) {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      try {
        const comments = await getComments(postId, currentUser?.id);
        setLoadedComments(prev => ({ ...prev, [postId]: comments }));
      } catch (error) {
        console.error('❌ Error loading comments:', error);
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
      await addComment(postId, comment);
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      
      // Recharger les commentaires
      const comments = await getComments(postId, currentUser?.id);
      setLoadedComments(prev => ({ ...prev, [postId]: comments }));
      
    } catch (error: any) {
      console.error('❌ Error adding comment:', error);
      const errorMessage = error.message || 'Impossible d\'ajouter le commentaire';
      Alert.alert('Erreur', errorMessage);
    } finally {
      setSendingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Backend fixé - Fonctions de commentaires réactivées
  const handleEditComment = (comment: PostComment) => {
    setEditingCommentId(comment.id);
    setEditedCommentContent(comment.content);
  };

  const handleSaveCommentEdit = async (postId: string, commentId: string) => {
    if (!editedCommentContent.trim()) return;
    try {
      console.log('✏️ [POSTS] Saving comment edit:', commentId);
      await updateComment(postId, commentId, editedCommentContent);
      setEditingCommentId(null);
      setEditedCommentContent('');
      const comments = await getComments(postId, currentUser?.id);
      setLoadedComments(prev => ({ ...prev, [postId]: comments }));
      console.log('✅ [POSTS] Comment updated successfully');
    } catch (error: any) {
      console.error('❌ [POSTS] Error updating comment:', error);
      Alert.alert('Erreur', error.message || 'Impossible de modifier le commentaire');
    }
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditedCommentContent('');
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    Alert.alert(
      'Supprimer le commentaire',
      'Êtes-vous sûr de vouloir supprimer ce commentaire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ [POSTS] Deleting comment:', commentId);
              await deleteComment(postId, commentId);
              const comments = await getComments(postId, currentUser?.id);
              setLoadedComments(prev => ({ ...prev, [postId]: comments }));
              console.log('✅ [POSTS] Comment deleted successfully');
            } catch (error: any) {
              console.error('❌ [POSTS] Error deleting comment:', error);
              Alert.alert('Erreur', error.message || 'Impossible de supprimer le commentaire');
            }
          },
        },
      ]
    );
  };

  const renderPostItem = ({ item }: { item: UIPost }) => {
    const isHighlighted = highlightedPostId === item.id;
    
    return (
    <View 
      ref={(ref) => {
        if (postRefs && postRefs.current) {
          postRefs.current[item.id] = ref;
        }
      }}
      style={[
        communityStyles.postCard,
        isHighlighted && {
          borderWidth: 2,
          borderColor: colors.primary,
        }
      ]}
    >
      <View style={communityStyles.postHeader}>
        <View style={communityStyles.authorContainer}>
          <Image
            source={{ 
              uri: item.author.avatar || `https://ui-avatars.com/api/?name=${item.author.name.replace(/ /g, '+')}&background=8e78fb&color=ffffff&size=128`
            }}
            style={[communityStyles.avatarSmall, { backgroundColor: '#f3f4f6' }]}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={communityStyles.authorName}>{item.author.name}</Text>
            <Text style={communityStyles.postMeta}>
              {item.isShared ? 'a partagé' : formatTimeAgo(item.createdAt)} • {item.author.role}
            </Text>
          </View>
        </View>
        {/* Menu - Backend fixé */}
        <TouchableOpacity 
          onPress={() => handleOpenMenu(item.id)}
          style={communityStyles.menuButton}
        >
          <MoreHorizontal size={20} color={colors.gray500} />
        </TouchableOpacity>
      </View>

      {/* Afficher le post original si c'est un partage */}
      {item.isShared && item.originalPost ? (
        <View style={{
          borderWidth: 1,
          borderColor: colors.gray300,
          borderRadius: 12,
          padding: 12,
          marginTop: 8,
          backgroundColor: colors.gray50,
        }}>
          {/* Header du post original */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Image
              source={{ 
                uri: item.originalPost.author.avatar || `https://ui-avatars.com/api/?name=${item.originalPost.author.name.replace(/ /g, '+')}&background=8e78fb&color=ffffff&size=128`
              }}
              style={[communityStyles.avatarSmall, { width: 32, height: 32 }]}
            />
            <View style={{ marginLeft: 8 }}>
              <Text style={[communityStyles.authorName, { fontSize: 14 }]}>{item.originalPost.author.name}</Text>
              <Text style={[communityStyles.postMeta, { fontSize: 11 }]}>
                {formatTimeAgo(item.originalPost.createdAt)}
              </Text>
            </View>
          </View>
          
          {/* Contenu du post original */}
          {item.originalPost.title && !item.originalPost.title.startsWith('SHARED_POST:') && (
            <Text style={[communityStyles.postContent, { fontWeight: '600', marginBottom: 4 }]}>
              {item.originalPost.title}
            </Text>
          )}
          <Text style={[communityStyles.postContent, { fontSize: 14 }]}>
            {item.originalPost.content}
          </Text>
          
          {/* Tags du post original */}
          {item.originalPost.tags.length > 0 && (
            <View style={[communityStyles.tagsContainer, { marginTop: 8 }]}>
              {item.originalPost.tags.map((tag, index) => (
                <View key={index} style={communityStyles.tag}>
                  <Text style={communityStyles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Image du post original */}
          {item.originalPost.images && item.originalPost.images.length > 0 && (
            <Image
              source={{ uri: item.originalPost.images[0] }}
              style={[communityStyles.postImage, { marginTop: 8 }]}
              resizeMode="contain"
            />
          )}
        </View>
      ) : (
        <>
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
        </>
      )}

      <View style={communityStyles.postActions}>
        <View style={communityStyles.leftActions}>
          <TouchableOpacity
            style={communityStyles.actionButton}
            onPress={() => onLike(item.isShared && item.originalPost ? item.originalPost.id : item.id)}
          >
            <Heart
              size={18}
              color={(item.isShared && item.originalPost ? item.originalPost.isLiked : item.isLiked) ? colors.error : colors.gray500}
              fill={(item.isShared && item.originalPost ? item.originalPost.isLiked : item.isLiked) ? colors.error : "transparent"}
            />
            <Text style={communityStyles.actionText}>
              {item.isShared && item.originalPost ? item.originalPost.likes : item.likes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={communityStyles.actionButton}
            onPress={() => toggleComments(item.id)}
          >
            <MessageSquare size={18} color={colors.gray500} />
            <Text style={communityStyles.actionText}>
              {item.comments}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={communityStyles.actionButton}
            onPress={() => onShare(item.isShared && item.originalPost ? item.originalPost.id : item.id)}
          >
            <Share size={18} color={colors.gray500} />
          </TouchableOpacity>
        </View>
        
        {/* Bookmark button - Backend fixed */}
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
          {/* Afficher les commentaires chargés */}
          {loadingComments[item.id] ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: colors.gray500 }}>Chargement des commentaires...</Text>
            </View>
          ) : loadedComments[item.id] && loadedComments[item.id].length > 0 ? (
            <View style={{ marginBottom: 12 }}>
              {loadedComments[item.id].map((comment) => (
                <View key={comment.id} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.gray200 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Image
                      source={{ 
                        uri: comment.userAvatar || `https://ui-avatars.com/api/?name=${comment.userName.replace(/ /g, '+')}&background=8e78fb&color=ffffff&size=128`
                      }}
                      style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }}
                    />
                    <Text style={{ fontWeight: '600', fontSize: 14, color: colors.gray900 }}>
                      {comment.userName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.gray500, marginLeft: 8 }}>
                      {formatTimeAgo(new Date(comment.createdAt))}
                    </Text>
                    
                    {/* Edit/Delete buttons for comment author - Backend fixé */}
                    {currentUser?.id === comment.userId && (
                      <View style={{ flexDirection: 'row', marginLeft: 'auto', gap: 8 }}>
                        <TouchableOpacity onPress={() => handleEditComment(comment)}>
                          <Edit2 size={16} color={colors.gray500} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteComment(item.id, comment.id)}>
                          <Trash2 size={16} color={colors.gray500} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  
                  {/* Comment content - Edit mode */}
                  {editingCommentId === comment.id ? (
                    <View style={{ marginLeft: 32, marginTop: 8 }}>
                      <TextInput
                        style={{
                          borderWidth: 1,
                          borderColor: colors.gray300,
                          borderRadius: 8,
                          padding: 8,
                          fontSize: 14,
                          color: colors.gray900,
                          minHeight: 60,
                        }}
                        value={editedCommentContent}
                        onChangeText={setEditedCommentContent}
                        multiline
                        autoFocus
                      />
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                        <TouchableOpacity
                          onPress={() => handleSaveCommentEdit(item.id, comment.id)}
                          style={{
                            backgroundColor: colors.primary,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ color: 'white', fontSize: 14 }}>Enregistrer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleCancelCommentEdit}
                          style={{
                            backgroundColor: colors.gray200,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ color: colors.gray700, fontSize: 14 }}>Annuler</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 14, color: colors.gray700, marginLeft: 32 }}>
                      {comment.content}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: colors.gray500, fontSize: 14 }}>Aucun commentaire</Text>
            </View>
          )}
          
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
      
      {/* Overlay menu - Backend fixé */}
      {menuVisible && menuAnchorPostId === item.id && (
        <PostMenuOverlay
          onEditPost={handleEditPost}
          onDeletePost={handleDeletePost}
          isAuthor={currentUser?.id === item.author.id}
          onClose={handleCloseMenu}
        />
      )}
    </View>
  );
  };

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