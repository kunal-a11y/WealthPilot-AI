import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type NotificationType = 'info' | 'success' | 'error' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('wealthpilot_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) }));
        setNotifications(parsed);
      } catch (e) {
        console.error("Failed to parse notifications", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('wealthpilot_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substring(2, 9),
      read: false,
      createdAt: new Date(),
    };
    
    setNotifications((prev) => [newNotif, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
