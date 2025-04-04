// Path: mobile/app/(app)/transactions/new.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { User, Listing, TransactionType } from '../../../types';
import * as ListingService from '../../../services/listingService';
import * as TransactionService from '../../../services/transaction';
import * as UserService from '../../../services/userService';
import config from '../../../config';

export default function NewTransactionScreen() {
  const { listingId, recipientId } = useLocalSearchParams<{ listingId?: string; recipientId?: string }>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [recipient, setRecipient] = useState<User | null>(null);
  const [message, setMessage] = useState<string>('');
  const [talentAmount, setTalentAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      // Load listing if listingId is provided
      if (listingId) {
        console.log('Fetching listing:', listingId);
        const fetchedListing = await ListingService.getListingById(listingId);
        setListing(fetchedListing);
        console.log('Listing fetched:', fetchedListing.title);

        // If we have a listing but no recipient, set the recipient as the listing owner
        if (fetchedListing && !recipientId) {
          if (typeof fetchedListing.user !== 'string') {
            setRecipient(fetchedListing.user as User);
            console.log('Using listing owner as recipient');
          } else {
            // If user is just an ID, fetch the user details
            try {
              console.log('Fetching listing owner:', fetchedListing.user);
              const userDetails = await UserService.getUserById(fetchedListing.user);
              setRecipient(userDetails);
              console.log('Listing owner fetched:', userDetails.fullName);
            } catch (userError) {
              console.error('Error fetching listing owner:', userError);
            }
          }
        }

        // Set default talent amount based on listing
        if (fetchedListing.talentPrice) {
          setTalentAmount(fetchedListing.talentPrice.toString());
        }
      }

      // Load recipient if recipientId is provided
      if (recipientId) {
        try {
          console.log('Fetching recipient:', recipientId);
          const fetchedUser = await UserService.getUserById(recipientId);
          setRecipient(fetchedUser);
          console.log('Recipient fetched:', fetchedUser.fullName);
        } catch (userError) {
          console.error('Error fetching recipient:', userError);
          Alert.alert('Error', 'Failed to load recipient information');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!user || !recipient) {
      Alert.alert('Error', 'Missing user information');
      return;
    }

    if (listing?.exchangeType !== 'Direct Swap' && !talentAmount) {
      Alert.alert('Error', 'Please enter a talent amount');
      return;
    }

    setSubmitting(true);

    try {
      // Use mock data if enabled in config
      if (config.enableMockData) {
        // For demo purposes, we'll just simulate API call success
        setTimeout(() => {
          // In a real app, this would create a transaction through the API
          Alert.alert(
            'Transaction Created',
            'Your transaction has been created successfully!',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(app)/transactions/index')
              }
            ]
          );
        }, 1000);
        return;
      }

      // Prepare transaction data
      const transactionData = {
        recipientId: recipient._id,
        listingId: listing?._id,
        type: listing?.exchangeType === 'Direct Swap' ? 'Direct Swap' : 'Talent',
        talentAmount: talentAmount ? parseInt(talentAmount) : undefined,
        message: message.trim() || undefined
      };

      console.log('Creating transaction with data:', transactionData);

      // Call the API to create the transaction
      const result = await TransactionService.createTransaction(transactionData);

      console.log('Transaction created:', result);

      console.log('Transaction created successfully, navigating to transaction details');

      // First set submitting to false
      setSubmitting(false);

      // Then navigate to the transaction details screen
      router.push({
        pathname: `/(app)/transactions/${result._id}`,
        params: { refresh: 'true' }
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert('Error', 'Failed to create transaction');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.dark }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Create New Transaction
        </Text>

        {/* Listing Info (if applicable) */}
        {listing && (
          <View style={[styles.section, { backgroundColor: colors.background.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Listing Details
            </Text>
            <Text style={[styles.listingTitle, { color: colors.text.primary }]}>
              {listing.title}
            </Text>
            <Text style={[styles.listingPrice, { color: colors.primary }]}>
              ✦ {listing.talentPrice}
            </Text>
          </View>
        )}

        {/* Recipient Info */}
        {recipient && (
          <View style={[styles.section, { backgroundColor: colors.background.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Transaction With
            </Text>
            <Text style={[styles.recipientName, { color: colors.text.primary }]}>
              {recipient.fullName}
            </Text>
          </View>
        )}

        {/* Transaction Type */}
        <View style={[styles.section, { backgroundColor: colors.background.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Transaction Details
          </Text>

          {/* Talent Amount (if applicable) */}
          {(listing?.exchangeType !== 'Direct Swap') && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>
                Talent Amount
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background.darker,
                    color: colors.text.primary,
                    borderColor: colors.border
                  }
                ]}
                value={talentAmount}
                onChangeText={setTalentAmount}
                keyboardType="numeric"
                placeholder="Enter talent amount"
                placeholderTextColor={colors.text.muted}
              />
            </View>
          )}

          {/* Message */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>
              Message (optional)
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.background.darker,
                  color: colors.text.primary,
                  borderColor: colors.border
                }
              ]}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              placeholder="Add a message about this transaction"
              placeholderTextColor={colors.text.muted}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            submitting && { opacity: 0.7 }
          ]}
          onPress={handleCreateTransaction}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>Create Transaction</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={[styles.cancelButton]}
          onPress={() => router.back()}
          disabled={submitting}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.large,
  },
  title: {
    fontSize: FONT.sizes.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.large,
    textAlign: 'center',
  },
  section: {
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    marginBottom: SPACING.medium,
  },
  listingTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  listingPrice: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
  },
  recipientName: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: SPACING.medium,
  },
  label: {
    fontSize: FONT.sizes.medium,
    marginBottom: SPACING.small,
  },
  input: {
    borderWidth: 1,
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    fontSize: FONT.sizes.medium,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    minHeight: 100,
    fontSize: FONT.sizes.medium,
  },
  submitButton: {
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  submitButtonText: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    color: '#000',
  },
  cancelButton: {
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT.sizes.medium,
  },
});