import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../constants/Theme';
import * as AuthService from '../../services/authService';
import Icon from '../../components/ui/Icon';

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    if (!token) {
      Alert.alert(
        'Invalid Reset Link',
        'The password reset link is invalid or has expired. Please request a new password reset.',
        [
          { text: 'OK', onPress: () => router.push('/forgot-password') }
        ]
      );
    }
  }, [token, router]);

  const handleResetPassword = async () => {
    // Validate inputs
    if (!password) {
      setError('Please enter a new password');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (token) {
        await AuthService.resetPassword(token, password);
        setSuccess(true);
      } else {
        setError('Invalid reset token');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Reset Password',
          headerStyle: {
            backgroundColor: colors.background.dark,
          },
          headerTintColor: colors.text.primary,
        }}
      />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background.dark }]}
          contentContainerStyle={styles.contentContainer}
        >
          {success ? (
            <View style={styles.successContainer}>
              <Icon name="check-circle" size={60} color={colors.success} style={styles.successIcon} />
              <Text style={[styles.successTitle, { color: colors.text.primary }]}>
                Password Reset Successful
              </Text>
              <Text style={[styles.successMessage, { color: colors.text.secondary }]}>
                Your password has been successfully reset. You can now log in with your new password.
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.buttonText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Icon name="lock" size={40} color={colors.primary} style={styles.headerIcon} />
                <Text style={[styles.title, { color: colors.text.primary }]}>
                  Reset Your Password
                </Text>
                <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                  Create a new password for your account
                </Text>
              </View>
              
              <View style={styles.form}>
                {/* New Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text.secondary }]}>
                    New Password
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { 
                      backgroundColor: colors.background.card,
                      borderColor: error && !password ? colors.error : colors.border
                    }
                  ]}>
                    <Icon name="lock" size={16} color={colors.text.muted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text.primary }]}
                      placeholder="Enter new password"
                      placeholderTextColor={colors.text.muted}
                      secureTextEntry={!passwordVisible}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setError(null)}
                    />
                    <TouchableOpacity
                      style={styles.visibilityToggle}
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    >
                      <Icon 
                        name={passwordVisible ? 'eye-slash' : 'eye'} 
                        size={16} 
                        color={colors.text.muted} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text.secondary }]}>
                    Confirm Password
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { 
                      backgroundColor: colors.background.card,
                      borderColor: error && password !== confirmPassword ? colors.error : colors.border
                    }
                  ]}>
                    <Icon name="lock" size={16} color={colors.text.muted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text.primary }]}
                      placeholder="Confirm new password"
                      placeholderTextColor={colors.text.muted}
                      secureTextEntry={!confirmPasswordVisible}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      onFocus={() => setError(null)}
                    />
                    <TouchableOpacity
                      style={styles.visibilityToggle}
                      onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    >
                      <Icon 
                        name={confirmPasswordVisible ? 'eye-slash' : 'eye'} 
                        size={16} 
                        color={colors.text.muted} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {error && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {error}
                  </Text>
                )}
                
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: colors.primary },
                    loading && { opacity: 0.7 }
                  ]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.buttonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.backLink}
                  onPress={() => router.push('/login')}
                >
                  <Icon name="arrow-left" size={14} color={colors.primary} style={styles.backIcon} />
                  <Text style={[styles.backText, { color: colors.primary }]}>
                    Back to Login
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
    flexGrow: 1,
    padding: SPACING.large,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xlarge,
  },
  headerIcon: {
    marginBottom: SPACING.medium,
  },
  title: {
    fontSize: FONT.sizes.xlarge,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.small,
  },
  subtitle: {
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
    marginBottom: SPACING.medium,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: SPACING.large,
  },
  label: {
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.small,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: SIZES.borderRadius.medium,
    paddingHorizontal: SPACING.medium,
    height: 50,
  },
  inputIcon: {
    marginRight: SPACING.small,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: FONT.sizes.medium,
  },
  visibilityToggle: {
    padding: SPACING.small,
  },
  errorText: {
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.medium,
    textAlign: 'center',
  },
  button: {
    height: 50,
    borderRadius: SIZES.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  buttonText: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    color: '#000',
  },
  backLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.small,
  },
  backIcon: {
    marginRight: SPACING.small,
  },
  backText: {
    fontSize: FONT.sizes.medium,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.large,
  },
  successIcon: {
    marginBottom: SPACING.large,
  },
  successTitle: {
    fontSize: FONT.sizes.xlarge,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.medium,
  },
  successMessage: {
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
    marginBottom: SPACING.xlarge,
  },
});
