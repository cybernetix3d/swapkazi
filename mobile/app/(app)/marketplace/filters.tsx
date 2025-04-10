import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Platform
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { ListingCategory } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
// No external slider component needed

// Filter options
const categories = [
  'Goods', 'Services', 'Food', 'Crafts',
  'Electronics', 'Clothing', 'Furniture', 'Books',
  'Tools', 'Education', 'Transportation', 'Other'
];

// Category icons mapping - same as in marketplace/index.tsx
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
const exchangeTypes = ['All', 'Talent', 'Direct Swap', 'Both'];
const listingTypes = ['All', 'Offer', 'Request'];
const conditions = ['All', 'New', 'Like New', 'Good', 'Fair', 'Poor'];
const sortOptions = [
  { id: 'newest', label: 'Newest First', icon: 'clock' },
  { id: 'price_low', label: 'Price: Low to High', icon: 'sort-amount-down' },
  { id: 'price_high', label: 'Price: High to Low', icon: 'sort-amount-up' },
  { id: 'distance', label: 'Distance: Nearest First', icon: 'map-marker-alt' },
];

export default function FiltersScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string, categories?: string }>();

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<ListingCategory[]>([]);
  const [exchangeType, setExchangeType] = useState('All');
  const [listingType, setListingType] = useState('All');
  const [condition, setCondition] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [distance, setDistance] = useState(50);
  const [sortBy, setSortBy] = useState('newest');
  const [useLocation, setUseLocation] = useState(true);

  // Initialize filters from URL params
  useEffect(() => {
    console.log('Filters page received params:', params);

    // Handle categories from marketplace page
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
      } else if (params.category === '') {
        // Empty string means clear the categories
        console.log('Clearing categories based on empty param');
        setSelectedCategories([]);
      }
    }

    // Initialize other filters from params
    if (params.exchangeType && exchangeTypes.includes(params.exchangeType)) {
      setExchangeType(params.exchangeType);
    }

    if (params.listingType && listingTypes.includes(params.listingType)) {
      setListingType(params.listingType);
    }

    if (params.condition && conditions.includes(params.condition)) {
      setCondition(params.condition);
    }

    if (params.minPrice) {
      setPriceRange([parseInt(params.minPrice) || 0, priceRange[1]]);
    }

    if (params.maxPrice) {
      setPriceRange([priceRange[0], parseInt(params.maxPrice) || 1000]);
    }

    if (params.distance) {
      setDistance(parseInt(params.distance) || 50);
    }

    if (params.sortBy) {
      const validSortOptions = sortOptions.map(option => option.id);
      if (validSortOptions.includes(params.sortBy)) {
        setSortBy(params.sortBy);
      }
    }
  }, [params]);

  // Handle apply filters
  const handleApplyFilters = () => {
    // Build query params
    const queryParams: Record<string, string> = {
      // Handle multiple categories
      ...(selectedCategories.length > 0 && { categories: JSON.stringify(selectedCategories) }),
      ...(exchangeType !== 'All' && { exchangeType }),
      ...(listingType !== 'All' && { listingType }),
      ...(condition !== 'All' && { condition }),
      ...(priceRange[0] > 0 && { minPrice: priceRange[0].toString() }),
      ...(priceRange[1] < 1000 && { maxPrice: priceRange[1].toString() }),
      ...(useLocation && { distance: distance.toString() }),
      sortBy,
    };

    console.log('Applying filters:', queryParams);

    // Navigate back to marketplace with filters
    router.push({
      pathname: '/(app)/marketplace',
      params: queryParams
    });
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setExchangeType('All');
    setListingType('All');
    setCondition('All');
    setPriceRange([0, 1000]);
    setDistance(50);
    setSortBy('newest');
    setUseLocation(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
      <Stack.Screen
        options={{
          title: 'Filter Listings',
          headerStyle: {
            backgroundColor: colors.background.dark,
          },
          headerTintColor: colors.text.primary,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <FontAwesome5 name="arrow-left" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Categories {selectedCategories.length > 0 && `(${selectedCategories.length} selected)`}
            </Text>
            {selectedCategories.length > 0 && (
              <TouchableOpacity
                style={[styles.clearButton, { borderColor: colors.primary }]}
                onPress={() => setSelectedCategories([])}
              >
                <Text style={[styles.clearButtonText, { color: colors.primary }]}>Clear</Text>
                <FontAwesome5 name="times" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.optionsContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.optionButton,
                  selectedCategories.includes(cat as ListingCategory) ?
                    {
                      backgroundColor: colors.primary,
                      borderWidth: 2,
                      borderColor: '#FFD700', // Gold border for selected category
                      transform: [{ scale: 1.05 }] // Slightly larger
                    } :
                    {
                      backgroundColor: colors.background.card,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                  // Add a shadow for better visibility
                  { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 3 }
                ]}
                onPress={() => {
                  // Toggle category selection
                  if (selectedCategories.includes(cat as ListingCategory)) {
                    // If already selected, remove it
                    setSelectedCategories(selectedCategories.filter(c => c !== cat));
                  } else {
                    // If not selected, add it
                    setSelectedCategories([...selectedCategories, cat as ListingCategory]);
                  }
                }}
                activeOpacity={0.4} // Make it more responsive
              >
                <FontAwesome5
                  name={categoryIcons[cat as ListingCategory]}
                  size={16}
                  color={selectedCategories.includes(cat as ListingCategory) ? '#000' : colors.text.secondary}
                  style={styles.categoryIcon}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: selectedCategories.includes(cat as ListingCategory) ? '#000' : colors.text.secondary }
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Price Range (Talents)</Text>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={[styles.priceInput, { backgroundColor: colors.background.card, color: colors.text.primary }]}
              value={priceRange[0].toString()}
              onChangeText={(text) => setPriceRange([parseInt(text) || 0, priceRange[1]])}
              keyboardType="number-pad"
              placeholder="Min"
              placeholderTextColor={colors.text.muted}
            />
            <Text style={[styles.priceSeparator, { color: colors.text.muted }]}>to</Text>
            <TextInput
              style={[styles.priceInput, { backgroundColor: colors.background.card, color: colors.text.primary }]}
              value={priceRange[1].toString()}
              onChangeText={(text) => setPriceRange([priceRange[0], parseInt(text) || 0])}
              keyboardType="number-pad"
              placeholder="Max"
              placeholderTextColor={colors.text.muted}
            />
          </View>
          <View style={styles.sliderControls}>
            <TouchableOpacity
              style={[styles.sliderButton, { backgroundColor: colors.background.card }]}
              onPress={() => setPriceRange([priceRange[0], Math.max(0, priceRange[1] - 50)])}
            >
              <Text style={[styles.sliderButtonText, { color: colors.text.primary }]}>-</Text>
            </TouchableOpacity>
            <View style={[styles.sliderTrack, { backgroundColor: colors.background.card }]}>
              <View
                style={[styles.sliderFill, {
                  backgroundColor: colors.primary,
                  width: `${(priceRange[1] / 1000) * 100}%`
                }]}
              />
            </View>
            <TouchableOpacity
              style={[styles.sliderButton, { backgroundColor: colors.background.card }]}
              onPress={() => setPriceRange([priceRange[0], Math.min(1000, priceRange[1] + 50)])}
            >
              <Text style={[styles.sliderButtonText, { color: colors.text.primary }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exchange Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Exchange Type</Text>
          <View style={styles.optionsContainer}>
            {exchangeTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  { backgroundColor: exchangeType === type ? colors.primary : colors.background.card }
                ]}
                onPress={() => setExchangeType(type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: exchangeType === type ? '#000' : colors.text.secondary }
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Listing Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Listing Type</Text>
          <View style={styles.optionsContainer}>
            {listingTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  { backgroundColor: listingType === type ? colors.primary : colors.background.card }
                ]}
                onPress={() => setListingType(type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: listingType === type ? '#000' : colors.text.secondary }
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Condition */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Condition</Text>
          <View style={styles.optionsContainer}>
            {conditions.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionButton,
                  { backgroundColor: condition === item ? colors.primary : colors.background.card }
                ]}
                onPress={() => setCondition(item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: condition === item ? '#000' : colors.text.secondary }
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Distance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Distance</Text>
            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, { color: colors.text.secondary }]}>Use my location</Text>
              <Switch
                value={useLocation}
                onValueChange={setUseLocation}
                trackColor={{ false: colors.background.card, true: colors.primary }}
                thumbColor={Platform.OS === 'ios' ? '#fff' : useLocation ? '#fff' : colors.text.muted}
              />
            </View>
          </View>
          {useLocation && (
            <>
              <Text style={[styles.distanceValue, { color: colors.text.secondary }]}>
                Within {distance} km
              </Text>
              <View style={styles.sliderControls}>
                <TouchableOpacity
                  style={[styles.sliderButton, { backgroundColor: colors.background.card }]}
                  onPress={() => setDistance(Math.max(1, distance - 5))}
                >
                  <Text style={[styles.sliderButtonText, { color: colors.text.primary }]}>-</Text>
                </TouchableOpacity>
                <View style={[styles.sliderTrack, { backgroundColor: colors.background.card }]}>
                  <View
                    style={[styles.sliderFill, {
                      backgroundColor: colors.primary,
                      width: `${(distance / 100) * 100}%`
                    }]}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.sliderButton, { backgroundColor: colors.background.card }]}
                  onPress={() => setDistance(Math.min(100, distance + 5))}
                >
                  <Text style={[styles.sliderButtonText, { color: colors.text.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Sort By */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Sort By</Text>
          <View style={styles.sortOptionsContainer}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortOptionButton,
                  { backgroundColor: sortBy === option.id ? colors.primary : colors.background.card }
                ]}
                onPress={() => setSortBy(option.id)}
              >
                <FontAwesome5
                  name={option.icon}
                  size={16}
                  color={sortBy === option.id ? '#000' : colors.text.secondary}
                  style={styles.sortOptionIcon}
                />
                <Text
                  style={[
                    styles.sortOptionText,
                    { color: sortBy === option.id ? '#000' : colors.text.secondary }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionContainer, { borderTopColor: colors.background.card }]}>
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.text.muted }]}
          onPress={handleResetFilters}
        >
          <Text style={[styles.resetButtonText, { color: colors.text.muted }]}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.applyButton,
            { backgroundColor: colors.primary },
            // Add a subtle animation effect when any filter is active
            (selectedCategories.length > 0 || exchangeType !== 'All' || listingType !== 'All' || condition !== 'All' ||
             priceRange[0] > 0 || priceRange[1] < 1000 || sortBy !== 'newest') &&
            { borderWidth: 2, borderColor: '#FFD700' } // Gold border when filters are active
          ]}
          onPress={handleApplyFilters}
        >
          <Text style={styles.applyButtonText}>
            {(selectedCategories.length > 0 || exchangeType !== 'All' || listingType !== 'All' || condition !== 'All' ||
              priceRange[0] > 0 || priceRange[1] < 1000 || sortBy !== 'newest') ?
              'Apply Filters (' +
                [selectedCategories.length > 0 ? selectedCategories.length : 0,
                 exchangeType !== 'All' ? 1 : 0,
                 listingType !== 'All' ? 1 : 0,
                 condition !== 'All' ? 1 : 0,
                 (priceRange[0] > 0 || priceRange[1] < 1000) ? 1 : 0,
                 sortBy !== 'newest' ? 1 : 0
                ].reduce((a, b) => a + b, 0) +
              ')' :
              'Apply Filters'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.medium,
  },
  section: {
    marginBottom: SPACING.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  sectionTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius.round,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: FONT.sizes.xs,
    fontWeight: 'bold',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  priceInput: {
    flex: 1,
    height: 48,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    fontSize: FONT.sizes.medium,
  },
  priceSeparator: {
    marginHorizontal: SPACING.small,
    fontSize: FONT.sizes.medium,
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 40,
  },
  sliderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    width: '80%',
    position: 'relative',
  },
  sliderFill: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SIZES.borderRadius.round, // Match the marketplace style
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
    height: 40, // Match the marketplace style
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: FONT.sizes.small,
    fontWeight: '500',
  },
  categoryIcon: {
    marginRight: SPACING.xs,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: FONT.sizes.small,
    marginRight: SPACING.small,
  },
  distanceValue: {
    fontSize: FONT.sizes.medium,
    marginBottom: SPACING.small,
  },
  sortOptionsContainer: {
    flexDirection: 'column',
  },
  sortOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SPACING.small,
  },
  sortOptionIcon: {
    marginRight: SPACING.small,
  },
  sortOptionText: {
    fontSize: FONT.sizes.medium,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: SPACING.medium,
    borderTopWidth: 1,
  },
  resetButton: {
    flex: 1,
    paddingVertical: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.small,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 2,
    paddingVertical: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    color: '#000',
  },
});
