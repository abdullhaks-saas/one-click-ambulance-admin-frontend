import { axiosInstance } from './axiosInstance';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  admin_role: string;
}

export interface AdminLoginResponse {
  access_token: string;
  admin: AdminProfile;
}

export interface AdminRefreshResponse {
  access_token: string;
}

export const adminAuthApi = {
  login: (data: AdminLoginRequest) =>
    axiosInstance.post<AdminLoginResponse>('/admin/auth/login', data),
  refreshToken: () =>
    axiosInstance.post<AdminRefreshResponse>('/admin/auth/refresh'),
  logout: () =>
    axiosInstance.post('/admin/auth/logout'),
};
