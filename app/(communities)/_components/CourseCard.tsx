import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { communityStyles } from '../_styles';
import Avatar from './Avatar';
import { Course, getCreatorInfo, getItemImage, getItemTitle } from '@/lib/explore-api';

interface CourseCardProps {
    course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
    const handlePress = () => {
        // Navigate to course details - fallback to alert for now if route doesn't exist
        // router.push(`/(courses)/${course._id}`);
        console.log('Navigating to course:', course._id);
    };

    const { name: creatorName, avatar: creatorAvatar } = getCreatorInfo(course);
    const image = getItemImage(course);
    const title = getItemTitle(course);
    const price = course.isPaid ? `${course.prix} ${course.devise || 'TND'}` : 'Free';
    const rating = course.averageRating || 0;
    const reviews = course.totalRatings || 0;

    return (
        <TouchableOpacity
            style={[communityStyles.gridCard, { marginRight: 16, width: 280 }]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            {/* Image Section */}
            <View style={communityStyles.gridImageContainer}>
                <Image
                    source={{ uri: image }}
                    style={communityStyles.gridImage}
                    resizeMode="cover"
                />

                {/* Level Badge */}
                {course.niveau && (
                    <View style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                        zIndex: 10
                    }}>
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: '600', textTransform: 'capitalize' }}>
                            {course.niveau}
                        </Text>
                    </View>
                )}

                {/* Overlay */}
                <View style={communityStyles.gridImageOverlay} />

                {/* Stats Row within Image */}
                <View style={communityStyles.gridStatsRow}>
                    <View style={communityStyles.gridStat}>
                        <Ionicons name="star" size={12} color="#fbbf24" style={{ marginRight: 4 }} />
                        <Text style={communityStyles.gridStatText}>{rating.toFixed(1)} ({reviews})</Text>
                    </View>
                    {course.duree && (
                        <View style={communityStyles.gridStat}>
                            <Ionicons name="time-outline" size={12} color="#fff" style={{ marginRight: 4 }} />
                            <Text style={communityStyles.gridStatText}>{course.duree}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Content Section */}
            <View style={communityStyles.gridContent}>
                {/* Category Badge */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={[communityStyles.categoryBadge, { color: '#3b82f6', backgroundColor: '#3b82f610' }]}>
                        COURSE
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: course.isPaid ? '#10b981' : '#3b82f6' }}>
                        {price}
                    </Text>
                </View>

                {/* Title */}
                <Text style={communityStyles.gridTitle} numberOfLines={2}>
                    {title}
                </Text>

                {/* Creator */}
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

                {/* Join Button */}
                <TouchableOpacity style={[communityStyles.joinButton, { marginTop: 12, backgroundColor: '#3b82f6' }]}>
                    <Text style={communityStyles.joinButtonText}>Enroll Now</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}
