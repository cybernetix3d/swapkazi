import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { Listing } from '../../../types';
import * as ListingService from '../../../services/listingService';
import Icon from '../../../components/ui/Icon';
import ListingCard from '../../../components/listings/ListingCard';
import EmptyState from '../../../components/EmptyState';
import ErrorMessage from '../../../components/ErrorMessage';

export default function FeaturedListingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      setError(null);
      setLoading(true);

      // Get featured listings from the API
      const listings = await ListingService.getListings({ isFeatured: true });
      setFeaturedListings(listings);
    } catch (err: any) {
      console.error('Error fetching featured listings:', err);
      setError(err.message || 'Failed to load featured listings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeaturedListings();
  };

  const renderListingItem = ({ item }: { item: Listing }) => (
    <ListingCard listing={item} onPress={() => router.push(`/marketplace/${item._id}`)} />
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <ErrorMessage message={error} onRetry={fetchFeaturedListings} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Featured Listings',
          headerStyle: {
            backgroundColor: colors.background.dark,
          },
          headerTintColor: colors.text.primary,
        }}
      />

      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        {featuredListings.length > 0 ? (
          <FlatList
            data={featuredListings}
            renderItem={renderListingItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            numColumns={2}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListHeaderComponent={
              <View style={styles.headerContainer}>
                <Text style={[styles.headerText, { color: colors.text.primary }]}>
                  Featured Listings
                </Text>
                <Text style={[styles.subHeaderText, { color: colors.text.secondary }]}>
                  Discover our handpicked selection of premium listings
                </Text>

                <View style={[styles.infoCard, { backgroundColor: colors.background.card }]}>
                  <Icon name="star" size={24} color={colors.primary} style={styles.infoIcon} />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoTitle, { color: colors.text.primary }]}>
                      Premium Visibility
                    </Text>
                    <Text style={[styles.infoDescription, { color: colors.text.secondary }]}>
                      Featured listings get more visibility and higher engagement from potential customers.
                    </Text>
                  </View>
                </View>
              </View>
            }
            ListEmptyComponent={
              <EmptyState
                icon="star"
                title="No Featured Listings"
                message="There are no featured listings available at the moment. Check back later!"
              />
            }
          />
        ) : (
          <EmptyState
            icon="star"
            title="No Featured Listings"
            message="There are no featured listings available at the moment. Check back later!"
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.medium,
  },
  headerContainer: {
    marginBottom: SPACING.large,
  },
  headerText: {
    fontSize: FONT.sizes.xlarge,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  subHeaderText: {
    fontSize: FONT.sizes.medium,
    marginBottom: SPACING.large,
  },
  infoCard: {
    flexDirection: 'row',
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SPACING.medium,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: SPACING.medium,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  infoDescription: {
    fontSize: FONT.sizes.small,
  },
});
