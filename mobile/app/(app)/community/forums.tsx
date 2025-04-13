import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import Icon from '../../../components/ui/Icon';
import EmptyState from '../../../components/EmptyState';

// Mock forum topics
const forumTopics = [
  {
    id: '1',
    title: 'Skill Exchange Tips',
    description: 'Share your tips for successful skill exchanges',
    icon: 'lightbulb',
    posts: 24,
    lastActive: '2 hours ago',
    category: 'General'
  },
  {
    id: '2',
    title: 'Community Projects',
    description: 'Collaborate on community projects and initiatives',
    icon: 'users',
    posts: 18,
    lastActive: '5 hours ago',
    category: 'Projects'
  },
  {
    id: '3',
    title: 'Talent Showcase',
    description: 'Show off your skills and get feedback',
    icon: 'star',
    posts: 32,
    lastActive: '1 day ago',
    category: 'Showcase'
  },
  {
    id: '4',
    title: 'Help & Support',
    description: 'Get help with using SwapKazi',
    icon: 'question-circle',
    posts: 45,
    lastActive: '3 hours ago',
    category: 'Support'
  },
  {
    id: '5',
    title: 'Announcements',
    description: 'Official announcements from the SwapKazi team',
    icon: 'bullhorn',
    posts: 12,
    lastActive: '1 week ago',
    category: 'Official'
  },
  {
    id: '6',
    title: 'Feedback & Suggestions',
    description: 'Share your ideas to improve SwapKazi',
    icon: 'comment-dots',
    posts: 37,
    lastActive: '12 hours ago',
    category: 'Support'
  },
  {
    id: '7',
    title: 'Success Stories',
    description: 'Share your successful skill exchange stories',
    icon: 'trophy',
    posts: 15,
    lastActive: '3 days ago',
    category: 'General'
  },
  {
    id: '8',
    title: 'Technical Skills',
    description: 'Discuss programming, design, and other technical skills',
    icon: 'laptop-code',
    posts: 28,
    lastActive: '1 day ago',
    category: 'Skills'
  },
  {
    id: '9',
    title: 'Creative Arts',
    description: 'Discuss music, painting, writing, and other creative skills',
    icon: 'paint-brush',
    posts: 22,
    lastActive: '2 days ago',
    category: 'Skills'
  },
  {
    id: '10',
    title: 'Events & Meetups',
    description: 'Find and organize local skill-sharing events',
    icon: 'calendar',
    posts: 9,
    lastActive: '4 days ago',
    category: 'Events'
  }
];

// Get unique categories
const categories = Array.from(new Set(forumTopics.map(topic => topic.category))).sort();

export default function ForumsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filteredTopics = forumTopics.filter(topic => {
    // Filter by search query
    const matchesSearch = !searchQuery || 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = !selectedCategory || topic.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

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

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Forums',
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
            placeholder="Search forums..."
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
        
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={['All', ...categories]}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  (item === 'All' && !selectedCategory) || item === selectedCategory
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.background.card }
                ]}
                onPress={() => setSelectedCategory(item === 'All' ? null : item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    (item === 'All' && !selectedCategory) || item === selectedCategory
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
        
        {/* Forums List */}
        <FlatList
          data={filteredTopics}
          renderItem={renderForumTopic}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.forumsList}
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
              icon="comments"
              title="No Forums Found"
              message={
                searchQuery || selectedCategory
                  ? "No forums match your search criteria. Try adjusting your filters."
                  : "There are no forums available at the moment."
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
  categoriesContainer: {
    marginBottom: SPACING.medium,
  },
  categoriesList: {
    paddingHorizontal: SPACING.medium,
  },
  categoryChip: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SIZES.borderRadius.full,
    marginRight: SPACING.small,
  },
  categoryText: {
    fontSize: FONT.sizes.small,
  },
  forumsList: {
    padding: SPACING.medium,
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
});
