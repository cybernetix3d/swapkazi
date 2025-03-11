import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import ListingCard from '../../../components/listings/ListingCard';
import { Listing } from '../../../types';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, toggleTheme } = useTheme();
  const router = useRouter();
  
  const [userListings, setUserListings] = useState<Listing[]>([]);
  
  // Mock data for demo purposes
  const mockRatings = [
    { id: '1', rating: 5, comment: "Great transaction! Very friendly and punctual.", user: "Mandla J." },
    { id: '2', rating: 4, comment: "Good experience, would trade again.", user: "Lerato K." },
    { id: '3', rating: 5, comment: "Excellent quality items, highly recommend!", user: "Nomsa T." },
  ];
  
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };
  
  const handleEditProfile = () => {
    router.push('/(app)/profile/edit');
  };
  
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
  
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <Text style={[styles.emptyText, { color: colors.text.primary }]}>
          Please login to view your profile
        </Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.dark }]}>
      {/* Header Section */}
      <View style={styles.header}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarInitial}>
              {user.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text.primary }]}>
            {user.fullName}
          </Text>
          <Text style={[styles.username, { color: colors.text.secondary }]}>
            @{user.username}
          </Text>
          
          <View style={styles.ratingContainer}>
            {renderStars(user.averageRating || 0)}
            <Text style={[styles.ratingText, { color: colors.text.secondary }]}>
              ({user.averageRating || 0}) • {user.ratings?.length || 0} reviews
            </Text>
          </View>
        </View>
      </View>
      
      {/* Talent Balance */}
      <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
        <View>
          <Text style={styles.balanceLabel}>Talent Balance</Text>
          <Text style={styles.balanceValue}>{user.talentBalance || 0}</Text>
        </View>
        <TouchableOpacity style={styles.earnMoreButton}>
          <Text style={styles.earnMoreText}>Learn how to earn more</Text>
          <FontAwesome5 name="arrow-right" size={14} color="#000" />
        </TouchableOpacity>
      </View>
      
      {/* Skills */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Skills</Text>
        <View style={styles.skillsContainer}>
          {user.skills && user.skills.length > 0 ? (
            user.skills.map((skill, index) => (
              <View
                key={index}
                style={[styles.skillBadge, { backgroundColor: colors.background.card }]}
              >
                <Text style={[styles.skillText, { color: colors.text.secondary }]}>
                  {skill}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No skills added yet
            </Text>
          )}
        </View>
      </View>
      
      {/* Bio */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>About</Text>
        <Text style={[styles.bioText, { color: colors.text.secondary }]}>
          {user.bio || "No bio added yet"}
        </Text>
      </View>
      
      {/* Ratings & Reviews */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Ratings & Reviews
        </Text>
        {mockRatings.length > 0 ? (
          mockRatings.map((item) => (
            <View
              key={item.id}
              style={[styles.reviewCard, { backgroundColor: colors.background.card }]}
            >
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewerName, { color: colors.text.primary }]}>
                  {item.user}
                </Text>
                <View style={styles.ratingContainer}>
                  {renderStars(item.rating)}
                </View>
              </View>
              <Text style={[styles.reviewComment, { color: colors.text.secondary }]}>
                {item.comment}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
            No reviews yet
          </Text>
        )}
      </View>
      
      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={handleEditProfile}
        >
          <FontAwesome5 name="user-edit" size={16} color="#fff" />
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.background.card }]}
          onPress={toggleTheme}
        >
          <FontAwesome5 name="moon" size={16} color={colors.text.primary} />
          <Text style={[styles.buttonText, { color: colors.text.primary }]}>
            Toggle Theme
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <FontAwesome5 name="sign-out-alt" size={16} color="#fff" />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.large,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
  },
  userInfo: {
    marginLeft: SPACING.medium,
    flex: 1,
  },
  userName: {
    fontSize: FONT.sizes.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  username: {
    fontSize: FONT.sizes.medium,
    marginBottom: SPACING.small,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONT.sizes.small,
    marginLeft: SPACING.xs,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.large,
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
  },
  balanceLabel: {
    fontSize: FONT.sizes.small,
    fontWeight: 'bold',
    color: '#000',
  },
  balanceValue: {
    fontSize: FONT.sizes.xxl,
    fontWeight: 'bold',
    color: '#000',
  },
  earnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earnMoreText: {
    fontSize: FONT.sizes.small,
    fontWeight: 'bold',
    color: '#000',
    marginRight: SPACING.xs,
  },
  section: {
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    marginBottom: SPACING.medium,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.borderRadius.round,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  skillText: {
    fontSize: FONT.sizes.small,
  },
  bioText: {
    fontSize: FONT.sizes.medium,
    lineHeight: 22,
  },
  reviewCard: {
    marginBottom: SPACING.medium,
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  reviewerName: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  reviewComment: {
    fontSize: FONT.sizes.medium,
  },
  buttonContainer: {
    padding: SPACING.large,
    marginBottom: SPACING.large,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SPACING.medium,
  },
  buttonText: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: SPACING.small,
  },
  emptyText: {
    fontSize: FONT.sizes.medium,
    fontStyle: 'italic',
  },
});