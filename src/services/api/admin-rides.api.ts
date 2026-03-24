import { axiosInstance } from './axiosInstance';

export type RideStatusEnum =
  | 'accepted'
  | 'arrived'
  | 'patient_onboard'
  | 'trip_started'
  | 'trip_completed';

export interface RideListItem {
  id: string;
  booking_id: string;
  ride_status: RideStatusEnum;
  total_distance_km: number | null;
  total_duration_min: number | null;
  trip_started_at: string | null;
  trip_completed_at: string | null;
  booking?: {
    id: string;
    status: string;
    user_id: string;
    pickup_address: string | null;
    drop_address: string | null;
    created_at: string;
  };
}

export interface RideTracking {
  latitude: number;
  longitude: number;
  recorded_at: string;
}

export interface RideDetail {
  id: string;
  booking_id: string;
  total_distance_km: number | null;
  total_duration_min: number | null;
  trip_started_at: string | null;
  trip_completed_at: string | null;
  ride_status: RideStatusEnum;
  booking: {
    id: string;
    status: string;
    pickup_address: string | null;
    drop_address: string | null;
    user_id: string;
    ambulance_type_id: string;
  };
  ride_tracking: RideTracking[];
}

export interface RidesListResponse {
  data: RideListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const adminRidesApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: RideStatusEnum;
    from?: string;
    to?: string;
    booking_id?: string;
    search?: string;
  }) => axiosInstance.get<RidesListResponse>('/admin/rides', { params }),

  getById: (id: string) =>
    axiosInstance.get<RideDetail>(`/admin/rides/${id}`),
};
