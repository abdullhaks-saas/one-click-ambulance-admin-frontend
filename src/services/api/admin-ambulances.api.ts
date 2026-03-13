import { axiosInstance } from './axiosInstance';

export type AmbulanceStatus = 'pending' | 'approved' | 'suspended';

export interface AmbulanceListItem {
  id: string;
  driver_id: string;
  ambulance_type_id: string;
  registration_number: string;
  vehicle_number: string | null;
  photo_url: string | null;
  insurance_expiry: string | null;
  status: AmbulanceStatus;
  suspend_reason: string | null;
  created_at: string;
  updated_at: string;
  ambulance_type?: { id: string; name: string } | null;
  driver?: { id: string; name: string | null } | null;
}

export interface AmbulanceDetail extends AmbulanceListItem {
  ambulance_type: { id: string; name: string } | null;
  driver: { id: string; name: string | null } | null;
  equipment: { id: string; name: string }[];
}

export interface AmbulancesListResponse {
  data: AmbulanceListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const adminAmbulancesApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: AmbulanceStatus;
    ambulance_type_id?: string;
    driver_id?: string;
    search?: string;
  }) =>
    axiosInstance.get<AmbulancesListResponse>('/admin/ambulances', { params }),

  getById: (id: string) =>
    axiosInstance.get<AmbulanceDetail>(`/admin/ambulances/${id}`),

  approve: (ambulance_id: string) =>
    axiosInstance.post<{ message: string }>('/admin/ambulance/approve', { ambulance_id }),

  suspend: (ambulance_id: string, reason?: string) =>
    axiosInstance.post<{ message: string }>('/admin/ambulance/suspend', { ambulance_id, reason }),

  suspendWithReason: (ambulance_id: string, reason?: string) =>
    axiosInstance.post<{ message: string }>('/admin/suspend-ambulance', { ambulance_id, reason }),

  restore: (ambulance_id: string) =>
    axiosInstance.post<{ message: string }>('/admin/restore-ambulance', { ambulance_id }),
};
