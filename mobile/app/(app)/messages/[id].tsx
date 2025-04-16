// Path: mobile/app/(app)/messages/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import DefaultAvatar from '../../../components/DefaultAvatar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from '../../../components/ui/Icon';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { Conversation, Message, User } from '../../../types';

// Mock data for development - no longer used
/* const mockUser: User = {
  _id: '1',
  username: 'current_user',
  email: 'user@example.com',
  fullName: 'Current User',
  skills: ['Coding', 'Design'],
  talentBalance: 50,
  location: {
    type: 'Point',
    coordinates: [18.4241, -33.9249],
    address: 'Cape Town, South Africa'
  },
  ratings: [],
  averageRating: 0,
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

const mockMessages: Message[] = [
  {
    _id: '1',
    conversation: '1',
    sender: {
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
    content: "Hi, I'm interested in your handcrafted pottery. Is it still available?",
    readBy: [],
    isSystemMessage: false,
    createdAt: '2023-02-01T14:30:00Z',
    updatedAt: '2023-02-01T14:30:00Z'
  },
  {
    _id: '2',
    conversation: '1',
    sender: {
      _id: '1',
      username: 'current_user',
      email: 'user@example.com',
      fullName: 'Current User',
      skills: ['Coding', 'Design'],
      talentBalance: 50,
      location: {
        type: 'Point',
        coordinates: [18.4241, -33.9249],
        address: 'Cape Town, South Africa'
      },
      ratings: [],
      averageRating: 0,
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    content: "Yes, it's still available! When would you like to come see it?",
    readBy: [],
    isSystemMessage: false,
    createdAt: '2023-02-01T14:35:00Z',
    updatedAt: '2023-02-01T14:35:00Z'
  },
  {
    _id: '3',
    conversation: '1',
    sender: {
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
    content: "Great! How about tomorrow afternoon around 3pm?",
    readBy: [],
    isSystemMessage: false,
    createdAt: '2023-02-01T14:40:00Z',
    updatedAt: '2023-02-01T14:40:00Z'
  }
]; */

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user: currentUser } = useAuth();
  const { resetUnreadMessageCount } = useNotification();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messageText, setMessageText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  // Polling interval reference
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      fetchConversation();

      // Set up polling for new messages every 5 seconds
      startPolling();

      // Mark messages as read when conversation is opened
      markMessagesAsRead();

      // Clean up polling when component unmounts
      return () => {
        try {
          stopPolling();
        } catch (error) {
          console.error('Error in cleanup function:', error);
        }
      };
    } catch (error) {
      console.error('Error in conversation effect:', error);
    }
  }, [id]);

  // Mark messages as read
  const markMessagesAsRead = async () => {
    try {
      const MessageService = await import('../../../services/messageService');

      try {
        await MessageService.markMessagesAsRead(id as string);
        // Reset unread count in notification context
        resetUnreadMessageCount();
      } catch (apiError) {
        // The endpoint might not be available yet, but we still want to reset the count locally
        console.log('Mark as read API not available yet, resetting count locally');
        resetUnreadMessageCount();
      }
    } catch (error) {
      console.error('Error importing message service:', error);
    }
  };

  const startPolling = () => {
    try {
      // Clear any existing interval
      stopPolling();

      // Set up new polling interval (every 5 seconds)
      pollingIntervalRef.current = setInterval(() => {
        fetchNewMessages();
      }, 5000);
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

  const fetchNewMessages = async () => {
    try {
      // Only fetch new messages, not the whole conversation
      const MessageService = await import('../../../services/messageService');
      const messagesData = await MessageService.getMessages(id as string);

      // Handle different message response formats
      let newMessages: Message[] = [];
      if (Array.isArray(messagesData)) {
        newMessages = messagesData;
      } else if (messagesData && typeof messagesData === 'object' && 'data' in messagesData && Array.isArray(messagesData.data)) {
        newMessages = messagesData.data;
      }

      // Only update if we have new messages
      if (newMessages.length > messages.length) {
        console.log('New messages received:', newMessages.length - messages.length);
        setMessages(newMessages);

        // Mark new messages as read
        markMessagesAsRead();

        // Scroll to bottom when new messages arrive
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }
    } catch (error) {
      console.error('Error polling for new messages:', error);
      // Don't stop polling on error
    }
  };

  const fetchConversation = async () => {
    setLoading(true);

    try {
      // Import the message service
      const MessageService = await import('../../../services/messageService');

      // Fetch conversation and messages
      const conversationData = await MessageService.getConversation(id as string);
      const messagesData = await MessageService.getMessages(id as string);

      console.log('Fetched conversation:', conversationData);
      console.log('Fetched messages:', messagesData);

      setConversation(conversationData);

      // Handle different message response formats
      if (Array.isArray(messagesData)) {
        // Direct array of messages
        setMessages(messagesData);
      } else if (messagesData && typeof messagesData === 'object' && 'data' in messagesData && Array.isArray(messagesData.data)) {
        // Paginated response
        setMessages(messagesData.data);
      } else {
        // Empty or invalid response
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sending) return;

    setSending(true);

    try {
      // Import the message service
      const MessageService = await import('../../../services/messageService');

      // Send message to API
      const messageData = {
        conversationId: id as string,
        content: messageText.trim()
      };

      console.log('Sending message:', messageData);
      const newMessage = await MessageService.sendMessage(messageData);
      console.log('Message sent:', newMessage);

      // Add message to state
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');

      // Scroll to bottom after message is sent
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentUser = (senderId: string) => {
    return senderId === currentUser?._id;
  };

  // Render message bubble
  const renderMessage = ({ item }: { item: Message }) => {
    // Handle different sender formats
    let senderId = '';
    let senderName = '';
    let senderAvatar = '';

    if (item.sender) {
      if (typeof item.sender === 'string') {
        // If sender is just a string ID
        senderId = item.sender;
        // Try to find user info from participants
        const participant = conversation?.participants?.find(p => {
          if (typeof p === 'string') return p === senderId;
          return (p as User)._id === senderId;
        });
        if (participant && typeof participant !== 'string') {
          senderName = (participant as User).fullName || '';
          senderAvatar = (participant as User).avatar || '';
        }
      } else if (typeof item.sender === 'object' && '_id' in item.sender) {
        // If sender is a User object
        senderId = (item.sender as User)._id;
        senderName = (item.sender as User).fullName || '';
        senderAvatar = (item.sender as User).avatar || '';
      }
    }

    const isUser = isCurrentUser(senderId);

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.otherMessageContainer
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            {senderAvatar ? (
              <Image source={{ uri: senderAvatar }} style={styles.avatar} />
            ) : (
              <DefaultAvatar
                name={senderName || 'User'}
                userId={senderId}
                size={36}
                showBorder={true}
              />
            )}
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userMessageBubble, { backgroundColor: colors.primary }]
              : [styles.otherMessageBubble, { backgroundColor: colors.background.card }]
          ]}
        >
          {!isUser && senderName && (
            <Text style={[styles.senderName, { color: colors.accent }]}>
              {senderName}
            </Text>
          )}
          <Text
            style={[
              styles.messageText,
              { color: isUser ? '#000' : colors.text.primary }
            ]}
          >
            {item.content || ''}
          </Text>
          <Text
            style={[
              styles.messageTime,
              { color: isUser ? 'rgba(0,0,0,0.6)' : colors.text.secondary }
            ]}
          >
            {item.createdAt ? formatTime(item.createdAt) : ''}
          </Text>
        </View>

        {isUser && (
          <View style={styles.avatarContainer}>
            {currentUser?.avatar ? (
              <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
            ) : (
              <DefaultAvatar
                name={currentUser?.fullName || 'You'}
                userId={currentUser?._id || ''}
                size={36}
                showBorder={true}
              />
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background.dark }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        initialNumToRender={15}
        inverted={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={[styles.inputContainer, { backgroundColor: colors.background.darker }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background.card, color: colors.text.primary }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.text.muted}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: colors.primary },
            (!messageText.trim() || sending) && { opacity: 0.7 }
          ]}
          onPress={sendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Icon name="paper-plane" size={16} color="#000" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.large,
  },
  messageContainer: {
    marginBottom: SPACING.medium,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    marginHorizontal: SPACING.xs,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageBubble: {
    maxWidth: '65%',
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    marginHorizontal: SPACING.xs,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: FONT.sizes.small,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  messageText: {
    fontSize: FONT.sizes.medium,
  },
  messageTime: {
    fontSize: FONT.sizes.xs,
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: SPACING.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
});