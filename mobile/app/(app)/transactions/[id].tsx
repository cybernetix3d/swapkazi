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
  const { user } = useAuth();
  const router = useRouter();
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  
  useEffect(() => {
    fetchTransaction();
  }, [id]);
  
  const fetchTransaction = async () => {
    setLoading(true);
    
    // In a real app, this would call an API
    // For now, we'll use mock data
    setTimeout(() => {
      setTransaction(mockTransaction);
      setLoading(false);
    }, 1000);
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
    return userId === user?._id;
  };
  
  const canAccept = () => {
    if (!transaction) return false;
    
    return (
      transaction.status === 'Proposed' &&
      !isCurrentUser((transaction.initiator as User)._id)
    );
  };
  
  const canReject = () => {
    if (!transaction) return false;
    
    return (
      transaction.status === 'Proposed' &&
      !isCurrentUser((transaction.initiator as User)._id)
    );
  };
  
  const canComplete = () => {
    if (!transaction) return false;
    
    return (
      transaction.status === 'Accepted' &&
      (isCurrentUser((transaction.initiator as User)._id) || isCurrentUser((transaction.recipient as User)._id))
    );
  };
  
  const canCancel = () => {
    if (!transaction) return false;
    
    return (
      (transaction.status === 'Proposed' || transaction.status === 'Accepted') &&
      (isCurrentUser((transaction.initiator as User)._id) || isCurrentUser((transaction.recipient as User)._id))
    );
  };
  
  const handleAccept = () => {
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
          onPress: () => {
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
          }
        }
      ]
    );
  };
  
  const handleReject = () => {
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
          onPress: () => {
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
          }
        }
      ]
    );
  };
  
  const handleComplete = () => {
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
          onPress: () => {
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
          }
        }
      ]
    );
  };
  
  const handleCancel = () => {
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
          onPress: () => {
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
          }
        }
      ]
    );
  };
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || sending || !transaction) return;
    
    setSending(true);
    
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
  };
  
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
            onPress={handleAccept}
          >
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
        )}
        
        {canReject() && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={handleReject}
          >
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        )}
        
        {canComplete() && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={handleComplete}
          >
            <Text style={styles.actionButtonText}>Complete</Text>
          </TouchableOpacity>
        )}
        
        {canCancel() && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={handleCancel}
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
});