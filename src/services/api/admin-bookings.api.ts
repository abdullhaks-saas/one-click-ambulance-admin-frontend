import { axiosInstance } from './axiosInstance';

export type BookingStatus =
  | 'created'
  | 'searching'
  | 'driver_assigned'
  | 'driver_accepted'
  | 'driver_on_way'
  | 'driver_arrived'
  | 'patient_onboard'
  | 'trip_started'
  | 'trip_completed'
  | 'cancelled'
  | 'no_driver_found'
  | 'force_cancelled';

export interface BookingListItem {
  id: string;
  user_id: string;
  ambulance_type_id: string;
  zone_id: string | null;
  status: BookingStatus;
  estimated_fare: number | null;
  final_fare: number | null;
  is_emergency: boolean;
  created_at: string;
  user?: {
    id: string;
    name: string | null;
    mobile_number: string;
  };
  ambulance_type?: {
    id: string;
    name: string;
  };
  zone?: {
    id: string;
    zone_name: string;
  } | null;
}

export interface BookingStatusHistory {
  id: string;
  status: string;
  created_at: string;
}

export interface BookingPayment {
  id: string;
  amount: number;
  status: string;
  razorpay_payment_id: string | null;
}

export interface BookingDriverAssignment {
  id: string;
  driver_id: string;
  assigned_at: string;
  accepted_at: string | null;
}

export interface BookingDetail {
  id: string;
  user_id: string;
  ambulance_type_id: string;
  zone_id: string | null;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string | null;
  drop_latitude: number;
  drop_longitude: number;
  drop_address: string | null;
  status: BookingStatus;
  estimated_fare: number | null;
  final_fare: number | null;
  estimated_distance_km: number | null;
  estimated_duration_min: number | null;
  is_emergency: boolean;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string | null;
    mobile_number: string;
    email: string | null;
  };
  ambulance_type?: {
    id: string;
    name: string;
  };
  zone?: {
    id: string;
    zone_name: string;
  } | null;
  status_history?: BookingStatusHistory[];
  ride_details?: {
    id: string;
    total_distance_km: number | null;
    total_duration_min: number | null;
    trip_started_at: string | null;
    trip_completed_at: string | null;
  } | null;
  payments?: BookingPayment[];
  driver_assignments?: BookingDriverAssignment[];
}

export interface BookingsListResponse {
  data: BookingListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const adminBookingsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: BookingStatus;
    from?: string;
    to?: string;
    zone_id?: string;
    search?: string;
  }) => axiosInstance.get<BookingsListResponse>('/admin/bookings', { params }),

  getById: (id: string) =>
    axiosInstance.get<BookingDetail>(`/admin/bookings/${id}`),

  forceCancel: (booking_id: string, reason?: string) =>
    axiosInstance.post<{ message: string }>('/admin/force-cancel-ride', {
      booking_id,
      reason,
    }),
};
