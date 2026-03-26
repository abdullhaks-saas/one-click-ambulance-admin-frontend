import { axiosInstance } from './axiosInstance';

export type NotificationHistoryTargetType =
  | 'ALL_USERS'
  | 'ALL_DRIVERS'
  | 'SPECIFIC_USERS'
  | 'SPECIFIC_DRIVERS'
  | 'TEST'
  | 'UNKNOWN';

export interface NotificationLog {
  id: string;
  notification_id: string | null;
  target_type: NotificationHistoryTargetType;
  title: string | null;
  body: string | null;
  recipient_type: string;
  recipient_id: string | null;
  status: 'SENT' | 'FAILED';
  error_message: string | null;
  created_at: string;
}

export type NotificationCampaignStatus = 'SENT' | 'FAILED' | 'PARTIAL' | 'NONE';

/** One row per admin send (broadcast = one campaign, many deliveries). */
export interface NotificationCampaignSummary {
  id: string;
  notification_id: string;
  target_type: NotificationHistoryTargetType;
  title: string;
  body: string;
  image_url: string | null;
  created_at: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  status: NotificationCampaignStatus;
}

export type NotificationHistoryResponse =
  | {
      group_by: 'campaign';
      data: NotificationCampaignSummary[];
      meta: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
      };
    }
  | {
      group_by: 'delivery';
      data: NotificationLog[];
      meta: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
      };
    };

export const adminNotificationsApi = {
  notifyDrivers: (data: { driver_ids: string[]; title: string; body: string; image_url?: string }) =>
    axiosInstance.post<{ message: string }>('/admin/notify-drivers', data),

  notifyUsers: (data: { user_ids: string[]; title: string; body: string; image_url?: string }) =>
    axiosInstance.post<{ message: string }>('/admin/notify-users', data),

  broadcastUsers: (data: { title: string; body: string; image_url?: string }) =>
    axiosInstance.post<{ message: string }>('/notifications/broadcast-users', data),

  broadcastDrivers: (data: { title: string; body: string; image_url?: string }) =>
    axiosInstance.post<{ message: string }>('/notifications/broadcast-drivers', data),

  getHistory: (params?: {
    page?: number;
    limit?: number;
    group_by?: 'campaign' | 'delivery';
    notification_id?: string;
    status?: 'sent' | 'failed';
    from?: string;
    to?: string;
  }) =>
    axiosInstance.get<NotificationHistoryResponse>('/notifications/admin-history', { params }),

  resend: (logId: string) =>
    axiosInstance.post<{ message: string }>('/notifications/resend', { log_id: logId }),

  testPush: (data: { token: string; title?: string; body?: string }) =>
    axiosInstance.post<{ message: string }>('/notifications/test', data),
};
