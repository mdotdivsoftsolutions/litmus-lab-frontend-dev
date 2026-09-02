import { apiClient } from './axios';

export interface InAppNotificationItem {
  _id: string;
  recipientRole: 'ADMIN' | 'LAB' | 'USER';
  recipientLabId?: string;
  recipientUserId?: string;
  type: 'NEW_LAB_ONBOARDING' | 'NEW_BOOKING' | 'BOOKING_ASSIGNED' | 'LAB_UPDATE' | 'REPORT_UPLOADED' | 'SUPPORT_REQUEST' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsResponse {
  notifications: InAppNotificationItem[];
  total: number;
  page: number;
  totalPages: number;
  unreadCount: number;
}

export const notificationApi = {
  getNotifications: async (params?: { page?: number; limit?: number; unreadOnly?: boolean; type?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: GetNotificationsResponse }>('/notifications', {
      params,
    });
    return res.data.data;
  },

  getUnreadCount: async () => {
    const res = await apiClient.get<{ success: boolean; data: { unreadCount: number } }>('/notifications/unread-count');
    return res.data.data.unreadCount;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; data: InAppNotificationItem }>(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch<{ success: boolean; data: { modifiedCount: number } }>('/notifications/mark-all-read');
    return res.data.data;
  },

  deleteNotification: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/notifications/${id}`);
    return res.data;
  },
};

export default notificationApi;
