import { axiosInstance } from './axiosInstance';

export type DriverStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'blocked';

export interface DriverListItem {
  id: string;
  mobile_number: string;
  name: string | null;
  email: string | null;
  profile_photo?: string | null;
  status: DriverStatus;
  rating: number;
  total_rides: number;
  is_verified: boolean;
  is_online: boolean;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriverDocument {
  id: string;
  document_type: string;
  document_url: string;
  verification_status: string;
  created_at: string;
}

export interface DriverBankAccount {
  id: string;
  bank_name: string;
  account_holder_name: string | null;
  ifsc_code: string;
  created_at: string;
}

export interface DriverDetail extends DriverListItem {
  documents: DriverDocument[];
  bank_accounts: DriverBankAccount[];
}

export interface DriversListResponse {
  data: DriverListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const adminDriversApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: DriverStatus;
    search?: string;
    from?: string;
    to?: string;
  }) =>
    axiosInstance.get<DriversListResponse>('/admin/drivers', { params }),

  getById: (id: string) =>
    axiosInstance.get<DriverDetail>(`/admin/drivers/${id}`),

  approve: (driver_id: string) =>
    axiosInstance.post<{ message: string }>('/admin/driver/approve', { driver_id }),

  reject: (driver_id: string, reason?: string) =>
    axiosInstance.post<{ message: string }>('/admin/driver/reject', { driver_id, reason }),

  suspend: (driver_id: string) =>
    axiosInstance.post<{ message: string }>('/admin/driver/suspend', { driver_id }),

  block: (driver_id: string) =>
    axiosInstance.post<{ message: string }>('/admin/block-driver', { driver_id }),

  unblock: (driver_id: string) =>
    axiosInstance.post<{ message: string }>('/admin/unblock-driver', { driver_id }),

  verifyDocument: (document_id: string, status: 'verified' | 'rejected') =>
    axiosInstance.post<{ message: string }>('/admin/driver-document/verify', {
      document_id,
      status,
    }),
};
