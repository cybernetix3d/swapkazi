// Path: mobile/app/(app)/messages/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { ConversationListItem } from '../../../types';

// Mock data for development
const mockConversations: ConversationListItem[] = [
  {
    _id: '1',
    participants: ['1', '2'],
    otherParticipant: {
      _id: '2',
      username: 'thabo_m',
      email: 'thabo@example.com',
      fullName: 'Thabo M',
      avatar: 'https://via.placeholder.com/50',
      skills: ['Crafts'],
      talentBalance: 50,
      location: {
        type: 'Point',
        coordinates: [18.4241, -33.9249],
        address: 'Khayelitsha, Cape Town'
      },
      ratings: [],
      averageRating: 4.5,
      isActive: true,
      createdAt: '2023-01-15T10:30:00Z',
      updatedAt: '2023-01-15T10:30:00Z'
    },
    lastMessageContent: "Hi, I'm interested in your handcrafted pottery. Is it still available?",
    lastMessageTime: '2023-02-01T14:30:00Z',
    isActive: true,
    createdAt: '2023-02-01T14:30:00Z',
    updatedAt: '2023-02-01T14:30:00Z',
    unreadCount: 1
  },
  {
    _id: '2',
    participants: ['1', '3'],
    otherParticipant: {
      _id: '3',
      username: 'lerato_k',
      email: 'lerato@example.com',
      fullName: 'Lerato K',
      avatar: 'https://via.placeholder.com/50',
      skills: ['Gardening'],
      talentBalance: 75,
      location: {
        type: 'Point',
        coordinates: [18.4641, -33.9249],
        address: 'Gugulethu, Cape Town'
      },
      ratings: [],
      averageRating: 4.8,
      isActive: true,
      createdAt: '2023-01-10T09:20:00Z',
      updatedAt: '2023-01-10T09:20:00Z'
    },
    lastMessageContent: 'Thank you for the garden service! Would you be available next week as well?',
    lastMessageTime: '2023-01-28T09:15:00Z',
    isActive: true,
    createdAt: '2023-01-25T11:20:00Z',
    updatedAt: '2023-01-28T09:15:00Z',
    unreadCount: 0
  }
];

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  useEffect(() => {
    fetchConversations();
  }, []);
  
  const fetchConversations = async () => {
    setLoading(true);
    // In a real app, this would call an API
    // For now, we'll use mock data
    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };
  
  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  const handleConversationPress = (id: string) => {
    router.push(`/(app)/messages/${id}`);
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };
  
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.conversationItem, { backgroundColor: colors.background.card }]}
            onPress={() => handleConversationPress(item._id)}
          >
            <View style={styles.avatarContainer}>
              {item.otherParticipant.avatar ? (
                <View style={styles.avatar}>
                  {/* In a real app, this would be an Image component */}
                  <Text style={{ fontSize: 20, color: '#fff' }}>
                    {item.otherParticipant.fullName.charAt(0)}
                  </Text>
                </View>
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={{ fontSize: 20, color: '#000' }}>
                    {item.otherParticipant.fullName.charAt(0)}
                  </Text>
                </View>
              )}
              {item.unreadCount && item.unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.contentContainer}>
              <View style={styles.headerRow}>
                <Text style={[styles.name, { color: colors.text.primary }]}>
                  {item.otherParticipant.fullName}
                </Text>
                <Text style={[styles.time, { color: colors.text.secondary }]}>
                  {formatDate(item.lastMessageTime)}
                </Text>
              </View>
              
              <Text 
                style={[
                  styles.message, 
                  { 
                    color: (item.unreadCount && item.unreadCount > 0) ? colors.text.primary : colors.text.secondary,
                    fontWeight: (item.unreadCount && item.unreadCount > 0) ? 'bold' : 'normal'
                  }
                ]}
                numberOfLines={2}
              >
                {item.lastMessageContent}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="comments" size={48} color={colors.text.secondary} />
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No conversations yet
            </Text>
            <Text style={[styles.emptySubText, { color: colors.text.muted }]}>
              Start a conversation by messaging someone on a listing
            </Text>
          </View>
        )}
      />
      
      {/* New Message Button */}
      <TouchableOpacity
        style={[styles.newMessageButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(app)/messages/new')}
      >
        <FontAwesome5 name="plus" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.medium,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#000',
    fontSize: FONT.sizes.xs,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  time: {
    fontSize: FONT.sizes.small,
  },
  message: {
    fontSize: FONT.sizes.medium,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT.sizes.large,
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
  },
  emptySubText: {
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
  },
  newMessageButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});