import React, { useEffect, useState } from 'react';
import { safeGet, isValidArray, safeMap } from '../../../utils/nullChecks';
import { getListingImageUrl as getImageUrl, getUserAvatarUrl, isValidImageUrl } from '../../../utils/imageUtils';
import { formatErrorMessage, tryCatch } from '../../../utils/errorUtils';
import ErrorMessage from '../../../components/ErrorMessage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '../../../components/ui/Icon';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { Listing, User } from '../../../types';
import * as ListingService from '../../../services/listingService';
import * as UserService from '../../../services/userService';
import DefaultAvatar from '../../../components/DefaultAvatar';
import { useLocation } from '../../../hooks/useLocation';
import { DEFAULT_LOCATION } from '../../../config/maps';


export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const { location, getLocation } = useLocation();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [errorMessage, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    setError(null);

    // Fetch featured listings
    await tryCatch(async () => {
      const listingsResponse = await ListingService.getListings({
        isFeatured: true,
        limit: 3,
        page: 1
      });

      if (listingsResponse.success && listingsResponse.data) {
        setFeaturedListings(listingsResponse.data);
      } else {
        setError('Failed to load featured listings');
        setFeaturedListings([]);
      }
    }, (error) => {
      console.error('Error fetching listings:', error);
      setError(formatErrorMessage(error) || 'Error loading listings');
      setFeaturedListings([]);
    });

    // Fetch nearby users
    await tryCatch(async () => {
      // Try to get the user's current location
      let userLocation = location;

      // If we don't have a location yet, try to get it
      if (!userLocation) {
        try {
          userLocation = await getLocation();
        } catch (locationError) {
          console.error('Error getting location:', locationError);
        }
      }

      // Use the user's location if available, otherwise use default location
      const coordinates = userLocation
        ? [userLocation.longitude, userLocation.latitude]
        : [DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.latitude];

      console.log('Using coordinates for nearby users:', coordinates);

      const usersResponse = await UserService.getNearbyUsers(
        coordinates[0],
        coordinates[1],
        10000, // 10km radius
        5 // limit to 5 users
      );

      if (usersResponse.success && usersResponse.data) {
        setNearbyUsers(usersResponse.data);
      } else {
        setError('Failed to load nearby users');
        setNearbyUsers([]);
      }
    }, (error) => {
      console.error('Error fetching nearby users:', error);
      setError(formatErrorMessage(error) || 'Error loading nearby users');
      setNearbyUsers([]);
    });

    setRefreshing(false);
  };

  const onRefresh = () => {
    loadData();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.dark }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {errorMessage && (
        <ErrorMessage message={errorMessage} onRetry={onRefresh} />
      )}
      {/* Welcome and Balance Section */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.text.primary }]}>
            Sawubona, {safeGet(user, 'fullName', 'Neighbor')}!
          </Text>
          <Text style={[styles.subText, { color: colors.text.secondary }]}>
            Welcome to SwapKazi
          </Text>
        </View>
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.balanceLabel}>Your Talents</Text>
          <Text style={styles.balanceValue}>{safeGet(user, 'talentBalance', 10)}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1
            }
          ]}
          onPress={() => router.push('/(app)/marketplace/create')}
        >
          <Icon name="plus-circle" size={24} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.text.primary }]}>
            Create Listing
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1
            }
          ]}
          onPress={() => router.push('/(app)/marketplace/filters')}
        >
          <Icon name="filter" size={24} color={colors.secondary} />
          <Text style={[styles.actionText, { color: colors.text.primary }]}>
            Filter Items
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1
            }
          ]}
          onPress={() => router.push('/(app)/marketplace')}
        >
          <Icon name="store" size={24} color={colors.accent} />
          <Text style={[styles.actionText, { color: colors.text.primary }]}>
            Marketplace
          </Text>
        </TouchableOpacity>
      </View>

      {/* Featured Listings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Featured Listings
          </Text>
          <TouchableOpacity onPress={() => router.push('/(app)/featured')}>
            <Text style={[styles.seeAll, { color: colors.accent }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredListings && featuredListings.length > 0 ? safeMap(featuredListings, (item) => (
            <TouchableOpacity
              key={item._id}
              style={[
                styles.listingCard,
                {
                  backgroundColor: colors.background.card,
                  borderColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 1
                }
              ]}
              onPress={() => router.push(`/(app)/marketplace/${item._id}`)}
            >
              <Image source={{ uri: getImageUrl(item) }} style={styles.listingImage} />
              <View style={styles.listingDetails}>
                <Text style={[styles.listingTitle, { color: colors.text.primary }]}>
                  {item.title}
                </Text>
                <Text style={[styles.listingCategory, { color: colors.text.secondary }]}>
                  {item.category}
                </Text>
                <View style={styles.listingFooter}>
                  <Text style={[styles.talentPrice, { color: colors.primary }]}>
                    ✦ {item.talentPrice}
                  </Text>
                  <View style={styles.userInfo}>
                    {!item.user ? (
                      <>
                        <DefaultAvatar
                          name="User"
                          userId="unknown"
                          size={24}
                          style={styles.userAvatar}
                        />
                        <Text style={[styles.userName, { color: colors.text.secondary }]}>
                          Unknown User
                        </Text>
                      </>
                    ) : typeof item.user === 'string' ? (
                      <>
                        <DefaultAvatar
                          name="User"
                          userId={item.user}
                          size={24}
                          style={styles.userAvatar}
                        />
                        <Text style={[styles.userName, { color: colors.text.secondary }]}>
                          User
                        </Text>
                      </>
                    ) : (
                      <>
                        {item.user.avatar ? (
                          <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
                        ) : (
                          <DefaultAvatar
                            name={item.user.fullName || item.user.username || 'User'}
                            userId={item.user._id}
                            size={24}
                            style={styles.userAvatar}
                          />
                        )}
                        <Text style={[styles.userName, { color: colors.text.secondary }]}>
                          {item.user.fullName || item.user.username || 'User'}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )) : (
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No featured listings available</Text>
          )}
        </ScrollView>
      </View>

      {/* Nearby Users */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            People Nearby
          </Text>
          <TouchableOpacity onPress={() => router.push('/(app)/community/people')}>
            <Text style={[styles.seeAll, { color: colors.accent }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {nearbyUsers && nearbyUsers.length > 0 ? safeMap(nearbyUsers, (user) => (
            <TouchableOpacity
              key={user._id}
              style={[
                styles.userCard,
                {
                  backgroundColor: colors.background.card,
                  borderColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 1
                }
              ]}
              onPress={() => router.push(`/(app)/profile/${safeGet(user, '_id', 'unknown')}`)}
            >
              {safeGet(user, 'avatar', null) ? (
                <Image source={{ uri: getUserAvatarUrl(user) }} style={styles.userCardAvatar} />
              ) : (
                <DefaultAvatar
                  name={safeGet(user, 'fullName', '') || safeGet(user, 'username', 'User')}
                  userId={safeGet(user, '_id', 'unknown')}
                  size={50}
                  style={styles.userCardAvatar}
                />
              )}
              <Text style={[styles.userCardName, { color: colors.text.primary }]}>
                {safeGet(user, 'fullName', '') || safeGet(user, 'username', 'User')}
              </Text>
              <Text style={[styles.userCardSkills, { color: colors.text.secondary }]}>
                {safeGet(user, 'skills', []).length > 0 ? safeGet(user, 'skills', []).join(', ') : 'No skills listed'}
              </Text>
              <View style={[styles.distance, { backgroundColor: colors.background.dark }]}>
                <Icon name="map-marker-alt" size={12} color={colors.primary} />
                <Text style={[styles.distanceText, { color: colors.text.secondary }]}>
                  Nearby
                </Text>
              </View>
            </TouchableOpacity>
          )) : (
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No users found nearby</Text>
          )}
        </ScrollView>
      </View>

      {/* Community Tips */}
      <View style={[styles.tipCard, { backgroundColor: colors.accent }]}>
        <Icon name="lightbulb" size={24} color="#fff" style={styles.tipIcon} />
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>Barter Tip</Text>
          <Text style={styles.tipText}>
            Remember to be clear about the condition of items you're offering for trade.
            Honesty builds trust in our community!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  welcomeText: {
    fontSize: FONT.sizes.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  subText: {
    fontSize: FONT.sizes.medium,
  },
  balanceCard: {
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: FONT.sizes.small,
    color: '#000',
    fontWeight: 'bold',
  },
  balanceValue: {
    fontSize: FONT.sizes.xxl,
    fontWeight: 'bold',
    color: '#000',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.large,
  },
  actionButton: {
    width: '30%',
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionText: {
    marginTop: SPACING.small,
    fontSize: FONT.sizes.small,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: FONT.sizes.medium,
  },
  listingCard: {
    width: 200,
    borderRadius: SIZES.borderRadius.medium,
    marginRight: SPACING.medium,
    overflow: 'hidden',
    borderWidth: 1,
  },
  listingImage: {
    width: '100%',
    height: 120,
  },
  listingDetails: {
    padding: SPACING.medium,
  },
  listingTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  listingCategory: {
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.small,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  talentPrice: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: SPACING.xs,
  },
  userName: {
    fontSize: FONT.sizes.small,
  },
  userCard: {
    width: 150,
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    alignItems: 'center',
    marginRight: SPACING.medium,
    borderWidth: 1,
  },
  userCardAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: SPACING.small,
  },
  userCardName: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  userCardSkills: {
    fontSize: FONT.sizes.small,
    textAlign: 'center',
    marginBottom: SPACING.small,
  },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.borderRadius.small,
  },
  distanceText: {
    fontSize: FONT.sizes.xs,
    marginLeft: SPACING.xs,
  },
  tipCard: {
    flexDirection: 'row',
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    marginBottom: SPACING.large,
  },
  tipIcon: {
    marginRight: SPACING.medium,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  tipText: {
    fontSize: FONT.sizes.small,
    color: '#fff',
  },

  emptyText: {
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
    padding: SPACING.medium,
    fontStyle: 'italic',
  },
});