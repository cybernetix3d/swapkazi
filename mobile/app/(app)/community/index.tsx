import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Image
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { User } from '../../../types';
import * as UserService from '../../../services/userService';
import Icon from '../../../components/ui/Icon';
import DefaultAvatar from '../../../components/DefaultAvatar';
import EmptyState from '../../../components/EmptyState';
import ErrorMessage from '../../../components/ErrorMessage';

// Mock forum topics for now
const forumTopics = [
  {
    id: '1',
    title: 'Skill Exchange Tips',
    description: 'Share your tips for successful skill exchanges',
    icon: 'lightbulb',
    posts: 24,
    lastActive: '2 hours ago'
  },
  {
    id: '2',
    title: 'Community Projects',
    description: 'Collaborate on community projects and initiatives',
    icon: 'users',
    posts: 18,
    lastActive: '5 hours ago'
  },
  {
    id: '3',
    title: 'Talent Showcase',
    description: 'Show off your skills and get feedback',
    icon: 'star',
    posts: 32,
    lastActive: '1 day ago'
  },
  {
    id: '4',
    title: 'Help & Support',
    description: 'Get help with using SwapKazi',
    icon: 'question-circle',
    posts: 45,
    lastActive: '3 hours ago'
  },
  {
    id: '5',
    title: 'Announcements',
    description: 'Official announcements from the SwapKazi team',
    icon: 'bullhorn',
    posts: 12,
    lastActive: '1 week ago'
  }
];

export default function CommunityScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNearbyUsers();
  }, []);

  const fetchNearbyUsers = async () => {
    try {
      setError(null);
      setLoading(true);

      // Use mock data instead of API call
      // This data is based on server/src/utils/seedData.js
      const mockUsers: User[] = [
        {
          _id: 'user1',
          username: 'alexsmith',
          email: 'alex.smith@example.com',
          fullName: 'Alex Smith',
          bio: 'Professional Web Developer specializing in modern frameworks and responsive design.',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          phoneNumber: '+27 71 123 4567',
          skills: ['Web Development', 'UX/UI Design', 'App Development'],
          location: {
            type: 'Point',
            coordinates: [18.4241, -33.9249],
            address: 'Cape Town CBD, Cape Town, South Africa'
          },
          talentBalance: 100,
          ratings: [],
          averageRating: 4.5,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'user2',
          username: 'sarahjohnson',
          email: 'sarah.johnson@example.com',
          fullName: 'Sarah Johnson',
          bio: 'Graphic designer with 5+ years of experience in branding and digital design.',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          phoneNumber: '+27 82 234 5678',
          skills: ['Graphic Design', 'Illustration', 'Branding'],
          location: {
            type: 'Point',
            coordinates: [18.4241, -33.9249],
            address: 'Woodstock, Cape Town, South Africa'
          },
          talentBalance: 85,
          ratings: [],
          averageRating: 4.8,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'user3',
          username: 'michaelbrown',
          email: 'michael.brown@example.com',
          fullName: 'Michael Brown',
          bio: 'Mobile app developer specializing in React Native and Flutter.',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
          phoneNumber: '+27 73 345 6789',
          skills: ['Mobile Development', 'React Native', 'Flutter'],
          location: {
            type: 'Point',
            coordinates: [18.4241, -33.9249],
            address: 'Observatory, Cape Town, South Africa'
          },
          talentBalance: 120,
          ratings: [],
          averageRating: 4.2,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'user4',
          username: 'emilydavis',
          email: 'emily.davis@example.com',
          fullName: 'Emily Davis',
          bio: 'Content writer and copywriter with expertise in SEO and digital marketing.',
          avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
          phoneNumber: '+27 84 456 7890',
          skills: ['Content Writing', 'Copywriting', 'Editing'],
          location: {
            type: 'Point',
            coordinates: [18.4241, -33.9249],
            address: 'Green Point, Cape Town, South Africa'
          },
          talentBalance: 75,
          ratings: [],
          averageRating: 4.6,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setNearbyUsers(mockUsers);
    } catch (err: any) {
      console.error('Error fetching nearby users:', err);
      setError(err.message || 'Failed to load nearby users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNearbyUsers();
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: colors.background.card }]}
      onPress={() => router.push(`/profile/${item._id}`)}
    >
      <View style={styles.userAvatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
        ) : (
          <DefaultAvatar
            name={item.fullName || ''}
            userId={item._id}
            size={60}
          />
        )}
      </View>
      <Text style={[styles.userName, { color: colors.text.primary }]} numberOfLines={1}>
        {item.fullName}
      </Text>
      <Text style={[styles.userSkills, { color: colors.text.secondary }]} numberOfLines={1}>
        {item.skills && item.skills.length > 0
          ? item.skills.slice(0, 2).join(', ')
          : 'No skills listed'}
      </Text>
      <View style={styles.locationContainer}>
        <Icon name="map-marker-alt" size={12} color={colors.text.muted} />
        <Text style={[styles.locationText, { color: colors.text.muted }]}>
          Nearby
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderForumTopic = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.forumCard, { backgroundColor: colors.background.card }]}
      onPress={() => router.push(`/community/forum/${item.id}`)}
    >
      <View style={[styles.forumIconContainer, { backgroundColor: colors.background.darker }]}>
        <Icon name={item.icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.forumContent}>
        <Text style={[styles.forumTitle, { color: colors.text.primary }]}>
          {item.title}
        </Text>
        <Text style={[styles.forumDescription, { color: colors.text.secondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.forumStats}>
          <Text style={[styles.forumStatText, { color: colors.text.muted }]}>
            {item.posts} posts • Last active {item.lastActive}
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={16} color={colors.text.muted} />
    </TouchableOpacity>
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
        <ErrorMessage message={error} onRetry={fetchNearbyUsers} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Community',
          headerStyle: {
            backgroundColor: colors.background.dark,
          },
          headerTintColor: colors.text.primary,
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background.dark }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* People Nearby Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              People Nearby
            </Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push('/community/people')}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {nearbyUsers.length > 0 ? (
            <FlatList
              data={nearbyUsers.slice(0, 4)} // Show only first 4 users
              renderItem={renderUserItem}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.usersList}
            />
          ) : (
            <EmptyState
              icon="user-friends"
              title="No People Nearby"
              message="There are no people nearby at the moment. Check back later!"
              compact
            />
          )}
        </View>

        {/* Forums Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Forums
            </Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push('/community/forums')}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.forumsList}>
            {forumTopics.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={[styles.forumCard, { backgroundColor: colors.background.card }]}
                onPress={() => router.push(`/community/forum/${topic.id}`)}
              >
                <View style={[styles.forumIconContainer, { backgroundColor: colors.background.darker }]}>
                  <Icon name={topic.icon} size={24} color={colors.primary} />
                </View>
                <View style={styles.forumContent}>
                  <Text style={[styles.forumTitle, { color: colors.text.primary }]}>
                    {topic.title}
                  </Text>
                  <Text style={[styles.forumDescription, { color: colors.text.secondary }]} numberOfLines={2}>
                    {topic.description}
                  </Text>
                  <View style={styles.forumStats}>
                    <Text style={[styles.forumStatText, { color: colors.text.muted }]}>
                      {topic.posts} posts • Last active {topic.lastActive}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={16} color={colors.text.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Community Guidelines */}
        <View style={[styles.guidelinesCard, { backgroundColor: colors.background.card }]}>
          <Icon name="info-circle" size={24} color={colors.primary} style={styles.guidelinesIcon} />
          <View style={styles.guidelinesContent}>
            <Text style={[styles.guidelinesTitle, { color: colors.text.primary }]}>
              Community Guidelines
            </Text>
            <Text style={[styles.guidelinesText, { color: colors.text.secondary }]}>
              Be respectful, helpful, and supportive of other community members.
              Share your knowledge and experiences to help others succeed.
            </Text>
            <TouchableOpacity
              style={[styles.guidelinesButton, { borderColor: colors.primary }]}
              onPress={() => router.push('/community/guidelines')}
            >
              <Text style={[styles.guidelinesButtonText, { color: colors.primary }]}>
                Read Full Guidelines
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
  },
  seeAllButton: {
    padding: SPACING.small,
  },
  seeAllText: {
    fontSize: FONT.sizes.medium,
    fontWeight: '500',
  },
  usersList: {
    paddingHorizontal: SPACING.medium,
  },
  userCard: {
    width: 120,
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    marginHorizontal: SPACING.small,
    alignItems: 'center',
  },
  userAvatarContainer: {
    marginBottom: SPACING.small,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userName: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  userSkills: {
    fontSize: FONT.sizes.small,
    textAlign: 'center',
    marginBottom: SPACING.small,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: FONT.sizes.xs,
    marginLeft: 4,
  },
  forumsList: {
    paddingHorizontal: SPACING.large,
  },
  forumCard: {
    flexDirection: 'row',
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    alignItems: 'center',
  },
  forumIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  forumContent: {
    flex: 1,
  },
  forumTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  forumDescription: {
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.xs,
  },
  forumStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forumStatText: {
    fontSize: FONT.sizes.xs,
  },
  guidelinesCard: {
    flexDirection: 'row',
    margin: SPACING.large,
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    marginBottom: SPACING.large,
  },
  guidelinesIcon: {
    marginRight: SPACING.medium,
    alignSelf: 'flex-start',
    marginTop: SPACING.small,
  },
  guidelinesContent: {
    flex: 1,
  },
  guidelinesTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  guidelinesText: {
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.medium,
  },
  guidelinesButton: {
    borderWidth: 1,
    borderRadius: SIZES.borderRadius.small,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    alignSelf: 'flex-start',
  },
  guidelinesButtonText: {
    fontSize: FONT.sizes.small,
    fontWeight: '500',
  },
});
