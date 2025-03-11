import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLocation } from '../../../hooks/useLocation';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { 
  Listing, 
  ListingFormData, 
  ListingCategory, 
  ListingType,
  ExchangeType,
  ItemCondition,
  ListingImage
} from '../../../types';
import * as ListingService from '../../../services/listingService';

// Available categories
const categories: ListingCategory[] = [
  'Goods', 'Services', 'Food', 'Crafts', 
  'Electronics', 'Clothing', 'Furniture', 'Books',
  'Tools', 'Education', 'Transportation', 'Other'
];

// Condition options
const conditions: ItemCondition[] = [
  'New', 'Like New', 'Good', 'Fair', 'Poor', 'Not Applicable'
];

export default function CreateListingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { location, getLocation } = useLocation();
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    category: 'Goods',
    images: [],
    condition: 'New',
    listingType: 'Offer',
    exchangeType: 'Talent',
    talentPrice: 10,
    location: location ? {
      coordinates: [location.longitude, location.latitude],
      address: location.address || 'Location not available'
    } : undefined
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useMyLocation, setUseMyLocation] = useState<boolean>(true);
  const [showCondition, setShowCondition] = useState<boolean>(true);
  
  // Request location when component mounts
  useEffect(() => {
    const fetchLocation = async () => {
      const locationData = await getLocation();
      if (locationData) {
        setFormData(prev => ({
          ...prev,
          location: {
            coordinates: [locationData.longitude, locationData.latitude],
            address: locationData.address || 'Location not available'
          }
        }));
      }
    };
    
    if (useMyLocation) {
      fetchLocation();
    }
  }, [useMyLocation]);
  
  // Update form data
  const handleInputChange = (name: keyof ListingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle toggle between Offer and Request
  const handleListingTypeToggle = (type: ListingType) => {
    handleInputChange('listingType', type);
    
    // For Requests, default to "Not Applicable" condition
    if (type === 'Request') {
      handleInputChange('condition', 'Not Applicable');
      setShowCondition(false);
    } else {
      setShowCondition(true);
    }
  };
  
  // Handle exchange type change
  const handleExchangeTypeChange = (type: ExchangeType) => {
    handleInputChange('exchangeType', type);
    
    // Clear swapFor if switching to Talent only
    if (type === 'Talent' && formData.swapFor) {
      handleInputChange('swapFor', undefined);
    }
  };
  
  // Handle image picking
  const handlePickImage = async () => {
    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant permission to access your photos.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      // In a real app, you would upload the image to a server here
      // For now, we'll just use the local URI
      const newImage: ListingImage = {
        url: result.assets[0].uri,
        caption: `Image ${formData.images.length + 1}`
      };
      
      handleInputChange('images', [...formData.images, newImage]);
    }
  };
  
  // Handle image removal
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    handleInputChange('images', updatedImages);
  };
  
  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.exchangeType !== 'Direct Swap' && (!formData.talentPrice || formData.talentPrice <= 0)) {
      newErrors.talentPrice = 'Please enter a valid price in Talents';
    }
    
    if ((formData.exchangeType === 'Direct Swap' || formData.exchangeType === 'Both') && !formData.swapFor?.trim()) {
      newErrors.swapFor = 'Please specify what you want to swap for';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a listing');
      return;
    }
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await ListingService.createListing(formData);
      
      Alert.alert(
        'Success',
        'Your listing has been created!',
        [
          {
            text: 'View Listing',
            onPress: () => router.push(`/(app)/marketplace/${result._id}`),
          },
          {
            text: 'Create Another',
            onPress: () => {
              // Reset form
              setFormData({
                title: '',
                description: '',
                category: 'Goods',
                images: [],
                condition: 'New',
                listingType: 'Offer',
                exchangeType: 'Talent',
                talentPrice: 10,
                location: location ? {
                  coordinates: [location.longitude, location.latitude],
                  address: location.address || 'Location not available'
                } : undefined
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render category selection button
  const renderCategoryButton = (category: ListingCategory) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        { backgroundColor: formData.category === category ? colors.primary : colors.background.card }
      ]}
      onPress={() => handleInputChange('category', category)}
    >
      <Text
        style={[
          styles.categoryText,
          { color: formData.category === category ? '#000' : colors.text.secondary }
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );
  
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <Text style={[styles.errorText, { color: colors.text.primary }]}>
          You must be logged in to create a listing
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Create New Listing
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Share what you're offering or what you need
          </Text>
        </View>
        
        {/* Listing Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { 
                backgroundColor: formData.listingType === 'Offer' 
                  ? colors.accent 
                  : colors.background.card 
              }
            ]}
            onPress={() => handleListingTypeToggle('Offer')}
          >
            <FontAwesome5 
              name="hand-holding" 
              size={16} 
              color={formData.listingType === 'Offer' ? '#000' : colors.text.secondary} 
            />
            <Text 
              style={[
                styles.toggleText,
                { color: formData.listingType === 'Offer' ? '#000' : colors.text.secondary }
              ]}
            >
              I'm Offering
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { 
                backgroundColor: formData.listingType === 'Request' 
                  ? colors.secondary 
                  : colors.background.card 
              }
            ]}
            onPress={() => handleListingTypeToggle('Request')}
          >
            <FontAwesome5 
              name="hand-paper" 
              size={16} 
              color={formData.listingType === 'Request' ? '#fff' : colors.text.secondary} 
            />
            <Text 
              style={[
                styles.toggleText,
                { color: formData.listingType === 'Request' ? '#fff' : colors.text.secondary }
              ]}
            >
              I'm Looking For
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text.primary }]}>
            Title *
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.background.card, color: colors.text.primary },
              errors.title && { borderColor: colors.error, borderWidth: 1 }
            ]}
            placeholder="What are you offering?"
            placeholderTextColor={colors.text.muted}
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            maxLength={100}
          />
          {errors.title && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.title}
            </Text>
          )}
        </View>
        
        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text.primary }]}>
            Description *
          </Text>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.background.card, color: colors.text.primary },
              errors.description && { borderColor: colors.error, borderWidth: 1 }
            ]}
            placeholder="Describe your item or service in detail"
            placeholderTextColor={colors.text.muted}
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          {errors.description && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.description}
            </Text>
          )}
        </View>
        
        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text.primary }]}>
            Category *
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories.map(renderCategoryButton)}
          </ScrollView>
        </View>
        
        {/* Subcategory (optional) */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text.primary }]}>
            Subcategory (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.background.card, color: colors.text.primary }
            ]}
            placeholder="e.g., Vegetables, Plumbing, etc."
            placeholderTextColor={colors.text.muted}
            value={formData.subCategory}
            onChangeText={(text) => handleInputChange('subCategory', text)}
          />
        </View>
        
        {/* Condition (if applicable) */}
        {showCondition && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Condition
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
            >
              {conditions.map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles.conditionButton,
                    { 
                      backgroundColor: formData.condition === condition 
                        ? colors.primary 
                        : colors.background.card 
                    }
                  ]}
                  onPress={() => handleInputChange('condition', condition)}
                >
                  <Text
                    style={[
                      styles.conditionText,
                      { 
                        color: formData.condition === condition 
                          ? '#000' 
                          : colors.text.secondary 
                      }
                    ]}
                  >
                    {condition}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Images */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text.primary }]}>
            Images (Optional)
          </Text>
          <View style={styles.imagesContainer}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: image.url }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={[styles.removeImageButton, { backgroundColor: colors.error }]}
                  onPress={() => handleRemoveImage(index)}
                >
                  <FontAwesome5 name="times" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity
              style={[styles.addImageButton, { backgroundColor: colors.background.card }]}
              onPress={handlePickImage}
            >
              <FontAwesome5 name="plus" size={24} color={colors.text.secondary} />
              <Text style={[styles.addImageText, { color: colors.text.secondary }]}>
                Add Image
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Exchange Type */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text.primary }]}>
            Exchange Type
          </Text>
          <View style={styles.exchangeTypeContainer}>
            <TouchableOpacity
              style={[
                styles.exchangeTypeButton,
                { 
                  backgroundColor: formData.exchangeType === 'Talent' 
                    ? colors.primary 
                    : colors.background.card 
                }
              ]}
              onPress={() => handleExchangeTypeChange('Talent')}
            >
              <FontAwesome5 
                name="coins" 
                size={18} 
                color={formData.exchangeType === 'Talent' ? '#000' : colors.text.secondary} 
                style={styles.exchangeIcon}
              />
              <View>
                <Text
                  style={[
                    styles.exchangeTitle,
                    { 
                      color: formData.exchangeType === 'Talent' 
                        ? '#000' 
                        : colors.text.primary 
                    }
                  ]}
                >
                  Talents Only
                </Text>
                <Text
                  style={[
                    styles.exchangeDescription,
                    { 
                      color: formData.exchangeType === 'Talent' 
                        ? '#000' 
                        : colors.text.secondary 
                    }
                  ]}
                >
                  Exchange for our local currency
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.exchangeTypeButton,
                { 
                  backgroundColor: formData.exchangeType === 'Direct Swap' 
                    ? colors.primary 
                    : colors.background.card 
                }
              ]}
              onPress={() => handleExchangeTypeChange('Direct Swap')}
            >
              <FontAwesome5 
                name="exchange-alt" 
                size={18} 
                color={formData.exchangeType === 'Direct Swap' ? '#000' : colors.text.secondary} 
                style={styles.exchangeIcon}
              />
              <View>
                <Text
                  style={[
                    styles.exchangeTitle,
                    { 
                      color: formData.exchangeType === 'Direct Swap' 
                        ? '#000' 
                        : colors.text.primary 
                    }
                  ]}
                >
                  Direct Swap
                </Text>
                <Text
                  style={[
                    styles.exchangeDescription,
                    { 
                      color: formData.exchangeType === 'Direct Swap' 
                        ? '#000' 
                        : colors.text.secondary 
                    }
                  ]}
                >
                  Item for item exchange
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.exchangeTypeButton,
                { 
                  backgroundColor: formData.exchangeType === 'Both' 
                    ? colors.primary 
                    : colors.background.card 
                }
              ]}
              onPress={() => handleExchangeTypeChange('Both')}
            >
              <FontAwesome5 
                name="handshake" 
                size={18} 
                color={formData.exchangeType === 'Both' ? '#000' : colors.text.secondary} 
                style={styles.exchangeIcon}
              />
              <View>
                <Text
                  style={[
                    styles.exchangeTitle,
                    { 
                      color: formData.exchangeType === 'Both' 
                        ? '#000' 
                        : colors.text.primary 
                    }
                  ]}
                >
                  Both Options
                </Text>
                <Text
                  style={[
                    styles.exchangeDescription,
                    { 
                      color: formData.exchangeType === 'Both' 
                        ? '#000' 
                        : colors.text.secondary 
                    }
                  ]}
                >
                  Talents or swap
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Price in Talents (if applicable) */}
        {formData.exchangeType !== 'Direct Swap' && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Price in Talents
            </Text>
            <View style={styles.talentInputContainer}>
              <TextInput
                style={[
                  styles.talentInput,
                  { 
                    backgroundColor: colors.background.card, 
                    color: colors.text.primary 
                  },
                  errors.talentPrice && { borderColor: colors.error, borderWidth: 1 }
                ]}
                placeholder="10"
                placeholderTextColor={colors.text.muted}
                value={formData.talentPrice?.toString() || ''}
                onChangeText={(text) => {
                  const price = parseInt(text);
                  if (!isNaN(price) || text === '') {
                    handleInputChange('talentPrice', text === '' ? undefined : price);
                  }
                }}
                keyboardType="numeric"
              />
              <View style={[styles.talentBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.talentBadgeText}>✦ Talents</Text>
              </View>
            </View>
            {errors.talentPrice && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.talentPrice}
              </Text>
            )}
          </View>
        )}
        
        {/* What are you looking to swap for (if applicable) */}
        {(formData.exchangeType === 'Direct Swap' || formData.exchangeType === 'Both') && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              What are you looking to swap for? *
            </Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: colors.background.card, color: colors.text.primary },
                errors.swapFor && { borderColor: colors.error, borderWidth: 1 }
              ]}
              placeholder="Describe what you'd like in return"
              placeholderTextColor={colors.text.muted}
              value={formData.swapFor || ''}
              onChangeText={(text) => handleInputChange('swapFor', text)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {errors.swapFor && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.swapFor}
              </Text>
            )}
          </View>
        )}
        
        {/* Location */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Location *
            </Text>
            <View style={styles.locationToggle}>
              <Text style={[styles.toggleLabel, { color: colors.text.secondary }]}>
                Use my current location
              </Text>
              <Switch
                value={useMyLocation}
                onValueChange={setUseMyLocation}
                trackColor={{ false: colors.background.card, true: colors.accent }}
                thumbColor={useMyLocation ? colors.primary : colors.text.muted}
              />
            </View>
          </View>
          
          {useMyLocation ? (
            <View style={[styles.locationDisplay, { backgroundColor: colors.background.card }]}>
              <FontAwesome5 name="map-marker-alt" size={16} color={colors.text.secondary} style={styles.locationIcon} />
              <Text style={[styles.locationText, { color: colors.text.primary }]}>
                {formData.location?.address || 'Fetching your location...'}
              </Text>
            </View>
          ) : (
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background.card, color: colors.text.primary },
                errors.location && { borderColor: colors.error, borderWidth: 1 }
              ]}
              placeholder="Enter your location"
              placeholderTextColor={colors.text.muted}
              value={formData.location?.address || ''}
              onChangeText={(text) => {
                handleInputChange('location', {
                  coordinates: [0, 0], // Would need geocoding in a real app
                  address: text
                });
              }}
            />
          )}
          {errors.location && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.location}
            </Text>
          )}
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>Create Listing</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.medium,
  },
  header: {
    marginBottom: SPACING.large,
  },
  title: {
    fontSize: FONT.sizes.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.sizes.medium,
  },
  inputGroup: {
    marginBottom: SPACING.large,
  },
  label: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  input: {
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    fontSize: FONT.sizes.medium,
  },
  textArea: {
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    fontSize: FONT.sizes.medium,
    minHeight: 100,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.large,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    marginRight: SPACING.small,
  },
  toggleText: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    marginLeft: SPACING.small,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginHorizontal: -SPACING.small,
  },
  categoryButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SIZES.borderRadius.round,
    marginHorizontal: SPACING.xs,
  },
  categoryText: {
    fontSize: FONT.sizes.small,
    fontWeight: 'bold',
  },
  conditionButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SIZES.borderRadius.round,
    marginHorizontal: SPACING.xs,
  },
  conditionText: {
    fontSize: FONT.sizes.small,
    fontWeight: 'bold',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageItem: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
    borderRadius: SIZES.borderRadius.medium,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: FONT.sizes.small,
    marginTop: SPACING.xs,
  },
  exchangeTypeContainer: {
    marginBottom: SPACING.small,
  },
  exchangeTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SPACING.small,
  },
  exchangeIcon: {
    marginRight: SPACING.medium,
    width: 20,
    textAlign: 'center',
  },
  exchangeTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  exchangeDescription: {
    fontSize: FONT.sizes.small,
  },
  talentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  talentInput: {
    flex: 1,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    fontSize: FONT.sizes.medium,
  },
  talentBadge: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SIZES.borderRadius.medium,
    marginLeft: SPACING.small,
  },
  talentBadgeText: {
    fontSize: FONT.sizes.small,
    fontWeight: 'bold',
    color: '#000',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: FONT.sizes.small,
    marginRight: SPACING.small,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
  },
  locationIcon: {
    marginRight: SPACING.small,
  },
  locationText: {
    fontSize: FONT.sizes.medium,
    flex: 1,
  },
  errorText: {
    fontSize: FONT.sizes.small,
    marginTop: SPACING.xs,
  },
  submitButton: {
    paddingVertical: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  submitButtonText: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    color: '#000',
  },
  button: {
    paddingVertical: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    alignItems: 'center',
    marginVertical: SPACING.medium,
  },
  buttonText: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    color: '#000',
  },
});

export { CreateListingScreen };
