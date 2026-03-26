import { axiosInstance } from './axiosInstance';

export interface AdminAlertItem {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface AlertsListResponse {
  data: AdminAlertItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface AlertsQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  severity?: string;
  unread_only?: boolean;
}

export const adminAlertsApi = {
  list: (params?: AlertsQueryParams) =>
    axiosInstance.get<AlertsListResponse>('/admin/alerts', { params }),

  unreadCount: () =>
    axiosInstance.get<{ count: number }>('/admin/alerts/unread-count'),

  markAsRead: (id: string) =>
    axiosInstance.post(`/admin/alerts/${id}/read`),

  markAllAsRead: () =>
    axiosInstance.post('/admin/alerts/mark-all-read'),

  dismiss: (id: string) =>
    axiosInstance.post(`/admin/alerts/${id}/dismiss`),

  triggerCheck: () =>
    axiosInstance.post('/admin/alerts/check'),
};
