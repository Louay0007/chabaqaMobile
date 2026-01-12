import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CommunityHeader from '../../_components/Header';
import { ThemedText } from '../../../../_components/ThemedText';
import { ThemedView } from '../../../../_components/ThemedView';
import { getCommunityBySlug as getMockCommunity, getUserPurchases, Product as MockProduct, Purchase } from '../../../../lib/mock-data';
import { getCommunityBySlug } from '../../../../lib/communities-api';
import { checkProductAccess, getProductsByCommunity as getBackendProducts, getMyPurchasedProducts, Product as BackendProduct } from '../../../../lib/product-api';
import { getAvatarUrl } from '../../../../lib/image-utils';
import { getSecureItem, removeSecureItem } from '../../../../lib/secure-storage';
import BottomNavigation from '../../_components/BottomNavigation';
import { ProductsHeader } from './_components/ProductsHeader';
import { ProductsList } from './_components/ProductsList';
import { ProductsTabs } from './_components/ProductsTabs';
import { SearchBar } from './_components/SearchBar';
import { styles } from './styles';

export default function ProductsScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [community, setCommunity] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [accessMap, setAccessMap] = useState<Record<string, { purchased: boolean; pending: boolean }>>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('�️ [PRODUCTS] Fetching products for community:', slug);

      // Fetch community data first
      const communityResponse = await getCommunityBySlug(slug || '');
      if (!communityResponse.success || !communityResponse.data) {
        throw new Error('Community not found');
      }

      const communityData = {
        _id: communityResponse.data._id,
        id: communityResponse.data.id,
        name: communityResponse.data.name,
      };
      setCommunity(communityData);

      // Fetch products from backend
      const productsResponse = await getBackendProducts(communityData._id || communityData.id);
      console.log('✅ [PRODUCTS] Backend products response:', productsResponse?.products?.length || 0);
      const backendProducts = productsResponse?.products || [];

      // Transform backend products to match UI component expectations
      const transformedProducts = backendProducts.map((product: any) => {
        const creatorInfo = product.creator || product.creatorId || {};
        const creatorName = creatorInfo.name || 'Unknown Creator';

        return {
          id: product.id || product._id,
          _id: product._id,
          title: product.title,
          description: product.description,
          price: product.price || 0,
          images: product.images || [],
          creator: {
            name: creatorName,
            avatar: getAvatarUrl(creatorInfo.avatar || creatorInfo.profile_picture || creatorInfo.photo_profil),
          },
          rating: 4.8,
          downloads: product.sales || 0,
          members: 0,
          category: product.category,
          type: product.type,
          isPublished: product.isPublished,
          inventory: product.inventory,
          currency: product.currency,
          variants: product.variants || [],
          files: product.files || [],
          createdAt: product.created_at,
          updatedAt: product.updated_at,
        };
      });

      console.log('✅ [PRODUCTS] Transformed products:', transformedProducts.length);
      setAllProducts(transformedProducts);

      // Compute access map (backend source of truth) + pending map (stored locally after proof submission)
      const accessEntries = await Promise.all(
        transformedProducts.map(async (p: any) => {
          const productId = String(p.id);
          const pendingOrderId = await getSecureItem(`pending_product_order_${productId}`);
          const pending = !!pendingOrderId;
          const purchased = p.price === 0 ? true : (await checkProductAccess(productId).then(r => r.purchased).catch(() => false));

          if (purchased && pendingOrderId) {
            await removeSecureItem(`pending_product_order_${productId}`);
          }

          return [productId, { purchased, pending: pending && !purchased }] as const;
        })
      );
      setAccessMap(Object.fromEntries(accessEntries));

      // Fetch user's purchased products
      console.log('📊 [PRODUCTS] Fetching user purchases');
      try {
        const purchasedProducts = await getMyPurchasedProducts();
        console.log('📊 [PRODUCTS] User purchases response:', purchasedProducts?.length || 0);

        const transformedPurchases = (purchasedProducts || []).map(product => ({
          id: Date.now().toString() + Math.random(),
          userId: 'current-user',
          productId: product._id,
          purchasedAt: new Date().toISOString(),
        }));
        setUserPurchases(transformedPurchases);
      } catch (purchaseError) {
        console.log('⚠️ [PRODUCTS] Failed to fetch purchases, using mock purchases');
        setUserPurchases(getUserPurchases('current-user'));
      }
    } catch (err: any) {
      console.error('💥 [PRODUCTS] Error fetching data:', err);
      setError(err.message || 'Failed to load products');
      // Fallback to mock data
      console.log('⚠️ [PRODUCTS] Falling back to mock data');
      const mockCommunity = getMockCommunity(slug || '');
      if (mockCommunity) {
        setCommunity(mockCommunity);
        // Use mock products as fallback - keeping original functionality
        setAllProducts([]);
        setUserPurchases([]);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh on screen focus (e.g. after returning from manual payment)
  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => {};
    }, [fetchData])
  );

  // Filter products based on search and active tab
  const filteredProducts = allProducts.filter((product: any) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const isPurchased = userPurchases.some((p: any) => p.productId === product.id);

    if (activeTab === 'purchased') {
      return matchesSearch && isPurchased;
    }
    if (activeTab === 'free') {
      return matchesSearch && product.price === 0;
    }
    if (activeTab === 'paid') {
      return matchesSearch && product.price > 0;
    }
    return matchesSearch;
  });

  // Calculate counts for tabs and header
  const totalProducts = allProducts.length;
  const purchasedCount = userPurchases.length;
  const freeCount = allProducts.filter((p: any) => p.price === 0).length;
  const premiumCount = allProducts.filter((p: any) => p.price > 0).length;

  // Create tabs data
  const tabs = [
    { key: 'all', title: 'All', count: totalProducts },
    { key: 'purchased', title: 'My Library', count: purchasedCount },
    { key: 'free', title: 'Free', count: freeCount },
    { key: 'paid', title: 'Premium', count: premiumCount },
  ];

  // Navigation and actions
  const navigateToProductDetails = (productId: string) => {
    router.push(`/(community)/${slug}/products/${productId}`);
  };

  const handlePurchase = (product: any) => {
    router.push({
      pathname: '/(communities)/manual-payment',
      params: { contentType: 'product', productId: String(product.id) },
    } as any);
  };

  const handleDownload = (product: any) => {
    navigateToProductDetails(String(product.id));
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8e78fb" />
        <ThemedText style={{ marginTop: 16, opacity: 0.7 }}>Loading products...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ color: '#ef4444', textAlign: 'center', margin: 20 }}>
          {error}
        </ThemedText>
        <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
          Community: {slug}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!community) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Community not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <CommunityHeader showBack communitySlug={slug as string} />
      
      <ProductsHeader
        totalProducts={totalProducts}
        purchasedCount={purchasedCount}
        freeCount={freeCount}
        premiumCount={premiumCount}
      />

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search products..."
      />

      <ProductsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      <ProductsList
        products={filteredProducts}
        userPurchases={userPurchases}
        searchQuery={searchQuery}
        onProductPress={navigateToProductDetails}
        onPurchase={handlePurchase}
        onDownload={handleDownload}
        accessMap={accessMap}
      />

      <BottomNavigation slug={slug as string} currentTab="products" />
    </ThemedView>
  );
}


