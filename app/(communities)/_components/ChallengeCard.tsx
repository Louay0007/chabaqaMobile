import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { communityStyles } from '../_styles';
import Avatar from './Avatar';
import { Challenge, getCreatorInfo, getItemImage, getItemTitle } from '@/lib/explore-api';

interface ChallengeCardProps {
    challenge: Challenge;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
    const handlePress = () => {
        console.log('Navigating to challenge:', challenge._id);
    };

    const { name: creatorName, avatar: creatorAvatar } = getCreatorInfo(challenge);
    const image = getItemImage(challenge);
    const title = getItemTitle(challenge);

    const difficultyColor =
        challenge.difficulty === 'Easy' ? '#10b981' :
            challenge.difficulty === 'Medium' ? '#f59e0b' :
                '#ef4444';

    return (
        <TouchableOpacity
            style={[communityStyles.gridCard, { marginRight: 16, width: 280 }]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <View style={communityStyles.gridImageContainer}>
                <Image
                    source={{ uri: image }}
                    style={communityStyles.gridImage}
                    resizeMode="cover"
                />

                {/* Difficulty Badge */}
                <View style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: difficultyColor,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                    zIndex: 10
                }}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
                        {challenge.difficulty || 'CHALLENGE'}
                    </Text>
                </View>

                <View style={communityStyles.gridImageOverlay} />

                <View style={communityStyles.gridStatsRow}>
                    <View style={communityStyles.gridStat}>
                        <Ionicons name="people" size={12} color="#fff" style={{ marginRight: 4 }} />
                        <Text style={communityStyles.gridStatText}>{challenge.participantsCount || 0} participants</Text>
                    </View>
                </View>
            </View>

            <View style={communityStyles.gridContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={[communityStyles.categoryBadge, { color: '#f97316', backgroundColor: '#f9731610' }]}>
                        CHALLENGE
                    </Text>
                    {challenge.startDate && (
                        <Text style={{ fontSize: 10, color: '#6b7280' }}>
                            Starts {new Date(challenge.startDate).toLocaleDateString()}
                        </Text>
                    )}
                </View>

                <Text style={communityStyles.gridTitle} numberOfLines={2}>
                    {title}
                </Text>

                <View style={communityStyles.gridCreatorRow}>
                    <Avatar
                        uri={creatorAvatar}
                        name={creatorName}
                        size={20}
                        style={{ marginRight: 6 }}
                    />
                    <Text style={communityStyles.gridCreatorText} numberOfLines={1}>
                        by <Text style={communityStyles.communityCardCreatorName}>{creatorName}</Text>
                    </Text>
                </View>

                <TouchableOpacity style={[communityStyles.joinButton, { marginTop: 12, backgroundColor: '#f97316' }]}>
                    <Text style={communityStyles.joinButtonText}>Join Challenge</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}
