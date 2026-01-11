import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { communityStyles } from '../_styles';
import Avatar from './Avatar';
import { EventItem, getCreatorInfo, getItemImage, getItemTitle } from '@/lib/explore-api';

interface EventCardProps {
    event: EventItem;
}

export default function EventCard({ event }: EventCardProps) {
    const handlePress = () => {
        console.log('Navigating to event:', event._id);
    };

    const { name: creatorName, avatar: creatorAvatar } = getCreatorInfo(event);
    const image = getItemImage(event);
    const title = getItemTitle(event);

    // Format Start Date
    const startDate = event.startDate ? new Date(event.startDate) : new Date();
    const day = startDate.getDate();
    const month = startDate.toLocaleString('default', { month: 'short' }).toUpperCase();

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

                {/* Date Calendar Badge */}
                <View style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10,
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.41
                }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#ef4444' }}>{month}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827' }}>{day}</Text>
                </View>

                <View style={communityStyles.gridImageOverlay} />

                <View style={communityStyles.gridStatsRow}>
                    <View style={communityStyles.gridStat}>
                        <Ionicons name="location" size={12} color="#fff" style={{ marginRight: 4 }} />
                        <Text style={communityStyles.gridStatText}>{event.isOnline ? 'Online' : (event.location || 'TBA')}</Text>
                    </View>
                </View>
            </View>

            <View style={communityStyles.gridContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={[communityStyles.categoryBadge, { color: '#9333ea', backgroundColor: '#9333ea10' }]}>
                        EVENT
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: event.ticketPrice ? '#10b981' : '#9333ea' }}>
                        {event.ticketPrice ? `$${event.ticketPrice}` : 'Free'}
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
                        by <Text style={communityStyles.communityCardCreatorName}>{creatorName}</Text>
                    </Text>
                </View>

                <TouchableOpacity style={[communityStyles.joinButton, { marginTop: 12, backgroundColor: '#9333ea' }]}>
                    <Text style={communityStyles.joinButtonText}>Get Tickets</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}
