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
    try {
      const userResponse = await api.get<any>('/users/me');
      let currentUserId;

      if (userResponse.data._id) {
        // Direct user object
        currentUserId = userResponse.data._id;
      } else if (userResponse.data.data && userResponse.data.data._id) {
        // Wrapped in data property
        currentUserId = userResponse.data.data._id;
      } else {
        console.error('Unexpected user response format:', userResponse.data);
        throw new Error('Could not determine current user ID');
      }

      console.log('Current user ID:', currentUserId);
    } catch (userError) {
      console.error('Error getting current user:', userError);
      // Continue with conversations even if we can't get the user ID
    }

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

      // If we have otherUser directly from the server, use it
      if (conversation.otherUser) {
        console.log('Using otherUser from server:', conversation.otherUser);
        conversationItem.otherParticipant = conversation.otherUser;
      }

      // If we have otherParticipant directly from the server, use it
      if (conversation.otherParticipant && typeof conversation.otherParticipant === 'object') {
        console.log('Using otherParticipant from server:', conversation.otherParticipant);
        conversationItem.otherParticipant = conversation.otherParticipant;
      }

      // Find the other participant
      if (conversation.participants && Array.isArray(conversation.participants)) {
        // Try to find the current user ID in the participants
        let currentUserId = '';
        try {
          // If we have an otherUser property, the current user is the other participant
          if (conversation.otherUser) {
            // Find the participant that is not the otherUser
            const currentUserParticipant = conversation.participants.find(p => {
              if (typeof p === 'string' && conversation.otherUser && typeof conversation.otherUser === 'object') {
                return p !== conversation.otherUser._id;
              } else if (p && typeof p === 'object' && p._id && conversation.otherUser && typeof conversation.otherUser === 'object') {
                return p._id !== conversation.otherUser._id;
              }
              return false;
            });

            if (currentUserParticipant) {
              currentUserId = typeof currentUserParticipant === 'string' ?
                currentUserParticipant :
                currentUserParticipant._id;
            }
          }
        } catch (error) {
          console.error('Error finding current user ID:', error);
        }

        // If we have an otherUser property, use it directly
        if (conversation.otherUser && typeof conversation.otherUser === 'object') {
          conversationItem.otherParticipant = conversation.otherUser;
        } else {
          // Otherwise, try to find the other participant
          // Find any participant that is not the current user
          const otherParticipant = conversation.participants.find(p => {
            if (currentUserId && typeof p === 'string') {
              return p !== currentUserId;
            } else if (currentUserId && p && typeof p === 'object' && p._id) {
              return p._id !== currentUserId;
            }
            // If we can't determine the current user, just return the first participant
            return true;
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
      // The server returns an array of messages for this conversation
      console.log('Server returned array of messages, creating conversation object');

      // Create a conversation object with the messages
      return {
        _id: id,
        participants: [],
        messages: response.data,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else if (response.data._id) {
      // Direct conversation object
      console.log('Server returned direct conversation object');
      return response.data;
    } else if (response.data.data) {
      // Wrapped in data property
      console.log('Server returned wrapped data:', typeof response.data.data);

      if (Array.isArray(response.data.data)) {
        // It's an array of messages
        console.log('Server returned wrapped array of messages');
        return {
          _id: id,
          participants: [],
          messages: response.data.data,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else if (response.data.data._id) {
        // It's a conversation object
        console.log('Server returned wrapped conversation object');
        return response.data.data;
      }
    }

    // If we get here, we couldn't parse the response
    console.error('Unexpected response format:', response.data);

    // Return a placeholder conversation as a fallback
    return {
      _id: id,
      participants: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
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
    let conversationData;

    if (response.data._id) {
      // Direct conversation object
      console.log('Server returned direct conversation object');
      conversationData = response.data;
    } else if (response.data.data && response.data.data._id) {
      // Wrapped in data property
      console.log('Server returned wrapped conversation object');
      conversationData = response.data.data;
    } else if (!response.data.success) {
      // Error response
      throw new Error(response.data.message || 'Failed to create conversation');
    } else {
      // Unexpected format
      console.error('Unexpected response format:', response.data);
      throw new Error('Invalid response format');
    }

    // Log the conversation data to help with debugging
    console.log('Conversation data:', {
      id: conversationData._id,
      otherUser: conversationData.otherUser ? conversationData.otherUser.fullName : 'Not provided',
      otherParticipant: conversationData.otherParticipant ? conversationData.otherParticipant.fullName : 'Not provided',
      participants: Array.isArray(conversationData.participants) ?
        conversationData.participants.map(p => typeof p === 'object' ? p.fullName : p) : 'Not provided'
    });

    return conversationData;
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

/**
 * Get a single message by ID
 */
export const getMessageById = async (id: string): Promise<Message | null> => {
  try {
    // First try to get the message directly
    try {
      const response = await api.get<ApiResponse<Message>>(`/messages/${id}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch (directError) {
      console.log('Direct message fetch failed, trying alternative approach');
    }

    // If direct fetch fails, try to find the message in its conversation
    // This is a fallback approach that might be less efficient
    // First, we need to find which conversation contains this message
    const conversationsResponse = await api.get<any>('/messages/conversations');

    let conversations = [];
    if (Array.isArray(conversationsResponse.data)) {
      conversations = conversationsResponse.data;
    } else if (conversationsResponse.data.data && Array.isArray(conversationsResponse.data.data)) {
      conversations = conversationsResponse.data.data;
    } else if (conversationsResponse.data.conversations && Array.isArray(conversationsResponse.data.conversations)) {
      conversations = conversationsResponse.data.conversations;
    }

    // Look for a conversation with this message as the last message
    for (const conversation of conversations) {
      if (conversation.lastMessage === id ||
          (conversation.lastMessage && conversation.lastMessage._id === id)) {
        // If we found it as a lastMessage and it's an object, return it
        if (conversation.lastMessage && typeof conversation.lastMessage === 'object') {
          return conversation.lastMessage;
        }

        // Otherwise, get all messages for this conversation
        const messagesResponse = await api.get<any>(`/messages/conversations/${conversation._id}`);

        let messages = [];
        if (Array.isArray(messagesResponse.data)) {
          messages = messagesResponse.data;
        } else if (messagesResponse.data.data && Array.isArray(messagesResponse.data.data)) {
          messages = messagesResponse.data.data;
        }

        // Find the message with the matching ID
        const message = messages.find(msg => msg._id === id);
        if (message) {
          return message;
        }
      }
    }

    // If we couldn't find the message, return null
    return null;
  } catch (error) {
    console.error('Error in getMessageById:', error);
    return null;
  }
};