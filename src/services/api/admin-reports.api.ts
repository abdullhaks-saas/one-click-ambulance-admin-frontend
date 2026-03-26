import { axiosInstance } from './axiosInstance';

export interface ReportParams {
  from?: string;
  to?: string;
  format?: 'csv' | 'xlsx';
  [key: string]: any;
}

export const adminReportsApi = {
  getRidesReport: (params?: ReportParams) =>
    axiosInstance.get('/reports/rides', { params }),

  getRevenueReport: (params?: ReportParams) =>
    axiosInstance.get('/reports/revenue', { params }),

  getDriversReport: (params?: ReportParams) =>
    axiosInstance.get('/reports/drivers', { params }),

  getPaymentsReport: (params?: ReportParams) =>
    axiosInstance.get('/reports/payments', { params }),

  getCancellationsReport: (params?: ReportParams) =>
    axiosInstance.get('/reports/cancellations', { params }),

  exportReport: (reportType: string, params?: ReportParams) =>
    axiosInstance.get(`/reports/export`, {
      params: { ...params, report: reportType },
      responseType: 'blob',
    }),
};
