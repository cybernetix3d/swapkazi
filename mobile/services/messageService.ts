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
    console.log('Fetching all conversations');
    const response = await api.get<any>('/messages/conversations');

    console.log('Conversations response:', JSON.stringify(response.data));

    // Get the current user ID to determine the other participant
    const userResponse = await api.get<any>('/users/me');
    const currentUserId = userResponse.data._id || userResponse.data.data?._id;
    console.log('Current user ID:', currentUserId);

    // Process the conversations data
    let conversations: any[] = [];

    // Handle different response formats
    if (Array.isArray(response.data)) {
      // Direct array of conversations
      console.log('Server returned direct array of conversations');
      conversations = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      // Wrapped in data property
      console.log('Server returned wrapped conversations object');
      conversations = response.data.data;
    } else if (response.data.conversations && Array.isArray(response.data.conversations)) {
      // Conversations property
      console.log('Server returned conversations in conversations property');
      conversations = response.data.conversations;
    } else if (!response.data.success) {
      // Error response
      throw new Error(response.data.message || 'Failed to fetch conversations');
    } else {
      // Empty or unexpected format
      console.error('Unexpected response format:', response.data);
      return [];
    }

    // Process each conversation to ensure otherParticipant is properly set
    return conversations.map(conversation => {
      // Create a properly formatted conversation item
      const conversationItem: ConversationListItem = {
        ...conversation,
        otherParticipant: {
          _id: '',
          username: '',
          email: '',
          fullName: 'Unknown User',
          skills: [],
          talentBalance: 0,
          location: {
            type: 'Point',
            coordinates: [0, 0],
            address: ''
          },
          ratings: [],
          averageRating: 0,
          isActive: true,
          createdAt: '',
          updatedAt: ''
        },
        lastMessageContent: conversation.lastMessageContent || 'No messages yet',
        lastMessageTime: conversation.lastMessageTime || conversation.updatedAt || conversation.createdAt
      };

      // Find the other participant
      if (conversation.participants && Array.isArray(conversation.participants)) {
        // If participants are full user objects
        const otherParticipant = conversation.participants.find(p => {
          if (typeof p === 'string') {
            return p !== currentUserId;
          } else if (p && typeof p === 'object' && p._id) {
            return p._id !== currentUserId;
          }
          return false;
        });

        if (otherParticipant) {
          if (typeof otherParticipant === 'string') {
            // If it's just an ID, we need to create a placeholder user
            conversationItem.otherParticipant = {
              ...conversationItem.otherParticipant,
              _id: otherParticipant,
              fullName: `User ${otherParticipant.substring(0, 5)}...`
            };
          } else if (otherParticipant && typeof otherParticipant === 'object') {
            // If it's a user object, use it directly
            conversationItem.otherParticipant = otherParticipant as User;
          }
        }
      }

      // If there's already an otherParticipant property, use it
      if (conversation.otherParticipant && typeof conversation.otherParticipant === 'object') {
        conversationItem.otherParticipant = conversation.otherParticipant;
      }

      return conversationItem;
    });
  } catch (error: any) {
    console.error('Error in getConversations:', error);

    // Log detailed error information
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data));
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received. Request:', JSON.stringify(error.request));
    } else {
      console.error('Error message:', error.message);
    }

    // Return empty array instead of throwing
    return [];
  }
};

/**
 * Get single conversation
 */
export const getConversation = async (id: string): Promise<Conversation> => {
  try {
    console.log(`Fetching conversation with ID: ${id}`);
    const response = await api.get<any>(`/messages/conversations/${id}`);

    console.log('Conversation response:', JSON.stringify(response.data));

    // Handle different response formats
    if (Array.isArray(response.data)) {
      // The server returns an empty array when the conversation doesn't exist
      // or when there are no messages yet
      if (response.data.length === 0) {
        console.log('Server returned empty array, creating placeholder conversation');
        // Return a placeholder conversation with the ID
        return {
          _id: id,
          participants: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else {
        // If it's a non-empty array, it might be the messages
        console.log('Server returned array of messages instead of conversation');
        // Return a placeholder conversation with the ID and messages
        return {
          _id: id,
          participants: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    } else if (response.data._id) {
      // Direct conversation object
      console.log('Server returned direct conversation object');
      return response.data;
    } else if (response.data.data && response.data.data._id) {
      // Wrapped in data property
      console.log('Server returned wrapped conversation object');
      return response.data.data;
    } else if (!response.data.success) {
      // Error response
      throw new Error(response.data.message || 'Failed to fetch conversation');
    } else {
      // Unexpected format
      console.error('Unexpected response format:', response.data);
      throw new Error('Invalid conversation data format in response');
    }
  } catch (error) {
    console.error('Error in getConversation:', error);
    // Return a placeholder conversation as a fallback
    return {
      _id: id,
      participants: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
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
    console.log('Creating conversation with userId:', recipientId);
    const response = await api.post<any>('/messages/conversations', {
      userId: recipientId, // Server expects 'userId', not 'recipientId'
      listingId
    });

    console.log('Conversation response:', response.data);

    // Handle different response formats
    if (response.data._id) {
      // Direct conversation object
      console.log('Server returned direct conversation object');
      return response.data;
    } else if (response.data.data && response.data.data._id) {
      // Wrapped in data property
      console.log('Server returned wrapped conversation object');
      return response.data.data;
    } else if (!response.data.success) {
      // Error response
      throw new Error(response.data.message || 'Failed to create conversation');
    } else {
      // Unexpected format
      console.error('Unexpected response format:', response.data);
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Failed to create conversation:', error);
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
): Promise<Message[] | PaginatedResponse<Message>> => {
  try {
    console.log(`Fetching messages for conversation: ${conversationId}, page: ${page}, limit: ${limit}`);
    const response = await api.get<any>(
      `/messages/conversations/${conversationId}`,
      {
        params: { page, limit }
      }
    );

    console.log('Messages response:', JSON.stringify(response.data));

    // Handle different response formats
    if (Array.isArray(response.data)) {
      // Direct array of messages - this is the expected format from the server
      console.log('Server returned direct array of messages');
      return response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      // Wrapped in data property
      console.log('Server returned wrapped messages object');
      return {
        data: response.data.data,
        page: response.data.page || page,
        limit: response.data.limit || limit,
        total: response.data.total || response.data.data.length,
        pages: response.data.pages || 1,
        success: true
      };
    } else if (response.data.success && response.data.data) {
      // Standard API response format
      console.log('Server returned standard API response format');
      return response.data;
    } else if (!response.data.success) {
      // Error response
      throw new Error(response.data.message || 'Failed to fetch messages');
    } else {
      // Empty or unexpected format
      console.log('Empty or unexpected response format, returning empty array');
      return [];
    }
  } catch (error: any) {
    console.error('Error in getMessages:', error);

    // Log detailed error information
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data));
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received. Request:', JSON.stringify(error.request));
    } else {
      console.error('Error message:', error.message);
    }

    // Return empty array instead of throwing
    return [];
  }
};

/**
 * Send a message
 */
export const sendMessage = async (messageData: MessageFormData): Promise<Message> => {
  try {
    console.log('Sending message:', JSON.stringify(messageData));
    const response = await api.post<any>('/messages', messageData);

    console.log('Send message response:', JSON.stringify(response.data));

    // Handle different response formats
    if (response.data._id) {
      // Direct message object
      console.log('Server returned direct message object');
      return response.data;
    } else if (response.data.data && response.data.data._id) {
      // Wrapped in data property
      console.log('Server returned wrapped message object');
      return response.data.data;
    } else if (response.data.message && response.data.message._id) {
      // Message property
      console.log('Server returned message in message property');
      return response.data.message;
    } else if (!response.data.success) {
      // Error response
      throw new Error(response.data.message || 'Failed to send message');
    } else {
      // Unexpected format
      console.error('Unexpected response format:', response.data);
      throw new Error('Invalid message data format in response');
    }
  } catch (error: any) {
    console.error('Error in sendMessage:', error);

    // Log detailed error information
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data));
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received. Request:', JSON.stringify(error.request));
    } else {
      console.error('Error message:', error.message);
    }

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