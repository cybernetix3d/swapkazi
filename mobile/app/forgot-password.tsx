import React, { useState } from 'react';
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
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../constants/Theme';
import * as AuthService from '../services/authService';
import Icon from '../components/ui/Icon';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await AuthService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Forgot Password',
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
                Reset Email Sent
              </Text>
              <Text style={[styles.successMessage, { color: colors.text.secondary }]}>
                We've sent password reset instructions to {email}. Please check your email inbox.
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.buttonText}>Return to Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resendLink}
                onPress={() => {
                  setSuccess(false);
                  handleResetPassword();
                }}
              >
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  Resend Email
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Icon name="key" size={40} color={colors.primary} style={styles.headerIcon} />
                <Text style={[styles.title, { color: colors.text.primary }]}>
                  Forgot Your Password?
                </Text>
                <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                  Enter your email address and we'll send you instructions to reset your password.
                </Text>
              </View>
              
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text.secondary }]}>
                    Email Address
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { 
                      backgroundColor: colors.background.card,
                      borderColor: error ? colors.error : colors.border
                    }
                  ]}>
                    <Icon name="envelope" size={16} color={colors.text.muted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text.primary }]}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setError(null)}
                    />
                  </View>
                  {error && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {error}
                    </Text>
                  )}
                </View>
                
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
                    <Text style={styles.buttonText}>Send Reset Instructions</Text>
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
  errorText: {
    fontSize: FONT.sizes.small,
    marginTop: SPACING.small,
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
  resendLink: {
    marginTop: SPACING.large,
    padding: SPACING.small,
  },
  resendText: {
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
  },
});
