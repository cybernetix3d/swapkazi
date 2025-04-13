import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput
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

export default function PeopleNearbyScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Get unique skills from all users
  const allSkills = Array.from(
    new Set(
      users.flatMap(user => user.skills || [])
    )
  ).sort();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedSkills, users]);

  const fetchUsers = async () => {
    try {
      setError(null);
      setLoading(true);

      // Get users from the API
      const fetchedUsers = await UserService.getUsers();
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        (user.skills && user.skills.some(skill => skill.toLowerCase().includes(query)))
      );
    }

    // Filter by selected skills
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(user =>
        user.skills && selectedSkills.every(skill => user.skills.includes(skill))
      );
    }

    setFilteredUsers(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const toggleSkillFilter = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: colors.background.card }]}
      onPress={() => router.push(`/profile/${item._id}`)}
    >
      <View style={styles.userCardContent}>
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

        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text.primary }]}>
            {item.fullName}
          </Text>
          <Text style={[styles.userUsername, { color: colors.text.secondary }]}>
            @{item.username}
          </Text>

          {item.skills && item.skills.length > 0 && (
            <View style={styles.skillsContainer}>
              {item.skills.slice(0, 3).map((skill, index) => (
                <View
                  key={index}
                  style={[
                    styles.skillChip,
                    { backgroundColor: colors.background.darker }
                  ]}
                >
                  <Text style={[styles.skillText, { color: colors.text.secondary }]}>
                    {skill}
                  </Text>
                </View>
              ))}
              {item.skills.length > 3 && (
                <Text style={[styles.moreSkills, { color: colors.text.muted }]}>
                  +{item.skills.length - 3} more
                </Text>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push({
            pathname: '/messages/new',
            params: { userId: item._id }
          })}
        >
          <Icon name="comment" size={16} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.userCardFooter}>
        <View style={styles.locationContainer}>
          <Icon name="map-marker-alt" size={12} color={colors.text.muted} />
          <Text style={[styles.locationText, { color: colors.text.muted }]}>
            {item.location?.address || 'Nearby'}
          </Text>
        </View>

        {item.averageRating > 0 && (
          <View style={styles.ratingContainer}>
            <Icon name="star" size={12} color={colors.primary} />
            <Text style={[styles.ratingText, { color: colors.text.muted }]}>
              {item.averageRating.toFixed(1)} ({item.ratings?.length || 0})
            </Text>
          </View>
        )}
      </View>
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
        <ErrorMessage message={error} onRetry={fetchUsers} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'People Nearby',
          headerStyle: {
            backgroundColor: colors.background.dark,
          },
          headerTintColor: colors.text.primary,
        }}
      />

      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.background.card }]}>
          <Icon name="search" size={16} color={colors.text.muted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder="Search by name or skill..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Icon name="times-circle" size={16} color={colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Skills Filter */}
        {allSkills.length > 0 && (
          <View style={styles.skillsFilterContainer}>
            <Text style={[styles.filterTitle, { color: colors.text.secondary }]}>
              Filter by skills:
            </Text>
            <FlatList
              data={allSkills}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.skillsFilterList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.skillFilterChip,
                    selectedSkills.includes(item)
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.background.card }
                  ]}
                  onPress={() => toggleSkillFilter(item)}
                >
                  <Text
                    style={[
                      styles.skillFilterText,
                      selectedSkills.includes(item)
                        ? { color: '#000' }
                        : { color: colors.text.primary }
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Users List */}
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.usersList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="user-friends"
              title="No People Found"
              message={
                searchQuery || selectedSkills.length > 0
                  ? "No people match your search criteria. Try adjusting your filters."
                  : "There are no people nearby at the moment. Check back later!"
              }
            />
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  searchIcon: {
    marginRight: SPACING.small,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT.sizes.medium,
    height: 40,
  },
  clearButton: {
    padding: SPACING.small,
  },
  skillsFilterContainer: {
    paddingHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  filterTitle: {
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.small,
  },
  skillsFilterList: {
    paddingBottom: SPACING.small,
  },
  skillFilterChip: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SIZES.borderRadius.full,
    marginRight: SPACING.small,
  },
  skillFilterText: {
    fontSize: FONT.sizes.small,
  },
  usersList: {
    padding: SPACING.medium,
  },
  userCard: {
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SPACING.medium,
    overflow: 'hidden',
  },
  userCardContent: {
    flexDirection: 'row',
    padding: SPACING.medium,
  },
  userAvatarContainer: {
    marginRight: SPACING.medium,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  userUsername: {
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.small,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  skillChip: {
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.borderRadius.small,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  skillText: {
    fontSize: FONT.sizes.xs,
  },
  moreSkills: {
    fontSize: FONT.sizes.xs,
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  userCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: FONT.sizes.xs,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONT.sizes.xs,
    marginLeft: 4,
  },
});
