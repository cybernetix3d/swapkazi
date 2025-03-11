import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // While checking authentication status
  if (isLoading) {
    return null; // Could return a splash screen or loading indicator
  }
  
  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(app)/home" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}