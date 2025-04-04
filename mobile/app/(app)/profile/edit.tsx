import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { UpdateProfileData } from '../../../types';
import * as ImagePicker from 'expo-image-picker';
import * as userService from '../../../services/userService';

export default function EditProfileScreen() {
  // Hide the bottom tab bar for this screen
  // This is done using the Stack component from expo-router
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    fullName: '',
    bio: '',
    phoneNumber: '',
    skills: [],
    avatar: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        bio: user.bio || '',
        phoneNumber: user.phoneNumber || '',
        skills: user.skills || [],
        avatar: user.avatar || '',
        location: user.location,
      });
    }
  }, [user]);

  const handleChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skill) || []
    }));
  };

  const handlePickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload an avatar.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        // Upload image
        setImageUploading(true);

        // In a real app, you would upload the image to your server here
        // For now, we'll just simulate an upload delay and use the local URI
        setTimeout(() => {
          setFormData(prev => ({ ...prev, avatar: selectedImage.uri }));
          setImageUploading(false);
        }, 1000);

        // Example of how you would upload to your server:
        /*
        const formData = new FormData();
        formData.append('file', {
          uri: selectedImage.uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        });

        const response = await fetch('YOUR_UPLOAD_ENDPOINT', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const data = await response.json();
        setFormData(prev => ({ ...prev, avatar: data.fileUrl }));
        */
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setImageUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validate form
      if (!formData.fullName) {
        Alert.alert('Error', 'Full name is required');
        setIsLoading(false);
        return;
      }

      // Update profile
      const success = await updateProfile(formData);

      if (success) {
        Alert.alert('Success', 'Profile updated successfully');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Please login to edit your profile
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Screen content */}
      <ScrollView style={[styles.container, { backgroundColor: colors.background.dark }]}>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          {imageUploading ? (
            <View style={[styles.avatarContainer, { backgroundColor: colors.background.card }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : formData.avatar ? (
            <Image source={{ uri: formData.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarInitial}>
                {formData.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.changeAvatarButton, { backgroundColor: colors.accent }]}
            onPress={handlePickImage}
            disabled={imageUploading}
          >
            <FontAwesome5 name="camera" size={16} color="#fff" />
            <Text style={styles.changeAvatarText}>
              {imageUploading ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background.card, color: colors.text.primary }
              ]}
              value={formData.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              placeholder="Your full name"
              placeholderTextColor={colors.text.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Bio</Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: colors.background.card, color: colors.text.primary }
              ]}
              value={formData.bio}
              onChangeText={(text) => handleChange('bio', text)}
              placeholder="Tell us about yourself"
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Phone Number</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background.card, color: colors.text.primary }
              ]}
              value={formData.phoneNumber}
              onChangeText={(text) => handleChange('phoneNumber', text)}
              placeholder="Your phone number"
              placeholderTextColor={colors.text.muted}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Skills</Text>
            <View style={styles.skillsInputContainer}>
              <TextInput
                style={[
                  styles.skillInput,
                  { backgroundColor: colors.background.card, color: colors.text.primary }
                ]}
                value={skillInput}
                onChangeText={setSkillInput}
                placeholder="Add a skill"
                placeholderTextColor={colors.text.muted}
                onSubmitEditing={handleAddSkill}
              />
              <TouchableOpacity
                style={[styles.addSkillButton, { backgroundColor: colors.primary }]}
                onPress={handleAddSkill}
              >
                <FontAwesome5 name="plus" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.skillsContainer}>
              {formData.skills && formData.skills.length > 0 ? (
                formData.skills.map((skill, index) => (
                  <View
                    key={index}
                    style={[styles.skillBadge, { backgroundColor: colors.background.card }]}
                  >
                    <Text style={[styles.skillText, { color: colors.text.secondary }]}>
                      {skill}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeSkillButton}
                      onPress={() => handleRemoveSkill(skill)}
                    >
                      <FontAwesome5 name="times" size={12} color={colors.text.muted} />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: colors.text.muted }]}>
                  No skills added yet
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <FontAwesome5 name="save" size={16} color="#fff" />
                <Text style={styles.buttonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.background.card }]}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <FontAwesome5 name="times" size={16} color={colors.text.primary} />
            <Text style={[styles.buttonText, { color: colors.text.primary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.medium,
  },
  avatarSection: {
    alignItems: 'center',
    padding: SPACING.large,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SIZES.borderRadius.medium,
    marginTop: SPACING.medium,
  },
  changeAvatarText: {
    fontSize: FONT.sizes.small,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: SPACING.small,
  },
  formContainer: {
    padding: SPACING.large,
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
    height: 50,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    fontSize: FONT.sizes.medium,
  },
  textArea: {
    minHeight: 100,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    fontSize: FONT.sizes.medium,
  },
  skillsInputContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
  },
  skillInput: {
    flex: 1,
    height: 50,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    fontSize: FONT.sizes.medium,
    marginRight: SPACING.small,
  },
  addSkillButton: {
    width: 50,
    height: 50,
    borderRadius: SIZES.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.borderRadius.round,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  skillText: {
    fontSize: FONT.sizes.small,
    marginRight: SPACING.xs,
  },
  removeSkillButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
