import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { FONT, SPACING, SIZES } from '../../../../constants/Theme';
import Icon from '../../../../components/ui/Icon';
import DefaultAvatar from '../../../../components/DefaultAvatar';
import EmptyState from '../../../../components/EmptyState';

// Mock forum topics
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

// Mock forum posts
const mockPosts = {
  '1': [
    {
      id: '101',
      author: {
        id: 'user1',
        name: 'Alex Smith',
        avatar: null
      },
      content: 'What are your best tips for negotiating a fair exchange of skills?',
      timestamp: '2023-10-15T14:30:00Z',
      likes: 5,
      replies: 3
    },
    {
      id: '102',
      author: {
        id: 'user2',
        name: 'Laura Baker',
        avatar: null
      },
      content: 'I always make sure to clearly define the scope of work before agreeing to an exchange. This prevents misunderstandings later on.',
      timestamp: '2023-10-15T15:45:00Z',
      likes: 8,
      replies: 1
    },
    {
      id: '103',
      author: {
        id: 'user3',
        name: 'Kevin Moore',
        avatar: null
      },
      content: 'Setting clear expectations about timeline and deliverables has been key for me. Also, I like to start with smaller exchanges to build trust before committing to larger projects.',
      timestamp: '2023-10-16T09:20:00Z',
      likes: 12,
      replies: 2
    }
  ],
  '2': [
    {
      id: '201',
      author: {
        id: 'user4',
        name: 'Robert Thomas',
        avatar: null
      },
      content: "I'm organizing a community garden project and need people with gardening skills. Anyone interested?",
      timestamp: '2023-10-10T11:15:00Z',
      likes: 15,
      replies: 7
    }
  ],
  '3': [
    {
      id: '301',
      author: {
        id: 'user5',
        name: 'Sarah Johnson',
        avatar: null
      },
      content: "I just completed a logo design for a local business. Would love some feedback from other designers!",
      timestamp: '2023-10-12T16:40:00Z',
      likes: 9,
      replies: 4
    }
  ],
  '4': [
    {
      id: '401',
      author: {
        id: 'user6',
        name: 'Michael Brown',
        avatar: null
      },
      content: "How do I update my skills on my profile? I can't seem to find the option.",
      timestamp: '2023-10-14T10:05:00Z',
      likes: 2,
      replies: 3
    }
  ],
  '5': [
    {
      id: '501',
      author: {
        id: 'admin',
        name: 'SwapKazi Team',
        avatar: null
      },
      content: "We're excited to announce that we'll be launching a new feature next week that allows you to track the progress of your skill exchanges!",
      timestamp: '2023-10-01T09:00:00Z',
      likes: 25,
      replies: 8
    }
  ]
};

export default function ForumTopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [topic, setTopic] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchTopicAndPosts();
  }, [id]);

  const fetchTopicAndPosts = () => {
    setLoading(true);
    
    // Find the topic from our mock data
    const foundTopic = forumTopics.find(t => t.id === id);
    
    if (foundTopic) {
      setTopic(foundTopic);
      
      // Get posts for this topic
      const topicPosts = mockPosts[id as keyof typeof mockPosts] || [];
      setPosts(topicPosts);
    }
    
    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTopicAndPosts();
  };

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;
    
    if (!user) {
      Alert.alert(
        'Login Required',
        'You need to be logged in to post in the forum.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }
    
    setPosting(true);
    
    // Simulate posting
    setTimeout(() => {
      const newPost = {
        id: `new-${Date.now()}`,
        author: {
          id: user._id,
          name: user.fullName,
          avatar: user.avatar
        },
        content: newPostContent.trim(),
        timestamp: new Date().toISOString(),
        likes: 0,
        replies: 0
      };
      
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setPosting(false);
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={[styles.postCard, { backgroundColor: colors.background.card }]}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <DefaultAvatar
            name={item.author.name}
            userId={item.author.id}
            size={40}
          />
          <View style={styles.authorTextInfo}>
            <Text style={[styles.authorName, { color: colors.text.primary }]}>
              {item.author.name}
            </Text>
            <Text style={[styles.postTime, { color: colors.text.muted }]}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="ellipsis-v" size={16} color={colors.text.muted} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.postContent, { color: colors.text.primary }]}>
        {item.content}
      </Text>
      
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="thumbs-up" size={16} color={colors.text.muted} />
          <Text style={[styles.actionText, { color: colors.text.muted }]}>
            {item.likes}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="comment" size={16} color={colors.text.muted} />
          <Text style={[styles.actionText, { color: colors.text.muted }]}>
            {item.replies}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share" size={16} color={colors.text.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!topic) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <EmptyState
          icon="exclamation-circle"
          title="Topic Not Found"
          message="The forum topic you're looking for doesn't exist."
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: topic.title,
          headerStyle: {
            backgroundColor: colors.background.dark,
          },
          headerTintColor: colors.text.primary,
        }}
      />
      
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background.dark }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.postsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.topicHeader}>
              <View style={[styles.topicIconContainer, { backgroundColor: colors.background.card }]}>
                <Icon name={topic.icon} size={24} color={colors.primary} />
              </View>
              <Text style={[styles.topicDescription, { color: colors.text.secondary }]}>
                {topic.description}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="comments"
              title="No Posts Yet"
              message="Be the first to start a discussion in this topic!"
            />
          }
        />
        
        <View style={[styles.inputContainer, { backgroundColor: colors.background.card }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background.darker, color: colors.text.primary }]}
            placeholder="Write a post..."
            placeholderTextColor={colors.text.muted}
            multiline
            value={newPostContent}
            onChangeText={setNewPostContent}
          />
          <TouchableOpacity
            style={[
              styles.postButton,
              { backgroundColor: colors.primary },
              (!newPostContent.trim() || posting) && { opacity: 0.7 }
            ]}
            onPress={handlePostSubmit}
            disabled={!newPostContent.trim() || posting}
          >
            {posting ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Icon name="paper-plane" size={16} color="#000" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topicHeader: {
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  topicIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  topicDescription: {
    fontSize: FONT.sizes.medium,
  },
  postsList: {
    padding: SPACING.medium,
  },
  postCard: {
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SPACING.medium,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorTextInfo: {
    marginLeft: SPACING.small,
  },
  authorName: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  postTime: {
    fontSize: FONT.sizes.xs,
  },
  moreButton: {
    padding: SPACING.small,
  },
  postContent: {
    padding: SPACING.medium,
    fontSize: FONT.sizes.medium,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.small,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.large,
    padding: SPACING.small,
  },
  actionText: {
    fontSize: FONT.sizes.small,
    marginLeft: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    maxHeight: 100,
    minHeight: 40,
  },
  postButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.small,
  },
});
