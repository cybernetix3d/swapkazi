import api, { handleApiError } from './api';
import { 
  Conversation, 
  Message, 
  ConversationListItem,
  MessageFormData,
  ApiResponse,
  PaginatedResponse
} from '../types';

/**
 * Get all conversations for current user
 */
export const getConversations = async (): Promise<ConversationListItem[]> => {
  try {
    const response = await api.get<ApiResponse<ConversationListItem[]>>('/messages/conversations');

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch conversations');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get single conversation
 */
export const getConversation = async (id: string): Promise<Conversation> => {
  try {
    const response = await api.get<ApiResponse<Conversation>>(`/messages/conversations/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch conversation');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Create new conversation or get existing one
 */
export const createOrGetConversation = async (
  recipientId: string,
  listingId?: string
): Promise<Conversation> => {
  try {
    const response = await api.post<ApiResponse<Conversation>>('/messages/conversations', {
      recipientId,
      listingId
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create conversation');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (
  conversationId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Message>> => {
  try {
    const response = await api.get<PaginatedResponse<Message>>(
      `/messages/conversations/${conversationId}/messages`,
      {
        params: { page, limit }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch messages');
    }

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Send a message
 */
export const sendMessage = async (messageData: MessageFormData): Promise<Message> => {
  try {
    const response = await api.post<ApiResponse<Message>>('/messages', messageData);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to send message');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (conversationId: string): Promise<boolean> => {
  try {
    const response = await api.put<ApiResponse<{ success: boolean }>>(
      `/messages/conversations/${conversationId}/read`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to mark messages as read');
    }

    return true;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get unread messages count
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await api.get<ApiResponse<{ count: number }>>('/messages/unread/count');

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch unread count');
    }

    return response.data.data.count;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Upload message attachment
 */
export const uploadMessageAttachment = async (formData: FormData): Promise<{ url: string }> => {
  try {
    const response = await api.post<ApiResponse<{ url: string }>>(
      '/messages/attachments',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to upload attachment');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete conversation
 */
export const deleteConversation = async (id: string): Promise<boolean> => {
  try {
    const response = await api.delete<ApiResponse<{ success: boolean }>>(
      `/messages/conversations/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete conversation');
    }

    return true;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};