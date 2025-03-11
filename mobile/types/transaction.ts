import { User } from './auth';
import { Listing } from './listing';

export type TransactionStatus = 
  | 'Proposed'
  | 'Accepted'
  | 'Rejected'
  | 'Completed'
  | 'Cancelled'
  | 'Disputed'
  | 'Resolved';

export type TransactionType = 'Talent' | 'Direct Swap' | 'Combined';

export interface TransactionItem {
  description: string;
  images?: string[];
}

export interface TransactionMessage {
  sender: string | User;
  content: string;
  timestamp: string;
}

export interface TransactionRating {
  rating: number;
  comment?: string;
  timestamp?: string;
}

export interface StatusHistoryItem {
  status: TransactionStatus;
  timestamp: string;
  updatedBy: string | User;
}

export interface Transaction {
  _id: string;
  initiator: string | User;
  recipient: string | User;
  listing?: string | Listing;
  status: TransactionStatus;
  type: TransactionType;
  talentAmount: number;
  items: TransactionItem[];
  messages: TransactionMessage[];
  meetupLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  meetupTime?: string;
  initiatorRating?: TransactionRating;
  recipientRating?: TransactionRating;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  recipientId: string;
  listingId?: string;
  type: TransactionType;
  talentAmount?: number;
  items?: TransactionItem[];
  message?: string;
  meetupLocation?: {
    coordinates: [number, number];
    address: string;
  };
  meetupTime?: string;
}

export interface TransactionFilter {
  status?: TransactionStatus;
  role?: 'initiator' | 'recipient' | 'both';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'newest' | 'oldest';
  page?: number;
  limit?: number;
}