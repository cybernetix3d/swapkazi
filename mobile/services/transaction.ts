import api, { handleApiError } from './api';
import {
  Transaction,
  TransactionStatus,
  TransactionFormData,
  TransactionFilter,
  TransactionRating,
  ApiResponse,
  PaginatedResponse
} from '../types';

/**
 * Get all transactions with optional filters
 */
export const getTransactions = async (filters?: TransactionFilter): Promise<PaginatedResponse<Transaction>> => {
  try {
    const response = await api.get<PaginatedResponse<Transaction>>('/transactions', {
      params: filters,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch transactions');
    }

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (id: string): Promise<Transaction> => {
  try {
    console.log(`Fetching transaction with ID: ${id}`);
    const response = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    console.log('Transaction API response:', response.data);

    if (!response.data.success || !response.data.data) {
      console.error('API error:', response.data.message);
      throw new Error(response.data.message || 'Failed to fetch transaction');
    }

    console.log('Transaction data:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error in getTransactionById:', error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Create new transaction
 */
export const createTransaction = async (transactionData: TransactionFormData): Promise<Transaction> => {
  try {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', transactionData);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create transaction');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (
  id: string,
  status: TransactionStatus
): Promise<Transaction> => {
  try {
    console.log(`Updating transaction ${id} status to ${status}`);

    const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}/status`, { status });
    console.log('API response:', response.data);

    if (!response.data.success || !response.data.data) {
      console.error('API error:', response.data.message);
      throw new Error(response.data.message || 'Failed to update transaction status');
    }

    console.log('Transaction status updated successfully');
    return response.data.data;
  } catch (error) {
    console.error('Error in updateTransactionStatus:', error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Add message to transaction
 */
export const addTransactionMessage = async (
  id: string,
  content: string
): Promise<Transaction> => {
  try {
    const response = await api.post<ApiResponse<Transaction>>(`/transactions/${id}/messages`, { content });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to add message');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update transaction meetup details
 */
export const updateTransactionMeetup = async (
  id: string,
  meetupTime: string,
  meetupLocation: {
    coordinates: [number, number];
    address: string;
  }
): Promise<Transaction> => {
  try {
    const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}/meetup`, {
      meetupTime,
      meetupLocation
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update meetup details');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Rate transaction
 */
export const rateTransaction = async (
  id: string,
  rating: TransactionRating
): Promise<Transaction> => {
  try {
    const response = await api.post<ApiResponse<Transaction>>(`/transactions/${id}/rate`, rating);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to rate transaction');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Report transaction (for disputes)
 */
export const reportTransaction = async (
  id: string,
  reason: string,
  details: string
): Promise<{ success: boolean; caseNumber?: string }> => {
  try {
    const response = await api.post<ApiResponse<{ success: boolean; caseNumber?: string }>>(
      `/transactions/${id}/report`,
      { reason, details }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to report transaction');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get transaction history for a specific user
 */
export const getUserTransactionHistory = async (
  userId: string,
  filters?: Omit<TransactionFilter, 'user'>
): Promise<PaginatedResponse<Transaction>> => {
  try {
    const response = await api.get<PaginatedResponse<Transaction>>(`/users/${userId}/transactions`, {
      params: filters,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user transactions');
    }

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get pending transactions count
 */
export const getPendingTransactionsCount = async (): Promise<number> => {
  try {
    const response = await api.get<ApiResponse<{ count: number }>>('/transactions/pending/count');

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch pending count');
    }

    return response.data.data.count;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};