import React, { useState } from 'react';
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
import { useRouter, Stack } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
// No external slider component needed

// Filter options
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

  // Filter state
  const [category, setCategory] = useState('');
  const [exchangeType, setExchangeType] = useState('All');
  const [listingType, setListingType] = useState('All');
  const [condition, setCondition] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [distance, setDistance] = useState(50);
  const [sortBy, setSortBy] = useState('newest');
  const [useLocation, setUseLocation] = useState(true);

  // Handle apply filters
  const handleApplyFilters = () => {
    // Build query params
    const params = {
      ...(category && { category }),
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
      params
    });
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setCategory('');
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
          style={[styles.applyButton, { backgroundColor: colors.primary }]}
          onPress={handleApplyFilters}
        >
          <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    marginBottom: SPACING.small,
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
    borderRadius: SIZES.borderRadius.medium,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  optionText: {
    fontSize: FONT.sizes.small,
    fontWeight: '500',
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
