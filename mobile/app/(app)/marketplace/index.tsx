import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView
} from 'react-native';
import ErrorMessage from '../../../components/ErrorMessage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Get search params from URL
  const params = useLocalSearchParams<Record<string, string>>();

  // Available categories for filtering
  const categories: ListingCategory[] = [
    'Goods', 'Services', 'Food', 'Crafts',
    'Electronics', 'Clothing', 'Furniture', 'Books',
    'Tools', 'Education', 'Transportation', 'Other'
  ];

  // Process URL params on mount - only once
  useEffect(() => {
    if (params) {
      const newFilters: Record<string, string> = {};

      // Process category
      if (params.category && categories.includes(params.category as ListingCategory)) {
        setSelectedCategory(params.category as ListingCategory);
      } else if (params.category === null || params.category === undefined) {
        // Clear category if not specified
        setSelectedCategory(null);
      }

      // Process other filters
      ['exchangeType', 'listingType', 'condition', 'minPrice', 'maxPrice', 'distance', 'sortBy'].forEach(key => {
        if (params[key]) {
          newFilters[key] = params[key];
        }
      });

      // Set the new filters only if they're different from current filters
      const currentFiltersStr = JSON.stringify(activeFilters);
      const newFiltersStr = JSON.stringify(newFilters);

      if (currentFiltersStr !== newFiltersStr) {
        console.log('Setting active filters:', newFilters);
        setActiveFilters(newFilters);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

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

    // Reset error state when starting a new fetch
    setError(null);

    try {
      // Build filters object
      const filters = {
        page: refresh ? 1 : page,
        limit: 10,
        category: selectedCategory || undefined,
        ...activeFilters
      };

      console.log('Fetching listings with filters:', filters);
      const response = await ListingService.getListings(filters);
      console.log('Listings response:', response);

      // Check if we have data in the response
      if (response.success && response.data) {
        console.log(`Received ${response.data.length} listings`);

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
      } else {
        console.error('Invalid response format:', response);
        setError('Received an invalid response from the server. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to fetch listings. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, hasMore, loading, selectedCategory, activeFilters]);

  // Fetch listings when component mounts or filters change
  useEffect(() => {
    // Create a stable reference to the filters for dependency tracking
    const filtersKey = JSON.stringify({
      category: selectedCategory,
      ...activeFilters
    });

    console.log('Fetching listings due to filter change or initial load');
    fetchListings(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, JSON.stringify(activeFilters)]);

  // Initial fetch on mount - only once
  useEffect(() => {
    console.log('Initial fetch on mount');
    fetchListings(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {/* Search and Filter Bar */}
      <View style={[styles.searchFilterContainer, { backgroundColor: colors.background.card }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.background.dark }]}>
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

        {/* Filter Button */}
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.background.dark }]}
          onPress={() => router.push('/(app)/marketplace/filters')}
        >
          <FontAwesome5 name="sliders-h" size={18} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Chips */}
      <View style={styles.categoryChipsContainer}>
        <Text style={[styles.categoryLabel, { color: colors.text.secondary }]}>Categories:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.categoryChip,
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
          ))}
        </ScrollView>
        {selectedCategory && (
          <TouchableOpacity
            style={[styles.clearFilterChip, { borderColor: colors.primary }]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.clearFilterText, { color: colors.primary }]}>
              Clear
            </Text>
            <FontAwesome5 name="times" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}
      </View>

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
            error ? (
              <ErrorMessage
                message={error}
                onRetry={() => fetchListings(true)}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <FontAwesome5 name="store-alt-slash" size={48} color={colors.text.secondary} />
                <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                  No listings found
                </Text>
                <Text style={[styles.emptySubText, { color: colors.text.muted }]}>
                  {(selectedCategory || Object.keys(activeFilters).length > 0) ?
                    'Try removing some filters to see more listings' :
                    'There are no listings available at the moment'}
                </Text>
                {(selectedCategory || Object.keys(activeFilters).length > 0) && (
                  <TouchableOpacity
                    style={[styles.clearFilterButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setSelectedCategory(null);
                      setActiveFilters({});
                      router.push('/marketplace');
                    }}
                  >
                    <Text style={[styles.clearFilterText, { color: '#000' }]}>
                      Clear All Filters
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.refreshButton, { borderColor: colors.text.secondary }]}
                  onPress={() => fetchListings(true)}
                >
                  <FontAwesome5 name="sync" size={16} color={colors.text.secondary} style={styles.refreshIcon} />
                  <Text style={[styles.refreshText, { color: colors.text.secondary }]}>
                    Refresh
                  </Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <LoadingIndicator message="Loading listings..." />
          )
        }
        ListHeaderComponent={
          listings.length > 0 ? (
            <View>
              {activeFilters.condition && activeFilters.condition !== 'New' && (
                <View style={[styles.noteContainer, { backgroundColor: colors.background.card }]}>
                  <Text style={[styles.noteText, { color: colors.primary }]}>
                    Note: Showing "New" condition items as alternatives
                  </Text>
                </View>
              )}
              {activeFilters.exchangeType && activeFilters.exchangeType === 'Direct Swap' && (
                <View style={[styles.noteContainer, { backgroundColor: colors.background.card }]}>
                  <Text style={[styles.noteText, { color: colors.primary }]}>
                    Note: Showing "Talent" exchange type as alternatives
                  </Text>
                </View>
              )}
              {selectedCategory && !['Services', 'Food', 'Education', 'Crafts'].includes(selectedCategory) && (
                <View style={[styles.noteContainer, { backgroundColor: colors.background.card }]}>
                  <Text style={[styles.noteText, { color: colors.primary }]}>
                    Note: No listings in "{selectedCategory}" category. Showing all categories.
                  </Text>
                </View>
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
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.small,
    marginBottom: SPACING.medium,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    marginRight: SPACING.small,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: FONT.sizes.medium,
  },
  searchButton: {
    padding: SPACING.small,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: SIZES.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipsContainer: {
    marginBottom: SPACING.medium,
  },
  categoryLabel: {
    fontSize: FONT.sizes.small,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
    paddingHorizontal: SPACING.small,
  },
  categoriesContainer: {
    paddingRight: SPACING.medium,
    paddingLeft: SPACING.small,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginRight: SPACING.small,
    borderRadius: SIZES.borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 36,
  },
  clearFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginTop: SPACING.small,
    marginLeft: SPACING.small,
    borderRadius: SIZES.borderRadius.round,
    borderWidth: 1,
    height: 36,
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
    marginBottom: SPACING.small,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
    marginBottom: SPACING.medium,
    paddingHorizontal: SPACING.large,
  },
  noteText: {
    fontSize: FONT.sizes.small,
    textAlign: 'center',
    marginBottom: SPACING.small,
    fontStyle: 'italic',
  },
  noteContainer: {
    padding: SPACING.small,
    marginHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
    borderRadius: SIZES.borderRadius.small,
    alignItems: 'center',
  },
  clearFilterButton: {
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginTop: SPACING.medium,
  },
  clearFilterText: {
    fontWeight: 'bold',
    fontSize: FONT.sizes.medium,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginTop: SPACING.medium,
  },
  refreshIcon: {
    marginRight: SPACING.small,
  },
  refreshText: {
    fontSize: FONT.sizes.medium,
  },
  loaderContainer: {
    padding: SPACING.large,
    alignItems: 'center',
  },
});