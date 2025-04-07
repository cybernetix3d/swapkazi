import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { FONT, SPACING } from '../constants/Theme';
import { useTheme } from '../contexts/ThemeContext';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.card }]}>
      <FontAwesome5 name="exclamation-circle" size={48} color={colors.error} />
      <Text style={[styles.message, { color: colors.text.primary }]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
        >
          <Text style={[styles.retryText, { color: colors.text.onPrimary }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.large,
    borderRadius: 8,
    alignItems: 'center',
    margin: SPACING.medium,
  },
  message: {
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
    marginTop: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  retryButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 4,
    marginTop: SPACING.small,
  },
  retryText: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
});

export default ErrorMessage;
