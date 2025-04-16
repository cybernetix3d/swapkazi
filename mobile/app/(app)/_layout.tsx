// Path: mobile/app/(app)/_layout.tsx

import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { SPACING, FONT } from '../../constants/Theme';
import Icon from '../../components/ui/Icon';

// Badge component for notifications
const NotificationBadge = ({ count }: { count: number }) => {
  const { colors } = useTheme();

  if (count <= 0) return null;

  return (
    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

export default function AppLayout() {
  const { colors } = useTheme();
  const { unreadMessageCount } = useNotification();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background.darker,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: SPACING.small,
          paddingTop: SPACING.small,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: colors.background.darker,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="marketplace/index"
        options={{
          title: 'Marketplace',
          tabBarIcon: ({ color, size }) => (
            <Icon name="store" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="community/index"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => (
            <Icon name="users" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="messages/index"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: 24, height: 24 }}>
              <Icon name="comments" size={size} color={color} />
              {unreadMessageCount > 0 && <NotificationBadge count={unreadMessageCount} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="transactions/index"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <Icon name="exchange-alt" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile/change-password"
        options={{
          href: null,  // This prevents the tab from showing in the tab bar, but allows it to be accessed via the URL
        }}
      />



      <Tabs.Screen
        name="messages/[id]"
        options={{
          href: null,  // This prevents the tab from showing in the tab bar, but allows it to be accessed via the URL
        }}
      />

      <Tabs.Screen
        name="messages/new"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="marketplace/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="marketplace/create"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="transactions/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="transactions/new"
        options={{
          href: null,
        }}
      />

        <Tabs.Screen
        name="profile/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="profile/edit"
        options={{
          href: null,
          headerTitle: "Edit Profile",
          headerShown: true,
          // This is the key part - hide the tab bar for this screen
          tabBarStyle: { display: 'none' }
        }}
      />

      {/* Hide filters screen from tab bar */}
      <Tabs.Screen
        name="marketplace/filters"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />

      {/* Featured Listings */}
      <Tabs.Screen
        name="featured/index"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />

      {/* Community Pages */}
      <Tabs.Screen
        name="community/people"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />

      <Tabs.Screen
        name="community/forums"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />

      <Tabs.Screen
        name="community/forum/[id]"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />

      <Tabs.Screen
        name="community/guidelines"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />
    </Tabs>

  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#000',
    fontSize: FONT.sizes.xs,
    fontWeight: 'bold',
  },
});