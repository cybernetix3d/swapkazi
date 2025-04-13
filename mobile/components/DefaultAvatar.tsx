import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getInitials, getAvatarColor } from '../utils/avatarUtils';

interface DefaultAvatarProps {
  name: string;
  userId: string;
  size?: number;
  style?: any;
  showBorder?: boolean;
}

/**
 * Default avatar component that displays user initials on a colored background
 */
const DefaultAvatar: React.FC<DefaultAvatarProps> = ({
  name,
  userId,
  size = 100,
  style,
  showBorder = true
}) => {
  const initials = getInitials(name || '?');
  const backgroundColor = getAvatarColor(userId || name || '');

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderWidth: showBorder ? 1 : 0,
          borderColor: 'rgba(255, 255, 255, 0.3)'
        },
        style
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontSize: size * 0.4 }
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default DefaultAvatar;
