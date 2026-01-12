import { Download, Star, Users } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Product } from '../../../../../lib/mock-data';
import { getAvatarUrl } from '../../../../../lib/image-utils';
import { styles } from '../styles';

interface ProductCardProps {
  product: Product;
  isPurchased: boolean;
  isPending: boolean;
  onPress: () => void;
  onPurchase: () => void;
  onDownload: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isPurchased,
  isPending,
  onPress,
  onPurchase,
  onDownload,
}) => {
  const creatorName = product?.creator?.name || 'Unknown';
  const creatorInitial = (creatorName || 'U').trim().charAt(0).toUpperCase();
  const creatorAvatar = getAvatarUrl((product as any)?.creator?.avatar);

  const renderBadge = () => {
    if (isPurchased) {
      return (
        <View style={[styles.badge, styles.ownedBadge]}>
          <Text style={styles.badgeText}>Owned</Text>
        </View>
      );
    } else if (product.price === 0) {
      return (
        <View style={[styles.badge, styles.freeBadge]}>
          <Text style={styles.badgeText}>Free</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.badge, styles.priceBadge]}>
          <Text style={styles.badgeText}>${product.price}</Text>
        </View>
      );
    }
  };

  const renderActionButton = () => {
    if (isPurchased) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.downloadButton]}
          onPress={onDownload}
        >
          <Download size={16} color="#fff" />
          <Text style={styles.downloadButtonText}>Explore</Text>
        </TouchableOpacity>
      );
    } else if (isPending) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.purchaseButton]}
          onPress={onPurchase}
          disabled
        >
          <Text style={styles.purchaseButtonText}>
            Pending
          </Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.purchaseButton]}
          onPress={onPurchase}
        >
          <Text style={styles.purchaseButtonText}>
            {product.price === 0 ? 'Explore' : 'Join'}
          </Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: product?.images?.[0] || 'https://picsum.photos/300/200' }}
          style={styles.productImage}
        />
        <View style={styles.badgeContainer}>
          {renderBadge()}
        </View>
      </View>

      <View style={styles.productContent}>
        <View style={styles.productHeader}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>
              {product.rating || '4.8'} ({product.sales})
            </Text>
          </View>
        </View>

        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>

        <View style={styles.productMeta}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
          <View style={styles.downloadCount}>
            <Users size={14} color="#6b7280" />
            <Text style={styles.downloadCountText}>{product.sales} downloads</Text>
          </View>
        </View>

        <View style={styles.creatorInfo}>
          <View style={styles.creatorAvatar}>
            {creatorAvatar ? (
              <Image
                source={{ uri: creatorAvatar }}
                style={[styles.creatorAvatar, { position: 'absolute', top: 0, left: 0 } as any]}
              />
            ) : (
              <Text style={styles.creatorInitial}>
                {creatorInitial}
              </Text>
            )}
          </View>
          <Text style={styles.creatorName}>{creatorName}</Text>
        </View>

        <View style={styles.productActions}>
          {renderActionButton()}
        </View>
      </View>
    </TouchableOpacity>
  );
};
