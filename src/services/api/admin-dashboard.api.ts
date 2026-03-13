import { axiosInstance } from './axiosInstance';

export interface DashboardMetrics {
  rides_today: number;
  active_rides: number;
  completed_today: number;
  revenue_today: number;
  total_users: number;
  total_drivers: number;
  approved_drivers: number;
  active_drivers: number;
}

export const adminDashboardApi = {
  getMetrics: () =>
    axiosInstance.get<DashboardMetrics>('/admin/dashboard'),
};
