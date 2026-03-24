import { axiosInstance } from './axiosInstance';

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PayoutListParams {
  page?: number;
  limit?: number;
  status?: string;
  from?: string;
  to?: string;
}

export interface PayoutListItem {
  id: string;
  driver_id: string;
  driver_bank_account_id: string | null;
  amount: number;
  currency: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
  driver?: { id: string; name: string | null; mobile_number: string };
  bank?: { id: string; bank_name: string; account_number_last4: string | undefined };
}

export interface PaginatedPayouts {
  data: PayoutListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface ProcessPayoutDto {
  driver_ids?: string[];
  period_start?: string;
  period_end?: string;
  min_balance?: number;
}

export interface ProcessPayoutResponse {
  processed_count: number;
  payout_ids: string[];
  skipped: { driver_id: string; reason: string }[];
  message: string;
}

export const adminPayoutsApi = {
  list: (params?: PayoutListParams) =>
    axiosInstance.get<PaginatedPayouts>('/admin/payouts', { params }),

  listByDriver: (driverId: string, params?: PayoutListParams) =>
    axiosInstance.get<{
      driver_id: string;
      data: Omit<PayoutListItem, 'driver_id' | 'driver'>[];
      meta: PaginatedPayouts['meta'];
    }>(`/admin/payouts/${driverId}`, { params }),

  process: (dto: ProcessPayoutDto) =>
    axiosInstance.post<ProcessPayoutResponse>('/admin/payout/process', dto),
};
