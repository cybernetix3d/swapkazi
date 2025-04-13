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
import Icon from '../../../components/ui/Icon';
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
  { id: 'newest', label: 'Newest First', icon: 'time' },
  { id: 'price_low', label: 'Price: Low to High', icon: 'arrow-down' },
  { id: 'price_high', label: 'Price: High to Low', icon: 'arrow-up' },
  { id: 'distance', label: 'Distance: Nearest First', icon: 'location' },
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
    // Only log once when component mounts or when params actually change
    const paramsString = JSON.stringify(params);

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

          setSelectedCategories(validCategories);
        }
      } catch (e) {
        console.error('Error parsing categories parameter:', e);
      }
    } else if (params.category) {
      // For backward compatibility, also support single category
      if (categories.includes(params.category as ListingCategory)) {
        setSelectedCategories([params.category as ListingCategory]);
      } else if (params.category === '') {
        // Empty string means clear the categories
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
              <Icon name="arrow-back" size={20} color={colors.text.primary} />
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
                <Icon name="close" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
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
                <Icon
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
              onChangeText={(text) => {
                const value = parseInt(text.replace(/[^0-9]/g, ''));
                if (!isNaN(value)) {
                  // Ensure min doesn't exceed max - 50
                  setPriceRange([Math.min(value, priceRange[1] - 50), priceRange[1]]);
                } else if (text === '') {
                  setPriceRange([0, priceRange[1]]);
                }
              }}
              keyboardType="numeric"
              placeholder="Min"
              placeholderTextColor={colors.text.muted}
              maxLength={4}
            />
            <Text style={[styles.priceSeparator, { color: colors.text.muted }]}>to</Text>
            <TextInput
              style={[styles.priceInput, { backgroundColor: colors.background.card, color: colors.text.primary }]}
              value={priceRange[1].toString()}
              onChangeText={(text) => {
                const value = parseInt(text.replace(/[^0-9]/g, ''));
                if (!isNaN(value)) {
                  // Ensure max doesn't go below min + 50
                  setPriceRange([priceRange[0], Math.max(value, priceRange[0] + 50)]);
                } else if (text === '') {
                  setPriceRange([priceRange[0], 1000]);
                }
              }}
              keyboardType="numeric"
              placeholder="Max"
              placeholderTextColor={colors.text.muted}
              maxLength={4}
            />
          </View>
          <View style={styles.sliderTrackContainer}>
            <View
              style={[styles.sliderTrack, { backgroundColor: colors.background.darker }]}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(e) => {
                const { locationX } = e.nativeEvent;
                const width = e.currentTarget.offsetWidth || 300; // Default fallback width
                const percentage = Math.min(Math.max(locationX / width, 0), 1);
                const value = Math.round(percentage * 1000);

                // Determine which thumb to move (closest to touch point)
                const minDist = Math.abs(value - priceRange[0]);
                const maxDist = Math.abs(value - priceRange[1]);

                if (minDist <= maxDist) {
                  // Move min thumb, but don't exceed max value
                  setPriceRange([Math.min(value, priceRange[1] - 50), priceRange[1]]);
                } else {
                  // Move max thumb, but don't go below min value
                  setPriceRange([priceRange[0], Math.max(value, priceRange[0] + 50)]);
                }
              }}
              onResponderMove={(e) => {
                const { locationX } = e.nativeEvent;
                const width = e.currentTarget.offsetWidth || 300; // Default fallback width
                const percentage = Math.min(Math.max(locationX / width, 0), 1);
                const value = Math.round(percentage * 1000);

                // Use the same logic as in onTouchStart
                const minDist = Math.abs(value - priceRange[0]);
                const maxDist = Math.abs(value - priceRange[1]);

                if (minDist <= maxDist) {
                  setPriceRange([Math.min(value, priceRange[1] - 50), priceRange[1]]);
                } else {
                  setPriceRange([priceRange[0], Math.max(value, priceRange[0] + 50)]);
                }
              }}
            >
              {/* Track background */}
              <View style={styles.sliderTrack} />

              {/* Filled area between thumbs */}
              <View
                style={[styles.sliderRangeFill, {
                  backgroundColor: colors.primary,
                  left: `${(priceRange[0] / 1000) * 100}%`,
                  width: `${((priceRange[1] - priceRange[0]) / 1000) * 100}%`
                }]}
              />

              {/* Min thumb */}
              <View
                style={[styles.sliderThumb, {
                  backgroundColor: colors.primary,
                  borderColor: colors.background.light,
                  left: `${(priceRange[0] / 1000) * 100}%`,
                  transform: [{ translateX: -12 }]
                }]}
              />

              {/* Max thumb */}
              <View
                style={[styles.sliderThumb, {
                  backgroundColor: colors.primary,
                  borderColor: colors.background.light,
                  left: `${(priceRange[1] / 1000) * 100}%`,
                  transform: [{ translateX: -12 }]
                }]}
              />

              {/* Tick marks */}
              <View style={styles.tickContainer}>
                {[0, 250, 500, 750, 1000].map(tick => (
                  <View
                    key={tick}
                    style={[styles.tick, {
                      left: `${(tick / 1000) * 100}%`,
                      backgroundColor: tick >= priceRange[0] && tick <= priceRange[1] ? colors.primary : colors.text.muted
                    }]}
                  />
                ))}
              </View>

              {/* Labels */}
              <View style={styles.labelContainer}>
                {[0, 250, 500, 750, 1000].map(tick => (
                  <Text
                    key={tick}
                    style={[styles.tickLabel, {
                      left: `${(tick / 1000) * 100}%`,
                      color: tick >= priceRange[0] && tick <= priceRange[1] ? colors.primary : colors.text.muted,
                      transform: [{ translateX: tick === 0 ? 0 : tick === 1000 ? -20 : -10 }]
                    }]}
                  >
                    {tick}
                  </Text>
                ))}
              </View>
            </View>
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
              <View style={styles.sliderLabelContainer}>
                <Text style={[styles.distanceValue, { color: colors.text.secondary }]}>
                  Within
                </Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.background.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.valueInput, { color: colors.text.primary }]}
                    value={distance.toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text.replace(/[^0-9]/g, ''));
                      if (!isNaN(value)) {
                        setDistance(Math.min(100, Math.max(1, value)));
                      } else if (text === '') {
                        setDistance(1);
                      }
                    }}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
                <Text style={[styles.distanceValue, { color: colors.text.secondary }]}>km</Text>
              </View>

              <View style={styles.sliderTrackContainer}>
                <View
                  style={[styles.sliderTrack, { backgroundColor: colors.background.darker }]}
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                  onResponderGrant={(e) => {
                    const { locationX } = e.nativeEvent;
                    // Get the width from the layout instead of measure
                    const width = e.currentTarget.offsetWidth || 300; // Default fallback width
                    const percentage = Math.min(Math.max(locationX / width, 0), 1);
                    const newDistance = Math.round(percentage * 100);
                    setDistance(Math.max(1, newDistance));
                  }}
                  onResponderMove={(e) => {
                    const { locationX } = e.nativeEvent;
                    // Get the width from the layout instead of measure
                    const width = e.currentTarget.offsetWidth || 300; // Default fallback width
                    const percentage = Math.min(Math.max(locationX / width, 0), 1);
                    const newDistance = Math.round(percentage * 100);
                    setDistance(Math.max(1, newDistance));
                  }}
                >
                  <View
                    style={[styles.sliderFill, {
                      backgroundColor: colors.primary,
                      width: `${(distance / 100) * 100}%`
                    }]}
                  />

                  <View
                    style={[styles.sliderThumb, {
                      backgroundColor: colors.primary,
                      borderColor: colors.background.light,
                      left: `${(distance / 100) * 100}%`,
                      transform: [{ translateX: -12 }]
                    }]}
                  />

                  {/* Tick marks */}
                  <View style={styles.tickContainer}>
                    {[0, 25, 50, 75, 100].map(tick => (
                      <View
                        key={tick}
                        style={[styles.tick, {
                          left: `${tick}%`,
                          backgroundColor: tick <= distance ? colors.primary : colors.text.muted
                        }]}
                      />
                    ))}
                  </View>

                  {/* Labels */}
                  <View style={styles.labelContainer}>
                    {[0, 25, 50, 75, 100].map(tick => (
                      <Text
                        key={tick}
                        style={[styles.tickLabel, {
                          left: `${tick}%`,
                          color: tick <= distance ? colors.primary : colors.text.muted,
                          transform: [{ translateX: tick === 0 ? 0 : tick === 100 ? -20 : -10 }]
                        }]}
                      >
                        {tick}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.sliderMarkers}>
                <Text style={[styles.sliderMarkerText, { color: colors.text.muted }]}>1km</Text>
                <Text style={[styles.sliderMarkerText, { color: colors.text.muted }]}>50km</Text>
                <Text style={[styles.sliderMarkerText, { color: colors.text.muted }]}>100km</Text>
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
                <Icon
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
  sliderTrackContainer: {
    width: '100%',
    height: 60,
    marginVertical: SPACING.medium,
    paddingHorizontal: SPACING.small,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    position: 'relative',
  },
  sliderFill: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
  },
  sliderRangeFill: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    top: -9,  // Center the thumb on the track
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  tickContainer: {
    position: 'absolute',
    width: '100%',
    height: 10,
    top: 10,
    flexDirection: 'row',
  },
  tick: {
    width: 2,
    height: 10,
    position: 'absolute',
  },
  labelContainer: {
    position: 'absolute',
    width: '100%',
    top: 25,
    flexDirection: 'row',
  },
  tickLabel: {
    fontSize: FONT.sizes.xs,
    position: 'absolute',
  },
  sliderLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  sliderLabel: {
    fontSize: FONT.sizes.medium,
    marginHorizontal: SPACING.xs,
  },
  inputContainer: {
    height: 40,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.small,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueInput: {
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
    width: '100%',
    height: '100%',
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
