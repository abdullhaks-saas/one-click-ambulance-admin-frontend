import { axiosInstance } from './axiosInstance';

export interface AvailableDriver {
  driver_id: string;
  name: string | null;
  mobile_number: string;
  latitude: number;
  longitude: number;
  last_seen: null;
  ambulance_type_id: string;
}

export interface NearestDriver {
  driver_id: string;
  name: string | null;
  mobile_number: string;
  latitude: number;
  longitude: number;
  distance_km: number;
}

export interface AssignmentResult {
  message: string;
  assignment_id?: string;
}

export const adminDispatchApi = {
  availableDrivers: (zone_id: string) =>
    axiosInstance.get<AvailableDriver[]>('/dispatch/available-drivers', {
      params: { zone_id },
    }),

  findDriver: (booking_id: string) =>
    axiosInstance.get<NearestDriver | null>('/dispatch/find-driver', {
      params: { booking_id },
    }),

  manualAssign: (booking_id: string, driver_id: string) =>
    axiosInstance.post<{ message: string; assignment_id: string }>(
      '/dispatch/manual-assign',
      { booking_id, driver_id }
    ),

  cancelAssignment: (booking_id: string) =>
    axiosInstance.post<{ message: string }>('/dispatch/cancel-assignment', {
      booking_id,
    }),

  assignDriver: (booking_id: string) =>
    axiosInstance.post<AssignmentResult>('/dispatch/assign-driver', {
      booking_id,
    }),

  retryAssignment: (booking_id: string) =>
    axiosInstance.post<AssignmentResult>('/dispatch/retry-assignment', {
      booking_id,
    }),

  driverTimeout: (assignment_id: string) =>
    axiosInstance.post<{ message: string }>('/dispatch/driver-timeout', {
      assignment_id,
    }),
};
