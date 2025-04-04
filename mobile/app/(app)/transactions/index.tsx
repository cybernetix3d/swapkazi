// Path: mobile/app/(app)/transactions/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { FONT, SPACING, SIZES } from '../../../constants/Theme';
import { Transaction, TransactionStatus, User, TransactionFilter } from '../../../types';
import * as TransactionService from '../../../services/transaction';
import config from '../../../config';

// Mock data for development
const mockTransactions: Transaction[] = [
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
];

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { user, isAuthenticated, logout, login } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'All'>('All');

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    setLoading(true);

    // If not authenticated, don't try to fetch transactions
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping transaction fetch');
      setTransactions([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // Use mock data if enabled in config
      if (config.enableMockData) {
        // For now, we'll use mock data
        setTimeout(() => {
          let filteredTransactions = [...mockTransactions];

          // Apply status filter if not "All"
          if (statusFilter !== 'All') {
            filteredTransactions = filteredTransactions.filter(
              transaction => transaction.status === statusFilter
            );
          }

          setTransactions(filteredTransactions);
          setLoading(false);
          setRefreshing(false);
        }, 1000);
        return;
      }

      // Prepare filter
      const filter: TransactionFilter = {};

      if (statusFilter !== 'All') {
        filter.status = statusFilter as TransactionStatus;
      }

      console.log('Fetching transactions with filter:', filter);

      // Get transactions from API
      const response = await TransactionService.getTransactions(filter);
      console.log('Transaction response:', response);

      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
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

  const isCurrentUser = (userId: string) => {
    return userId === user?._id;
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

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              statusFilter === status && {
                backgroundColor: status === 'All' ? colors.primary : getStatusColor(status as TransactionStatus)
              }
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === status && { color: '#000' }
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="lock" size={48} color={colors.text.secondary} />
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
      {/* Status Filter */}
      {renderStatusFilter()}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.transactionItem, { backgroundColor: colors.background.card }]}
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
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                  Type
                </Text>
                <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                  {item.type}
                </Text>
              </View>

              {item.type !== 'Direct Swap' && (
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                    Talents
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.primary }]}>
                    ✦ {item.talentAmount}
                  </Text>
                </View>
              )}

              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                  Date
                </Text>
                <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                  {new Date(item.createdAt).toLocaleDateString()}
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
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="exchange-alt" size={48} color={colors.text.secondary} />
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No transactions found
            </Text>
            <Text style={[styles.emptySubText, { color: colors.text.muted }]}>
              {statusFilter !== 'All'
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  filterButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: SIZES.borderRadius.round,
    marginRight: SPACING.small,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterText: {
    fontSize: FONT.sizes.small,
    color: 'rgba(255, 255, 255, 0.7)', // Fixed COLORS reference
  },
  transactionItem: {
    marginHorizontal: SPACING.medium,
    marginVertical: SPACING.small,
    borderRadius: SIZES.borderRadius.medium,
    padding: SPACING.medium,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  transactionTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.borderRadius.small,
  },
  statusText: {
    fontSize: FONT.sizes.xs,
    fontWeight: 'bold',
    color: '#000',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {},
  detailLabel: {
    fontSize: FONT.sizes.xs,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: FONT.sizes.small,
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
  },
  emptySubText: {
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
    marginBottom: SPACING.large,
  },
  loginButton: {
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderRadius: SIZES.borderRadius.medium,
    marginTop: SPACING.medium,
  },
  loginButtonText: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    color: '#fff',
  },
});