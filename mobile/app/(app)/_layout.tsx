import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING } from '../../constants/Theme';

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
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="marketplace/index"
        options={{
          title: 'Marketplace',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="store" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="messages/index"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="comments" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="transactions/index"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="exchange-alt" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}