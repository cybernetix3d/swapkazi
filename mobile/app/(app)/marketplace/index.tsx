import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { Listing, ListingCategory } from '../../../types';
import * as ListingService from '../../../services/listingService';
import ListingCard from '../../../components/listings/ListingCard';

// Category icons mapping
const categoryIcons: Record<ListingCategory, string> = {
  'Goods': 'box',
  'Services': 'hands-helping',
  'Food': 'utensils',
  'Crafts': 'paint-brush',
  'Electronics': 'laptop',
  'Clothing': 'tshirt',
  'Furniture': 'couch',
  'Books': 'book',
  'Tools': 'tools',
  'Education': 'graduation-cap',
  'Transportation': 'car',
  'Other': 'question-circle',
};

export default function MarketplaceScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Available categories for filtering
  const categories: ListingCategory[] = [
    'Goods', 'Services', 'Food', 'Crafts', 
    'Electronics', 'Clothing', 'Furniture', 'Books',
    'Tools', 'Education', 'Transportation', 'Other'
  ];

  // Fetch listings
  const fetchListings = useCallback(async (refresh = false) => {
    if (refresh) {
      setPage(1);
      setRefreshing(true);
    } else if (!hasMore || loading) {
      return;
    } else {
      setLoading(true);
    }

    try {
      const filters = {
        page: refresh ? 1 : page,
        limit: 10,
        category: selectedCategory || undefined,
      };

      const response = await ListingService.getListings(filters);
      
      if (response.data) {
        if (refresh) {
          setListings(response.data);
        } else {
          setListings((prev) => [...prev, ...response.data]);
        }
        
        // Check if there are more pages
        setHasMore(!!response.page && !!response.totalPages && response.page < response.totalPages);
        
        // Increment page for next fetch
        if (!refresh) {
          setPage((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, hasMore, loading, selectedCategory]);

  // Initial fetch
  useEffect(() => {
    fetchListings(true);
  }, [selectedCategory]);

  // Handle refresh
  const handleRefresh = () => {
    fetchListings(true);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchListings();
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: ListingCategory) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/(app)/marketplace/search',
        params: { query: searchQuery }
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background.card }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text.primary }]}
          placeholder="Search listings..."
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <FontAwesome5 name="search" size={18} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Categories Scroll */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item && { backgroundColor: colors.primary }
            ]}
            onPress={() => handleCategorySelect(item)}
          >
            <FontAwesome5
              name={categoryIcons[item]}
              size={16}
              color={selectedCategory === item ? '#000' : colors.text.secondary}
              style={styles.categoryIcon}
            />
            <Text
              style={[
                styles.categoryText,
                { color: selectedCategory === item ? '#000' : colors.text.secondary }
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoriesContainer}
      />

      {/* Create Listing Button */}
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(app)/marketplace/create')}
      >
        <FontAwesome5 name="plus" size={16} color="#000" />
        <Text style={styles.createButtonText}>Create Listing</Text>
      </TouchableOpacity>

      {/* Listings */}
      <FlatList
        data={listings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={styles.listingsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="store-alt-slash" size={48} color={colors.text.secondary} />
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                No listings found
              </Text>
              {selectedCategory && (
                <TouchableOpacity
                  style={[styles.clearFilterButton, { borderColor: colors.primary }]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={[styles.clearFilterText, { color: colors.primary }]}>
                    Clear Filter
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.medium,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: FONT.sizes.medium,
  },
  searchButton: {
    padding: SPACING.small,
  },
  categoriesList: {
    maxHeight: 50,
    marginBottom: SPACING.medium,
  },
  categoriesContainer: {
    paddingRight: SPACING.medium,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginRight: SPACING.small,
    borderRadius: SIZES.borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryIcon: {
    marginRight: SPACING.xs,
  },
  categoryText: {
    fontSize: FONT.sizes.small,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SPACING.medium,
  },
  createButtonText: {
    marginLeft: SPACING.small,
    fontWeight: 'bold',
    color: '#000',
  },
  listingsContainer: {
    paddingBottom: SPACING.large,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT.sizes.large,
    marginTop: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  clearFilterButton: {
    borderWidth: 1,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  clearFilterText: {
    fontWeight: 'bold',
  },
  loaderContainer: {
    padding: SPACING.large,
    alignItems: 'center',
  },
});