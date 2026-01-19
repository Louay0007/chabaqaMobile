import { useAdaptiveColors } from '@/hooks/useAdaptiveColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, View } from 'react-native';
import { communityStyles } from '../_styles';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  selectedSort?: string;
  onSortChange?: (sort: string) => void;
  categories?: string[];
  sortOptions?: { value: string; label: string }[];
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
}: SearchBarProps) {
  const adaptiveColors = useAdaptiveColors();

  return (
    <View style={[communityStyles.searchContainer, { backgroundColor: adaptiveColors.background }]}>
      {/* Search Input */}
      <View style={[communityStyles.searchBar, { backgroundColor: adaptiveColors.inputBackground, borderColor: adaptiveColors.inputBorder }]}>
        <Ionicons
          name="search"
          size={20}
          color={adaptiveColors.secondaryText}
          style={communityStyles.searchIcon}
        />
        <TextInput
          style={[communityStyles.searchInput, { color: adaptiveColors.primaryText }]}
          placeholder="Search for communities"
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor={adaptiveColors.secondaryText}
        />
      </View>
    </View>
  );
}
