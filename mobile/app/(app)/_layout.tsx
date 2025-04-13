// Path: mobile/app/(app)/_layout.tsx

import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING } from '../../constants/Theme';
import Icon from '../../components/ui/Icon';

export default function AppLayout() {
  const { colors } = useTheme();

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
        name="messages/index"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Icon name="comments" size={size} color={color} />
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
    </Tabs>

  );
}