import { axiosInstance } from './axiosInstance';

export interface ZoneCoordinate {
  latitude: number;
  longitude: number;
  sequence_order: number;
}

export interface Zone {
  id: string;
  zone_name: string;
  city: string | null;
  created_at: string;
  updated_at: string;
  coordinates: ZoneCoordinate[];
}

export interface ZoneDriver {
  id: string;
  driver_id: string;
  zone_id: string;
  created_at: string;
  driver: {
    id: string;
    name: string | null;
    mobile_number: string;
    status: string;
  } | null;
}

export interface ZonesListResponse {
  data: Zone[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface ZoneDriversResponse {
  data: ZoneDriver[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface CreateZoneDto {
  zone_name: string;
  city?: string;
  coordinates: Array<{
    latitude: number;
    longitude: number;
    sequence_order?: number;
  }>;
}

export interface UpdateZoneDto {
  zone_name?: string;
  city?: string;
  coordinates?: Array<{
    latitude: number;
    longitude: number;
    sequence_order?: number;
  }>;
}

export const adminZonesApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    axiosInstance.get<ZonesListResponse>('/admin/zones', { params }),

  create: (dto: CreateZoneDto) =>
    axiosInstance.post<Zone>('/admin/zones/create', dto),

  update: (id: string, dto: UpdateZoneDto) =>
    axiosInstance.put<Zone>(`/admin/zones/${id}`, dto),

  delete: (id: string) =>
    axiosInstance.delete<{ message: string }>(`/admin/zones/${id}`),

  assignDriver: (zone_id: string, driver_id: string) =>
    axiosInstance.post<{ message: string }>(
      `/admin/zones/${zone_id}/assign-driver`,
      { driver_id }
    ),

  getZoneDrivers: (
    zone_id: string,
    params?: { page?: number; limit?: number }
  ) =>
    axiosInstance.get<ZoneDriversResponse>(
      `/admin/zones/${zone_id}/drivers`,
      { params }
    ),
};
