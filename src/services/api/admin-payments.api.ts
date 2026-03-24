import { axiosInstance } from './axiosInstance';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface PaymentListParams {
  page?: number;
  limit?: number;
  status?: string;
  from?: string;
  to?: string;
  search?: string;
}

export interface PaymentListItem {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_method: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  transaction_count: number;
  user?: { id: string; name: string | null; mobile_number: string };
  booking?: { id: string; status: string };
}

export interface PaginatedPayments {
  data: PaymentListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface FailedPaymentListItem {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  razorpay_payment_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user?: { id: string; name: string | null; mobile_number: string };
}

export interface ReconciliationResponse {
  payments_by_status: Record<string, { count: number; amount: number }>;
  wallet_ledger: {
    total_driver_commission_credited: number;
    total_payout_debited: number;
  };
  flags: {
    pending_with_razorpay_id_older_than_24h: number;
  };
}

export interface PlatformRevenueResponse {
  gross_revenue_from_online_payments: number;
  total_driver_commission_credited: number;
  net_platform_estimate: number;
  note: string;
}

export interface DriverCommissionRow {
  driver_id: string;
  driver_name: string | null;
  mobile_number: string;
  total_commission: number;
  transaction_count: number;
}

export interface DriverCommissionResponse {
  drivers: DriverCommissionRow[];
}

export interface RetryFailedPaymentResponse {
  payment_id: string;
  local_status: string;
  razorpay_status: string;
  message: string;
}

export const adminPaymentsApi = {
  list: (params?: PaymentListParams) =>
    axiosInstance.get<PaginatedPayments>('/admin/payments', { params }),

  listFailed: (params?: PaymentListParams) =>
    axiosInstance.get<{ data: FailedPaymentListItem[]; meta: PaginatedPayments['meta'] }>(
      '/payments/failed-transactions',
      { params }
    ),

  retryFailed: (payment_id: string) =>
    axiosInstance.post<RetryFailedPaymentResponse>('/payments/retry-failed', { payment_id }),

  reconciliation: () => axiosInstance.get<ReconciliationResponse>('/payments/reconciliation'),

  platformRevenue: (params?: { from?: string; to?: string }) =>
    axiosInstance.get<PlatformRevenueResponse>('/payments/platform-revenue', { params }),

  driverCommission: (params?: { from?: string; to?: string }) =>
    axiosInstance.get<DriverCommissionResponse>('/payments/driver-commission', { params }),
};
