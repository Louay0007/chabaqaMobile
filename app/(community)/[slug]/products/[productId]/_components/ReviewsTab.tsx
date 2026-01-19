import { Star } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ProductReview } from '../../../../../../lib/product-api';
import { getAvatarUrl } from '../../../../../../lib/image-utils';
import { styles } from '../../styles';

type Props = {
  reviews: ProductReview[];
  averageRating: number;
  ratingCount: number;
  myReview: { rating: number; message: string } | null;
  onSubmit: (rating: number, message: string) => Promise<void>;
};

export function ReviewsTab({ reviews, averageRating, ratingCount, myReview, onSubmit }: Props) {
  const [rating, setRating] = useState<number>(myReview?.rating || 0);
  const [message, setMessage] = useState<string>(myReview?.message || '');
  const [submitting, setSubmitting] = useState(false);

  const subtitle = useMemo(() => {
    if (!ratingCount) return 'No reviews yet';
    return `${averageRating.toFixed(1)} / 5 • ${ratingCount} review${ratingCount === 1 ? '' : 's'}`;
  }, [averageRating, ratingCount]);

  const canSubmit = rating >= 1 && rating <= 5 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await onSubmit(rating, message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => (
    <View style={styles.reviewStarsRow}>
      {[1, 2, 3, 4, 5].map((v) => (
        <TouchableOpacity key={v} onPress={() => setRating(v)} style={styles.reviewStarButton}>
          <Star size={22} color="#fbbf24" fill={rating >= v ? '#fbbf24' : 'transparent'} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR');
  };

  const renderReview = ({ item }: { item: ProductReview }) => {
    const avatar = getAvatarUrl(item.user?.avatar);
    const name = item.user?.name || 'User';
    const initial = name.trim().charAt(0).toUpperCase();

    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeaderRow}>
          <View style={styles.reviewAvatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={[styles.reviewAvatar, { position: 'absolute', top: 0, left: 0 } as any]} />
            ) : (
              <Text style={styles.reviewAvatarInitial}>{initial}</Text>
            )}
          </View>
          <View style={styles.reviewHeaderInfo}>
            <Text style={styles.reviewUserName}>{name}</Text>
            <View style={styles.reviewMetaRow}>
              <View style={styles.reviewRatingRow}>
                <Star size={14} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.reviewRatingText}>{(item.rating || 0).toFixed(1)}</Text>
              </View>
              {!!item.updatedAt && (
                <Text style={styles.reviewDateText}>{formatDate(item.updatedAt)}</Text>
              )}
            </View>
          </View>
        </View>
        {!!item.message && <Text style={styles.reviewMessageText}>{item.message}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Reviews</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>

        <View style={styles.reviewComposer}>
          <Text style={styles.reviewComposerTitle}>{myReview ? 'Update your review' : 'Leave a review'}</Text>
          {renderStars()}
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Write your review (optional)"
            multiline
            style={styles.reviewInput}
          />
          <TouchableOpacity
            style={[styles.reviewSubmitButton, !canSubmit && styles.reviewSubmitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Text style={[styles.reviewSubmitText, !canSubmit && styles.reviewSubmitTextDisabled]}>
              {submitting ? 'Saving...' : myReview ? 'Update' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>All reviews</Text>
        {reviews.length === 0 ? (
          <Text style={styles.cardText}>No reviews yet. Be the first to review this product.</Text>
        ) : (
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(r) => r.id}
            scrollEnabled={false}
          />
        )}
      </View>
    </View>
  );
}
