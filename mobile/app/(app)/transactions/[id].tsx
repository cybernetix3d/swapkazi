// Path: mobile/app/(app)/transactions/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from '../../../components/ui/Icon';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { FONT, SPACING, SIZES, SHADOWS } from '../../../constants/Theme';
import DefaultAvatar from '../../../components/DefaultAvatar';
import { Transaction, TransactionStatus, User } from '../../../types';
import * as TransactionService from '../../../services/transaction';

// No mock data - using real API data

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const router = useRouter();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  // Define styles inside the component to access the theme colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      padding: SPACING.large,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      marginBottom: SPACING.medium,
    },
    transactionTitle: {
      fontSize: FONT.sizes.large,
      fontWeight: 'bold',
      marginBottom: SPACING.medium,
      textAlign: 'center',
    },
    participantsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.medium,
    },
    headerParticipant: {
      alignItems: 'center',
      flex: 1,
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginBottom: SPACING.xs,
    },
    headerParticipantName: {
      fontSize: FONT.sizes.small,
      textAlign: 'center',
    },
    exchangeIconContainer: {
      alignItems: 'center',
      paddingHorizontal: SPACING.small,
    },
    talentAmount: {
      fontSize: FONT.sizes.small,
      fontWeight: 'bold',
      marginTop: SPACING.xs,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.small,
    },
    statusBadge: {
      paddingHorizontal: SPACING.medium,
      paddingVertical: SPACING.small,
      borderRadius: SIZES.borderRadius.round,
      marginBottom: SPACING.medium,
      minWidth: 120,
      alignItems: 'center',
      ...SHADOWS.medium,
    },
    statusText: {
      fontSize: FONT.sizes.medium,
      fontWeight: 'bold',
      color: colors.text.inverse,
    },
    transactionId: {
      fontSize: FONT.sizes.small,
      marginBottom: SPACING.small,
    },
    date: {
      fontSize: FONT.sizes.small,
    },
    section: {
      margin: SPACING.medium,
      borderRadius: SIZES.borderRadius.medium,
      padding: SPACING.medium,
      ...SHADOWS.small,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    sectionTitle: {
      fontSize: FONT.sizes.large,
      fontWeight: 'bold',
      marginBottom: SPACING.medium,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      paddingBottom: SPACING.small,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.medium,
      backgroundColor: colors.background.input,
      padding: SPACING.small,
      borderRadius: SIZES.borderRadius.small,
    },
    detailLabel: {
      fontSize: FONT.sizes.small,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: colors.text.secondary,
    },
    detailValue: {
      fontSize: FONT.sizes.medium,
      fontWeight: 'bold',
    },
    balanceContainer: {
      alignItems: 'center',
      marginVertical: SPACING.medium,
      backgroundColor: 'rgba(249, 200, 14, 0.1)',
      padding: SPACING.medium,
      borderRadius: SIZES.borderRadius.medium,
    },
    balanceAmount: {
      fontSize: FONT.sizes.xxl,
      fontWeight: 'bold',
      marginBottom: SPACING.xs,
    },
    balanceLabel: {
      fontSize: FONT.sizes.small,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    listingLink: {
      fontSize: FONT.sizes.medium,
      fontWeight: 'bold',
      textDecorationLine: 'underline',
      color: colors.primary,
    },
    participant: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.medium,
      backgroundColor: colors.background.input,
      padding: SPACING.small,
      borderRadius: SIZES.borderRadius.medium,
    },
    participantLabel: {
      fontSize: FONT.sizes.small,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: colors.text.secondary,
    },
    participantInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    participantName: {
      fontSize: FONT.sizes.medium,
      fontWeight: 'bold',
      marginRight: SPACING.small,
    },
    message: {
      marginBottom: SPACING.medium,
      padding: SPACING.medium,
      backgroundColor: colors.background.input,
      borderRadius: SIZES.borderRadius.medium,
      borderLeftWidth: 2,
      borderLeftColor: colors.divider,
    },
    messageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.small,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      paddingBottom: SPACING.xs,
    },
    messageSender: {
      fontSize: FONT.sizes.small,
      fontWeight: 'bold',
    },
    messageTime: {
      fontSize: FONT.sizes.xs,
    },
    messageContent: {
      fontSize: FONT.sizes.medium,
      lineHeight: 20,
    },
    messageInputContainer: {
      flexDirection: 'row',
      padding: SPACING.medium,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.background.darker,
    },
    messageInput: {
      flex: 1,
      backgroundColor: colors.background.input,
      borderRadius: SIZES.borderRadius.medium,
      paddingHorizontal: SPACING.medium,
      paddingVertical: SPACING.small,
      color: colors.text.primary,
      marginRight: SPACING.small,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    sendButton: {
      backgroundColor: colors.primary,
      borderRadius: SIZES.borderRadius.medium,
      padding: SPACING.small,
      ...SHADOWS.small,
    },
    historyItem: {
      marginBottom: SPACING.medium,
      padding: SPACING.medium,
      backgroundColor: colors.background.input,
      borderRadius: SIZES.borderRadius.medium,
      borderLeftWidth: 3,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.small,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      paddingBottom: SPACING.small,
    },
    historyStatus: {
      paddingHorizontal: SPACING.small,
      paddingVertical: SPACING.xs,
      borderRadius: SIZES.borderRadius.small,
      minWidth: 80,
      alignItems: 'center',
    },
    historyStatusText: {
      fontSize: FONT.sizes.xs,
      fontWeight: 'bold',
      color: colors.text.inverse,
    },
    historyTime: {
      fontSize: FONT.sizes.xs,
    },
    historyDescription: {
      fontSize: FONT.sizes.medium,
      marginBottom: SPACING.small,
      fontWeight: '500',
    },
    historyUpdatedBy: {
      fontSize: FONT.sizes.small,
      fontStyle: 'italic',
    },
    actionBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: SPACING.medium,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.background.darker,
    },
    actionButton: {
      paddingHorizontal: SPACING.large,
      paddingVertical: SPACING.medium,
      borderRadius: SIZES.borderRadius.medium,
      ...SHADOWS.medium,
      minWidth: 120,
      alignItems: 'center',
    },
    actionButtonText: {
      fontWeight: 'bold',
      color: colors.text.inverse,
      fontSize: FONT.sizes.medium,
    },
    errorText: {
      fontSize: FONT.sizes.large,
      textAlign: 'center',
      marginBottom: SPACING.large,
      padding: SPACING.large,
      fontWeight: 'bold',
    },
    button: {
      alignSelf: 'center',
      paddingHorizontal: SPACING.large,
      paddingVertical: SPACING.medium,
      borderRadius: SIZES.borderRadius.medium,
      ...SHADOWS.medium,
    },
    buttonText: {
      fontWeight: 'bold',
      color: colors.text.inverse,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.large,
    },
    errorSubText: {
      fontSize: FONT.sizes.medium,
      textAlign: 'center',
      marginBottom: SPACING.large,
      lineHeight: 22,
    },
  });

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    console.log('Fetching transaction with ID:', id);
    if (!id) {
      console.log('No transaction ID provided');
      return;
    }

    // If not authenticated, don't try to fetch transaction
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping transaction fetch');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Get transaction from API
      console.log('Fetching transaction from API');
      const data = await TransactionService.getTransactionById(id as string);
      console.log('Transaction data received:', data);
      setTransaction(data);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      Alert.alert('Error', 'Failed to load transaction details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'Proposed':
        return colors.transaction.proposed;
      case 'Accepted':
        return colors.transaction.accepted;
      case 'Completed':
        return colors.transaction.completed;
      case 'Rejected':
        return colors.transaction.rejected;
      case 'Cancelled':
        return colors.transaction.cancelled;
      case 'Disputed':
        return colors.transaction.disputed;
      case 'Resolved':
        return colors.transaction.resolved;
      default:
        return colors.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isCurrentUser = (userId: string) => {
    const result = userId === user?._id;
    console.log('isCurrentUser check:', { userId, currentUserId: user?._id, result });
    return result;
  };

  const canAccept = () => {
    console.log('Checking if user can accept transaction');
    if (!transaction) {
      console.log('No transaction data available');
      return false;
    }

    const initiatorId = typeof transaction.initiator === 'string'
      ? transaction.initiator
      : (transaction.initiator as User)._id;

    const result = (
      transaction.status === 'Proposed' &&
      !isCurrentUser(initiatorId)
    );

    console.log('Can accept:', result, 'Status:', transaction.status, 'Is initiator:', isCurrentUser(initiatorId));
    return result;
  };

  const canReject = () => {
    console.log('Checking if user can reject transaction');
    if (!transaction) {
      console.log('No transaction data available');
      return false;
    }

    const initiatorId = typeof transaction.initiator === 'string'
      ? transaction.initiator
      : (transaction.initiator as User)._id;

    const result = (
      transaction.status === 'Proposed' &&
      !isCurrentUser(initiatorId)
    );

    console.log('Can reject:', result, 'Status:', transaction.status, 'Is initiator:', isCurrentUser(initiatorId));
    return result;
  };

  const canComplete = () => {
    console.log('Checking if user can complete transaction');
    if (!transaction) {
      console.log('No transaction data available');
      return false;
    }

    const initiatorId = typeof transaction.initiator === 'string'
      ? transaction.initiator
      : (transaction.initiator as User)._id;

    const recipientId = typeof transaction.recipient === 'string'
      ? transaction.recipient
      : (transaction.recipient as User)._id;

    const result = (
      transaction.status === 'Accepted' &&
      (isCurrentUser(initiatorId) || isCurrentUser(recipientId))
    );

    console.log('Can complete:', result, 'Status:', transaction.status,
      'Is initiator:', isCurrentUser(initiatorId),
      'Is recipient:', isCurrentUser(recipientId));
    return result;
  };

  const canCancel = () => {
    console.log('Checking if user can cancel transaction');
    if (!transaction) {
      console.log('No transaction data available');
      return false;
    }

    const initiatorId = typeof transaction.initiator === 'string'
      ? transaction.initiator
      : (transaction.initiator as User)._id;

    const recipientId = typeof transaction.recipient === 'string'
      ? transaction.recipient
      : (transaction.recipient as User)._id;

    const result = (
      (transaction.status === 'Proposed' || transaction.status === 'Accepted') &&
      (isCurrentUser(initiatorId) || isCurrentUser(recipientId))
    );

    console.log('Can cancel:', result, 'Status:', transaction.status,
      'Is initiator:', isCurrentUser(initiatorId),
      'Is recipient:', isCurrentUser(recipientId));
    return result;
  };

  const handleAccept = () => {
    if (!id) return;

    Alert.alert(
      'Accept Transaction',
      'Are you sure you want to accept this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Accept',
          onPress: async () => {
            console.log('Accept button pressed');
            try {
              setLoading(true);

              // Update transaction status via API
              console.log('Accepting transaction:', id);
              try {
                const updatedTransaction = await TransactionService.updateTransactionStatus(
                  id as string,
                  'Accepted'
                );
                console.log('Transaction accepted successfully:', updatedTransaction);
                setTransaction(updatedTransaction);
              } catch (apiError: any) {
                console.error('API error accepting transaction:', apiError);
                Alert.alert('API Error', 'Failed to accept transaction: ' + (apiError.message || 'Unknown error'));
              }
            } catch (error) {
              console.error('Error accepting transaction:', error);
              Alert.alert('Error', 'Failed to accept transaction');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleReject = () => {
    if (!id) return;

    Alert.alert(
      'Reject Transaction',
      'Are you sure you want to reject this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reject',
          onPress: async () => {
            console.log('Reject button pressed');
            try {
              setLoading(true);

              // Update transaction status via API
              console.log('Rejecting transaction:', id);
              try {
                const updatedTransaction = await TransactionService.updateTransactionStatus(
                  id as string,
                  'Rejected'
                );
                console.log('Transaction rejected successfully:', updatedTransaction);
                setTransaction(updatedTransaction);
              } catch (apiError: any) {
                console.error('API error rejecting transaction:', apiError);
                Alert.alert('API Error', 'Failed to reject transaction: ' + (apiError.message || 'Unknown error'));
              }
            } catch (error) {
              console.error('Error rejecting transaction:', error);
              Alert.alert('Error', 'Failed to reject transaction');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleComplete = () => {
    if (!id) return;

    Alert.alert(
      'Complete Transaction',
      'Are you sure you want to mark this transaction as completed?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Complete',
          onPress: async () => {
            console.log('Complete button pressed');
            try {
              setLoading(true);

              // Update transaction status via API
              console.log('Completing transaction:', id);
              try {
                // Show confirmation for talent transactions
                if (transaction?.type === 'Talent' || transaction?.type === 'Combined') {
                  const talentAmount = transaction.talentAmount || 0;
                  const isInitiator = typeof transaction.initiator === 'string'
                    ? transaction.initiator === user?._id
                    : (transaction.initiator as User)._id === user?._id;

                  const message = isInitiator
                    ? `You are about to send ${talentAmount} talents to complete this transaction. Continue?`
                    : `You are about to receive ${talentAmount} talents to complete this transaction. Continue?`;

                  Alert.alert(
                    'Confirm Talent Transfer',
                    message,
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => setLoading(false)
                      },
                      {
                        text: 'Continue',
                        onPress: async () => {
                          try {
                            const updatedTransaction = await TransactionService.updateTransactionStatus(
                              id as string,
                              'Completed'
                            );
                            console.log('Transaction completed successfully:', updatedTransaction);
                            setTransaction(updatedTransaction);

                            // Refresh user profile to get updated talent balance
                            if (user && refreshProfile) {
                              console.log('Refreshing user profile after transaction completion');
                              await refreshProfile();

                              // Show success message with updated balance
                              Alert.alert(
                                'Transaction Completed',
                                `The transaction has been completed successfully! Your updated talent balance will be reflected in your profile.`,
                                [{ text: 'OK' }]
                              );
                            }
                          } catch (error) {
                            console.error('Error completing transaction:', error);
                            Alert.alert('Error', 'Failed to complete transaction. Please try again.');
                          } finally {
                            setLoading(false);
                          }
                        }
                      }
                    ]
                  );
                } else {
                  // For non-talent transactions, proceed directly
                  const updatedTransaction = await TransactionService.updateTransactionStatus(
                    id as string,
                    'Completed'
                  );
                  console.log('Transaction completed successfully:', updatedTransaction);
                  setTransaction(updatedTransaction);

                  // Show success message
                  Alert.alert(
                    'Transaction Completed',
                    'The transaction has been completed successfully!',
                    [{ text: 'OK' }]
                  );

                  setLoading(false);
                }
              } catch (apiError: any) {
                console.error('API error completing transaction:', apiError);
                Alert.alert('API Error', 'Failed to complete transaction: ' + (apiError.message || 'Unknown error'));
              }
            } catch (error) {
              console.error('Error completing transaction:', error);
              Alert.alert('Error', 'Failed to complete transaction');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    if (!id) return;

    Alert.alert(
      'Cancel Transaction',
      'Are you sure you want to cancel this transaction?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes, Cancel',
          onPress: async () => {
            console.log('Cancel button pressed');
            try {
              setLoading(true);

              // Update transaction status via API
              console.log('Cancelling transaction:', id);
              try {
                const updatedTransaction = await TransactionService.updateTransactionStatus(
                  id as string,
                  'Cancelled'
                );
                console.log('Transaction cancelled successfully:', updatedTransaction);
                setTransaction(updatedTransaction);
              } catch (apiError: any) {
                console.error('API error cancelling transaction:', apiError);
                Alert.alert('API Error', 'Failed to cancel transaction: ' + (apiError.message || 'Unknown error'));
              }
            } catch (error) {
              console.error('Error cancelling transaction:', error);
              Alert.alert('Error', 'Failed to cancel transaction');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !transaction || !id) return;

    setSending(true);

    try {
      // Send message to API
      const updatedTransaction = await TransactionService.addTransactionMessage(
        id as string,
        newMessage.trim()
      );

      setTransaction(updatedTransaction);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <View style={styles.errorContainer}>
          <Icon name="lock" size={48} color={colors.text.secondary} />
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>
            Authentication Required
          </Text>
          <Text style={[styles.errorSubText, { color: colors.text.muted }]}>
            Please log in to view transaction details
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <Text style={[styles.errorText, { color: colors.text.primary }]}>
          Transaction not found
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initiator = transaction.initiator as User;
  const recipient = transaction.recipient as User;
  const listing = transaction.listing as any;

  return (
    <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
      <ScrollView style={styles.scrollView}>
        {/* Transaction Header */}
        <View style={styles.header}>
          <Text style={[styles.transactionTitle, { color: colors.text.primary }]}>
            {transaction.listing ? transaction.listing.title : 'Transaction'}
          </Text>

          <View style={styles.participantsHeader}>
            {/* Initiator */}
            <View style={styles.headerParticipant}>
              {initiator.avatar ? (
                <Image source={{ uri: initiator.avatar }} style={styles.headerAvatar} />
              ) : (
                <DefaultAvatar
                  name={initiator.fullName || ''}
                  userId={initiator._id}
                  size={40}
                  style={styles.headerAvatar}
                />
              )}
              <Text style={[styles.headerParticipantName, { color: colors.text.secondary }]}>
                {initiator.fullName}
              </Text>
            </View>

            {/* Exchange Icon */}
            <View style={styles.exchangeIconContainer}>
              <Icon name="exchange-alt" size={16} color={colors.text.muted} />
              <Text style={[styles.talentAmount, { color: colors.primary }]}>
                {transaction.type !== 'Direct Swap' ? `✦ ${transaction.talentAmount}` : ''}
              </Text>
            </View>

            {/* Recipient */}
            <View style={styles.headerParticipant}>
              {recipient.avatar ? (
                <Image source={{ uri: recipient.avatar }} style={styles.headerAvatar} />
              ) : (
                <DefaultAvatar
                  name={recipient.fullName || ''}
                  userId={recipient._id}
                  size={40}
                  style={styles.headerAvatar}
                />
              )}
              <Text style={[styles.headerParticipantName, { color: colors.text.secondary }]}>
                {recipient.fullName}
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(transaction.status) }
              ]}
            >
              <Text style={styles.statusText}>{transaction.status}</Text>
            </View>

            <Text style={[styles.date, { color: colors.text.secondary }]}>
              {formatDate(transaction.createdAt)}
            </Text>
          </View>

          <Text style={[styles.transactionId, { color: colors.text.muted }]}>
            ID: {transaction._id}
          </Text>
        </View>

        {/* User Balance */}
        <View style={[styles.section, { backgroundColor: colors.background.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Your Talent Balance
          </Text>
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceAmount, { color: colors.primary }]}>
              ✦ {user?.talentBalance || 0}
            </Text>
            <Text style={[styles.balanceLabel, { color: colors.text.secondary }]}>
              Available Talents
            </Text>
          </View>
        </View>

        {/* Transaction Details */}
        <View style={[styles.section, { backgroundColor: colors.background.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Transaction Details
          </Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
              Type:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text.primary }]}>
              {transaction.type}
            </Text>
          </View>

          {transaction.type !== 'Direct Swap' && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                Talents:
              </Text>
              <Text style={[styles.detailValue, { color: colors.primary }]}>
                ✦ {transaction.talentAmount}
              </Text>
            </View>
          )}

          {transaction.listing && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                Listing:
              </Text>
              <TouchableOpacity
                onPress={() => router.push(`/(app)/marketplace/${listing._id}`)}
              >
                <Text style={[styles.listingLink, { color: colors.accent }]}>
                  {listing.title}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Participants */}
        <View style={[styles.section, { backgroundColor: colors.background.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Participants
          </Text>

          <View style={styles.participant}>
            <Text style={[styles.participantLabel, { color: colors.text.secondary }]}>
              Initiator:
            </Text>
            <TouchableOpacity
              style={styles.participantInfo}
              onPress={() => router.push(`/(app)/profile/${initiator._id}`)}
            >
              {initiator.avatar ? (
                <Image source={{ uri: initiator.avatar }} style={styles.participantAvatar} />
              ) : (
                <DefaultAvatar
                  name={initiator.fullName || ''}
                  userId={initiator._id}
                  size={30}
                  style={styles.participantAvatar}
                />
              )}
              <Text style={[styles.participantName, { color: colors.text.primary }]}>
                {initiator.fullName}
              </Text>
              <FontAwesome5 name="chevron-right" size={14} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.participant}>
            <Text style={[styles.participantLabel, { color: colors.text.secondary }]}>
              Recipient:
            </Text>
            <TouchableOpacity
              style={styles.participantInfo}
              onPress={() => router.push(`/(app)/profile/${recipient._id}`)}
            >
              {recipient.avatar ? (
                <Image source={{ uri: recipient.avatar }} style={styles.participantAvatar} />
              ) : (
                <DefaultAvatar
                  name={recipient.fullName || ''}
                  userId={recipient._id}
                  size={30}
                  style={styles.participantAvatar}
                />
              )}
              <Text style={[styles.participantName, { color: colors.text.primary }]}>
                {recipient.fullName}
              </Text>
              <FontAwesome5 name="chevron-right" size={14} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <View style={[styles.section, { backgroundColor: colors.background.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Messages
          </Text>

          {transaction.messages.map((message, index) => {
            const isSender = isCurrentUser(message.sender as string);
            const senderUser = isSender ? user : (message.sender === initiator._id ? initiator : recipient);

            return (
              <View key={index} style={styles.message}>
                <View style={styles.messageHeader}>
                  <View style={styles.messageSenderContainer}>
                    {(senderUser as User)?.avatar ? (
                      <Image source={{ uri: (senderUser as User).avatar }} style={styles.messageAvatar} />
                    ) : (
                      <DefaultAvatar
                        name={(senderUser as User)?.fullName || 'User'}
                        userId={(senderUser as User)?._id || 'unknown'}
                        size={24}
                        style={styles.messageAvatar}
                      />
                    )}
                    <Text style={[styles.messageSender, { color: colors.accent }]}>
                      {(senderUser as User)?.fullName || 'User'}
                    </Text>
                  </View>
                  <Text style={[styles.messageTime, { color: colors.text.secondary }]}>
                    {formatDate(message.timestamp)}
                  </Text>
                </View>
                <Text style={[styles.messageContent, { color: colors.text.primary }]}>
                  {message.content}
                </Text>
              </View>
            );
          })}

          {/* New Message Input */}
          <View style={styles.messageInputContainer}>
            <TextInput
              style={[
                styles.messageInput,
                {
                  backgroundColor: colors.background.darker,
                  color: colors.text.primary,
                  borderColor: colors.border
                }
              ]}
              placeholder="Type a message..."
              placeholderTextColor={colors.text.muted}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: colors.primary },
                (!newMessage.trim() || sending) && { opacity: 0.7 }
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <FontAwesome5 name="paper-plane" size={16} color="#000" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction History */}
        <View style={[styles.section, { backgroundColor: colors.background.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Transaction History
          </Text>

          {transaction.statusHistory.map((item, index) => {
            // Handle different formats of updatedBy
            let updatedByName = 'Unknown';
            if (item.updatedBy) {
              if (typeof item.updatedBy === 'string') {
                // If it's just an ID, try to match with initiator or recipient
                if (item.updatedBy === (typeof initiator === 'string' ? initiator : initiator._id)) {
                  updatedByName = typeof initiator === 'string' ? 'Initiator' : initiator.fullName;
                } else if (item.updatedBy === (typeof recipient === 'string' ? recipient : recipient._id)) {
                  updatedByName = typeof recipient === 'string' ? 'Recipient' : recipient.fullName;
                } else {
                  updatedByName = `User ${item.updatedBy.substring(0, 6)}...`;
                }
              } else if (typeof item.updatedBy === 'object' && item.updatedBy !== null) {
                // If it's a user object
                updatedByName = (item.updatedBy as User).fullName || 'Unknown';
              }
            }

            // Get status description
            const getStatusDescription = (status: string) => {
              switch(status) {
                case 'Proposed': return 'Transaction was proposed';
                case 'Accepted': return 'Transaction was accepted';
                case 'Rejected': return 'Transaction was rejected';
                case 'Completed':
                  if (transaction.type === 'Talent' || transaction.type === 'Combined') {
                    return `Transaction completed with ${transaction.talentAmount} talents transferred`;
                  }
                  return 'Transaction was completed';
                case 'Cancelled': return 'Transaction was cancelled';
                case 'Disputed': return 'Transaction was marked as disputed';
                case 'Resolved': return 'Dispute was resolved';
                default: return `Status changed to ${status}`;
              }
            };

            return (
              <View
                key={index}
                style={[
                  styles.historyItem,
                  { borderLeftColor: getStatusColor(item.status as TransactionStatus) }
                ]}
              >
                <View style={styles.historyHeader}>
                  <View
                    style={[
                      styles.historyStatus,
                      { backgroundColor: getStatusColor(item.status as TransactionStatus) }
                    ]}
                  >
                    <Text style={styles.historyStatusText}>{item.status}</Text>
                  </View>
                  <Text style={[styles.historyTime, { color: colors.text.secondary }]}>
                    {formatDate(item.timestamp)}
                  </Text>
                </View>
                <Text style={[styles.historyDescription, { color: colors.text.primary }]}>
                  {getStatusDescription(item.status)}
                </Text>
                <Text style={[styles.historyUpdatedBy, { color: colors.text.muted }]}>
                  Updated by: {updatedByName}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionBar, { backgroundColor: colors.background.darker }]}>
        {canAccept() && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => {
              console.log('Accept button directly pressed');
              handleAccept();
            }}
          >
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
        )}

        {canReject() && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => {
              console.log('Reject button directly pressed');
              handleReject();
            }}
          >
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        )}

        {canComplete() && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => {
              console.log('Complete button directly pressed');
              handleComplete();
            }}
          >
            <Text style={styles.actionButtonText}>Complete</Text>
          </TouchableOpacity>
        )}

        {canCancel() && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => {
              console.log('Cancel button directly pressed');
              handleCancel();
            }}
          >
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: SPACING.large,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: SPACING.medium,
  },
  statusBadge: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SIZES.borderRadius.round,
    marginBottom: SPACING.medium,
    minWidth: 120,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  statusText: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    color: '#000',
  },
  transactionId: {
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.small,
  },
  date: {
    fontSize: FONT.sizes.small,
  },
  section: {
    margin: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
    ...SHADOWS.small,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(249, 200, 14, 0.7)', // Faded primary color
  },
  sectionTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    marginBottom: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: SPACING.small,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.small,
    borderRadius: SIZES.borderRadius.small,
  },
  detailLabel: {
    fontSize: FONT.sizes.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: FONT.sizes.small,
  },
  detailValue: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: SPACING.medium,
    backgroundColor: 'rgba(249, 200, 14, 0.1)',
    padding: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
  },
  balanceAmount: {
    fontSize: FONT.sizes.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  balanceLabel: {
    fontSize: FONT.sizes.small,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listingLink: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: '#F9C80E',
  },
  participant: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.small,
    borderRadius: SIZES.borderRadius.medium,
  },
  participantLabel: {
    fontSize: FONT.sizes.small,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: SPACING.small,
  },
  participantName: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    marginRight: SPACING.small,
  },
  message: {
    marginBottom: SPACING.medium,
    padding: SPACING.medium,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: SIZES.borderRadius.medium,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: SPACING.xs,
  },
  messageSenderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SPACING.xs,
  },
  messageSender: {
    fontSize: FONT.sizes.small,
    fontWeight: 'bold',
  },
  messageTime: {
    fontSize: FONT.sizes.xs,
  },
  messageContent: {
    fontSize: FONT.sizes.medium,
    lineHeight: 20,
  },
  messageInputContainer: {
    flexDirection: 'row',
    marginTop: SPACING.medium,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.small,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: SPACING.small,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  historyItem: {
    marginBottom: SPACING.medium,
    padding: SPACING.small,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: SIZES.borderRadius.medium,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  historyStatus: {
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.borderRadius.small,
  },
  historyStatusText: {
    fontSize: FONT.sizes.xs,
    fontWeight: 'bold',
    color: '#000',
  },
  historyTime: {
    fontSize: FONT.sizes.xs,
  },
  historyDescription: {
    fontSize: FONT.sizes.medium,
    marginBottom: SPACING.xs,
  },
  historyUpdatedBy: {
    fontSize: FONT.sizes.small,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
  },
  actionButtonText: {
    fontWeight: 'bold',
    color: '#000',
  },
  errorText: {
    fontSize: FONT.sizes.large,
    textAlign: 'center',
    marginBottom: SPACING.large,
    padding: SPACING.large,
  },
  button: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#000',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.large,
  },
  errorSubText: {
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
    marginBottom: SPACING.large,
  },
});