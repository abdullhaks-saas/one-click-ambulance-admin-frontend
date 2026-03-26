import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  adminSupportApi,
  type SupportTicket,
  type TicketDetail,
  type TicketMessage,
} from '@/services/api';
import { toast } from 'sonner';
import { MessageSquare, Send, CheckCircle, Clock, Search } from 'lucide-react';

/** Backend returns `body` / `is_from_admin`; UI uses `message` / `sender_type`. */
function normalizeTicketDetail(raw: unknown): TicketDetail | null {
  if (!raw || typeof raw !== 'object') return null;
  const t = raw as Record<string, unknown>;
  const rawMessages = t.messages;
  const messages: TicketMessage[] = Array.isArray(rawMessages)
    ? rawMessages.map((m) => {
        const row = m as Record<string, unknown>;
        const fromAdmin = row.is_from_admin === true;
        return {
          id: String(row.id),
          ticket_id: String(row.ticket_id),
          sender_type: fromAdmin
            ? 'admin'
            : t.user_id
              ? 'user'
              : 'driver',
          sender_id: String(row.admin_id ?? t.user_id ?? ''),
          message: String(row.body ?? ''),
          created_at:
            row.created_at instanceof Date
              ? row.created_at.toISOString()
              : String(row.created_at ?? ''),
        };
      })
    : [];

  return {
    id: String(t.id),
    user_id: t.user_id != null && t.user_id !== '' ? String(t.user_id) : undefined,
    driver_id: t.driver_id != null && t.driver_id !== '' ? String(t.driver_id) : undefined,
    subject: String(t.subject ?? ''),
    status: t.status as TicketDetail['status'],
    created_at:
      t.created_at instanceof Date
        ? t.created_at.toISOString()
        : String(t.created_at ?? ''),
    updated_at:
      t.updated_at instanceof Date
        ? t.updated_at.toISOString()
        : String(t.updated_at ?? ''),
    messages,
  };
}

export function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | SupportTicket['status']>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminSupportApi.getTickets({
        page,
        limit: 15,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      setTickets(data.data);
      setMeta(data.meta);
    } catch (err: unknown) {
      toast.error((err as { apiMessage?: string })?.apiMessage ?? 'Failed to load tickets');
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 text-slate-950 dark:text-slate-50">
      {/* Ticket List */}
      <Card className="w-1/3 flex flex-col overflow-hidden">
        <CardHeader className="pb-3 border-b dark:border-slate-800 space-y-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Support Tickets
            {meta ? (
              <span className="text-sm font-normal text-slate-400">({meta.total} total)</span>
            ) : null}
          </CardTitle>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-slate-500">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as 'all' | SupportTicket['status'])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-slate-500">Search subject</Label>
                <Input
                  placeholder="Keyword…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" size="icon" className="shrink-0" title="Search">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0 flex flex-col min-h-0">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No tickets found.</div>
          ) : (
            <div className="divide-y dark:divide-slate-800">
              {tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    selectedTicketId === ticket.id ? 'bg-slate-50 dark:bg-slate-800' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium truncate pr-2">{ticket.subject}</span>
                    <Badge variant={ticket.status === 'closed' ? 'secondary' : ticket.status === 'in_progress' ? 'default' : 'destructive'}>
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 flex justify-between">
                    <span>{ticket.user_id ? 'User' : 'Driver'}</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {meta && meta.total_pages > 1 ? (
            <div className="p-3 border-t dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <p className="text-xs text-slate-500">
                Page {meta.page} / {meta.total_pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.total_pages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Ticket Detail / Chat */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {selectedTicketId ? (
          <TicketChat ticketId={selectedTicketId} onStatusChange={fetchTickets} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 flex-col gap-4">
            <MessageSquare className="w-12 h-12 opacity-20" />
            <p>Select a ticket to view details</p>
          </div>
        )}
      </Card>
    </div>
  );
}

type TicketStatusAction = 'in_progress' | 'closed';

function TicketChat({ ticketId, onStatusChange }: { ticketId: string, onStatusChange: () => void }) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [statusDialog, setStatusDialog] = useState<TicketStatusAction | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminSupportApi.getTicketById(ticketId);
      const detail = normalizeTicketDetail(data);
      if (!detail) {
        toast.error('Invalid ticket response');
        setTicket(null);
      } else {
        setTicket(detail);
      }
    } catch (err: any) {
      toast.error(err?.apiMessage || 'Failed to load ticket details');
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await adminSupportApi.replyToTicket(ticketId, reply);
      setReply('');
      fetchDetail();
    } catch (err: any) {
      toast.error(err?.apiMessage || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  }

  async function confirmStatusChange() {
    if (statusDialog === null) return;
    const status = statusDialog;
    setStatusSubmitting(true);
    try {
      await adminSupportApi.updateTicketStatus(ticketId, status);
      toast.success(
        status === 'closed' ? 'Ticket closed' : 'Ticket marked as in progress',
      );
      await fetchDetail();
      onStatusChange();
    } catch (err: any) {
      toast.error(err?.apiMessage || 'Failed to update status');
    } finally {
      setStatusSubmitting(false);
      setStatusDialog(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-slate-500">
        Could not load this ticket. Try another or refresh the list.
      </div>
    );
  }

  return (
    <>
      <Dialog
        open={statusDialog !== null}
        onOpenChange={(open) => {
          if (!open && !statusSubmitting) setStatusDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {statusDialog === 'closed'
                ? 'Close this ticket?'
                : 'Mark ticket as in progress?'}
            </DialogTitle>
            <DialogDescription>
              {statusDialog === 'closed'
                ? 'Closing will stop new replies on this ticket until it is opened again. You can still read the history.'
                : 'This marks the ticket as actively handled by support.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={statusSubmitting}
              onClick={() => setStatusDialog(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={statusDialog === 'closed' ? 'destructive' : 'default'}
              disabled={statusSubmitting}
              onClick={() => void confirmStatusChange()}
            >
              {statusSubmitting
                ? 'Updating…'
                : statusDialog === 'closed'
                  ? 'Close ticket'
                  : 'Mark in progress'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardHeader className="border-b dark:border-slate-800 flex flex-row items-center justify-between py-3">
        <div>
          <CardTitle className="text-lg">{ticket.subject}</CardTitle>
          <p className="text-sm text-slate-500">ID: {ticket.id}</p>
        </div>
        <div className="flex gap-2">
          {ticket.status !== 'in_progress' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusDialog('in_progress')}
            >
              <Clock className="w-4 h-4 mr-1" /> In Progress
            </Button>
          )}
          {ticket.status !== 'closed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusDialog('closed')}
            >
              <CheckCircle className="w-4 h-4 mr-1 text-green-600" /> Close Ticket
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
        {ticket.messages.map((msg) => {
          const isAdmin = msg.sender_type === 'admin';
          return (
            <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                isAdmin 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-tl-sm'
              }`}>
                <p className="text-sm">{msg.message}</p>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 mx-1">
                {isAdmin ? 'You' : msg.sender_type} • {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          );
        })}
      </CardContent>

      <div className="p-4 border-t dark:border-slate-800 bg-white dark:bg-slate-950">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            placeholder="Type your reply..." 
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            disabled={ticket.status === 'closed' || sending}
            className="flex-1"
          />
          <Button type="submit" disabled={!reply.trim() || ticket.status === 'closed' || sending}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
