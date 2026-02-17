import { apiClient } from '../../../core/api/api-client';
import type { Notification, NotificationStats } from '../types';

export const notificationsApi = {
  getNotifications: (): Promise<Notification[]> => {
    return apiClient.get<Notification[]>('/notifications');
  },

  getUnreadCount: (): Promise<NotificationStats> => {
    return apiClient.get<NotificationStats>('/notifications/unread-count');
  },

  markAsRead: (id: string): Promise<void> => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: (): Promise<void> => {
    return apiClient.patch('/notifications/mark-all-read');
  },

  deleteNotification: (id: string): Promise<void> => {
    return apiClient.delete(`/notifications/${id}`);
  },
};
