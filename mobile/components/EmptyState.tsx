import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { FONT, SPACING } from '../constants/Theme';
import Icon from './ui/Icon';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, compact = false }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Icon 
        name={icon} 
        size={compact ? 40 : 60} 
        color={colors.text.muted} 
        style={styles.icon} 
      />
      <Text style={[
        styles.title, 
        { color: colors.text.primary },
        compact && styles.compactTitle
      ]}>
        {title}
      </Text>
      <Text style={[
        styles.message, 
        { color: colors.text.secondary },
        compact && styles.compactMessage
      ]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.large,
    paddingVertical: SPACING.xlarge,
  },
  compactContainer: {
    paddingVertical: SPACING.large,
  },
  icon: {
    marginBottom: SPACING.medium,
    opacity: 0.7,
  },
  title: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.small,
  },
  compactTitle: {
    fontSize: FONT.sizes.medium,
  },
  message: {
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
    maxWidth: '80%',
  },
  compactMessage: {
    fontSize: FONT.sizes.small,
  },
});

export default EmptyState;
