import { axiosInstance } from './axiosInstance';

export interface SupportTicket {
  id: string;
  user_id?: string;
  driver_id?: string;
  subject: string;
  status: 'open' | 'closed' | 'in_progress';
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'admin' | 'user' | 'driver';
  sender_id: string;
  message: string;
  created_at: string;
}

export interface TicketDetail extends SupportTicket {
  messages: TicketMessage[];
}

export interface TicketsListResponse {
  data: SupportTicket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const adminSupportApi = {
  getTickets: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) =>
    axiosInstance.get<TicketsListResponse>('/support/tickets', { params }),

  /** Response is the ticket entity (axios unwraps `{ success, data }`). */
  getTicketById: (id: string) =>
    axiosInstance.get<TicketDetail & Record<string, unknown>>(`/support/tickets/${id}`),

  replyToTicket: (ticketId: string, message: string) =>
    axiosInstance.post<{ message: string }>('/support/message', {
      ticket_id: ticketId,
      body: message,
    }),

  updateTicketStatus: (id: string, status: 'open' | 'closed' | 'in_progress') =>
    axiosInstance.put<{ message: string }>(`/support/tickets/${id}/status`, { status }),
};
