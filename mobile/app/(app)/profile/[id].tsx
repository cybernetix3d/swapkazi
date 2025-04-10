import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserById } from '../../../services/userService';
import { getUserListings } from '../../../services/listingService';
import * as MessageService from '../../../services/messageService';
import { User, Listing } from '../../../types';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorMessage from '../../../components/ErrorMessage';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import { FontAwesome5 } from '@expo/vector-icons';
import DefaultAvatar from '../../../components/DefaultAvatar';


export default function UserProfileScreen() {
  const { colors } = useTheme();
  const { user: currentUser, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Log authentication state
  useEffect(() => {
    console.log('Auth state in profile page:', {
      isAuthenticated,
      hasCurrentUser: !!currentUser,
      hasToken: !!token,
      currentUserId: currentUser?._id
    });
  }, [isAuthenticated, currentUser, token]);

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch user profile
        const userData = await getUserById(id as string);
        setUser(userData);

        // Fetch user listings
        const userListings = await getUserListings(id as string);
        setListings(userListings);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user profile.');
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
        setListingsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);

  // Render stars for ratings
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome5
          key={i}
          name="star"
          solid={i <= rating}
          size={12}
          color={i <= rating ? colors.primary : colors.text.muted}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('User ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setListingsLoading(true);
      setError(null);

      try {
        // Fetch user profile
        const fetchedUser = await getUserById(id);
        setUser(fetchedUser);

        // Fetch user listings
        try {
          const userListings = await getUserListings(id);
          setListings(userListings);
        } catch (listingErr) {
          console.error('Failed to fetch user listings:', listingErr);
          // Don't set an error for listings - we'll just show an empty state
        } finally {
          setListingsLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user profile.');
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle contact user
  const handleContactUser = async () => {
    // Check if user is authenticated
    if (!isAuthenticated || !token || !currentUser) {
      console.log('User not authenticated');
      Alert.alert(
        'Login Required',
        'You need to be logged in to contact this user.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    if (currentUser._id === id) {
      Alert.alert('Error', 'You cannot message yourself.');
      return;
    }

    if (!user || !user._id) {
      Alert.alert('Error', 'Cannot identify the user to contact.');
      return;
    }

    setContactLoading(true);

    try {
      // Use user._id instead of id from params to ensure we have the full ID
      const recipientId = user._id;
      console.log('Creating conversation with user:', recipientId);
      console.log('Current user:', JSON.stringify(currentUser));
      console.log('Target user:', JSON.stringify(user));
      console.log('Auth token exists:', !!token);

      if (!recipientId || typeof recipientId !== 'string' || recipientId.trim() === '') {
        throw new Error(`Invalid recipient ID: ${recipientId}`);
      }

      // Create or get conversation with this user
      console.log('Calling createOrGetConversation with recipientId:', recipientId);
      const conversation = await MessageService.createOrGetConversation(recipientId);
      console.log('Conversation created/retrieved:', conversation);

      if (!conversation || !conversation._id) {
        throw new Error('Invalid conversation data received');
      }

      // Navigate to the conversation
      console.log('Navigating to conversation:', conversation._id);

      // Simple navigation approach
      router.push(`/(app)/messages/${conversation._id}`);
    } catch (err: any) {
      console.error('Failed to create conversation:', err);

      // Check for authentication errors
      if (err.response && err.response.status === 401) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please log in again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.push('/(auth)/login') }
          ]
        );
        return;
      }

      // Show more detailed error information
      let errorMessage = 'Unknown error';

      if (err.response && err.response.data) {
        console.error('Response data:', JSON.stringify(err.response.data));
        errorMessage = err.response.data.message || 'Server error';
      } else if (err.message) {
        errorMessage = err.message;
      }

      console.error('Error details:', errorMessage);

      // Show a user-friendly error message
      Alert.alert(
        'Error',
        `Could not start conversation: ${errorMessage}`,
        [
          { text: 'OK' },
          {
            text: 'Try Again',
            onPress: () => {
              // Wait a moment before trying again
              setTimeout(() => handleContactUser(), 1000);
            }
          }
        ]
      );
    } finally {
      setContactLoading(false);
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>User not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: user.fullName,
          headerStyle: {
            backgroundColor: colors.background.dark,
          },
          headerTintColor: colors.text.primary,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background.dark }]}>
        {/* Profile Header */}
        <ThemedView style={styles.profileHeader}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <DefaultAvatar
              name={user.fullName || ''}
              userId={user._id}
              size={100}
              style={styles.avatar}
            />
          )}
          <ThemedText style={styles.fullName}>{user.fullName}</ThemedText>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            {renderStars(user.averageRating || 0)}
            <ThemedText style={styles.ratingText}>
              {user.averageRating ? user.averageRating.toFixed(1) : 'No ratings'}
              ({user.ratings?.length || 0} reviews)
            </ThemedText>
          </View>

          {/* Contact Button */}
          {currentUser && currentUser._id !== id && (
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: colors.primary }]}
              onPress={handleContactUser}
              disabled={contactLoading}
            >
              {contactLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <FontAwesome5 name="comment" size={16} color="#000" style={styles.contactButtonIcon} />
                  <ThemedText style={styles.contactButtonText}>Contact</ThemedText>
                </>
              )}
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Bio Section */}
        <ThemedView style={[styles.section, { borderBottomColor: colors.border }]}>
          <ThemedText style={styles.sectionTitle}>Bio</ThemedText>
          <ThemedText>{user.bio || 'No bio provided.'}</ThemedText>
        </ThemedView>

        {/* Skills Section */}
        <ThemedView style={[styles.section, { borderBottomColor: colors.border }]}>
          <ThemedText style={styles.sectionTitle}>Skills</ThemedText>
          <View style={styles.skillsContainer}>
            {user.skills && user.skills.length > 0 ? (
              user.skills.map((skill: string, index: number) => (
                <View key={index} style={[styles.skillChip, { backgroundColor: colors.background.card }]}>
                  <ThemedText style={styles.skillChipText}>{skill}</ThemedText>
                </View>
              ))
            ) : (
              <ThemedText>No skills listed.</ThemedText>
            )}
          </View>
        </ThemedView>

        {/* Listings Section */}
        <ThemedView style={[styles.section, { borderBottomColor: colors.border }]}>
          <ThemedText style={styles.sectionTitle}>Listings</ThemedText>
          {listingsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.listingsLoader} />
          ) : listings.length > 0 ? (
            <View style={styles.listingsContainer}>
              {listings.map((listing) => (
                <TouchableOpacity
                  key={listing._id}
                  style={[styles.listingCard, { backgroundColor: colors.background.card }]}
                  onPress={() => router.push(`/(app)/marketplace/${listing._id}`)}
                >
                  {listing.images && listing.images.length > 0 ? (
                    <Image
                      source={{ uri: listing.images[0].url }}
                      style={styles.listingImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.listingImagePlaceholder, { backgroundColor: colors.background.dark }]}>
                      <FontAwesome5 name="image" size={24} color={colors.text.muted} />
                    </View>
                  )}
                  <View style={styles.listingDetails}>
                    <ThemedText style={styles.listingTitle} numberOfLines={1}>{listing.title}</ThemedText>
                    <ThemedText style={styles.listingCategory}>{listing.category}</ThemedText>
                    <ThemedText style={styles.listingPrice}>{listing.talentPrice} Talents</ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <ThemedText>No listings available.</ThemedText>
          )}
        </ThemedView>

        {/* Ratings Section */}
        <ThemedView style={[styles.section, { borderBottomColor: colors.border }]}>
          <ThemedText style={styles.sectionTitle}>Ratings & Reviews</ThemedText>
          {user.ratings && user.ratings.length > 0 ? (
            <View style={styles.ratingsContainer}>
              {user.ratings.map((rating, index) => (
                <View key={index} style={[styles.ratingItem, { borderBottomColor: colors.border }]}>
                  <View style={styles.ratingHeader}>
                    <View style={styles.ratingStars}>
                      {renderStars(rating.rating)}
                    </View>
                    <ThemedText style={styles.ratingDate}>
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  {rating.comment && (
                    <ThemedText style={styles.ratingComment}>{rating.comment}</ThemedText>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <ThemedText>No reviews yet.</ThemedText>
          )}
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  contactButtonIcon: {
    marginRight: 8,
  },
  contactButtonText: {
    fontWeight: 'bold',
    color: '#000',
  },
  section: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  skillChipText: {
    fontSize: 14,
  },
  skillItem: {
    paddingVertical: 2,
  },
  listingsLoader: {
    marginVertical: 20,
  },
  listingsContainer: {
    marginTop: 10,
  },
  listingCard: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  listingImage: {
    width: 80,
    height: 80,
  },
  listingImagePlaceholder: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingDetails: {
    flex: 1,
    padding: 10,
  },
  listingTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  listingCategory: {
    fontSize: 14,
    marginBottom: 4,
  },
  listingPrice: {
    fontWeight: 'bold',
  },
  ratingsContainer: {
    marginTop: 10,
  },
  ratingItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  ratingDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  ratingComment: {
    marginTop: 5,
    fontSize: 14,
  },
});