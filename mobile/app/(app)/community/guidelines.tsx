import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import Icon from '../../../components/ui/Icon';

export default function CommunityGuidelinesScreen() {
  const { colors } = useTheme();

  const guidelines = [
    {
      title: 'Be Respectful',
      description: 'Treat all community members with respect and courtesy. Harassment, hate speech, or discrimination of any kind will not be tolerated.',
      icon: 'handshake'
    },
    {
      title: 'Stay On Topic',
      description: 'Keep discussions relevant to the forum topic. Off-topic posts may be moved or removed.',
      icon: 'bullseye'
    },
    {
      title: 'No Spam',
      description: 'Do not post promotional content, advertisements, or repetitive messages. Focus on meaningful contributions.',
      icon: 'ban'
    },
    {
      title: 'Protect Privacy',
      description: 'Do not share personal information about yourself or others. Respect privacy and confidentiality.',
      icon: 'user-shield'
    },
    {
      title: 'Be Honest',
      description: 'Be truthful about your skills, experiences, and offerings. Honesty builds trust in our community.',
      icon: 'check-circle'
    },
    {
      title: 'Constructive Feedback',
      description: 'When providing feedback, be constructive and helpful. Focus on the work, not the person.',
      icon: 'comment-dots'
    },
    {
      title: 'Report Issues',
      description: 'If you see content that violates these guidelines, please report it to the moderators.',
      icon: 'flag'
    },
    {
      title: 'Follow Local Laws',
      description: 'Ensure all your activities comply with local laws and regulations.',
      icon: 'gavel'
    }
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Community Guidelines',
          headerStyle: {
            backgroundColor: colors.background.dark,
          },
          headerTintColor: colors.text.primary,
        }}
      />
      
      <ScrollView style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Community Guidelines
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Our community thrives when everyone follows these guidelines
          </Text>
        </View>
        
        <View style={styles.guidelinesContainer}>
          {guidelines.map((guideline, index) => (
            <View 
              key={index} 
              style={[
                styles.guidelineCard, 
                { backgroundColor: colors.background.card }
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.background.darker }]}>
                <Icon name={guideline.icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.guidelineTitle, { color: colors.text.primary }]}>
                  {guideline.title}
                </Text>
                <Text style={[styles.guidelineDescription, { color: colors.text.secondary }]}>
                  {guideline.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text.muted }]}>
            These guidelines are in place to ensure a positive and productive community experience for everyone. 
            Failure to follow these guidelines may result in content removal or account restrictions.
          </Text>
          <Text style={[styles.footerText, { color: colors.text.muted, marginTop: SPACING.medium }]}>
            Last updated: April 2023
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: FONT.sizes.xlarge,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  subtitle: {
    fontSize: FONT.sizes.medium,
  },
  guidelinesContainer: {
    padding: SPACING.large,
  },
  guidelineCard: {
    flexDirection: 'row',
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  textContainer: {
    flex: 1,
  },
  guidelineTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  guidelineDescription: {
    fontSize: FONT.sizes.small,
  },
  footer: {
    padding: SPACING.large,
    paddingTop: 0,
    marginBottom: SPACING.large,
  },
  footerText: {
    fontSize: FONT.sizes.small,
    lineHeight: 20,
  },
});
