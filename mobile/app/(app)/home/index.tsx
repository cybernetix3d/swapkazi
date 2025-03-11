import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { Listing, User } from '../../../types';

// Mock interfaces for demo data
interface MockListing {
  id: string;
  title: string;
  category: string;
  image: string;
  talentPrice: number;
  user: {
    name: string;
    avatar: string;
  };
}

interface NearbyUser {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  distance: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [featuredListings, setFeaturedListings] = useState<MockListing[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Simulate API calls with timeout
    setRefreshing(true);
    setTimeout(() => {
      setFeaturedListings([
        {
          id: '1',
          title: 'Handcrafted Pottery',
          category: 'Crafts',
          image: 'https://via.placeholder.com/150',
          talentPrice: 15,
          user: {
            name: 'Thabo M.',
            avatar: 'https://via.placeholder.com/50',
          },
        },
        {
          id: '2',
          title: 'Gardening Services',
          category: 'Services',
          image: 'https://via.placeholder.com/150',
          talentPrice: 25,
          user: {
            name: 'Lerato K.',
            avatar: 'https://via.placeholder.com/50',
          },
        },
        {
          id: '3',
          title: 'Homemade Bread',
          category: 'Food',
          image: 'https://via.placeholder.com/150',
          talentPrice: 8,
          user: {
            name: 'Sipho N.',
            avatar: 'https://via.placeholder.com/50',
          },
        },
      ]);

      setNearbyUsers([
        {
          id: '1',
          name: 'Mandla J.',
          avatar: 'https://via.placeholder.com/50',
          skills: ['Carpentry', 'Plumbing'],
          distance: '0.5 km',
        },
        {
          id: '2',
          name: 'Nomsa T.',
          avatar: 'https://via.placeholder.com/50',
          skills: ['Baking', 'Sewing'],
          distance: '0.8 km',
        },
        {
          id: '3',
          name: 'Bongani M.',
          avatar: 'https://via.placeholder.com/50',
          skills: ['Electronics', 'IT Support'],
          distance: '1.2 km',
        },
      ]);

      setRefreshing(false);
    }, 1000);
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
          style={[styles.actionButton, { backgroundColor: colors.background.card }]}
          onPress={() => router.push('/(app)/marketplace/create')}
        >
          <FontAwesome5 name="plus-circle" size={24} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.text.primary }]}>
            Create Listing
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background.card }]}
          onPress={() => router.push('/(app)/marketplace/search')}
        >
          <FontAwesome5 name="search" size={24} color={colors.secondary} />
          <Text style={[styles.actionText, { color: colors.text.primary }]}>
            Find Items
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background.card }]}
          onPress={() => router.push('/(app)/marketplace')}
        >
          <FontAwesome5 name="store" size={24} color={colors.accent} />
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
          <TouchableOpacity onPress={() => router.push('/(app)/marketplace')}>
            <Text style={[styles.seeAll, { color: colors.accent }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredListings.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.listingCard, { backgroundColor: colors.background.card }]}
              onPress={() => router.push(`/(app)/marketplace/${item.id}`)}
            >
              <Image source={{ uri: item.image }} style={styles.listingImage} />
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
                    <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
                    <Text style={[styles.userName, { color: colors.text.secondary }]}>
                      {item.user.name}
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
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: colors.accent }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {nearbyUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[styles.userCard, { backgroundColor: colors.background.card }]}
              onPress={() => router.push(`/(app)/profile/${user.id}`)}
            >
              <Image source={{ uri: user.avatar }} style={styles.userCardAvatar} />
              <Text style={[styles.userCardName, { color: colors.text.primary }]}>
                {user.name}
              </Text>
              <Text style={[styles.userCardSkills, { color: colors.text.secondary }]}>
                {user.skills.join(', ')}
              </Text>
              <View style={[styles.distance, { backgroundColor: colors.background.dark }]}>
                <FontAwesome5 name="map-marker-alt" size={12} color={colors.primary} />
                <Text style={[styles.distanceText, { color: colors.text.secondary }]}>
                  {user.distance}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Community Tips */}
      <View style={[styles.tipCard, { backgroundColor: colors.accent }]}>
        <FontAwesome5 name="lightbulb" size={24} color="#fff" style={styles.tipIcon} />
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
});