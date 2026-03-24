import { axiosInstance } from './axiosInstance';

/** GET /admin/dashboard — Phase 7.1 (backend plan) */
export interface AdminDashboardMetrics {
  total_rides_today: number;
  active_drivers: number;
  completed_rides: number;
  total_revenue: number;
  driver_utilization_rate: number;
  average_response_time_seconds: number;
}

export const adminDashboardApi = {
  getMetrics: () =>
    axiosInstance.get<AdminDashboardMetrics>('/admin/dashboard'),
};
