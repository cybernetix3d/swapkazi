import React, { useEffect, useState } from 'react';
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

// Helper function to get image URL from listing
const getListingImageUrl = (listing: Listing): string => {
  if (listing.images && listing.images.length > 0) {
    const firstImage = listing.images[0];
    if (typeof firstImage === 'string') {
      return firstImage;
    } else if (typeof firstImage === 'object' && firstImage.url) {
      return firstImage.url;
    }
  }
  return 'https://via.placeholder.com/150';
};



export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [errorMessage, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Fetch featured listings
      try {
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
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Error loading listings');
        setFeaturedListings([]);
      }

      // Fetch nearby users
      try {
        const defaultLocation = [18.4241, -33.9249]; // Cape Town coordinates
        const usersResponse = await UserService.getNearbyUsers(
          defaultLocation[0],
          defaultLocation[1],
          10000, // 10km radius
          5 // limit to 5 users
        );

        if (usersResponse.success && usersResponse.data) {
          setNearbyUsers(usersResponse.data);
        } else {
          setError('Failed to load nearby users');
          setNearbyUsers([]);
        }
      } catch (error) {
        console.error('Error fetching nearby users:', error);
        setError('Error loading nearby users');
        setNearbyUsers([]);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setRefreshing(false);
    }
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
        <View style={[styles.errorContainer, { backgroundColor: colors.error }]}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
      {/* Welcome and Balance Section */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.text.primary }]}>
            Sawubona, {user?.fullName || 'Neighbor'}!
          </Text>
          <Text style={[styles.subText, { color: colors.text.secondary }]}>
            Welcome to SwopKasi
          </Text>
        </View>
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.balanceLabel}>Your Talents</Text>
          <Text style={styles.balanceValue}>{user?.talentBalance || 10}</Text>
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
          {featuredListings.map((item) => (
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
              <Image source={{ uri: getListingImageUrl(item) }} style={styles.listingImage} />
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
                    {typeof item.user === 'string' ? (
                      <DefaultAvatar
                        name="User"
                        userId={item.user}
                        size={24}
                        style={styles.userAvatar}
                      />
                    ) : item.user.avatar ? (
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
                      {typeof item.user === 'string' ? 'User' : (item.user.fullName || item.user.username)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
          {nearbyUsers.map((user) => (
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
              onPress={() => router.push(`/(app)/profile/${user._id}`)}
            >
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.userCardAvatar} />
              ) : (
                <DefaultAvatar
                  name={user.fullName || user.username || 'User'}
                  userId={user._id}
                  size={50}
                  style={styles.userCardAvatar}
                />
              )}
              <Text style={[styles.userCardName, { color: colors.text.primary }]}>
                {user.fullName || user.username}
              </Text>
              <Text style={[styles.userCardSkills, { color: colors.text.secondary }]}>
                {user.skills.join(', ')}
              </Text>
              <View style={[styles.distance, { backgroundColor: colors.background.dark }]}>
                <Icon name="map-marker-alt" size={12} color={colors.primary} />
                <Text style={[styles.distanceText, { color: colors.text.secondary }]}>
                  Nearby
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
  errorContainer: {
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
  },
  errorText: {
    color: '#fff',
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
  },
});