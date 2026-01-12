import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    StatusBar,
    Text,
    View
} from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {
  checkProductAccess,
  downloadProductFile,
  getMyProductReview,
  getProductById,
  getProductReviews,
  ProductReview,
  upsertProductReview,
} from '../../../../../lib/product-api';
import { getAvatarUrl, getImageUrl } from '../../../../../lib/image-utils';
import BottomNavigation from '../../../_components/BottomNavigation';
import { styles } from '../styles';
import { FilesTab } from './_components/FilesTab';
import { LicenseTab } from './_components/LicenseTab';
import { OverviewTab } from './_components/OverviewTab';
import { ProductHeader } from './_components/ProductHeader';
import { ProductTabs } from './_components/ProductTabs';
import { ReviewsTab } from './_components/ReviewsTab';

export default function ProductDetailScreen() {
  const { slug, productId } = useLocalSearchParams<{ slug: string; productId: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [myReview, setMyReview] = useState<{ rating: number; message: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const pid = String(productId || '');
        const p = await getProductById(pid);
        setProduct(p);
        const purchased = (Number(p?.price || 0) === 0) ? true : (await checkProductAccess(pid).then(r => r.purchased).catch(() => false));
        setHasAccess(purchased);

        try {
          const [reviewsRes, my] = await Promise.all([
            getProductReviews(pid),
            getMyProductReview(pid),
          ]);
          setReviews(reviewsRes.reviews || []);
          setAverageRating(reviewsRes.averageRating || 0);
          setRatingCount(reviewsRes.ratingCount || 0);
          setMyReview(my ? { rating: my.rating, message: my.message || '' } : null);
        } catch (e) {
          console.log('⚠️ [PRODUCT] Failed to fetch reviews:', e);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.notFound}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Transform product data for components
  const creatorFromApi = (product as any)?.creator || (product as any)?.creatorId || {};
  const transformedProduct = {
    id: String((product as any)?.id || (product as any)?._id || ''),
    title: product.title || 'Untitled Product',
    creator: {
      name: creatorFromApi?.name || 'Anonymous Creator',
      avatar: getAvatarUrl(creatorFromApi?.avatar || creatorFromApi?.profile_picture || creatorFromApi?.photo_profil),
    },
    rating: Number((product as any)?.averageRating ?? (product as any)?.rating ?? averageRating ?? 0),
    reviewCount: Number((product as any)?.ratingCount ?? (product as any)?.reviews_count ?? ratingCount ?? 0),
    image: product.images?.[0],
    description: product.description || 'No description available.',
    features: (product as any)?.features || [],
    type: (product as any)?.type,
    category: (product as any)?.category,
    price: product.price || 0,
    fileTypes: Array.isArray((product as any)?.files)
      ? (Array.from(
          new Set<string>(
            ((product as any)?.files || [])
              .map((f: any) => (f?.type || '').toString())
              .filter(Boolean)
          )
        ) as string[])
      : ([] as string[]),
    license: undefined,
    terms: undefined,
    usage: undefined,
  };

  const files = Array.isArray((product as any)?.files)
    ? (product as any).files.map((f: any) => ({
        id: String(f?.id || f?._id || ''),
        name: String(f?.name || 'File'),
        type: String(f?.type || 'FILE'),
        size: (() => {
          const bytes = Number(f?.size);
          if (!Number.isFinite(bytes) || bytes <= 0) return '';
          return `${Math.round(bytes / 1024 / 1024)}MB`;
        })(),
        url: f?.url,
        isPaid: Number((product as any)?.price || 0) > 0,
        isDownloaded: false,
      }))
    : [];

  const tabs = [
    { key: 'overview', title: 'Overview' },
    { key: 'files', title: 'Files' },
    { key: 'license', title: 'License' },
    { key: 'reviews', title: 'Reviews' }
  ];

  const handleDownload = async (fileId: string) => {
    try {
      const pid = String((product as any)?.id || (product as any)?._id || productId || '');
      const res = await downloadProductFile(pid, fileId);
      const url = res.download_url;
      if (!url) {
        throw new Error('No download URL returned');
      }

      const normalizedUrl = getImageUrl(url);

      // Without expo-file-system/expo-sharing installed, opening the signed URL in the browser
      // is the most reliable cross-platform way to trigger a real download.
      try {
        await WebBrowser.openBrowserAsync(normalizedUrl);
      } catch {
        await Linking.openURL(normalizedUrl);
      }
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  const handlePurchase = () => {
    router.push({
      pathname: '/(communities)/manual-payment',
      params: { contentType: 'product', productId: String(productId || '') },
    } as any);
  };

  const handleSubmitReview = async (rating: number, message: string) => {
    const pid = String(productId || '');
    const result = await upsertProductReview(pid, rating, message);
    setAverageRating(result.averageRating || 0);
    setRatingCount(result.ratingCount || 0);
    if (result.myReview) {
      setMyReview({ rating: result.myReview.rating, message: result.myReview.message || '' });
    }

    const refreshed = await getProductReviews(pid);
    setReviews(refreshed.reviews || []);
    setAverageRating(refreshed.averageRating || 0);
    setRatingCount(refreshed.ratingCount || 0);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab product={transformedProduct} />;
      case 'files':
        return (
          <FilesTab 
            files={files} 
            hasAccess={hasAccess} 
            onDownload={handleDownload} 
            onPurchase={handlePurchase} 
          />
        );
      case 'license':
        return <LicenseTab product={transformedProduct} />;
      case 'reviews':
        return (
          <ReviewsTab
            reviews={reviews}
            averageRating={averageRating}
            ratingCount={ratingCount}
            myReview={myReview}
            onSubmit={handleSubmitReview}
          />
        );
      default:
        return <OverviewTab product={transformedProduct} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProductHeader product={transformedProduct} />
        <ProductTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
        <View style={styles.content}>
          {renderTabContent()}
        </View>
      </ScrollView>

      <BottomNavigation slug={slug} currentTab="products" />
    </SafeAreaView>
  );
}

