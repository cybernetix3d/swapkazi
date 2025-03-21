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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { Conversation, Message, User } from '../../../types';

// Mock data for development
const mockUser: User = {
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
];

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messageText, setMessageText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  
  useEffect(() => {
    fetchConversation();
  }, [id]);
  
  const fetchConversation = async () => {
    setLoading(true);
    // In a real app, this would call an API
    // For now, we'll use mock data
    setTimeout(() => {
      setMessages(mockMessages);
      setLoading(false);
    }, 1000);
  };
  
  const sendMessage = async () => {
    if (!messageText.trim() || sending) return;
    
    setSending(true);
    
    // In a real app, this would call an API to send the message
    // For now, we'll just add it to our local state
    const newMessage: Message = {
      _id: Date.now().toString(),
      conversation: id,
      sender: mockUser,
      content: messageText.trim(),
      readBy: [],
      isSystemMessage: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add message to state
    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    
    // Simulate network delay
    setTimeout(() => {
      setSending(false);
      
      // Scroll to bottom after message is sent
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 500);
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const isCurrentUser = (senderId: string) => {
    return senderId === mockUser._id;
  };
  
  // Render message bubble
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = isCurrentUser((item.sender as User)._id);
    
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.otherMessageContainer
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userMessageBubble, { backgroundColor: colors.primary }]
              : [styles.otherMessageBubble, { backgroundColor: colors.background.card }]
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? '#000' : colors.text.primary }
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              { color: isUser ? 'rgba(0,0,0,0.6)' : colors.text.secondary }
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
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
            <FontAwesome5 name="paper-plane" size={16} color="#000" />
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
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
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