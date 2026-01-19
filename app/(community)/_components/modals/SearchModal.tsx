import { colors } from '@/lib/design-tokens';
import { globalSearch } from '@/lib/search-api';
import { useRouter } from 'expo-router';
import { ArrowLeft, Hash, Search, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { modalStyles } from './modal-styles';

// Types pour la recherche
interface SearchResult {
  id: string;
  type: 'user' | 'post';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  communitySlug?: string; // Pour la navigation vers les posts
  postId?: string; // ID du post pour la navigation
}

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SearchModal({ visible, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  // Perform search when query changes
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsLoading(true);
      
      const timer = setTimeout(async () => {
        try {
          const searchResults = await globalSearch(searchQuery, 10);
          
          // Transform results into unified format with unique IDs (users and posts only)
          const transformedResults: SearchResult[] = [
            ...searchResults.users
              .filter(user => user._id && user.name)
              .map(user => ({
                id: `user-${user._id}`,
                type: 'user' as const,
                title: user.name,
                subtitle: user.handle ? `@${user.handle}` : undefined,
                imageUrl: user.avatar,
              })),
            ...searchResults.posts
              .filter(post => post._id && post.title && post.author)
              .map(post => ({
                id: `post-${post._id}`,
                type: 'post' as const,
                title: post.title,
                subtitle: post.community ? `in ${post.community.name}` : `by ${post.author.name}`,
                communitySlug: post.community?.slug,
                postId: post._id,
              })),
          ];

          setResults(transformedResults);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Gérer la sélection d'un résultat
  const handleResultPress = (result: SearchResult) => {
    // Ajouter à l'historique récent
    if (!recentSearches.includes(result.title)) {
      setRecentSearches(prev => [result.title, ...prev.slice(0, 4)]);
    }
    
    // Navigation basée sur le type
    switch (result.type) {
      case 'user':
        // Pas de navigation pour les users, juste fermer le modal
        console.log(`User selected: ${result.title}`);
        break;
      case 'post':
        // Navigation vers le feed de posts dans la communauté avec le postId
        if (result.communitySlug && result.postId) {
          console.log(`Navigating to community feed: ${result.communitySlug} with postId: ${result.postId}`);
          // Naviguer vers la page home de la communauté avec le postId pour scroll/highlight
          router.push(`/(community)/${result.communitySlug}/(loggedUser)/home?postId=${result.postId}`);
        } else if (result.communitySlug) {
          console.log(`Navigating to community feed: ${result.communitySlug}`);
          router.push(`/(community)/${result.communitySlug}/(loggedUser)/home`);
        } else {
          console.log(`Post selected but missing community slug: ${result.title}`);
        }
        break;
    }
    
    onClose();
  };

  // Gérer la recherche récente
  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Effacer l'historique de recherche
  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Rendu d'un élément de résultat
  const renderResultItem = ({ item }: { item: SearchResult }) => {
    return (
      <TouchableOpacity 
        style={modalStyles.searchResultItem} 
        onPress={() => handleResultPress(item)}
      >
        {/* Avatar ou icône */}
        {item.type === 'user' && item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }}
            style={modalStyles.searchUserAvatar}
          />
        ) : (
          <View style={[modalStyles.searchResultIcon, 
            item.type === 'user' ? modalStyles.searchUserIcon : 
            modalStyles.searchPostIcon
          ]}>
            {item.type === 'user' ? (
              <User size={16} color="#fff" />
            ) : (
              <Hash size={16} color="#fff" />
            )}
          </View>
        )}
        
        <View style={modalStyles.searchResultContent}>
          <Text style={modalStyles.searchResultTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={modalStyles.searchResultSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={modalStyles.searchContainer}>
        <View style={modalStyles.searchHeader}>
          <TouchableOpacity onPress={onClose} style={modalStyles.searchBackButton}>
            <ArrowLeft size={22} color={colors.gray700} />
          </TouchableOpacity>
          
          <View style={modalStyles.searchInputContainer}>
            <Search size={18} color={colors.gray500} style={modalStyles.searchIcon} />
            <TextInput
              style={modalStyles.searchInput}
              placeholder="Search posts and people..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>
        </View>

        {/* Résultats de recherche ou historique récent */}
        {searchQuery.trim().length > 0 ? (
          <View style={modalStyles.searchResultsContainer}>
            {isLoading ? (
              <Text style={modalStyles.searchStatusText}>Searching...</Text>
            ) : (
              results.length > 0 ? (
                <FlatList
                  data={results}
                  renderItem={renderResultItem}
                  keyExtractor={item => item.id}
                  style={modalStyles.searchResultsList}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <Text style={modalStyles.searchStatusText}>No results found</Text>
              )
            )}
          </View>
        ) : (
          <View style={modalStyles.searchRecentContainer}>
            <View style={modalStyles.searchRecentHeader}>
              <Text style={modalStyles.searchRecentTitle}>Recent Searches</Text>
              {recentSearches.length > 0 && (
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={modalStyles.searchClearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {recentSearches.length > 0 ? (
              recentSearches.map((query, index) => (
                <TouchableOpacity 
                  key={index}
                  style={modalStyles.searchRecentItem}
                  onPress={() => handleRecentSearch(query)}
                >
                  <Search size={16} color={colors.gray500} />
                  <Text style={modalStyles.searchRecentText}>{query}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={modalStyles.searchNoRecentText}>
                No recent searches
              </Text>
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
