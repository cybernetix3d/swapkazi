import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../constants/Theme';

export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const router = useRouter();
  const { login } = useAuth();
  const { colors } = useTheme();
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/(app)/home');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password');
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
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background.dark }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo-placeholder.png')} // Replace with your logo
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={[styles.title, { color: colors.text.primary }]}>Welcome to SwopKasi</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Township barter made easy
        </Text>
        
        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: colors.background.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Email"
              placeholderTextColor={colors.text.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.background.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Password"
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.linkContainer}>
            <Text style={[styles.linkText, { color: colors.text.secondary }]}>
              Don't have an account?{' '}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={[styles.link, { color: colors.accent }]}>
                  Register
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  logo: {
    width: 150,
    height: 150,
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