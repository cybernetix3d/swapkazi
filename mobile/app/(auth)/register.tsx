import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../constants/Theme';
import { RegisterData } from '../../types';

export default function Register() {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    fullName: '',
  });
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const router = useRouter();
  const { register } = useAuth();
  const { colors } = useTheme();
  
  const handleRegister = async () => {
    // Basic validation
    if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    if (formData.password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await register(formData);
      if (success) {
        router.replace('/(app)/home');
      } else {
        Alert.alert('Registration Failed', 'Could not create account. Please try again.');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message || 'Something went wrong');
      } else {
        Alert.alert('Error', 'An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateFormData = (key: keyof RegisterData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background.dark }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Join the SwapKazi community and start bartering
        </Text>
        
        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: colors.background.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Full Name"
              placeholderTextColor={colors.text.muted}
              value={formData.fullName}
              onChangeText={(value) => updateFormData('fullName', value)}
            />
          </View>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.background.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Username"
              placeholderTextColor={colors.text.muted}
              value={formData.username}
              onChangeText={(value) => updateFormData('username', value)}
              autoCapitalize="none"
            />
          </View>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.background.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Email"
              placeholderTextColor={colors.text.muted}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.background.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Password"
              placeholderTextColor={colors.text.muted}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
            />
          </View>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.background.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.text.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.background.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Phone Number (optional)"
              placeholderTextColor={colors.text.muted}
              value={formData.phoneNumber || ''}
              onChangeText={(value) => updateFormData('phoneNumber', value)}
              keyboardType="phone-pad"
            />
          </View>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Creating Account...' : 'Register'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.linkContainer}>
            <Text style={[styles.linkText, { color: colors.text.secondary }]}>
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.link, { color: colors.accent }]}>
                  Login
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.large,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT.sizes.title,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.small,
  },
  subtitle: {
    fontSize: FONT.sizes.large,
    textAlign: 'center',
    marginBottom: SPACING.large,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    borderRadius: SIZES.borderRadius.medium,
    marginBottom: SPACING.medium,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    fontSize: FONT.sizes.medium,
  },
  button: {
    borderRadius: SIZES.borderRadius.medium,
    paddingVertical: SPACING.medium,
    alignItems: 'center',
    marginVertical: SPACING.medium,
  },
  buttonText: {
    color: '#000',
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.medium,
  },
  linkText: {
    fontSize: FONT.sizes.medium,
  },
  link: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
});