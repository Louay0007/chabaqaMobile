import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { communityStyles } from '../_styles';
import Avatar from './Avatar';
import { Product, getCreatorInfo, getItemImage, getItemTitle } from '@/lib/explore-api';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const handlePress = () => {
        console.log('Navigating to product:', product._id);
    };

    const { name: creatorName, avatar: creatorAvatar } = getCreatorInfo(product);
    const image = getItemImage(product);
    const title = getItemTitle(product);
    const price = product.price ? `$${product.price}` : 'Free';
    const rating = product.rating || 0;

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

                {/* Type Badge */}
                <View style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: product.type === 'digital' ? 'rgba(99, 102, 241, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                    zIndex: 10
                }}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: '600', textTransform: 'capitalize' }}>
                        {product.type || 'Product'}
                    </Text>
                </View>

                <View style={communityStyles.gridImageOverlay} />

                {/* Rating */}
                <View style={communityStyles.gridStatsRow}>
                    <View style={communityStyles.gridStat}>
                        <Ionicons name="star" size={12} color="#fbbf24" style={{ marginRight: 4 }} />
                        <Text style={communityStyles.gridStatText}>{rating.toFixed(1)} {product.reviewsCount ? `(${product.reviewsCount})` : ''}</Text>
                    </View>
                </View>
            </View>

            <View style={communityStyles.gridContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={[communityStyles.categoryBadge, { color: '#6366f1', backgroundColor: '#6366f110' }]}>
                        PRODUCT
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
                        by <Text style={communityStyles.communityCardCreatorName}>{creatorName}</Text>
                    </Text>
                </View>

                <TouchableOpacity style={[communityStyles.joinButton, { marginTop: 12, backgroundColor: '#6366f1' }]}>
                    <Text style={communityStyles.joinButtonText}>View Details</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}
