// Path: mobile/app/(app)/transactions/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Image
} from 'react-native';
import ErrorMessage from '../../../components/ErrorMessage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useRouter } from 'expo-router';
import Icon from '../../../components/ui/Icon';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { FONT, SPACING, SIZES, SHADOWS } from '../../../constants/Theme';
import DefaultAvatar from '../../../components/DefaultAvatar';
import { Transaction, TransactionStatus, TransactionFilter, StatusHistoryItem } from '../../../types';
import * as TransactionService from '../../../services/transaction';

// Mock data for development - no longer used
/* const mockTransactions: Transaction[] = [
  {
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
      user: '2', // Add the missing user property to fix the TypeScript error
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
        content: 'I would like to purchase your pottery with Talents.',
        timestamp: '2023-02-10T15:30:00Z'
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
  },
  {
    _id: '2',
    initiator: {
      _id: '3',
      username: 'lerato_k',
      email: 'lerato@example.com',
      fullName: 'Lerato K',
      skills: ['Gardening'],
      talentBalance: 75,
      location: {
        type: 'Point',
        coordinates: [18.4641, -33.9249],
        address: 'Gugulethu, Cape Town'
      },
      ratings: [],
      averageRating: 4.8,
      isActive: true,
      createdAt: '2023-01-10T09:20:00Z',
      updatedAt: '2023-01-10T09:20:00Z'
    },
    recipient: {
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
    listing: {
      _id: '2',
      user: '1', // Add the missing user property to fix the TypeScript error
      title: 'Website Design Services',
      description: 'Professional website design and development.',
      category: 'Services',
      subCategory: 'Digital',
      images: [{ url: 'https://via.placeholder.com/150' }],
      condition: 'Not Applicable',
      listingType: 'Offer',
      exchangeType: 'Talent',
      talentPrice: 30,
      location: {
        type: 'Point',
        coordinates: [18.4241, -33.9249],
        address: 'Cape Town, South Africa'
      },
      isActive: true,
      isFeatured: false,
      views: 25,
      likes: [],
      expiresAt: '2023-03-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    status: 'Accepted',
    type: 'Talent',
    talentAmount: 30,
    items: [],
    messages: [
      {
        sender: '3',
        content: 'I would like to hire you for website design services.',
        timestamp: '2023-02-05T10:00:00Z'
      }
    ],
    statusHistory: [
      {
        status: 'Proposed',
        timestamp: '2023-02-05T10:00:00Z',
        updatedBy: '3'
      },
      {
        status: 'Accepted',
        timestamp: '2023-02-05T14:30:00Z',
        updatedBy: '1'
      }
    ],
    createdAt: '2023-02-05T10:00:00Z',
    updatedAt: '2023-02-05T14:30:00Z'
  }
]; */

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilters, setStatusFilters] = useState<(TransactionStatus | 'All')[]>(['All']);

  // Define styles inside the component to access the theme colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    filterContainer: {
      paddingHorizontal: 10,
      paddingVertical: 0,
      borderBottomWidth: 0,
      marginBottom: 0,
      height: 'auto',
      marginTop: 0,
    },
    filterButton: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 15,
      marginRight: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      minWidth: 50,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      height: 26,
    },
    filterText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text.secondary,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    transactionItem: {
      marginHorizontal: SPACING.small,
      marginTop: 2,
      marginBottom: 4,
      borderRadius: 8,
      padding: SPACING.small,
      borderLeftWidth: 3,
      borderWidth: 1,
      borderLeftColor: colors.primary,
    },
    transactionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      paddingBottom: 4,
    },
    transactionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      minWidth: 60,
      alignItems: 'center',
    },
    statusText: {
      fontSize: FONT.sizes.xs,
      fontWeight: 'bold',
      color: '#000',
    },
    transactionDetails: {
      flexDirection: 'row',
      paddingTop: 4,
      flexWrap: 'wrap',
    },
    detailItem: {
      backgroundColor: colors.background.input,
      padding: 4,
      borderRadius: 4,
      minWidth: 65,
      marginRight: 4,
      marginBottom: 4,
    },
    detailLabel: {
      fontSize: 9,
      marginBottom: 2,
      color: colors.text.secondary,
    },
    detailValue: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.large,
      marginTop: SPACING.xxl,
    },
    emptyText: {
      fontSize: FONT.sizes.large,
      marginTop: SPACING.medium,
      marginBottom: SPACING.small,
      fontWeight: 'bold',
    },
    emptySubText: {
      fontSize: FONT.sizes.medium,
      textAlign: 'center',
      marginBottom: SPACING.large,
      lineHeight: 22,
    },
    loginButton: {
      paddingHorizontal: SPACING.large,
      paddingVertical: SPACING.medium,
      borderRadius: SIZES.borderRadius.medium,
      marginTop: SPACING.medium,
      ...SHADOWS.medium,
    },
    loginButtonText: {
      fontSize: FONT.sizes.medium,
      fontWeight: 'bold',
      color: '#000',
    },
    participantsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.small,
      paddingBottom: SPACING.small,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    participantContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    participantAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: SPACING.xs,
    },
    participantName: {
      fontSize: 12,
      flex: 1,
    },
    exchangeIcon: {
      marginHorizontal: SPACING.small,
    },
  });

  useEffect(() => {
    fetchTransactions();
  }, [statusFilters]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null); // Reset error state

    // If not authenticated, don't try to fetch transactions
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping transaction fetch');
      setTransactions([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // Prepare filter
      const filter: TransactionFilter = {};

      if (!statusFilters.includes('All')) {
        // The backend expects a single status value
        filter.status = statusFilters[0] as TransactionStatus;
      }

      console.log('Fetching transactions with filter:', filter);

      // Get transactions from API
      const response = await TransactionService.getTransactions(filter);
      console.log('Transaction response:', response);

      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        setTransactions([]);
        setError('No transactions found. The response format was unexpected.');
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      setError('Failed to fetch transactions: ' + (error.message || 'Please check your connection and try again.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
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
        return colors.error;
      case 'Cancelled':
        return colors.error;
      case 'Disputed':
        return colors.secondary;
      case 'Resolved':
        return colors.accent;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: TransactionStatus | 'All') => {
    const iconColor = status === 'All' ? colors.primary : getStatusColor(status as TransactionStatus);
    const activeColor = statusFilters.includes(status) ? '#000' : iconColor;

    switch (status) {
      case 'All':
        return null;
      case 'Proposed':
        return <Icon name="handshake" size={8} color={activeColor} />;
      case 'Accepted':
        return <Icon name="check-circle" size={8} color={activeColor} />;
      case 'Completed':
        return <Icon name="check-double" size={8} color={activeColor} />;
      case 'Rejected':
        return <Icon name="times-circle" size={8} color={activeColor} />;
      case 'Cancelled':
        return <Icon name="ban" size={8} color={activeColor} />;
      case 'Disputed':
        return <Icon name="exclamation-triangle" size={8} color={activeColor} />;
      case 'Resolved':
        return <Icon name="balance-scale" size={8} color={activeColor} />;
      default:
        return null;
    }
  };

  const isCurrentUser = (userId: string) => {
    return userId === user?._id;
  };

  // Helper function to format the last action from status history
  const formatLastAction = (statusHistory: StatusHistoryItem[]) => {
    if (!statusHistory || statusHistory.length === 0) return 'No actions';

    // Get the most recent status change
    const lastAction = statusHistory[statusHistory.length - 1];

    // Format the date
    const date = new Date(lastAction.timestamp);
    const formattedDate = date.toLocaleDateString();

    // Return a user-friendly message
    return `${lastAction.status} on ${formattedDate}`;
  };

  const getTransactionTitle = (transaction: Transaction) => {
    const userIsInitiator = isCurrentUser((transaction.initiator as any)._id);
    const otherParty = userIsInitiator ? transaction.recipient : transaction.initiator;
    const otherPartyName = typeof otherParty === 'string'
      ? 'User'
      : (otherParty as any).fullName;

    if (transaction.listing) {
      return userIsInitiator
        ? `${(transaction.listing as any).title} for ${otherPartyName}`
        : `${otherPartyName}'s ${(transaction.listing as any).title}`;
    } else {
      return userIsInitiator
        ? `Transaction with ${otherPartyName}`
        : `Transaction with ${otherPartyName}`;
    }
  };

  const renderStatusFilter = () => {
    const statuses: (TransactionStatus | 'All')[] = [
      'All', 'Proposed', 'Accepted', 'Completed', 'Rejected', 'Cancelled', 'Disputed', 'Resolved'
    ];

    const toggleFilter = (status: TransactionStatus | 'All') => {
      // For simplicity, just select one filter at a time
      if (statusFilters[0] === status) {
        // If clicking the already selected filter, go back to 'All'
        setStatusFilters(['All']);
      } else {
        // Otherwise, select just this filter
        setStatusFilters([status]);
      }
    };

    return (
      <View style={{ marginBottom: 8, paddingTop: 10 }}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary, marginLeft: 10, marginBottom: 8 }]}>Filter by Status</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={{ paddingVertical: 5, paddingHorizontal: 5 }}
        >
        {statuses.map((status) => {
          const isActive = statusFilters.includes(status);
          const statusColor = status === 'All' ? colors.primary : getStatusColor(status as TransactionStatus);

          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                isActive && {
                  backgroundColor: statusColor,
                  borderColor: statusColor
                }
              ]}
              onPress={() => toggleFilter(status)}
            >
              <>
                {getStatusIcon(status)}
                <Text
                  style={[
                    styles.filterText,
                    isActive && { color: '#000', fontWeight: 'bold' },
                    { marginLeft: status !== 'All' ? 4 : 0 }
                  ]}
                >
                  {status}
                </Text>
              </>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      </View>
    );
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <View style={styles.emptyContainer}>
          <Icon name="lock" size={48} color={colors.text.secondary} />
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
            Authentication Required
          </Text>
          <Text style={[styles.emptySubText, { color: colors.text.muted }]}>
            Please log in to view your transactions
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <LoadingIndicator message="Loading transactions..." fullScreen />
      </View>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        {renderStatusFilter()}
        <ErrorMessage
          message={error}
          onRetry={fetchTransactions}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
      <FlatList
        ListHeaderComponent={<>
          {renderStatusFilter()}
          <View style={{ paddingHorizontal: 15, paddingTop: 10, paddingBottom: 5 }}>
            <View style={{ height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginBottom: 10 }} />
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Your Transactions</Text>
          </View>
        </>}
        style={{ flex: 1 }}
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.transactionItem,
              {
                backgroundColor: colors.background.card,
                borderLeftColor: getStatusColor(item.status),
                borderColor: colors.border,
                ...colors.shadows.small
              }
            ]}
            onPress={() => router.push(`/(app)/transactions/${item._id}`)}
          >
            <View style={styles.transactionHeader}>
              <Text style={[styles.transactionTitle, { color: colors.text.primary }]}>
                {getTransactionTitle(item)}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) }
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.transactionDetails}>
              {/* Participants */}
              <View style={styles.participantsRow}>
                {/* Initiator */}
                <View style={styles.participantContainer}>
                  {typeof item.initiator === 'string' ? (
                    <DefaultAvatar
                      name="User"
                      userId={item.initiator}
                      size={24}
                      style={styles.participantAvatar}
                    />
                  ) : item.initiator.avatar ? (
                    <Image source={{ uri: item.initiator.avatar }} style={styles.participantAvatar} />
                  ) : (
                    <DefaultAvatar
                      name={item.initiator.fullName || ''}
                      userId={item.initiator._id}
                      size={24}
                      style={styles.participantAvatar}
                    />
                  )}
                  <Text style={[styles.participantName, { color: colors.text.secondary }]}>
                    {typeof item.initiator === 'string' ? 'User' : item.initiator.fullName}
                  </Text>
                </View>

                <Icon name="exchange-alt" size={12} color={colors.text.muted} style={styles.exchangeIcon} />

                {/* Recipient */}
                <View style={styles.participantContainer}>
                  {typeof item.recipient === 'string' ? (
                    <DefaultAvatar
                      name="User"
                      userId={item.recipient}
                      size={24}
                      style={styles.participantAvatar}
                    />
                  ) : item.recipient.avatar ? (
                    <Image source={{ uri: item.recipient.avatar }} style={styles.participantAvatar} />
                  ) : (
                    <DefaultAvatar
                      name={item.recipient.fullName || ''}
                      userId={item.recipient._id}
                      size={24}
                      style={styles.participantAvatar}
                    />
                  )}
                  <Text style={[styles.participantName, { color: colors.text.secondary }]}>
                    {typeof item.recipient === 'string' ? 'User' : item.recipient.fullName}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>
                  Type
                </Text>
                <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                  {item.type}
                </Text>
              </View>

              {item.type !== 'Direct Swap' && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>
                    Talents
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.primary }]}>
                    ✦ {item.talentAmount}
                  </Text>
                </View>
              )}

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>
                  Date
                </Text>
                <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>
                  Last Action
                </Text>
                <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                  {item.statusHistory && item.statusHistory.length > 0
                    ? formatLastAction(item.statusHistory)
                    : 'No actions yet'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="exchange-alt" size={48} color={colors.text.secondary} />
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No transactions found
            </Text>
            <Text style={[styles.emptySubText, { color: colors.text.muted }]}>
              {!statusFilters.includes('All')
                ? `Try a different filter or create new transactions`
                : `Start transactions by offering or requesting items in the marketplace`
              }
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// Styles moved inside the component to access theme colors