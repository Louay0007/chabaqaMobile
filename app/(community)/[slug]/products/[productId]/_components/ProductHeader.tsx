import { Star } from 'lucide-react-native';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { styles } from '../../styles';

interface ProductHeaderProps {
  product: {
    id: string;
    title: string;
    creator?: {
      name: string;
      avatar?: string;
    };
    rating?: number;
    reviewCount?: number;
    image?: string;
  };
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({ product }) => {
  const { title, creator, rating, reviewCount, image } = product;

  return (
    <>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.detailProductImage} />
        ) : (
          <View style={[styles.detailProductImage, { backgroundColor: '#f3f4f6' }]} />
        )}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <View style={styles.creatorInfo}>
          <View style={styles.avatar}>
            {creator?.avatar ? (
              <Image source={{ uri: creator.avatar }} style={[styles.avatar, { borderRadius: 20 }]} />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#6366f1' }}>
                {creator?.name?.[0] || 'U'}
              </Text>
            )}
          </View>
          <View style={styles.creatorDetails}>
            <Text style={styles.productTitle}>{title || 'Untitled'}</Text>
            <Text style={styles.creatorText}>By {creator?.name || 'Anonymous Creator'}</Text>
            {rating !== undefined && rating !== null && (
              <View style={styles.ratingContainer}>
                <Star size={12} color="#fbbf24" fill={rating > 0 ? "#fbbf24" : "transparent"} />
                <Text style={styles.rating}>
                  {Number(rating || 0).toFixed(1)} ({reviewCount || 0} reviews)
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </>
  );
};
