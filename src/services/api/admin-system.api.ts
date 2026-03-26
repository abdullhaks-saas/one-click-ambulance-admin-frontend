import { axiosInstance } from './axiosInstance';

export interface SystemSetting {
  key: string;
  value: any;
  description: string;
  updated_at: string;
}

export interface AppVersion {
  platform: 'android' | 'ios';
  version: string;
  build_number: number;
  is_mandatory: boolean;
  release_notes: string;
}

export interface SystemHealth {
  database: 'healthy' | 'unhealthy';
  firebase: 'healthy' | 'unhealthy';
  razorpay: 'healthy' | 'unhealthy';
  last_checked: string;
}

export interface LogEntry {
  id: string;
  level?: string;
  message?: string;
  action?: string;
  admin_id?: string;
  entity?: string;
  created_at: string;
}

export interface LogsResponse {
  data: LogEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

/** Body of GET /system/settings after ResponseTransformInterceptor + axios unwrap. */
export interface SystemSettingsGetPayload {
  settings: Record<string, string>;
  rows: Array<Pick<SystemSetting, 'key' | 'value' | 'updated_at'>>;
}

export const adminSystemApi = {
  getSettings: () => axiosInstance.get<SystemSettingsGetPayload>('/system/settings'),

  updateSetting: (key: string, value: any) =>
    axiosInstance.post<{ message: string }>('/admin/update-system-setting', { key, value }),

  getHealth: () =>
    axiosInstance.get<{ data: SystemHealth }>('/admin/system-health'),

  toggleMaintenance: (enabled: boolean) =>
    axiosInstance.post<{ message: string }>('/admin/maintenance-mode', { enabled }),

  getAppVersions: () =>
    axiosInstance.get<{ data: AppVersion[] }>('/app/version'),

  updateAppVersion: (data: AppVersion) =>
    axiosInstance.post<{ message: string }>('/admin/app/version/update', data),

  getErrorLogs: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get<LogsResponse>('/admin/error-logs', { params }),

  getAuditLogs: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get<LogsResponse>('/admin/audit-logs', { params }),

  getLiveMap: () =>
    axiosInstance.get<{ data: { drivers: any[]; rides: any[] } }>('/admin/live-map'),
};
