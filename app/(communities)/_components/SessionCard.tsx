import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { communityStyles } from '../_styles';
import Avatar from './Avatar';
import { Session, getCreatorInfo, getItemImage, getItemTitle } from '@/lib/explore-api';

interface SessionCardProps {
    session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
    const handlePress = () => {
        console.log('Navigating to session:', session._id);
    };

    const { name: creatorName, avatar: creatorAvatar } = getCreatorInfo(session);
    const image = getItemImage(session);
    const title = getItemTitle(session);
    const price = session.price ? `$${session.price}` : 'Free';

    return (
        <TouchableOpacity
            style={[communityStyles.gridCard, { marginRight: 16, width: 280 }]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <View style={communityStyles.gridImageContainer}>
                {/* For sessions, use creator avatar as main image if no thumbnail, or generic meeting image */}
                <Image
                    source={{ uri: image || creatorAvatar || 'https://images.unsplash.com/photo-1515168816178-541700b92661?q=80&w=2670&auto=format&fit=crop' }}
                    style={communityStyles.gridImage}
                    resizeMode="cover"
                />

                <View style={communityStyles.gridImageOverlay} />

                <View style={communityStyles.gridStatsRow}>
                    <View style={communityStyles.gridStat}>
                        <Ionicons name="time" size={12} color="#fff" style={{ marginRight: 4 }} />
                        <Text style={communityStyles.gridStatText}>{session.duration || 60} min</Text>
                    </View>
                </View>
            </View>

            <View style={communityStyles.gridContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={[communityStyles.categoryBadge, { color: '#F7567C', backgroundColor: '#F7567C10' }]}>
                        1-ON-1
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>
                        {price}
                    </Text>
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
                        with <Text style={communityStyles.communityCardCreatorName}>{creatorName}</Text>
                    </Text>
                </View>

                <TouchableOpacity style={[communityStyles.joinButton, { marginTop: 12, backgroundColor: '#F7567C' }]}>
                    <Text style={communityStyles.joinButtonText}>Book Session</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}
