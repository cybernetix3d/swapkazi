import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Listing, User } from '../../types';
import { FONT, SPACING, SIZES } from '../../constants/Theme';

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
  onPress?: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, compact = false, onPress }) => {
  const { colors } = useTheme();
  const router = useRouter();

  // Handle if the listing.user is populated as an object or just an ID
  const userObj = typeof listing.user === 'string'
    ? null
    : listing.user as User;

  const userName = userObj?.fullName || 'Unknown User';
  const userAvatar = userObj?.avatar || 'https://via.placeholder.com/50';

  // Default image if no images are provided
  let mainImage = 'https://via.placeholder.com/400';

  if (listing.images && listing.images.length > 0) {
    // Handle different image formats
    const firstImage = listing.images[0];
    if (typeof firstImage === 'string') {
      mainImage = firstImage;
    } else if (typeof firstImage === 'object' && firstImage.url) {
      mainImage = firstImage.url;
    }
  }

  console.log('Listing images:', listing.images);
  console.log('Main image URL:', mainImage);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(app)/marketplace/${listing._id}`);
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { backgroundColor: colors.background.card }]}
        onPress={handlePress}
      >
        <Image source={{ uri: mainImage }} style={styles.compactImage} />
        <View style={styles.compactContent}>
          <Text
            style={[styles.compactTitle, { color: colors.text.primary }]}
            numberOfLines={2}
          >
            {listing.title}
          </Text>
          <Text style={[styles.compactCategory, { color: colors.text.secondary }]}>
            {listing.category}
          </Text>
          <View style={styles.compactFooter}>
            <Text style={[styles.talentPrice, { color: colors.primary }]}>
              ✦ {listing.talentPrice}
            </Text>

            {listing.exchangeType !== 'Talent' && (
              <View style={[styles.exchangeBadge, { backgroundColor: colors.secondary }]}>
                <Text style={styles.exchangeText}>
                  {listing.exchangeType === 'Both' ? 'Swap/Talent' : 'Swap'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.background.card }]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image source={{ uri: mainImage }} style={styles.image} />

      {/* Listing Type Badge */}
      <View
        style={[
          styles.typeBadge,
          {
            backgroundColor: listing.listingType === 'Offer'
              ? colors.accent
              : colors.secondary
          }
        ]}
      >
        <Text style={styles.typeBadgeText}>
          {listing.listingType === 'Offer' ? 'Offering' : 'Wanted'}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {listing.title}
        </Text>
        <Text style={[styles.category, { color: colors.text.secondary }]}>
          {listing.category}
        </Text>

        {listing.condition !== 'Not Applicable' && (
          <Text style={[styles.condition, { color: colors.text.secondary }]}>
            Condition: {listing.condition}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={[styles.talentPrice, { color: colors.primary }]}>
              ✦ {listing.talentPrice}
            </Text>

            {listing.exchangeType !== 'Talent' && (
              <View style={[styles.exchangeBadge, { backgroundColor: colors.secondary }]}>
                <Text style={styles.exchangeText}>
                  {listing.exchangeType === 'Both' ? 'Swap/Talent' : 'Swap'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.userInfo}>
            <Image source={{ uri: userAvatar }} style={styles.userAvatar} />
            <Text style={[styles.userName, { color: colors.text.secondary }]}>
              {userName}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: SPACING.medium,
    width: '100%',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: SPACING.medium,
  },
  title: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  category: {
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.small,
  },
  condition: {
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.small,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  talentPrice: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    marginRight: SPACING.small,
  },
  exchangeBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.borderRadius.small,
  },
  exchangeText: {
    color: '#fff',
    fontSize: FONT.sizes.xs,
    fontWeight: 'bold',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SPACING.xs,
  },
  userName: {
    fontSize: FONT.sizes.small,
  },
  typeBadge: {
    position: 'absolute',
    top: SPACING.small,
    left: SPACING.small,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.borderRadius.small,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: FONT.sizes.xs,
    fontWeight: 'bold',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    borderRadius: SIZES.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: SPACING.small,
    width: '100%',
    height: 100,
  },
  compactImage: {
    width: 100,
    height: '100%',
  },
  compactContent: {
    flex: 1,
    padding: SPACING.small,
    justifyContent: 'space-between',
  },
  compactTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  compactCategory: {
    fontSize: FONT.sizes.xs,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ListingCard;