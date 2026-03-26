import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  adminNotificationsApi,
  type NotificationCampaignStatus,
  type NotificationCampaignSummary,
  type NotificationHistoryResponse,
  type NotificationHistoryTargetType,
  type NotificationLog,
} from '@/services/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Send, History, RefreshCw, Info, ListChecks } from 'lucide-react';

function formatApiError(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (typeof e.apiMessage === 'string' && e.apiMessage.trim()) return e.apiMessage;
    if (Array.isArray(e.apiMessage)) {
      const parts = e.apiMessage.map(String).filter(Boolean);
      if (parts.length) return parts.join(', ');
    }
    const resp = e.response as { data?: { message?: unknown } } | undefined;
    const msg = resp?.data?.message;
    if (typeof msg === 'string' && msg.trim()) return msg;
    if (Array.isArray(msg)) {
      const parts = msg.map(String).filter(Boolean);
      if (parts.length) return parts.join(', ');
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return 'Something went wrong. Please try again.';
}

function deliveryIsFailed(status: string | undefined): boolean {
  return String(status ?? '').toUpperCase() === 'FAILED';
}

function isNoFcmTokenDelivery(log: NotificationLog): boolean {
  return (log.error_message ?? '').trim() === 'No FCM token';
}

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');

  return (
    <div className="space-y-6 text-slate-950 dark:text-slate-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'send'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            Send
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {activeTab === 'send' ? <SendNotificationTab /> : <NotificationHistoryTab />}
    </div>
  );
}

function SendNotificationTab() {
  const sendLockRef = useRef(false);
  const [targetType, setTargetType] = useState('BROADCAST_USERS');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetIds, setTargetIds] = useState(''); // Comma separated for specific users/drivers
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required');
      return;
    }
    if (sendLockRef.current) return;
    sendLockRef.current = true;
    setLoading(true);
    try {
      if (targetType === 'BROADCAST_USERS') {
        await adminNotificationsApi.broadcastUsers({ title, body, image_url: imageUrl });
      } else if (targetType === 'BROADCAST_DRIVERS') {
        await adminNotificationsApi.broadcastDrivers({ title, body, image_url: imageUrl });
      } else if (targetType === 'SPECIFIC_USERS') {
        const ids = targetIds.split(',').map(id => id.trim()).filter(Boolean);
        if (!ids.length) {
          toast.error('Please enter at least one user ID');
          return;
        }
        await adminNotificationsApi.notifyUsers({ user_ids: ids, title, body, image_url: imageUrl });
      } else if (targetType === 'SPECIFIC_DRIVERS') {
        const ids = targetIds.split(',').map(id => id.trim()).filter(Boolean);
        if (!ids.length) {
          toast.error('Please enter at least one driver ID');
          return;
        }
        await adminNotificationsApi.notifyDrivers({ driver_ids: ids, title, body, image_url: imageUrl });
      }
      toast.success('Notification sent successfully');
      setTitle('');
      setBody('');
      setImageUrl('');
      setTargetIds('');
    } catch (err: unknown) {
      toast.error(formatApiError(err));
    } finally {
      sendLockRef.current = false;
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Notification</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSend} className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="targetType">Target Audience</Label>
            <Select value={targetType} onValueChange={setTargetType}>
              <SelectTrigger id="targetType">
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BROADCAST_USERS">All Users</SelectItem>
                <SelectItem value="BROADCAST_DRIVERS">All Drivers</SelectItem>
                <SelectItem value="SPECIFIC_USERS">Specific Users</SelectItem>
                <SelectItem value="SPECIFIC_DRIVERS">Specific Drivers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(targetType === 'SPECIFIC_USERS' || targetType === 'SPECIFIC_DRIVERS') && (
            <div className="space-y-2">
              <Label htmlFor="targetIds">Target IDs (comma separated)</Label>
              <Input
                id="targetIds"
                placeholder="e.g. user123, user456"
                value={targetIds}
                onChange={(e) => setTargetIds(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Notification Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message Body</Label>
            <textarea
              id="body"
              className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
              placeholder="Enter your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? 'Sending...' : 'Send Notification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const TARGET_LABELS: Record<NotificationHistoryTargetType, string> = {
  ALL_USERS: 'All users',
  ALL_DRIVERS: 'All drivers',
  SPECIFIC_USERS: 'Specific users',
  SPECIFIC_DRIVERS: 'Specific drivers',
  TEST: 'Test device',
  UNKNOWN: 'Unknown',
};

function CampaignStatusBadge({ status }: { status: NotificationCampaignStatus }) {
  switch (status) {
    case 'SENT':
      return <Badge variant="default">All sent</Badge>;
    case 'FAILED':
      return <Badge variant="destructive">All failed</Badge>;
    case 'PARTIAL':
      return <Badge variant="secondary">Partial</Badge>;
    default:
      return <Badge variant="outline">No deliveries</Badge>;
  }
}

function NotificationHistoryTab() {
  const [history, setHistory] = useState<NotificationHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [histFrom, setHistFrom] = useState('');
  const [histTo, setHistTo] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCampaign, setDetailCampaign] = useState<NotificationCampaignSummary | null>(null);

  const [deliveriesOpen, setDeliveriesOpen] = useState(false);
  const [deliveriesCampaign, setDeliveriesCampaign] = useState<NotificationCampaignSummary | null>(null);
  const [deliveryLogs, setDeliveryLogs] = useState<NotificationLog[]>([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryPage, setDeliveryPage] = useState(1);
  const [deliveryMeta, setDeliveryMeta] = useState<{
    total: number;
    total_pages: number;
  } | null>(null);

  const [pendingResendLog, setPendingResendLog] = useState<NotificationLog | null>(null);
  const [resendSubmitting, setResendSubmitting] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminNotificationsApi.getHistory({
        page,
        limit: 10,
        group_by: 'campaign',
        from: histFrom || undefined,
        to: histTo || undefined,
      });
      setHistory(data);
    } catch (err: unknown) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [page, histFrom, histTo]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    setPage(1);
  }, [histFrom, histTo]);

  const DELIVERY_PAGE_SIZE = 100;

  async function loadDeliveries(campaignId: string, pageNum: number) {
    setDeliveryLoading(true);
    try {
      const { data } = await adminNotificationsApi.getHistory({
        group_by: 'delivery',
        notification_id: campaignId,
        page: pageNum,
        limit: DELIVERY_PAGE_SIZE,
      });
      if (data.group_by === 'delivery') {
        setDeliveryLogs(data.data);
        setDeliveryMeta({
          total: data.meta.total,
          total_pages: data.meta.total_pages,
        });
      }
    } catch (err: unknown) {
      toast.error(formatApiError(err));
      setDeliveryLogs([]);
      setDeliveryMeta(null);
    } finally {
      setDeliveryLoading(false);
    }
  }

  function openDetails(row: NotificationCampaignSummary) {
    setDetailCampaign(row);
    setDetailOpen(true);
  }

  function openDeliveries(row: NotificationCampaignSummary) {
    setDeliveriesCampaign(row);
    setDeliveryPage(1);
    setDeliveriesOpen(true);
    void loadDeliveries(row.notification_id, 1);
  }

  function requestResend(log: NotificationLog) {
    if (isNoFcmTokenDelivery(log)) {
      toast.error(
        'This recipient has no FCM token on file. They need to open the app so a device token is saved before you can resend.',
      );
      return;
    }
    setPendingResendLog(log);
  }

  async function confirmResend() {
    if (!pendingResendLog) return;
    setResendSubmitting(true);
    try {
      await adminNotificationsApi.resend(pendingResendLog.id);
      toast.success('Resend completed. Refresh the table to see the latest status.');
      setPendingResendLog(null);
      if (deliveriesCampaign) {
        await loadDeliveries(deliveriesCampaign.notification_id, deliveryPage);
      }
      await fetchHistory();
    } catch (err: unknown) {
      toast.error(formatApiError(err));
    } finally {
      setResendSubmitting(false);
    }
  }

  const meta = history?.meta ?? null;
  const campaigns = history?.group_by === 'campaign' ? history.data : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification History</CardTitle>
        <p className="text-sm text-slate-500 font-normal">
          Each row is one send. <strong>Details</strong> shows the message only. <strong>Deliveries</strong>{' '}
          loads per-device rows (max {DELIVERY_PAGE_SIZE} per page) where you can resend failures.
        </p>
        <div className="flex flex-wrap gap-3 items-end pt-2">
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">From</Label>
            <Input
              type="date"
              value={histFrom}
              onChange={(e) => setHistFrom(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">To</Label>
            <Input
              type="date"
              value={histTo}
              onChange={(e) => setHistTo(e.target.value)}
              className="w-[150px]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !campaigns.length ? (
          <div className="py-8 text-center text-slate-500">No notification history found.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(row.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {TARGET_LABELS[row.target_type] ?? row.target_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={row.title}>
                      {row.title}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {row.recipient_count === 0 ? (
                        '—'
                      ) : (
                        <>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {row.sent_count} sent
                          </span>
                          {' · '}
                          <span className="text-red-600 dark:text-red-400">
                            {row.failed_count} failed
                          </span>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <CampaignStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetails(row)}
                          title="Title, body, image URL, and summary counts"
                        >
                          <Info className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeliveries(row)}
                          disabled={row.recipient_count === 0}
                          title="Per-recipient delivery log and resend"
                        >
                          <ListChecks className="w-4 h-4 mr-2" />
                          Deliveries
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {meta && meta.total_pages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-slate-500">
                  Page {page} of {meta.total_pages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.total_pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Notification details</DialogTitle>
              <DialogDescription>
                Campaign id:{' '}
                <span className="font-mono text-xs">{detailCampaign?.notification_id}</span>
              </DialogDescription>
            </DialogHeader>

            {detailCampaign && (
              <div className="space-y-4 text-sm border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">Target</p>
                  <p>{TARGET_LABELS[detailCampaign.target_type] ?? detailCampaign.target_type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">Sent</p>
                  <p>{new Date(detailCampaign.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">Title</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{detailCampaign.title}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">Body</p>
                  <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                    {detailCampaign.body}
                  </p>
                </div>
                {detailCampaign.image_url ? (
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Image URL</p>
                    <a
                      href={detailCampaign.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 break-all"
                    >
                      {detailCampaign.image_url}
                    </a>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <CampaignStatusBadge status={detailCampaign.status} />
                  <span className="text-slate-600 dark:text-slate-400">
                    {detailCampaign.recipient_count === 0
                      ? 'No delivery rows'
                      : `${detailCampaign.sent_count} sent · ${detailCampaign.failed_count} failed · ${detailCampaign.recipient_count} total`}
                  </span>
                </div>
              </div>
            )}
            <p className="text-xs text-slate-500">
              Use <strong>Deliveries</strong> on the history row to open the delivery log and resend failed
              pushes.
            </p>
          </DialogContent>
        </Dialog>

        <Dialog
          open={deliveriesOpen}
          onOpenChange={(open) => {
            setDeliveriesOpen(open);
            if (!open) {
              setDeliveriesCampaign(null);
              setDeliveryLogs([]);
              setDeliveryMeta(null);
              setDeliveryPage(1);
              setPendingResendLog(null);
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Delivery log</DialogTitle>
              <DialogDescription>
                Campaign:{' '}
                <span className="font-mono text-xs">
                  {deliveriesCampaign?.notification_id}
                </span>
                {deliveriesCampaign?.title ? (
                  <>
                    <br />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {deliveriesCampaign.title}
                    </span>
                  </>
                ) : null}
              </DialogDescription>
            </DialogHeader>

            {pendingResendLog && (
              <div
                role="alert"
                className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/35 p-4 space-y-3"
              >
                <div>
                  <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
                    Resend this notification?
                  </p>
                  <p className="text-sm text-amber-900/90 dark:text-amber-200/85 mt-1">
                    The same title and body will be sent again using the FCM token stored for this
                    delivery. If the token is invalid, delivery may fail again.
                  </p>
                </div>
                <div className="text-xs space-y-1 font-mono text-slate-800 dark:text-slate-200 bg-white/60 dark:bg-black/25 rounded-md px-2 py-2">
                  <p>
                    <span className="text-slate-500 dark:text-slate-400 font-sans">Log id · </span>
                    {pendingResendLog.id}
                  </p>
                  {pendingResendLog.recipient_id ? (
                    <p>
                      <span className="text-slate-500 dark:text-slate-400 font-sans">Recipient · </span>
                      {pendingResendLog.recipient_id}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={resendSubmitting}
                    onClick={() => setPendingResendLog(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={resendSubmitting}
                    onClick={() => void confirmResend()}
                  >
                    {resendSubmitting ? 'Sending…' : 'Yes, resend now'}
                  </Button>
                </div>
              </div>
            )}

            {deliveryMeta && deliveryMeta.total > DELIVERY_PAGE_SIZE && (
              <p className="text-xs text-slate-500">
                Showing page {deliveryPage} of {deliveryMeta.total_pages} ({deliveryMeta.total} deliveries
                total).
              </p>
            )}

            {deliveryLoading ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : deliveryLogs.length === 0 ? (
              <p className="text-sm text-slate-500 py-2">No delivery rows.</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Log id</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Resend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveryLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs max-w-[120px] truncate" title={log.id}>
                          {log.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs uppercase text-slate-500">{log.recipient_type}</span>
                            <span
                              className="font-mono text-xs truncate max-w-[200px]"
                              title={log.recipient_id ?? ''}
                            >
                              {log.recipient_id ?? '—'}
                            </span>
                            {deliveryIsFailed(log.status) && log.error_message && (
                              <span
                                className="text-xs text-slate-500 truncate max-w-[260px]"
                                title={log.error_message}
                              >
                                {log.error_message}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={deliveryIsFailed(log.status) ? 'destructive' : 'default'}>
                            {deliveryIsFailed(log.status) ? 'Failed' : 'Sent'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {deliveryIsFailed(log.status) ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              title={
                                isNoFcmTokenDelivery(log)
                                  ? 'Tap to see why resend is not available'
                                  : 'Tap to review and confirm resend'
                              }
                              onClick={() => requestResend(log)}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Resend
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {deliveryMeta && deliveryMeta.total_pages > 1 && (
                  <div className="mt-4 flex justify-between items-center gap-2">
                    <p className="text-sm text-slate-500">
                      Page {deliveryPage} / {deliveryMeta.total_pages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deliveryPage <= 1 || deliveryLoading || !deliveriesCampaign}
                        onClick={() => {
                          if (!deliveriesCampaign) return;
                          const p = deliveryPage - 1;
                          setDeliveryPage(p);
                          void loadDeliveries(deliveriesCampaign.notification_id, p);
                        }}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          !deliveryMeta ||
                          deliveryPage >= deliveryMeta.total_pages ||
                          deliveryLoading ||
                          !deliveriesCampaign
                        }
                        onClick={() => {
                          if (!deliveriesCampaign) return;
                          const p = deliveryPage + 1;
                          setDeliveryPage(p);
                          void loadDeliveries(deliveriesCampaign.notification_id, p);
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
