import { axiosInstance } from './axiosInstance';

export interface RideAnomaly {
  booking_id: string;
  reason: string;
  total_distance_km: number;
  total_duration_min: number;
  implied_speed_kmh: number;
  straight_line_km: number | null;
}

export interface GpsMismatch {
  booking_id: string;
  straight_line_km: number;
  path_length_km: number;
  ratio: number;
}

export interface FakeLocationDriver {
  driver_id: string;
  reason: string;
  latitude: number;
  longitude: number;
  location_updated_at: string;
  is_online: boolean;
}

export interface DuplicateAccounts {
  duplicate_user_mobiles: { mobile_number: string; count: number }[];
  duplicate_driver_mobiles: { mobile_number: string; count: number }[];
  duplicate_pan_documents: { document_url: string; count: number }[];
  user_and_driver_same_mobile: { mobile_number: string; user_id: string; driver_id: string }[];
}

export interface FraudListResponse<T> {
  data: T[];
  count: number;
}

export const adminFraudApi = {
  getRideAnomalies: () =>
    axiosInstance.get<FraudListResponse<RideAnomaly>>('/fraud/ride-anomalies'),

  getGpsMismatch: () =>
    axiosInstance.get<FraudListResponse<GpsMismatch>>('/fraud/gps-mismatch'),

  getFakeLocationDrivers: () =>
    axiosInstance.get<FraudListResponse<FakeLocationDriver>>('/fraud/fake-location-drivers'),

  getDuplicateAccounts: () =>
    axiosInstance.get<DuplicateAccounts>('/fraud/duplicate-accounts'),

  /** Phase 8 plan: POST /fraud/flag-driver with driver_id + reason → drivers + audit_logs */
  flagDriver: (driverId: string, reason: string) =>
    axiosInstance.post<{ message: string }>('/fraud/flag-driver', {
      driver_id: driverId,
      reason,
    }),

  flagUser: (userId: string, reason: string) =>
    axiosInstance.post<{ message: string }>('/fraud/flag-user', {
      user_id: userId,
      reason,
    }),
};
