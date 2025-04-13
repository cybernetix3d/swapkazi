import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Icon from '../../../components/ui/Icon';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import * as userService from '../../../services/userService';

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return false;
    }
    
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return false;
    }
    
    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await userService.changePassword(currentPassword, newPassword);
      
      Alert.alert(
        'Success',
        'Your password has been changed successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Change Password',
          headerStyle: {
            backgroundColor: colors.background.dark,
          },
          headerTintColor: colors.text.primary,
        }}
      />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          style={[styles.container, { backgroundColor: colors.background.dark }]}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Change Your Password
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.text.secondary }]}>
              Enter your current password and a new password below
            </Text>
            
            {/* Current Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
                Current Password
              </Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.background.card,
                      color: colors.text.primary,
                      borderColor: colors.border
                    }
                  ]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.text.muted}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Icon
                    name={showCurrentPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* New Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
                New Password
              </Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.background.card,
                      color: colors.text.primary,
                      borderColor: colors.border
                    }
                  ]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.text.muted}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Icon
                    name={showNewPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.passwordHint, { color: colors.text.muted }]}>
                Password must be at least 8 characters long
              </Text>
            </View>
            
            {/* Confirm New Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
                Confirm New Password
              </Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.background.card,
                      color: colors.text.primary,
                      borderColor: colors.border
                    }
                  ]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.text.muted}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: colors.primary },
              isLoading && { opacity: 0.7 }
            ]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.saveButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.large,
  },
  formSection: {
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  sectionDescription: {
    fontSize: FONT.sizes.medium,
    marginBottom: SPACING.large,
  },
  inputContainer: {
    marginBottom: SPACING.medium,
  },
  inputLabel: {
    fontSize: FONT.sizes.medium,
    marginBottom: SPACING.xs,
  },
  input: {
    height: 50,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    borderWidth: 1,
    fontSize: FONT.sizes.medium,
    flex: 1,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: SPACING.medium,
    height: '100%',
    justifyContent: 'center',
  },
  passwordHint: {
    fontSize: FONT.sizes.small,
    marginTop: SPACING.xs,
  },
  saveButton: {
    height: 50,
    borderRadius: SIZES.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.medium,
  },
  saveButtonText: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    color: '#000',
  },
});
