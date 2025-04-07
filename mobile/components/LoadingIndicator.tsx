import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { FONT, SPACING } from '../constants/Theme';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingIndicatorProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  const { colors } = useTheme();

  if (fullScreen) {
    return (
      <View style={[styles.fullScreenContainer, { backgroundColor: colors.background.dark }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message && (
          <Text style={[styles.message, { color: colors.text.secondary }]}>
            {message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.text.secondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: SPACING.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: FONT.sizes.small,
    marginTop: SPACING.small,
    textAlign: 'center',
  },
});

export default LoadingIndicator;
