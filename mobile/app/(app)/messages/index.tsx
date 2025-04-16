// Path: mobile/app/(app)/messages/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import ErrorMessage from '../../../components/ErrorMessage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useRouter } from 'expo-router';
import Icon from '../../../components/ui/Icon';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { ConversationListItem } from '../../../types';
import DefaultAvatar from '../../../components/DefaultAvatar';

// Mock data for development - no longer used
/* const mockConversations: ConversationListItem[] = [
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
]; */

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Polling interval reference
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      fetchConversations();

      // Set up polling for conversations every 10 seconds
      startPolling();

      // Clean up polling when component unmounts
      return () => {
        try {
          stopPolling();
        } catch (error) {
          console.error('Error in cleanup function:', error);
        }
      };
    } catch (error) {
      console.error('Error in messages effect:', error);
    }
  }, []);

  const startPolling = () => {
    try {
      // Clear any existing interval
      stopPolling();

      // Set up new polling interval (every 10 seconds)
      pollingIntervalRef.current = setInterval(() => {
        // Use silent refresh (don't show loading indicator)
        fetchConversations(true);
      }, 10000);
    } catch (error) {
      console.error('Error starting polling:', error);
    }
  };

  const stopPolling = () => {
    try {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping polling:', error);
    }
  };

  const fetchConversations = async (silent: boolean = false) => {
    if (!silent) {
      setLoading(true);
      setError(null); // Reset error state
    }

    try {
      // Import the message service
      const MessageService = await import('../../../services/messageService');

      // Fetch conversations from API
      console.log('Fetching conversations from API');
      const conversationsData = await MessageService.getConversations();

      if (Array.isArray(conversationsData)) {
        // Process conversations to ensure they have proper user info and message previews
        const processedConversations = await Promise.all(conversationsData.map(async conversation => {
          // Make sure we have a valid otherParticipant
          if (!conversation.otherParticipant ||
              (typeof conversation.otherParticipant === 'object' && !conversation.otherParticipant.fullName)) {
            // Try to find the other participant from the participants array
            if (conversation.participants && Array.isArray(conversation.participants)) {
              const otherParticipantData = conversation.participants.find(p => {
                if (typeof p === 'string') {
                  return p !== currentUser?._id;
                } else if (p && typeof p === 'object' && p._id) {
                  return p._id !== currentUser?._id;
                }
                return false;
              });

              if (otherParticipantData) {
                if (typeof otherParticipantData === 'object') {
                  conversation.otherParticipant = otherParticipantData;
                } else if (typeof otherParticipantData === 'string') {
                  // If it's just an ID, try to fetch the user data
                  try {
                    const UserService = await import('../../../services/userService');
                    const userData = await UserService.getUserById(otherParticipantData);
                    if (userData) {
                      conversation.otherParticipant = userData;
                    }
                  } catch (userError) {
                    console.error('Error fetching user data:', userError);
                  }
                }
              }
            }
          }

          // Make sure we have a valid lastMessageContent
          if (!conversation.lastMessageContent && conversation.lastMessage) {
            if (typeof conversation.lastMessage === 'string') {
              // It's just an ID, try to fetch the message content
              try {
                const MessageService = await import('../../../services/messageService');
                const messageData = await MessageService.getMessageById(conversation.lastMessage);
                if (messageData && messageData.content) {
                  conversation.lastMessageContent = messageData.content;
                  if (messageData.createdAt) {
                    conversation.lastMessageTime = messageData.createdAt;
                  }
                } else {
                  conversation.lastMessageContent = 'New message';
                }
              } catch (messageError) {
                console.error('Error fetching message data:', messageError);
                conversation.lastMessageContent = 'New message';
              }
            } else if (conversation.lastMessage && typeof conversation.lastMessage === 'object') {
              // It's a message object
              conversation.lastMessageContent = conversation.lastMessage.content || 'New message';
              // Update lastMessageTime if available
              if (conversation.lastMessage.createdAt) {
                conversation.lastMessageTime = conversation.lastMessage.createdAt;
              }
            }
          }

          // Make sure unreadCount is a number
          if (conversation.unreadCount === undefined || conversation.unreadCount === null) {
            // Try to calculate unread count from messages
            if (conversation.messages && Array.isArray(conversation.messages)) {
              conversation.unreadCount = conversation.messages.filter(msg => {
                if (typeof msg === 'object') {
                  return msg.sender !== currentUser?._id &&
                         (!msg.readBy || !msg.readBy.some(read => read.user === currentUser?._id));
                }
                return false;
              }).length;
            } else {
              conversation.unreadCount = 0;
            }
          }

          // Convert unreadCount to a number if it's a string
          if (typeof conversation.unreadCount === 'string') {
            conversation.unreadCount = parseInt(conversation.unreadCount, 10) || 0;
          }

          return conversation;
        }));

        // Log detailed information about each conversation
        processedConversations.forEach((conv, index) => {
          console.log(`Conversation ${index + 1}:`);
          console.log(`- ID: ${conv._id}`);
          console.log(`- Other participant: ${conv.otherParticipant?.fullName || 'Unknown'}`);
          console.log(`- Last message: ${conv.lastMessageContent || 'No messages yet'}`);
          console.log(`- Unread count: ${conv.unreadCount || 0}`);
        });

        setConversations(processedConversations);
        console.log('Processed conversations:', processedConversations.length);
      } else {
        if (!silent) {
          console.error('Unexpected response format:', conversationsData);
          setError('Received an invalid response from the server. Please try again.');
          setConversations([]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      if (!silent) {
        setError('Failed to fetch conversations. Please check your connection and try again.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
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

  const handleConversationPress = async (id: string) => {
    try {
      // Mark messages as read when conversation is opened
      const MessageService = await import('../../../services/messageService');
      MessageService.markMessagesAsRead(id).catch(err => {
        console.error('Error marking messages as read:', err);
      });
    } catch (error) {
      console.error('Error importing message service:', error);
    }

    // Navigate to the conversation
    router.push(`/(app)/messages/${id}`);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <LoadingIndicator message="Loading conversations..." fullScreen />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <ErrorMessage
          message={error}
          onRetry={fetchConversations}
        />
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
            style={[
              styles.conversationItem,
              { backgroundColor: colors.background.card },
              item.unreadCount && item.unreadCount > 0 ? styles.unreadConversationItem : null
            ]}
            onPress={() => handleConversationPress(item._id)}
          >
            {/* Debug unread count */}
            {__DEV__ && (
              <Text style={{ position: 'absolute', bottom: 2, right: 5, fontSize: 10, color: '#999' }}>
                {`unread: ${item.unreadCount || 0}`}
              </Text>
            )}
            <View style={styles.avatarContainer}>
              {item.otherParticipant && item.otherParticipant.avatar ? (
                <Image
                  source={{ uri: item.otherParticipant.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <DefaultAvatar
                  name={item.otherParticipant?.fullName || 'User'}
                  userId={item.otherParticipant?._id || ''}
                  size={50}
                />
              )}
              {item.unreadCount && item.unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: '#FF5722' }]}>
                  <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.headerRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {item.unreadCount && item.unreadCount > 0 && (
                    <View style={styles.unreadDot} />
                  )}
                  <Text style={[
                    styles.name,
                    {
                      color: (item.unreadCount && item.unreadCount > 0) ? '#FF5722' : colors.text.primary,
                      fontWeight: 'bold',
                      fontSize: (item.unreadCount && item.unreadCount > 0) ? FONT.sizes.medium + 2 : FONT.sizes.medium
                    }
                  ]}>
                  {item.otherParticipant?.fullName || 'Unknown User'}
                </Text>
                </View>
                <Text style={[styles.time, { color: colors.text.secondary }]}>
                  {item.lastMessageTime ? formatDate(item.lastMessageTime) :
                   item.updatedAt ? formatDate(item.updatedAt) :
                   item.createdAt ? formatDate(item.createdAt) : ''}
                </Text>
              </View>

              <Text
                style={[
                  styles.message,
                  {
                    color: (item.unreadCount && item.unreadCount > 0) ? '#FF5722' : colors.text.secondary,
                    fontWeight: (item.unreadCount && item.unreadCount > 0) ? 'bold' : 'normal',
                    fontSize: (item.unreadCount && item.unreadCount > 0) ? FONT.sizes.medium + 1 : FONT.sizes.medium,
                    letterSpacing: (item.unreadCount && item.unreadCount > 0) ? 0.5 : 0
                  }
                ]}
                numberOfLines={2}
              >
                {item.lastMessageContent || 'No messages yet'}
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
            <Icon name="comments" size={48} color={colors.text.secondary} />
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No conversations yet
            </Text>
            <Text style={[styles.emptySubText, { color: colors.text.muted }]}>
              Start a conversation by messaging someone on a listing
            </Text>
            <TouchableOpacity
              style={[styles.refreshButton, { borderColor: colors.text.secondary }]}
              onPress={fetchConversations}
            >
              <Icon name="refresh" size={16} color={colors.text.secondary} style={styles.refreshIcon} />
              <Text style={[styles.refreshText, { color: colors.text.secondary }]}>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* New Message Button */}
      <TouchableOpacity
        style={[styles.newMessageButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(app)/messages/new')}
      >
        <Icon name="add" size={20} color="#000" />
      </TouchableOpacity>

      {/* Debug Button - only visible in development */}
      {__DEV__ && (
        <TouchableOpacity
          style={[styles.debugButton, { backgroundColor: colors.accent }]}
          onPress={() => {
            console.log('Current conversations state:', conversations);
            Alert.alert(
              'Debug Info',
              `Conversations: ${conversations.length}\n` +
              `Names: ${conversations.map(c => c.otherParticipant?.fullName || 'Unknown').join(', ')}`,
              [{ text: 'OK' }, { text: 'Refresh', onPress: fetchConversations }]
            );
          }}
        >
          <Icon name="bug" size={16} color="#000" />
        </TouchableOpacity>
      )}
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
    borderWidth: 1,
    marginHorizontal: SPACING.small,
    marginVertical: SPACING.xs,
    borderRadius: SIZES.borderRadius.medium,
  },
  unreadConversationItem: {
    borderLeftWidth: 10,
    borderLeftColor: '#FF5722', // Orange indicator for unread messages
    backgroundColor: 'rgba(255, 87, 34, 0.3)', // More visible orange tint
    borderColor: '#FF5722', // Orange border all around
    borderWidth: 3,
    // Add a subtle shadow for more emphasis
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
    transform: [{ scale: 1.02 }], // Slightly larger
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
    right: -8,
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
    elevation: 3,
  },
  badgeText: {
    color: '#FFF',
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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginTop: SPACING.large,
  },
  refreshIcon: {
    marginRight: SPACING.small,
  },
  refreshText: {
    fontSize: FONT.sizes.medium,
  },
  debugButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5722',
    marginRight: SPACING.xs,
    borderWidth: 1,
    borderColor: '#FFF',
  },
});