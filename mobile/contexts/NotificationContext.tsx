import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  unreadMessageCount: number;
  updateUnreadMessageCount: (count: number) => void;
  incrementUnreadMessageCount: () => void;
  decrementUnreadMessageCount: () => void;
  resetUnreadMessageCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track last toast time to prevent too frequent notifications
  const lastToastTimeRef = useRef<number>(0);

  // Update unread message count
  const updateUnreadMessageCount = (count: number) => {
    const now = Date.now();
    const MIN_TOAST_INTERVAL = 60000; // 1 minute between toasts

    // Only show toast if enough time has passed since the last one
    const shouldShowToast = now - lastToastTimeRef.current > MIN_TOAST_INTERVAL;

    // Only show toast if count increased from zero or increased significantly
    if (shouldShowToast && unreadMessageCount === 0 && count > 0) {
      // First unread message
      Toast.show({
        type: 'info',
        text1: 'New Message',
        text2: 'You have a new unread message',
        position: 'top',
        visibilityTime: 3000,
      });
      lastToastTimeRef.current = now;
    } else if (shouldShowToast && count > unreadMessageCount + 2) {
      // Multiple new messages since last check
      Toast.show({
        type: 'info',
        text1: 'New Messages',
        text2: `You have ${count - unreadMessageCount} new unread messages`,
        position: 'top',
        visibilityTime: 3000,
      });
      lastToastTimeRef.current = now;
    }

    setUnreadMessageCount(count);
  };

  // Increment unread message count
  const incrementUnreadMessageCount = () => {
    const now = Date.now();
    const MIN_TOAST_INTERVAL = 60000; // 1 minute between toasts

    setUnreadMessageCount(prev => {
      const newCount = prev + 1;

      // Only show toast if enough time has passed since the last one
      const shouldShowToast = now - lastToastTimeRef.current > MIN_TOAST_INTERVAL;

      if (shouldShowToast) {
        // Show toast notification for new message
        Toast.show({
          type: 'info',
          text1: 'New Message',
          text2: 'You have a new unread message',
          position: 'top',
          visibilityTime: 3000,
        });
        lastToastTimeRef.current = now;
      }

      return newCount;
    });
  };

  // Decrement unread message count
  const decrementUnreadMessageCount = () => {
    setUnreadMessageCount(prev => Math.max(0, prev - 1));
  };

  // Reset unread message count
  const resetUnreadMessageCount = () => {
    setUnreadMessageCount(0);
  };

  // Fetch unread message count from API
  const fetchUnreadMessageCount = async () => {
    if (!isAuthenticated) return;

    try {
      const MessageService = await import('../services/messageService');

      try {
        const count = await MessageService.getUnreadCount();

        if (typeof count === 'number') {
          updateUnreadMessageCount(count);
        } else if (count && typeof count === 'object' && 'count' in count) {
          updateUnreadMessageCount(count.count);
        }
      } catch (apiError) {
        // Silently handle API errors - the endpoint might not be available yet
        console.log('Unread count API not available yet');
      }
    } catch (error) {
      console.error('Error importing message service:', error);
    }
  };

  // Start polling for unread message count
  const startPolling = () => {
    stopPolling();

    // Poll every 30 seconds
    try {
      pollingIntervalRef.current = setInterval(() => {
        fetchUnreadMessageCount();
      }, 30000);
    } catch (error) {
      console.error('Error starting polling:', error);
    }
  };

  // Stop polling
  const stopPolling = () => {
    try {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping polling:', error);
    }
  };

  // Initialize and clean up
  useEffect(() => {
    try {
      if (isAuthenticated) {
        fetchUnreadMessageCount();
        startPolling();
      } else {
        resetUnreadMessageCount();
        stopPolling();
      }

      return () => {
        try {
          stopPolling();
        } catch (error) {
          console.error('Error in cleanup function:', error);
        }
      };
    } catch (error) {
      console.error('Error in notification effect:', error);
    }
  }, [isAuthenticated, user]);

  return (
    <NotificationContext.Provider
      value={{
        unreadMessageCount,
        updateUnreadMessageCount,
        incrementUnreadMessageCount,
        decrementUnreadMessageCount,
        resetUnreadMessageCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
