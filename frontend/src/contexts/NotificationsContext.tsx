import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'lead' | 'application';
  read: boolean;
  link?: string;
  createdAt: Date;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const STORAGE_KEY = 'mortgage_notifications';

const defaultNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    title: 'Application Submitted',
    message: 'Your mortgage application APP-2024-001 has been submitted successfully to 3 lenders.',
    type: 'success',
    read: false,
    link: '/application/app-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    title: 'Document Verification Complete',
    message: 'Your government ID has been verified successfully.',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    title: 'Pre-Approval Available',
    message: 'Congratulations! You have received a conditional pre-approval from Abbey Mortgage Bank.',
    type: 'success',
    read: false,
    link: '/application/app-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    title: 'Rate Alert',
    message: 'Interest rates from Infinity Trust have dropped to 16.5%. Check updated offers.',
    type: 'info',
    read: true,
    link: '/compare',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'notif-5',
    userId: 'lender-user-1',
    title: 'New Lead Received',
    message: 'A new mortgage application from Adeola Johnson (₦25,000,000) is awaiting your review.',
    type: 'lead',
    read: false,
    link: '/lender/dashboard',
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 'notif-6',
    userId: 'lender-user-1',
    title: 'Lead Accepted',
    message: 'You accepted the lead from Chinedu Obi. Start processing the application.',
    type: 'success',
    read: false,
    link: '/lender/dashboard',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: 'notif-7',
    userId: 'lender-user-1',
    title: 'Product Expiring Soon',
    message: 'Your promotional rate on "Premium Home Plus" expires in 7 days. Update your products.',
    type: 'warning',
    read: true,
    link: '/lender/dashboard',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: 'notif-8',
    userId: 'admin-1',
    title: 'New Lender Registration',
    message: 'Homebase Mortgage Bank Limited has submitted an onboarding application.',
    type: 'info',
    read: false,
    link: '/admin/dashboard',
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
  },
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) })));
      } catch {
        setNotifications(defaultNotifications);
      }
    } else {
      setNotifications(defaultNotifications);
    }
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications]);

  const userNotifications = notifications.filter(n => {
    if (!user) return false;
    return n.userId === user.id;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => n.userId === user.id ? { ...n, read: true } : n));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearAll = () => {
    if (!user) return;
    setNotifications(prev => prev.filter(n => n.userId !== user.id));
  };

  return (
    <NotificationsContext.Provider value={{
      notifications: userNotifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      clearAll,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
