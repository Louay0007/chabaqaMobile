import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { communityStyles } from './community-styles';

interface ActiveMember {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
}

interface ActiveMembersProps {
  members?: ActiveMember[];
}

export default function ActiveMembers({ members }: ActiveMembersProps) {
  // If no members data, show loading state
  if (!members || members.length === 0) {
    return (
      <View style={communityStyles.cardContainer}>
        <View style={communityStyles.sectionHeader}>
          <Text style={communityStyles.sectionTitle}>Active Members</Text>
          <Text style={communityStyles.sectionSubtitle}>No active members</Text>
        </View>
      </View>
    );
  }

  // Show all members returned by the API
  const displayCount = members.length;
  
  return (
    <View style={communityStyles.cardContainer}>
      <View style={communityStyles.sectionHeader}>
        <Text style={communityStyles.sectionTitle}>Active Members</Text>
        <Text style={communityStyles.sectionSubtitle}>
          {displayCount} member{displayCount !== 1 ? 's' : ''} active
        </Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={communityStyles.horizontalScroll}
      >
        {/* Show ALL members from API */}
        {members.map((member) => (
          <TouchableOpacity key={member.id} style={communityStyles.memberItem}>
            <View style={communityStyles.avatarContainer}>
              <Image source={{ uri: member.avatar }} style={communityStyles.avatar} />
              {member.isOnline && <View style={communityStyles.onlineIndicator} />}
            </View>
            <Text style={communityStyles.memberName} numberOfLines={1}>
              {member.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

