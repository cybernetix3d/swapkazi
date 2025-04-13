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

      // Use mock data instead of API call
      // This data is based on server/src/utils/seedData.js
      const mockListings: Listing[] = [
        {
          _id: '1',
          title: 'Professional Web Development',
          description: 'I can build responsive websites using modern frameworks like React, Vue, or Angular.',
          category: 'Web Development',
          condition: 'New',
          exchangeType: 'Talent',
          talentPrice: 50,
          cashPrice: 0,
          location: {
            type: 'Point',
            coordinates: [18.4241, -33.9249],
            address: 'Cape Town, South Africa'
          },
          images: ['https://randomuser.me/api/portraits/men/1.jpg'],
          user: {
            _id: 'user1',
            username: 'alexsmith',
            fullName: 'Alex Smith',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            skills: ['Web Development', 'UX/UI Design', 'App Development']
          },
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Graphic Design Services',
          description: 'Professional graphic design including logos, branding, and marketing materials.',
          category: 'Design',
          condition: 'New',
          exchangeType: 'Talent',
          talentPrice: 40,
          cashPrice: 0,
          location: {
            type: 'Point',
            coordinates: [18.4241, -33.9249],
            address: 'Cape Town, South Africa'
          },
          images: ['https://randomuser.me/api/portraits/women/2.jpg'],
          user: {
            _id: 'user2',
            username: 'sarahjohnson',
            fullName: 'Sarah Johnson',
            avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
            skills: ['Graphic Design', 'Illustration', 'Branding']
          },
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '3',
          title: 'Mobile App Development',
          description: 'I can develop native iOS and Android applications using React Native or Flutter.',
          category: 'App Development',
          condition: 'New',
          exchangeType: 'Talent',
          talentPrice: 60,
          cashPrice: 0,
          location: {
            type: 'Point',
            coordinates: [18.4241, -33.9249],
            address: 'Cape Town, South Africa'
          },
          images: ['https://randomuser.me/api/portraits/men/3.jpg'],
          user: {
            _id: 'user3',
            username: 'michaelbrown',
            fullName: 'Michael Brown',
            avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
            skills: ['Mobile Development', 'React Native', 'Flutter']
          },
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '4',
          title: 'Content Writing & Copywriting',
          description: 'Professional content writing for blogs, websites, and marketing materials.',
          category: 'Writing',
          condition: 'New',
          exchangeType: 'Talent',
          talentPrice: 35,
          cashPrice: 0,
          location: {
            type: 'Point',
            coordinates: [18.4241, -33.9249],
            address: 'Cape Town, South Africa'
          },
          images: ['https://randomuser.me/api/portraits/women/4.jpg'],
          user: {
            _id: 'user4',
            username: 'emilydavis',
            fullName: 'Emily Davis',
            avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
            skills: ['Content Writing', 'Copywriting', 'Editing']
          },
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '5',
          title: 'Photography Services',
          description: 'Professional photography for events, portraits, and product photography.',
          category: 'Photography',
          condition: 'New',
          exchangeType: 'Talent',
          talentPrice: 45,
          cashPrice: 0,
          location: {
            type: 'Point',
            coordinates: [18.4241, -33.9249],
            address: 'Cape Town, South Africa'
          },
          images: ['https://randomuser.me/api/portraits/men/5.jpg'],
          user: {
            _id: 'user5',
            username: 'davidwilson',
            fullName: 'David Wilson',
            avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
            skills: ['Photography', 'Photo Editing', 'Videography']
          },
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '6',
          title: 'Social Media Management',
          description: 'Complete social media management including content creation and scheduling.',
          category: 'Marketing',
          condition: 'New',
          exchangeType: 'Talent',
          talentPrice: 40,
          cashPrice: 0,
          location: {
            type: 'Point',
            coordinates: [18.4241, -33.9249],
            address: 'Cape Town, South Africa'
          },
          images: ['https://randomuser.me/api/portraits/women/6.jpg'],
          user: {
            _id: 'user6',
            username: 'oliviathomas',
            fullName: 'Olivia Thomas',
            avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
            skills: ['Social Media', 'Content Creation', 'Marketing']
          },
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setFeaturedListings(mockListings);
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
