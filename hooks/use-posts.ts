/**
 * Custom Hook: usePosts
 * 
 * Gère les posts d'une communauté avec post-api.ts
 */

import {
  Post,
  PostListResponse,
  bookmarkPost,
  createPost,
  getPostsByCommunity,
  likePost,
  sharePost,
  unbookmarkPost,
  unlikePost,
  uploadPostImage
} from '@/lib/post-api';
import { useCallback, useEffect, useRef, useState } from 'react';

// Interface UI pour les posts (simplifié)
export interface UIPost {
  id: string;
  content: string;
  title: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  createdAt: Date;
  likes: number;
  comments: number;
  shares: number;
  images: string[];
  tags: string[];
  isLiked: boolean;
  isBookmarked: boolean;
  excerpt?: string;
  thumbnail?: string;
  originalPost?: UIPost; // Post original si c'est un partage
  isShared?: boolean; // Indique si c'est un post partagé
}

interface UsePostsResult {
  posts: UIPost[];
  loading: boolean;
  hasMore: boolean;
  page: number;
  fetchPosts: (pageNum?: number, isRefresh?: boolean) => Promise<void>;
  createNewPost: (content: string, imageUri?: string | null) => Promise<void>;
  likePostOptimistic: (postId: string) => Promise<void>;
  bookmarkPostOptimistic: (postId: string) => Promise<void>;
  sharePostOptimistic: (postId: string) => Promise<void>;
  refreshPosts: () => Promise<void>;
  creatingPost: boolean;
}

// Transformer Post API vers UIPost
function transformPostToUI(post: Post, allPosts?: Post[], sharesCache?: Map<string, number>): UIPost {
  // Générer avatar fallback si avatar est vide ou undefined
  const avatarUrl = post.author.avatar && post.author.avatar.trim() !== '' 
    ? post.author.avatar 
    : `https://ui-avatars.com/api/?name=${post.author.name.replace(/ /g, '+')}&background=8e78fb&color=ffffff&size=128`;
  
  // Détecter si c'est un post partagé
  const isShared = post.title.startsWith('SHARED_POST:');
  let originalPost: UIPost | undefined;
  
  if (isShared && allPosts) {
    // Extraire l'ID du post original
    const originalPostId = post.title.replace('SHARED_POST:', '');
    const original = allPosts.find(p => p.id === originalPostId);
    if (original) {
      originalPost = transformPostToUI(original, undefined, sharesCache); // Pas de récursion infinie
    }
  }
  
  // Utiliser le cache de partages si disponible, sinon fallback sur backend (qui est undefined)
  const shares = sharesCache?.get(post.id) ?? post.shares ?? 0;
  
  return {
    id: post.id,
    content: post.content,
    title: isShared ? '' : post.title,
    author: {
      id: post.author.id,
      name: post.author.name,
      avatar: avatarUrl,
      role: 'member',
    },
    createdAt: new Date(post.createdAt),
    likes: post.likes,
    comments: post.comments.length,
    shares,
    images: post.thumbnail ? [post.thumbnail] : [],
    tags: post.tags.filter(t => t !== 'shared'), // Enlever le tag 'shared'
    isLiked: post.isLikedByUser,
    isBookmarked: post.isBookmarked || false,
    excerpt: post.excerpt,
    thumbnail: post.thumbnail,
    originalPost,
    isShared,
  };
}

export function usePosts(communityId: string): UsePostsResult {
  const [posts, setPosts] = useState<UIPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [creatingPost, setCreatingPost] = useState(false);
  const likingPostsRef = useRef<Set<string>>(new Set());
  const originalPostsCache = useRef<Map<string, UIPost>>(new Map()); // Cache des posts originaux
  const sharesCache = useRef<Map<string, number>>(new Map()); // Cache des compteurs de partages

  const fetchPosts = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    if (!communityId) return;

    try {
      setLoading(true);

      const response: PostListResponse = await getPostsByCommunity(communityId, {
        page: pageNum,
        limit: 10
      });

      // Transformer les posts et récupérer les posts originaux pour les partages
      const transformedPosts = await Promise.all(
        response.posts.map(async (post) => {
          const uiPost = transformPostToUI(post, response.posts, sharesCache.current);
          
          // Si c'est un post partagé et qu'on n'a pas le post original, le récupérer
          if (post.title.startsWith('SHARED_POST:') && !uiPost.originalPost) {
            const originalPostId = post.title.replace('SHARED_POST:', '');
            
            // Vérifier le cache d'abord
            if (originalPostsCache.current.has(originalPostId)) {
              uiPost.originalPost = originalPostsCache.current.get(originalPostId);
            } else {
              try {
                const { getPostById } = await import('@/lib/post-api');
                const originalPost = await getPostById(originalPostId);
                const transformedOriginal = transformPostToUI(originalPost, undefined);
                originalPostsCache.current.set(originalPostId, transformedOriginal);
                uiPost.originalPost = transformedOriginal;
              } catch (error) {
                console.warn('⚠️ Could not fetch original post:', originalPostId);
              }
            }
          }
          
          return uiPost;
        })
      );

      if (pageNum === 1 || isRefresh) {
        setPosts(transformedPosts);
        setPage(1);
      } else {
        setPosts(prev => [...prev, ...transformedPosts]);
        setPage(pageNum);
      }

      setHasMore(response.pagination.page < response.pagination.totalPages);
    } catch (err: any) {
      if (pageNum === 1 || posts.length === 0) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  const createNewPost = async (content: string, imageUri?: string | null) => {
    if (!content.trim() || !communityId) {
      throw new Error('Content and community are required');
    }

    if (content.trim().length < 2) {
      throw new Error('Please enter at least 2 characters for your post.');
    }

    try {
      setCreatingPost(true);

      // Upload image si fournie
      let thumbnailUrl: string | undefined;
      if (imageUri) {
        try {
          thumbnailUrl = await uploadPostImage(imageUri);
        } catch (uploadError: any) {
          // Continue sans image si l'upload échoue
        }
      }

      // Créer le post
      const postData: any = {
        title: content.substring(0, 100),
        content: content.trim(),
        communityId,
        tags: [],
      };

      if (thumbnailUrl) {
        postData.thumbnail = thumbnailUrl;
      }

      await createPost(postData);

      // Recharger les posts
      await fetchPosts(1, true);
    } catch (err: any) {
      throw err;
    } finally {
      setCreatingPost(false);
    }
  };

  const likePostOptimistic = async (postId: string) => {
    if (likingPostsRef.current.has(postId)) return;

    try {
      likingPostsRef.current.add(postId);
      let wasLiked: boolean = false;

      // Mise à jour optimiste
      setPosts(currentPosts => {
        const post = currentPosts.find(p => p.id === postId);
        if (!post) return currentPosts;

        wasLiked = post.isLiked;

        return currentPosts.map(p =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
            : p
        );
      });

      // Appel backend
      const result = wasLiked ? await unlikePost(postId) : await likePost(postId);

      // Synchroniser avec la réponse
      setPosts(currentPosts => currentPosts.map(p =>
        p.id === postId
          ? { ...p, isLiked: result.isLikedByUser, likes: result.totalLikes }
          : p
      ));
    } catch (err: any) {
      // Annuler la mise à jour optimiste
      setPosts(currentPosts => currentPosts.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes + 1 : p.likes - 1 }
          : p
      ));
    } finally {
      likingPostsRef.current.delete(postId);
    }
  };

  const bookmarkPostOptimistic = async (postId: string) => {
    try {
      let wasBookmarked: boolean = false;

      // Mise à jour optimiste
      setPosts(currentPosts => {
        const post = currentPosts.find(p => p.id === postId);
        if (!post) return currentPosts;

        wasBookmarked = post.isBookmarked;

        return currentPosts.map(p =>
          p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
        );
      });

      // Appel backend
      if (wasBookmarked) {
        await unbookmarkPost(postId);
      } else {
        await bookmarkPost(postId);
      }
    } catch (err: any) {
      // Annuler la mise à jour optimiste
      setPosts(currentPosts => currentPosts.map(p =>
        p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
      ));
    }
  };

  const sharePostOptimistic = async (postId: string) => {
    try {
      console.log('📤 [USE-POSTS] Sharing post:', postId);
      
      // Trouver le post original
      const originalPost = posts.find(p => p.id === postId);
      if (!originalPost) {
        throw new Error('Post not found');
      }

      // Incrémenter le compteur optimiste avant l'appel API
      setPosts(currentPosts => 
        currentPosts.map(p => 
          p.id === postId ? { ...p, shares: p.shares + 1 } : p
        )
      );

      // Créer un post de partage avec référence à l'original (stockée dans le title pour persistence)
      const shareData = {
        title: `SHARED_POST:${postId}`, // Marqueur pour identifier les posts partagés
        content: `Shared post from ${originalPost.author.name}`, // Contenu minimal requis par le backend
        communityId: communityId,
        tags: ['shared', ...originalPost.tags],
      };
      
      await createPost(shareData);

      // Appeler l'API share pour notifier le backend
      await sharePost(postId);
      
      console.log('✅ [USE-POSTS] Post partagé');
      
      // Rafraîchir pour voir le nouveau post partagé
      await fetchPosts(1, true);
      
    } catch (err: any) {
      console.error('❌ Share error:', err);
      alert('Erreur lors du partage');
    }
  };

  const refreshPosts = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await fetchPosts(1, true);
  }, [fetchPosts]);

  // Auto-chargement au montage et quand communityId change
  useEffect(() => {
    if (communityId) {
      fetchPosts(1, true);
    }
  }, [communityId, fetchPosts]);

  return {
    posts,
    loading,
    hasMore,
    page,
    fetchPosts,
    createNewPost,
    likePostOptimistic,
    bookmarkPostOptimistic,
    sharePostOptimistic,
    refreshPosts,
    creatingPost,
  };
}
