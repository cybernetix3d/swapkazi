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
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { Transaction, TransactionStatus, User } from '../../../types';
import * as TransactionService from '../../../services/transaction';
import config from '../../../config';

// Mock data (this would be fetched from API in a real app)
const mockTransaction: Transaction = {
  _id: '1',
  initiator: {
    _id: '1',
    username: 'current_user',
    email: 'user@example.com',
    fullName: 'Current User',
    skills: ['Coding', 'Design'],
    talentBalance: 50,
    location: {
      type: 'Point',
      coordinates: [18.4241, -33.9249],
      address: 'Cape Town, South Africa'
    },
    ratings: [],
    averageRating: 0,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  recipient: {
    _id: '2',
    username: 'thabo_m',
    email: 'thabo@example.com',
    fullName: 'Thabo M',
    skills: ['Crafts'],
    talentBalance: 50,
    location: {
      type: 'Point',
      coordinates: [18.4241, -33.9249],
      address: 'Khayelitsha, Cape Town'
    },
    ratings: [],
    averageRating: 4.5,
    isActive: true,
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-01-15T10:30:00Z'
  },
  listing: {
    _id: '1',
    user: '2',
    title: 'Handcrafted Pottery',
    description: 'Beautiful handmade clay pots and vases.',
    category: 'Crafts',
    subCategory: 'Pottery',
    images: [{ url: 'https://via.placeholder.com/150' }],
    condition: 'New',
    listingType: 'Offer',
    exchangeType: 'Both',
    talentPrice: 15,
    swapFor: 'Gardening tools',
    location: {
      type: 'Point',
      coordinates: [18.4241, -33.9249],
      address: 'Khayelitsha, Cape Town'
    },
    isActive: true,
    isFeatured: true,
    views: 45,
    likes: [],
    expiresAt: '2023-03-15T10:30:00Z',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-01-15T10:30:00Z'
  },
  status: 'Proposed',
  type: 'Talent',
  talentAmount: 15,
  items: [],
  messages: [
    {
      sender: '1',
      content: 'Hi, I would like to purchase your pottery with Talents.',
      timestamp: '2023-02-10T15:30:00Z'
    },
    {
      sender: '2',
      content: 'Yes, that sounds good. When would you like to meet?',
      timestamp: '2023-02-10T16:00:00Z'
    }
  ],
  statusHistory: [
    {
      status: 'Proposed',
      timestamp: '2023-02-10T15:30:00Z',
      updatedBy: '1'
    }
  ],
  createdAt: '2023-02-10T15:30:00Z',
  updatedAt: '2023-02-10T15:30:00Z'
};

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const router = useRouter();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

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
      // Use mock data if enabled in config
      if (config.enableMockData) {
        console.log('Using mock data for transaction');
        // For now, we'll use mock data
        setTimeout(() => {
          setTransaction(mockTransaction);
          console.log('Set mock transaction data:', mockTransaction);
          setLoading(false);
        }, 1000);
        return;
      }

      // Get transaction from API
      console.log('Fetching transaction from API');
      const data = await TransactionService.getTransactionById(id as string);
      console.log('Transaction data received:', data);
      setTransaction(data);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      Alert.alert('Error', 'Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'Proposed':
        return colors.warning;
      case 'Accepted':
        return colors.info;
      case 'Completed':
        return colors.success;
      case 'Rejected':
      case 'Cancelled':
        return colors.error;
      case 'Disputed':
        return colors.error;
      case 'Resolved':
        return colors.accent;
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

              // Use mock data if enabled in config
              if (config.enableMockData) {
                // In a real app, this would call an API
                if (transaction) {
                  const updatedTransaction = { ...transaction, status: 'Accepted' as TransactionStatus };
                  updatedTransaction.statusHistory.push({
                    status: 'Accepted',
                    timestamp: new Date().toISOString(),
                    updatedBy: user?._id || ''
                  });
                  setTransaction(updatedTransaction);
                }
                setLoading(false);
                return;
              }

              // Update transaction status via API
              console.log('Accepting transaction:', id);
              try {
                const updatedTransaction = await TransactionService.updateTransactionStatus(
                  id as string,
                  'Accepted'
                );
                console.log('Transaction accepted successfully:', updatedTransaction);
                setTransaction(updatedTransaction);
              } catch (apiError) {
                console.error('API error accepting transaction:', apiError);
                Alert.alert('API Error', 'Failed to accept transaction: ' + apiError.message);
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

              // Use mock data if enabled in config
              if (config.enableMockData) {
                // In a real app, this would call an API
                if (transaction) {
                  const updatedTransaction = { ...transaction, status: 'Rejected' as TransactionStatus };
                  updatedTransaction.statusHistory.push({
                    status: 'Rejected',
                    timestamp: new Date().toISOString(),
                    updatedBy: user?._id || ''
                  });
                  setTransaction(updatedTransaction);
                }
                setLoading(false);
                return;
              }

              // Update transaction status via API
              console.log('Rejecting transaction:', id);
              try {
                const updatedTransaction = await TransactionService.updateTransactionStatus(
                  id as string,
                  'Rejected'
                );
                console.log('Transaction rejected successfully:', updatedTransaction);
                setTransaction(updatedTransaction);
              } catch (apiError) {
                console.error('API error rejecting transaction:', apiError);
                Alert.alert('API Error', 'Failed to reject transaction: ' + apiError.message);
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

              // Use mock data if enabled in config
              if (config.enableMockData) {
                // In a real app, this would call an API
                if (transaction) {
                  const updatedTransaction = { ...transaction, status: 'Completed' as TransactionStatus };
                  updatedTransaction.statusHistory.push({
                    status: 'Completed',
                    timestamp: new Date().toISOString(),
                    updatedBy: user?._id || ''
                  });
                  setTransaction(updatedTransaction);
                }
                setLoading(false);
                return;
              }

              // Update transaction status via API
              console.log('Completing transaction:', id);
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
                }
              } catch (apiError) {
                console.error('API error completing transaction:', apiError);
                Alert.alert('API Error', 'Failed to complete transaction: ' + apiError.message);
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

              // Use mock data if enabled in config
              if (config.enableMockData) {
                // In a real app, this would call an API
                if (transaction) {
                  const updatedTransaction = { ...transaction, status: 'Cancelled' as TransactionStatus };
                  updatedTransaction.statusHistory.push({
                    status: 'Cancelled',
                    timestamp: new Date().toISOString(),
                    updatedBy: user?._id || ''
                  });
                  setTransaction(updatedTransaction);
                }
                setLoading(false);
                return;
              }

              // Update transaction status via API
              console.log('Cancelling transaction:', id);
              try {
                const updatedTransaction = await TransactionService.updateTransactionStatus(
                  id as string,
                  'Cancelled'
                );
                console.log('Transaction cancelled successfully:', updatedTransaction);
                setTransaction(updatedTransaction);
              } catch (apiError) {
                console.error('API error cancelling transaction:', apiError);
                Alert.alert('API Error', 'Failed to cancel transaction: ' + apiError.message);
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
      // Use mock data if enabled in config
      if (config.enableMockData) {
        // In a real app, this would call an API
        const updatedTransaction = { ...transaction };
        updatedTransaction.messages.push({
          sender: user?._id || '',
          content: newMessage.trim(),
          timestamp: new Date().toISOString()
        });

        setTransaction(updatedTransaction);
        setNewMessage('');

        // Simulate API delay
        setTimeout(() => {
          setSending(false);
        }, 500);
        return;
      }

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
          <FontAwesome5 name="lock" size={48} color={colors.text.secondary} />
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
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(transaction.status) }
            ]}
          >
            <Text style={styles.statusText}>{transaction.status}</Text>
          </View>

          <Text style={[styles.transactionId, { color: colors.text.secondary }]}>
            ID: {transaction._id}
          </Text>

          <Text style={[styles.date, { color: colors.text.secondary }]}>
            Created: {formatDate(transaction.createdAt)}
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
                  <Text style={[styles.messageSender, { color: colors.accent }]}>
                    {(senderUser as User)?.fullName || 'User'}
                  </Text>
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
            const updatedByUser = item.updatedBy === initiator._id ? initiator : recipient;

            return (
              <View key={index} style={styles.historyItem}>
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
                <Text style={[styles.historyUpdatedBy, { color: colors.text.primary }]}>
                  Updated by: {(updatedByUser as User)?.fullName || 'User'}
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
  },
  statusBadge: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SIZES.borderRadius.round,
    marginBottom: SPACING.medium,
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
    marginBottom: SPACING.small,
  },
  detailLabel: {
    fontSize: FONT.sizes.medium,
  },
  detailValue: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: SPACING.medium,
  },
  balanceAmount: {
    fontSize: FONT.sizes.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  balanceLabel: {
    fontSize: FONT.sizes.small,
  },
  listingLink: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  participant: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  participantLabel: {
    fontSize: FONT.sizes.medium,
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
    padding: SPACING.small,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: SIZES.borderRadius.medium,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
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