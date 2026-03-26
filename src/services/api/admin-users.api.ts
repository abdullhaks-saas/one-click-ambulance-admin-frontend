import { axiosInstance } from './axiosInstance';

export type UserStatus = 'all' | 'blocked' | 'active';

export interface UserListItem {
  id: string;
  mobile_number: string;
  name: string | null;
  email: string | null;
  is_verified: boolean;
  is_blocked: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface RideHistoryItem {
  id: string;
  status: string;
  pickup_address?: string;
  drop_address?: string;
  created_at: string;
}

export interface UserDetail extends UserListItem {
  profile_photo_url: string | null;
  ride_history: RideHistoryItem[];
}

export interface UsersListResponse {
  data: UserListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const adminUsersApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: UserStatus;
    search?: string;
    from?: string;
    to?: string;
  }) =>
    axiosInstance.get<UsersListResponse>('/admin/users', { params }),

  getById: (id: string) =>
    axiosInstance.get<UserDetail>(`/admin/users/${id}`),

  block: (id: string) =>
    axiosInstance.post<{ message: string }>(`/admin/users/block/${id}`),

  unblock: (id: string) =>
    axiosInstance.post<{ message: string }>(`/admin/users/unblock/${id}`),
};
