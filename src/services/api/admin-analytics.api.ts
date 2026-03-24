import { axiosInstance } from './axiosInstance';

export interface AnalyticsRangeParams {
  from?: string;
  to?: string;
  zone_id?: string;
  ambulance_type_id?: string;
}

export interface DailyRidesResponse {
  from: string;
  to: string;
  days: { date: string; ride_count: number }[];
}

export interface WeeklyRidesResponse {
  from: string;
  to: string;
  weeks: { week_start: string; ride_count: number }[];
}

export interface MonthlyRidesResponse {
  from: string;
  to: string;
  months: { year_month: string; ride_count: number }[];
}

export interface RevenueSummaryResponse {
  from: string;
  to: string;
  total_revenue: number;
  by_day: { date: string; revenue: number }[];
}

export interface DriverUtilizationResponse {
  from: string;
  to: string;
  note: string;
  drivers: {
    driver_id: string;
    driver_name: string | null;
    completed_rides: number;
    total_ride_duration_min: number;
    total_ride_distance_km: number;
  }[];
}

export interface AverageResponseTimeResponse {
  from: string;
  to: string;
  overall_average_response_time_seconds: number;
  by_day: { date: string; average_response_time_seconds: number }[];
}

export interface TopDriversResponse {
  from: string;
  to: string;
  limit: number;
  drivers: {
    driver_id: string;
    driver_name: string | null;
    mobile_number: string | null;
    completed_rides: number;
    commission_credited: number;
  }[];
}

export interface RideCancellationsResponse {
  from: string;
  to: string;
  total_bookings: number;
  cancelled_bookings: number;
  cancellation_rate: number;
  by_reason: { reason: string; count: number }[];
}

export interface ZoneDemandResponse {
  from: string;
  to: string;
  zones: {
    zone_id: string | null;
    zone_name: string | null;
    ride_count: number;
  }[];
}

export interface AmbulanceTypeDemandResponse {
  from: string;
  to: string;
  ambulance_types: {
    ambulance_type_id: string;
    ambulance_type_name: string;
    ride_count: number;
  }[];
}

export const adminAnalyticsApi = {
  dailyRides: (params: AnalyticsRangeParams & { date?: string }) =>
    axiosInstance.get<DailyRidesResponse>('/analytics/daily-rides', { params }),

  weeklyRides: (params: AnalyticsRangeParams) =>
    axiosInstance.get<WeeklyRidesResponse>('/analytics/weekly-rides', { params }),

  monthlyRides: (params: AnalyticsRangeParams) =>
    axiosInstance.get<MonthlyRidesResponse>('/analytics/monthly-rides', { params }),

  revenueSummary: (params: AnalyticsRangeParams) =>
    axiosInstance.get<RevenueSummaryResponse>('/analytics/revenue-summary', { params }),

  driverUtilization: (params: AnalyticsRangeParams) =>
    axiosInstance.get<DriverUtilizationResponse>('/analytics/driver-utilization', { params }),

  averageResponseTime: (params: AnalyticsRangeParams) =>
    axiosInstance.get<AverageResponseTimeResponse>('/analytics/average-response-time', { params }),

  topDrivers: (params: AnalyticsRangeParams & { limit?: number }) =>
    axiosInstance.get<TopDriversResponse>('/analytics/top-drivers', { params }),

  rideCancellations: (params: AnalyticsRangeParams) =>
    axiosInstance.get<RideCancellationsResponse>('/analytics/ride-cancellations', { params }),

  zoneDemand: (params: AnalyticsRangeParams) =>
    axiosInstance.get<ZoneDemandResponse>('/analytics/zone-demand', { params }),

  ambulanceTypeDemand: (params: AnalyticsRangeParams) =>
    axiosInstance.get<AmbulanceTypeDemandResponse>('/analytics/ambulance-type-demand', { params }),
};
