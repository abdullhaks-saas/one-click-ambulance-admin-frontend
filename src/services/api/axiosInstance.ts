import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/stores/auth.store';

// Extend InternalAxiosRequestConfig to include isRetry
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    isRetry?: boolean;
  }
}

export const axiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: attach JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: error handling + Token Refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // If the response is wrapped by our ResponseTransformInterceptor, unwrap it
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      return {
        ...response,
        data: response.data.data,
      };
    }
    return response;
  },
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;
    const status = error.response?.status;

    // Handle 401 Unauthorized
    if (status === 401 && !originalRequest.isRetry) {
      originalRequest.isRetry = true;

      try {
        // Use a clean axios instance for refresh to avoid interceptor issues
        const response = await axios.post(
          `${env.API_BASE_URL}/admin/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Check if the refresh response is also wrapped
        const newAccessToken = response.data?.data?.access_token || response.data?.access_token;
        
        if (!newAccessToken) {
          throw new Error('Refresh failed - no access token in response');
        }

        useAuthStore.getState().setAccessToken(newAccessToken);

        // Update authorization header and retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g. refresh token expired or invalid)
        useAuthStore.getState().logout();
        if (!window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle Forbidden (403) or other fatal errors
    if (status === 403) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }

    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'Something went wrong';

    return Promise.reject({ ...error, apiMessage: message });
  }
);
