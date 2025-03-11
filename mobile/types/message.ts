import { User } from './auth';
import { Listing } from './listing';
import { Transaction } from './transaction';

export interface ReadStatus {
  user: string | User;
  timestamp: string;
}

export interface Message {
  _id: string;
  conversation: string | Conversation;
  sender: string | User;
  content: string;
  attachments?: string[];
  readBy: ReadStatus[];
  isSystemMessage: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: (string | User)[];
  listing?: string | Listing;
  transaction?: string | Transaction;
  lastMessage?: string | Message;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number; // Client-side computed property
}

export interface MessageFormData {
  conversationId: string;
  content: string;
  attachments?: string[];
}

export interface ConversationListItem extends Conversation {
  otherParticipant: User; // The other user in the conversation (client-side computed)
  lastMessageContent: string;
  lastMessageTime: string;
}