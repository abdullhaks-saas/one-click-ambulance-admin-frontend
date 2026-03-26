import { axiosInstance } from './axiosInstance';

export interface RideRatingItem {
  id: string;
  booking_id: string;
  user_id: string;
  user_name: string | null;
  user_mobile: string | null;
  driver_id: string;
  driver_name: string | null;
  driver_mobile: string | null;
  rating: number;
  review: string | null;
  created_at: string;
}

export interface RatingsListResponse {
  data: RideRatingItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface RatingsStatsResponse {
  total_ratings: number;
  average_rating: string;
  distribution: { stars: number; count: number }[];
  low_rated_drivers: {
    driver_id: string;
    driver_name: string | null;
    avg_rating: number;
    review_count: number;
  }[];
}

export interface RatingsQueryParams {
  page?: number;
  limit?: number;
  driver_id?: string;
  max_rating?: number;
  min_rating?: number;
  from?: string;
  to?: string;
}

export const adminRatingsApi = {
  list: (params?: RatingsQueryParams) =>
    axiosInstance.get<RatingsListResponse>('/admin/ratings', { params }),

  stats: () =>
    axiosInstance.get<RatingsStatsResponse>('/admin/ratings/stats'),
};
