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
  const [selectedCategories, setSelectedCategories] = useState<ListingCategory[]>([]);
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

      // Process categories - support multiple selections
      if (params.categories) {
        try {
          // Try to parse the categories parameter as JSON
          const categoriesParam = JSON.parse(params.categories);
          if (Array.isArray(categoriesParam)) {
            // Filter to only include valid categories
            const validCategories = categoriesParam.filter(cat =>
              categories.includes(cat as ListingCategory)
            ) as ListingCategory[];

            console.log('Setting categories from params:', validCategories);
            setSelectedCategories(validCategories);
          }
        } catch (e) {
          console.error('Error parsing categories parameter:', e);
        }
      } else if (params.category) {
        // For backward compatibility, also support single category
        if (categories.includes(params.category as ListingCategory)) {
          console.log('Setting single category from params:', params.category);
          setSelectedCategories([params.category as ListingCategory]);
        }
      }
      // Don't reset the categories if not specified - this allows the category buttons to maintain their state

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
        // Handle multiple categories
        ...(selectedCategories.length > 0 && { categories: selectedCategories }),
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
  }, [page, hasMore, loading, selectedCategories, activeFilters]);

  // Fetch listings when component mounts or filters change
  useEffect(() => {
    // Create a stable reference to the filters for dependency tracking
    const filtersKey = JSON.stringify({
      categories: selectedCategories,
      ...activeFilters
    });

    console.log('Filters changed, new filters:', { categories: selectedCategories, ...activeFilters });

    // Use a small delay to prevent race conditions with other state updates
    const timer = setTimeout(() => {
      console.log('Fetching listings due to filter change');
      fetchListings(true);
    }, 50);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedCategories), JSON.stringify(activeFilters)]);

  // Initial fetch on mount - only once
  useEffect(() => {
    // Only do the initial fetch if no categories are selected and no active filters
    // This prevents double-fetching when filters are applied
    if (selectedCategories.length === 0 && Object.keys(activeFilters).length === 0) {
      console.log('Initial fetch on mount - no filters active');
      fetchListings(true);
    } else {
      console.log('Skipping initial fetch because filters are active');
    }
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

  // Handle category selection - now supports multiple selections
  const handleCategorySelect = (category: ListingCategory) => {
    console.log('Category selected:', category);
    console.log('Current selectedCategories:', selectedCategories);
    console.log('Current activeFilters:', activeFilters);

    // Prevent immediate re-renders by using a timeout
    setTimeout(() => {
      let newSelectedCategories: ListingCategory[];

      // Check if the category is already selected
      if (selectedCategories.includes(category)) {
        // If already selected, remove it (toggle off)
        console.log('Deselecting category:', category);
        newSelectedCategories = selectedCategories.filter(cat => cat !== category);
      } else {
        // If not selected, add it to the selection
        console.log('Adding category to selection:', category);
        newSelectedCategories = [...selectedCategories, category];
      }

      // Update state with new selection
      setSelectedCategories(newSelectedCategories);

      // Update URL params to keep UI and URL in sync
      const newParams = { ...params };
      if (newSelectedCategories.length > 0) {
        // Store as JSON string to support multiple values
        newParams.categories = JSON.stringify(newSelectedCategories);
        // Remove old single category param if it exists
        delete newParams.category;
      } else {
        // If no categories selected, remove the parameter
        delete newParams.categories;
        delete newParams.category;
      }
      router.setParams(newParams);

      // Add haptic feedback if available
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50); // Short vibration for feedback
      }
    }, 10); // Small timeout to prevent race conditions
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
          style={[
            styles.filterButton,
            { backgroundColor: colors.background.dark },
            // Add indicator dot when filters are active
            Object.keys(activeFilters).length > 0 && styles.filterButtonActive
          ]}
          onPress={() => {
            console.log('Navigating to filters with categories:', selectedCategories);
            router.push({
              pathname: '/(app)/marketplace/filters',
              params: {
                // Pass selected categories as JSON string
                ...(selectedCategories.length > 0 && { categories: JSON.stringify(selectedCategories) }),
                // Also pass other active filters
                ...activeFilters
              }
            });
          }}
        >
          <FontAwesome5 name="sliders-h" size={18} color={colors.text.primary} />
          {Object.keys(activeFilters).length > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.filterBadgeText}>{Object.keys(activeFilters).length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Chips */}
      <View style={styles.categoryChipsContainer}>
        <View style={styles.categoryHeaderContainer}>
          <Text style={[styles.categoryLabel, { color: colors.text.secondary }]}>
            Categories {selectedCategories.length > 0 && `(${selectedCategories.length} selected)`}:
          </Text>
          {selectedCategories.length > 0 && (
            <TouchableOpacity
              style={[styles.clearCategoryButton, { borderColor: colors.primary }]}
              onPress={() => {
                setSelectedCategories([]);
                // Update URL params
                const newParams = { ...params };
                delete newParams.categories;
                delete newParams.category;
                router.setParams(newParams);
              }}
            >
              <Text style={[styles.clearCategoryText, { color: colors.primary }]}>Clear All</Text>
              <FontAwesome5 name="times" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
        </View>
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
                selectedCategories.includes(item) ?
                  {
                    backgroundColor: colors.primary,
                    borderWidth: 2,
                    borderColor: '#FFD700', // Gold border for selected category
                    transform: [{ scale: 1.05 }] // Slightly larger
                  } :
                  {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  },
                // Add a shadow for better visibility
                { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 3 }
              ]}
              onPress={() => handleCategorySelect(item)}
              activeOpacity={0.4} // Make it more responsive with lower opacity on press
            >
              <FontAwesome5
                name={categoryIcons[item]}
                size={16}
                color={selectedCategories.includes(item) ? '#000' : colors.text.secondary}
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategories.includes(item) ? '#000' : colors.text.secondary }
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Removed duplicate clear button */}
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
                  {(selectedCategories.length > 0 || Object.keys(activeFilters).length > 0) ?
                    'Try removing some filters to see more listings' :
                    'There are no listings available at the moment'}
                </Text>
                {(selectedCategories.length > 0 || Object.keys(activeFilters).length > 0) && (
                  <TouchableOpacity
                    style={[styles.clearFilterButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setSelectedCategories([]);
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
              {selectedCategories.length > 0 && selectedCategories.some(cat => !['Services', 'Food', 'Education', 'Crafts'].includes(cat)) && (
                <View style={[styles.noteContainer, { backgroundColor: colors.background.card }]}>
                  <Text style={[styles.noteText, { color: colors.primary }]}>
                    Note: Some selected categories may not have listings. Showing all available categories.
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
    position: 'relative',
  },
  filterButtonActive: {
    borderWidth: 1,
    borderColor: '#FFD700', // Gold color to indicate active filters
  },
  filterBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  categoryChipsContainer: {
    marginBottom: SPACING.medium,
  },
  categoryHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    marginBottom: SPACING.small,
  },
  categoryLabel: {
    fontSize: FONT.sizes.small,
    fontWeight: 'bold',
  },
  clearCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.round,
    borderWidth: 1,
  },
  clearCategoryText: {
    fontSize: FONT.sizes.xs,
    fontWeight: 'bold',
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
    height: 40, // Slightly taller for better touch target
    // Border and background color are set in the component
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