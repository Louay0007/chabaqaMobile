import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Star, Send, User } from 'lucide-react-native';
import { useAuth } from '@/hooks/use-auth';
import {
  getCommunityReviews,
  getMyCommunityReview,
  submitCommunityReview,
  getCommunityBySlug,
  CommunityReview,
} from '@/lib/communities-api';
import { getImageUrl } from '@/lib/image-utils';
import BottomNavigation from '../../_components/BottomNavigation';
import CommunityHeader from '../../_components/Header';

export default function ReviewsPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [communityId, setCommunityId] = useState('');

  // Reviews data
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<{ [key: number]: number }>({});

  // User's review
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [hasExistingReview, setHasExistingReview] = useState(false);

  const loadData = useCallback(async () => {
    if (!slug) return;

    try {
      // Get community info
      const communityResp = await getCommunityBySlug(slug);
      if (communityResp.success && communityResp.data) {
        setCommunityName(communityResp.data.name);
        setCommunityId(communityResp.data._id || communityResp.data.id);
      }

      const id = communityResp.data?._id || communityResp.data?.id || slug;

      // Get all reviews
      const reviewsResp = await getCommunityReviews(id);
      if (reviewsResp.success) {
        setReviews(reviewsResp.reviews || []);
        setAverageRating(reviewsResp.averageRating || 0);
        setTotalReviews(reviewsResp.totalReviews || 0);
        setRatingDistribution(reviewsResp.ratingDistribution || {});
      }

      // Get user's review
      if (user) {
        const myReviewResp = await getMyCommunityReview(id);
        if (myReviewResp.success && myReviewResp.review) {
          setMyRating(myReviewResp.review.rating);
          setMyComment(myReviewResp.review.comment || '');
          setHasExistingReview(true);
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slug, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSubmitReview = async () => {
    if (myRating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating');
      return;
    }

    if (!user) {
      Alert.alert('Login Required', 'Please login to submit a review');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitCommunityReview(communityId || slug, myRating, myComment);
      if (result.success) {
        setAverageRating(result.averageRating);
        setTotalReviews(result.totalReviews);
        setHasExistingReview(true);
        Alert.alert('Success', hasExistingReview ? 'Review updated!' : 'Review submitted!');
        loadData();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && setMyRating(star)}
            style={styles.starButton}
          >
            <Star
              size={size}
              color="#fbbf24"
              fill={star <= rating ? '#fbbf24' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get proper avatar URL using image-utils
  const getReviewerAvatar = (avatarUrl: string | undefined | null): string => {
    if (!avatarUrl) return '';
    return getImageUrl(avatarUrl);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Use the same header as other community pages */}
        <CommunityHeader showBack communitySlug={slug} />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#000000" />
          }
        >
          {/* Rating Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.communityName}>{communityName}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.averageSection}>
                <Text style={styles.averageNumber}>{averageRating.toFixed(1)}</Text>
                {renderStars(Math.round(averageRating), 20)}
                <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
              </View>
              <View style={styles.distributionSection}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution[star] || 0;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <View key={star} style={styles.distributionRow}>
                      <Text style={styles.distributionStar}>{star}</Text>
                      <Star size={12} color="#fbbf24" fill="#fbbf24" />
                      <View style={styles.distributionBarBg}>
                        <View style={[styles.distributionBarFill, { width: `${percentage}%` }]} />
                      </View>
                      <Text style={styles.distributionCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Write Review Section */}
          {user && (
            <View style={styles.writeReviewCard}>
              <Text style={styles.sectionTitle}>
                {hasExistingReview ? 'Update Your Review' : 'Write a Review'}
              </Text>
              <View style={styles.ratingSelector}>
                <Text style={styles.ratingLabel}>Your Rating:</Text>
                {renderStars(myRating, 32, true)}
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder="Share your experience (optional)"
                placeholderTextColor="#9ca3af"
                value={myComment}
                onChangeText={setMyComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmitReview}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Send size={18} color="#ffffff" />
                    <Text style={styles.submitButtonText}>
                      {hasExistingReview ? 'Update Review' : 'Submit Review'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Reviews List */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>All Reviews</Text>
            {reviews.length === 0 ? (
              <View style={styles.emptyState}>
                <Star size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No reviews yet</Text>
                <Text style={styles.emptySubtext}>Be the first to review this community!</Text>
              </View>
            ) : (
              reviews.map((review) => {
                const avatarUrl = getReviewerAvatar(review.userAvatar);
                return (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.reviewAvatar} />
                      ) : (
                        <View style={styles.reviewAvatarPlaceholder}>
                          <User size={20} color="#9ca3af" />
                        </View>
                      )}
                      <View style={styles.reviewInfo}>
                        <Text style={styles.reviewerName}>{review.userName}</Text>
                        <View style={styles.reviewMeta}>
                          {renderStars(review.rating, 14)}
                          <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                        </View>
                      </View>
                    </View>
                    {review.comment ? (
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        <BottomNavigation slug={slug} currentTab="reviews" />
      </View>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  communityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 20,
  },
  averageSection: {
    alignItems: 'center',
    flex: 1,
  },
  averageNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
  },
  totalReviews: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  distributionSection: {
    flex: 1.5,
    gap: 6,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distributionStar: {
    fontSize: 12,
    color: '#6b7280',
    width: 12,
    textAlign: 'right',
  },
  distributionBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 12,
    color: '#6b7280',
    width: 24,
    textAlign: 'right',
  },
  writeReviewCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  ratingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  starButton: {
    padding: 2,
  },
  commentInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    color: '#111827',
    fontSize: 15,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  reviewsSection: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e7eb',
  },
  reviewAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    marginTop: 12,
    lineHeight: 20,
  },
});
