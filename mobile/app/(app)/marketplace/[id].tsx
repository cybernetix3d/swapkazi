import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { Listing, User } from '../../../types';
import * as ListingService from '../../../services/listingService';

const { width } = Dimensions.get('window');

export default function ListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const data = await ListingService.getListingById(id);
        setListing(data);
      } catch (error: any) {
        setError(error.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchListing();
    }
  }, [id]);
  
  const handleContactSeller = () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'You need to be logged in to contact the seller.');
      return;
    }
    
    // Navigate to create conversation
    router.push({
      pathname: '/(app)/messages/new',
      params: { 
        userId: typeof listing?.user === 'string' 
          ? listing?.user 
          : (listing?.user as User)._id,
        listingId: listing?._id
      }
    });
  };
  
  const handleStartTransaction = () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'You need to be logged in to make an offer.');
      return;
    }
    
    // Navigate to create transaction
    router.push({
      pathname: '/(app)/transactions/new',
      params: { 
        recipientId: typeof listing?.user === 'string' 
          ? listing?.user 
          : (listing?.user as User)._id,
        listingId: listing?._id
      }
    });
  };
  
  const handleViewProfile = () => {
    const sellerId = typeof listing?.user === 'string' 
      ? listing?.user 
      : (listing?.user as User)._id;
      
    router.push(`/(app)/profile/${sellerId}`);
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background.dark }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (error || !listing) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background.dark }]}>
        <FontAwesome5 name="exclamation-circle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text.primary }]}>
          {error || 'Listing not found'}
        </Text>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Handle different user types (string ID vs User object)
  const seller = typeof listing.user === 'string' 
    ? { fullName: 'User', avatar: undefined } 
    : listing.user as User;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {listing.images && listing.images.length > 0 ? (
            <>
              <Image 
                source={{ uri: listing.images[currentImageIndex].url }} 
                style={styles.mainImage}
                resizeMode="cover"
              />
              
              {listing.images.length > 1 && (
                <View style={styles.thumbnailContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {listing.images.map((image, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setCurrentImageIndex(index)}
                        style={[
                          styles.thumbnail,
                          currentImageIndex === index && { 
                            borderColor: colors.primary,
                            borderWidth: 2 
                          }
                        ]}
                      >
                        <Image 
                          source={{ uri: image.url }} 
                          style={styles.thumbnailImage} 
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: colors.background.card }]}>
              <FontAwesome5 name="image" size={48} color={colors.text.muted} />
            </View>
          )}
          
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
        </View>
        
        <View style={styles.content}>
          {/* Title and Price */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {listing.title}
            </Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.talentPrice, { color: colors.primary }]}>
                ✦ {listing.talentPrice}
              </Text>
              
              {listing.exchangeType !== 'Talent' && (
                <View style={[styles.exchangeBadge, { backgroundColor: colors.secondary }]}>
                  <Text style={styles.exchangeText}>
                    {listing.exchangeType === 'Both' ? 'Open to Swap' : 'Swap Only'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Category and Condition */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                Category
              </Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                {listing.category}
                {listing.subCategory ? ` / ${listing.subCategory}` : ''}
              </Text>
            </View>
            
            {listing.condition !== 'Not Applicable' && (
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                  Condition
                </Text>
                <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                  {listing.condition}
                </Text>
              </View>
            )}
          </View>
          
          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              {listing.description}
            </Text>
          </View>
          
          {/* Swap For Section (if applicable) */}
          {listing.exchangeType !== 'Talent' && listing.swapFor && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Willing to Swap For
              </Text>
              <Text style={[styles.description, { color: colors.text.secondary }]}>
                {listing.swapFor}
              </Text>
            </View>
          )}
          
          {/* Location */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Location
            </Text>
            <View style={styles.locationRow}>
              <FontAwesome5 
                name="map-marker-alt" 
                size={16} 
                color={colors.text.secondary} 
                style={{ marginRight: SPACING.small }}
              />
              <Text style={[styles.location, { color: colors.text.secondary }]}>
                {listing.location.address || 'Location information not available'}
              </Text>
            </View>
          </View>
          
          {/* Seller Information */}
          <View style={[styles.sellerCard, { backgroundColor: colors.background.card }]}>
            <View style={styles.sellerInfo}>
              {seller.avatar ? (
                <Image source={{ uri: seller.avatar }} style={styles.sellerAvatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarInitial}>
                    {seller.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              
              <View>
                <Text style={[styles.sellerName, { color: colors.text.primary }]}>
                  {seller.fullName}
                </Text>
                <TouchableOpacity onPress={handleViewProfile}>
                  <Text style={[styles.viewProfile, { color: colors.accent }]}>
                    View Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.contactButton, { backgroundColor: colors.accent }]}
              onPress={handleContactSeller}
            >
              <FontAwesome5 name="comment" size={14} color="#fff" />
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
          
          {/* Posted Date and Views */}
          <View style={styles.statsRow}>
            <Text style={[styles.statsText, { color: colors.text.muted }]}>
              Posted {new Date(listing.createdAt).toLocaleDateString()}
            </Text>
            <Text style={[styles.statsText, { color: colors.text.muted }]}>
              <FontAwesome5 name="eye" size={12} /> {listing.views} views
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Action Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background.darker }]}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleStartTransaction}
        >
          {listing.exchangeType === 'Talent' ? (
            <Text style={styles.actionButtonText}>
              Pay with {listing.talentPrice} Talents
            </Text>
          ) : listing.exchangeType === 'Direct Swap' ? (
            <Text style={styles.actionButtonText}>
              Offer a Swap
            </Text>
          ) : (
            <Text style={styles.actionButtonText}>
              Make an Offer
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large,
  },
  errorText: {
    fontSize: FONT.sizes.large,
    textAlign: 'center',
    marginVertical: SPACING.large,
  },
  backButton: {
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
  },
  backButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  placeholderImage: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: SPACING.medium,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.medium,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: SPACING.small,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: SPACING.medium,
    left: SPACING.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.borderRadius.small,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: FONT.sizes.small,
    fontWeight: 'bold',
  },
  content: {
    padding: SPACING.large,
  },
  titleContainer: {
    marginBottom: SPACING.medium,
  },
  title: {
    fontSize: FONT.sizes.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  talentPrice: {
    fontSize: FONT.sizes.xl,
    fontWeight: 'bold',
    marginRight: SPACING.medium,
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
  detailsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.large,
  },
  detailItem: {
    marginRight: SPACING.large,
  },
  detailLabel: {
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  description: {
    fontSize: FONT.sizes.medium,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: FONT.sizes.medium,
    flex: 1,
  },
  sellerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SPACING.large,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.medium,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  sellerName: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  viewProfile: {
    fontSize: FONT.sizes.small,
    marginTop: SPACING.xs,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SIZES.borderRadius.medium,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.large,
  },
  statsText: {
    fontSize: FONT.sizes.small,
  },
  bottomBar: {
    padding: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    paddingVertical: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: FONT.sizes.large,
  },
});