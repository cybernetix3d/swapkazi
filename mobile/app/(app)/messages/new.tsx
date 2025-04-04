// Path: mobile/app/(app)/messages/new.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { User, Listing } from '../../../types';
import * as ListingService from '../../../services/listingService';

// Mock users for recipient selection
const mockUsers = [
  {
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
  {
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
  {
    _id: '4',
    username: 'mandla_j',
    email: 'mandla@example.com',
    fullName: 'Mandla J',
    avatar: 'https://via.placeholder.com/50',
    skills: ['Carpentry', 'Plumbing'],
    talentBalance: 95,
    location: {
      type: 'Point',
      coordinates: [18.4841, -33.9649],
      address: 'Philippi, Cape Town'
    },
    ratings: [],
    averageRating: 4.6,
    isActive: true,
    createdAt: '2022-12-20T11:45:00Z',
    updatedAt: '2022-12-20T11:45:00Z'
  }
];

export default function NewConversationScreen() {
  const { userId, listingId } = useLocalSearchParams<{ userId?: string; listingId?: string }>();
  const { colors } = useTheme();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  
  const [recipient, setRecipient] = useState<User | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [showUserSelection, setShowUserSelection] = useState<boolean>(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  useEffect(() => {
    fetchData();
  }, [userId, listingId]);
  
  const fetchData = async () => {
    setLoading(true);
    
    try {
      // In a real app, you'd fetch the recipient and listing from your API
      // For now, we'll use mock data
      
      // Mock fetch user if specified
      if (userId) {
        // Find user in mock data
        const foundUser = mockUsers.find(user => user._id === userId);
        if (foundUser) {
          setRecipient(foundUser);
        }
      }
      
      // Mock fetch listing if specified
      if (listingId) {
        try {
          const fetchedListing = await ListingService.getListingById(listingId);
          setListing(fetchedListing);
          
          // If we have a listing but no recipient, set the recipient as the listing owner
          if (fetchedListing && !userId) {
            if (typeof fetchedListing.user !== 'string') {
              setRecipient(fetchedListing.user as User);
            } else {
              // Find user in mock data
              const foundUser = mockUsers.find(user => user._id === fetchedListing.user);
              if (foundUser) {
                setRecipient(foundUser);
              }
            }
          }
          
          // Pre-fill message if it's about a listing
          setMessage(`Hi! I'm interested in your listing "${fetchedListing.title}". Is it still available?`);
        } catch (error) {
          console.error('Error fetching listing:', error);
        }
      }
      
      // If no recipient was specified, show user selection
      if (!userId && !listingId) {
        setShowUserSelection(true);
        setAvailableUsers(mockUsers);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const sendMessage = async () => {
    if (!message.trim() || !recipient || sending) return;
    
    setSending(true);
    
    try {
      // In a real app, this would call your API to create a conversation and send message
      // For now, we'll just simulate it
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hardcoded conversation ID for demo
      const conversationId = '1';
      
      // Navigate to the conversation detail screen
      router.replace(`/(app)/messages/${conversationId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      setSending(false);
    }
  };
  
  const selectUser = (user: User) => {
    setRecipient(user);
    setShowUserSelection(false);
  };
  
  const filteredUsers = searchQuery 
    ? availableUsers.filter(user => 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableUsers;
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  // Show user selection if no recipient is set
  if (showUserSelection) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.background.card, color: colors.text.primary }]}
            placeholder="Search for a user..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.userItem, { backgroundColor: colors.background.card }]}
              onPress={() => selectUser(item)}
            >
              <View style={styles.avatarContainer}>
                {item.avatar ? (
                  <View style={styles.avatar}>
                    <Text style={{ fontSize: 20, color: '#fff' }}>
                      {item.fullName.charAt(0)}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={{ fontSize: 20, color: '#000' }}>
                      {item.fullName.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text.primary }]}>
                  {item.fullName}
                </Text>
                <Text style={[styles.userUsername, { color: colors.text.secondary }]}>
                  @{item.username}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                No users found
              </Text>
            </View>
          )}
        />
      </View>
    );
  }
  
  if (!recipient) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <Text style={[styles.errorText, { color: colors.text.primary }]}>
          Recipient not found. Please try again.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background.dark }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Recipient Info */}
        <View style={[styles.recipientContainer, { backgroundColor: colors.background.card }]}>
          <View style={styles.avatarContainer}>
            {recipient.avatar ? (
              <View style={styles.avatar}>
                <Text style={{ fontSize: 20, color: '#fff' }}>
                  {recipient.fullName.charAt(0)}
                </Text>
              </View>
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={{ fontSize: 20, color: '#000' }}>
                  {recipient.fullName.charAt(0)}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.recipientInfo}>
            <Text style={[styles.recipientName, { color: colors.text.primary }]}>
              {recipient.fullName}
            </Text>
            <Text style={[styles.recipientUsername, { color: colors.text.secondary }]}>
              @{recipient.username}
            </Text>
          </View>
        </View>
        
        {/* Listing Preview (if applicable) */}
        {listing && (
          <View style={[styles.listingPreview, { backgroundColor: colors.background.card }]}>
            <Text style={[styles.previewLabel, { color: colors.text.secondary }]}>
              About Listing:
            </Text>
            <View style={styles.listingContent}>
              {listing.images && listing.images.length > 0 ? (
                <View style={styles.thumbnailContainer}>
                  <View style={styles.thumbnail}>
                    <Text style={{ color: colors.text.muted }}>Image</Text>
                  </View>
                </View>
              ) : null}
              <View style={styles.listingDetails}>
                <Text style={[styles.listingTitle, { color: colors.text.primary }]}>
                  {listing.title}
                </Text>
                <Text style={[styles.listingPrice, { color: colors.primary }]}>
                  ✦ {listing.talentPrice}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Message Input */}
        <View style={[styles.messageContainer, { backgroundColor: colors.background.card }]}>
          <Text style={[styles.messageLabel, { color: colors.text.secondary }]}>
            Your Message:
          </Text>
          <TextInput
            style={[styles.messageInput, { backgroundColor: colors.background.darker, color: colors.text.primary }]}
            multiline
            placeholder="Type your message here..."
            placeholderTextColor={colors.text.muted}
            value={message}
            onChangeText={setMessage}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: colors.background.darker }]}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: colors.primary },
            (!message.trim() || sending) && { opacity: 0.7 }
          ]}
          onPress={sendMessage}
          disabled={!message.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <FontAwesome5 name="paper-plane" size={16} color="#000" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Send Message</Text>
            </>
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
  scrollContent: {
    padding: SPACING.large,
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SPACING.medium,
  },
  avatarContainer: {
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
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  recipientUsername: {
    fontSize: FONT.sizes.small,
  },
  listingPreview: {
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SPACING.medium,
  },
  previewLabel: {
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.small,
  },
  listingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailContainer: {
    marginRight: SPACING.medium,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: SIZES.borderRadius.small,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listingDetails: {
    flex: 1,
  },
  listingTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  listingPrice: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  messageContainer: {
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SPACING.medium,
  },
  messageLabel: {
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.small,
  },
  messageInput: {
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    minHeight: 120,
  },
  footer: {
    padding: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
  },
  buttonIcon: {
    marginRight: SPACING.small,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#000',
  },
  errorText: {
    fontSize: FONT.sizes.large,
    textAlign: 'center',
    marginBottom: SPACING.large,
    padding: SPACING.large,
  },
  button: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
  },
  searchContainer: {
    padding: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SIZES.borderRadius.medium,
    fontSize: FONT.sizes.medium,
  },
  userItem: {
    flexDirection: 'row',
    padding: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
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
  },
  emptyContainer: {
    padding: SPACING.large,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
  },
});