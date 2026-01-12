import React from 'react';
import { FlatList } from 'react-native';
import { Product, Purchase } from '../../../../../lib/mock-data';
import { styles } from '../styles';
import { EmptyState } from './EmptyState';
import { ProductCard } from './ProductCard';

interface ProductsListProps {
  products: Product[];
  userPurchases: Purchase[];
  searchQuery: string;
  onProductPress: (productId: string) => void;
  onPurchase: (product: Product) => void;
  onDownload: (product: Product) => void;
  accessMap: Record<string, { purchased: boolean; pending: boolean }>;
}

export const ProductsList: React.FC<ProductsListProps> = ({
  products,
  userPurchases,
  searchQuery,
  onProductPress,
  onPurchase,
  onDownload,
  accessMap,
}) => {
  const renderProductItem = ({ item }: { item: Product }) => {
    const isPurchased = accessMap[String(item.id)]?.purchased || userPurchases.some((p: Purchase) => p.productId === item.id);
    const isPending = !!accessMap[String(item.id)]?.pending;

    return (
      <ProductCard
        product={item}
        isPurchased={isPurchased}
        isPending={isPending}
        onPress={() => (isPurchased ? onProductPress(item.id) : onPurchase(item))}
        onPurchase={() => onPurchase(item)}
        onDownload={() => onDownload(item)}
      />
    );
  };

  if (products.length === 0) {
    return <EmptyState searchQuery={searchQuery} />;
  }

  return (
    <FlatList
      data={products}
      renderItem={renderProductItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.productsList}
      showsVerticalScrollIndicator={false}
      numColumns={2}
      columnWrapperStyle={styles.row}
    />
  );
};
