import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Search,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { DashboardMetricCard } from './dashboard/DashboardMetricCard';
import { rollingDaysRange } from './dashboard/dateRange';
import { formatInr, formatInrPrecise } from './dashboard/formatters';
import { FinanceBackdrop, glassPanel, glassTableShell } from './finance/adminFinanceUi';
import {
  adminPaymentsApi,
  type FailedPaymentListItem,
  type PaymentListItem,
  type PlatformRevenueResponse,
  type ReconciliationResponse,
} from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PAYMENT_STATUSES = ['pending', 'success', 'failed', 'refunded'] as const;

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === 'success') return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300';
  if (s === 'failed') return 'bg-red-500/15 text-red-800 dark:text-red-300';
  if (s === 'pending') return 'bg-amber-500/15 text-amber-900 dark:text-amber-200';
  if (s === 'refunded') return 'bg-slate-500/15 text-slate-700 dark:text-slate-300';
  return 'bg-slate-500/10 text-slate-600';
}

function formatDt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function PaymentOverviewPage() {
  const defaultRev = useMemo(() => rollingDaysRange(30), []);

  const [recon, setRecon] = useState<ReconciliationResponse | null>(null);
  const [reconLoading, setReconLoading] = useState(true);

  const [revFrom, setRevFrom] = useState(defaultRev.from);
  const [revTo, setRevTo] = useState(defaultRev.to);
  const [platformRev, setPlatformRev] = useState<PlatformRevenueResponse | null>(null);
  const [revLoading, setRevLoading] = useState(true);

  const [commissionDrivers, setCommissionDrivers] = useState<
    { driver_id: string; driver_name: string | null; mobile_number: string; total_commission: number; transaction_count: number }[]
  >([]);
  const [commLoading, setCommLoading] = useState(true);

  const [payPage, setPayPage] = useState(1);
  const [payStatus, setPayStatus] = useState<string>('');
  const [payFrom, setPayFrom] = useState('');
  const [payTo, setPayTo] = useState('');
  const [paySearch, setPaySearch] = useState('');
  const [paySearchInput, setPaySearchInput] = useState('');
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [payMeta, setPayMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  } | null>(null);
  const [payLoading, setPayLoading] = useState(true);

  const [failedPage, setFailedPage] = useState(1);
  const [failedFrom, setFailedFrom] = useState('');
  const [failedTo, setFailedTo] = useState('');
  const [failedSearch, setFailedSearch] = useState('');
  const [failedSearchInput, setFailedSearchInput] = useState('');
  const [failedRows, setFailedRows] = useState<FailedPaymentListItem[]>([]);
  const [failedMeta, setFailedMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  } | null>(null);
  const [failedLoading, setFailedLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadRecon = useCallback(async () => {
    setReconLoading(true);
    try {
      const { data } = await adminPaymentsApi.reconciliation();
      setRecon(data);
    } catch (e: unknown) {
      toast.error((e as { apiMessage?: string })?.apiMessage ?? 'Failed to load reconciliation');
      setRecon(null);
    } finally {
      setReconLoading(false);
    }
  }, []);

  const loadRevenueBlock = useCallback(async () => {
    setRevLoading(true);
    setCommLoading(true);
    try {
      const [pr, dc] = await Promise.all([
        adminPaymentsApi.platformRevenue({ from: revFrom, to: revTo }),
        adminPaymentsApi.driverCommission({ from: revFrom, to: revTo }),
      ]);
      setPlatformRev(pr.data);
      setCommissionDrivers(dc.data.drivers ?? []);
    } catch (e: unknown) {
      toast.error((e as { apiMessage?: string })?.apiMessage ?? 'Failed to load revenue');
      setPlatformRev(null);
      setCommissionDrivers([]);
    } finally {
      setRevLoading(false);
      setCommLoading(false);
    }
  }, [revFrom, revTo]);

  const loadPayments = useCallback(async () => {
    setPayLoading(true);
    try {
      const { data } = await adminPaymentsApi.list({
        page: payPage,
        limit: 15,
        status: payStatus || undefined,
        from: payFrom || undefined,
        to: payTo || undefined,
        search: paySearch || undefined,
      });
      setPayments(data.data);
      setPayMeta(data.meta);
    } catch (e: unknown) {
      toast.error((e as { apiMessage?: string })?.apiMessage ?? 'Failed to load payments');
      setPayments([]);
      setPayMeta(null);
    } finally {
      setPayLoading(false);
    }
  }, [payPage, payStatus, payFrom, payTo, paySearch]);

  const loadFailed = useCallback(async () => {
    setFailedLoading(true);
    try {
      const { data } = await adminPaymentsApi.listFailed({
        page: failedPage,
        limit: 12,
        from: failedFrom || undefined,
        to: failedTo || undefined,
        search: failedSearch || undefined,
      });
      setFailedRows(data.data);
      setFailedMeta(data.meta);
    } catch (e: unknown) {
      toast.error((e as { apiMessage?: string })?.apiMessage ?? 'Failed to load failed payments');
      setFailedRows([]);
      setFailedMeta(null);
    } finally {
      setFailedLoading(false);
    }
  }, [failedPage, failedFrom, failedTo, failedSearch]);

  useEffect(() => {
    void loadRecon();
  }, [loadRecon]);

  useEffect(() => {
    void loadRevenueBlock();
  }, [loadRevenueBlock]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    void loadFailed();
  }, [loadFailed]);

  useEffect(() => {
    setPayPage(1);
  }, [payStatus, payFrom, payTo, paySearch]);

  useEffect(() => {
    setFailedPage(1);
  }, [failedFrom, failedTo, failedSearch]);

  async function handleRetry(paymentId: string) {
    setRetryingId(paymentId);
    try {
      const { data } = await adminPaymentsApi.retryFailed(paymentId);
      toast.success(data.message ?? 'Status refreshed');
      void loadFailed();
      void loadPayments();
      void loadRecon();
    } catch (e: unknown) {
      toast.error((e as { apiMessage?: string })?.apiMessage ?? 'Sync failed');
    } finally {
      setRetryingId(null);
    }
  }

  function paySearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPaySearch(paySearchInput);
  }

  function failedSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFailedSearch(failedSearchInput);
  }

  const statusEntries = recon ? Object.entries(recon.payments_by_status) : [];

  return (
    <div className="relative min-h-full">
      <FinanceBackdrop />

      <div className="relative mx-auto max-w-[1600px] space-y-6 pb-10">
        <div className="analytics-section-in flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-semibold tracking-tight text-transparent dark:from-white dark:to-slate-300">
              Payment overview
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Razorpay collections, ledger reconciliation, and failed payment recovery.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 border-white/50 bg-white/60 shadow-md backdrop-blur-md dark:border-slate-600 dark:bg-slate-800/60"
            onClick={() => {
              void loadRecon();
              void loadRevenueBlock();
              void loadPayments();
              void loadFailed();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh all
          </Button>
        </div>

        {recon &&
        recon.flags.pending_with_razorpay_id_older_than_24h > 0 &&
        !reconLoading ? (
          <div
            className="analytics-section-in flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-amber-950 shadow-md backdrop-blur-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
            style={{ animationDelay: '40ms' }}
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">Stale pending payments</p>
              <p className="text-sm opacity-90">
                {recon.flags.pending_with_razorpay_id_older_than_24h} payment(s) still pending with a
                Razorpay ID, older than 24h — review in Failed & pending and sync status.
              </p>
            </div>
          </div>
        ) : null}

        <div
          className="analytics-section-in grid grid-cols-1 gap-4 lg:grid-cols-3"
          style={{ animationDelay: '60ms' }}
        >
          <Card className={cn('overflow-hidden lg:col-span-3', glassPanel)}>
            <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50">
              <CardTitle className="text-lg">Revenue window</CardTitle>
              <CardDescription className="dark:text-slate-400">
                Gross successful online payments vs driver commission (wallet) in range.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="rev-from">From</Label>
                <Input
                  id="rev-from"
                  type="date"
                  value={revFrom}
                  onChange={(e) => setRevFrom(e.target.value)}
                  className="border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rev-to">To</Label>
                <Input
                  id="rev-to"
                  type="date"
                  value={revTo}
                  onChange={(e) => setRevTo(e.target.value)}
                  className="border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50"
                />
              </div>
              <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    const r = rollingDaysRange(7);
                    setRevFrom(r.from);
                    setRevTo(r.to);
                  }}
                >
                  Last 7 days
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    const r = rollingDaysRange(30);
                    setRevFrom(r.from);
                    setRevTo(r.to);
                  }}
                >
                  Last 30 days
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div
          className="analytics-section-in grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          style={{ animationDelay: '90ms' }}
        >
          <DashboardMetricCard
            title="Gross (online)"
            value={platformRev ? formatInr(platformRev.gross_revenue_from_online_payments) : '—'}
            description="Successful payments in range"
            icon={TrendingUp}
            iconClassName="bg-emerald-600 dark:bg-emerald-500"
            loading={revLoading}
            className={glassPanel}
          />
          <DashboardMetricCard
            title="Commission credited"
            value={platformRev ? formatInrPrecise(platformRev.total_driver_commission_credited) : '—'}
            description="Driver wallet ledger (range)"
            icon={Wallet}
            iconClassName="bg-violet-600 dark:bg-violet-500"
            loading={revLoading}
            className={glassPanel}
          />
          <DashboardMetricCard
            title="Net estimate"
            value={platformRev ? formatInrPrecise(platformRev.net_platform_estimate) : '—'}
            description={platformRev?.note?.slice(0, 48) ?? 'Simplified platform share'}
            icon={TrendingUp}
            iconClassName="bg-sky-600 dark:bg-sky-500"
            loading={revLoading}
            className={glassPanel}
          />
          <DashboardMetricCard
            title="Payouts debited (all time)"
            value={
              recon ? formatInrPrecise(recon.wallet_ledger.total_payout_debited) : '—'
            }
            description="From reconciliation ledger"
            icon={Wallet}
            iconClassName="bg-red-600 dark:bg-red-500"
            loading={reconLoading}
            className={glassPanel}
          />
        </div>

        <div
          className="analytics-section-in grid grid-cols-1 gap-4 xl:grid-cols-2"
          style={{ animationDelay: '120ms' }}
        >
          <Card className={cn('overflow-hidden', glassPanel)}>
            <CardHeader>
              <CardTitle className="text-lg">Payments by status</CardTitle>
              <CardDescription className="dark:text-slate-400">All-time aggregates</CardDescription>
            </CardHeader>
            <CardContent>
              {reconLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : statusEntries.length === 0 ? (
                <p className="text-sm text-slate-500">No payment data.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {statusEntries.map(([st, v]) => (
                    <div
                      key={st}
                      className="rounded-xl border border-slate-200/60 bg-white/50 p-4 dark:border-slate-700/50 dark:bg-slate-950/30"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge className={cn('font-semibold capitalize', statusBadgeClass(st))}>
                          {st}
                        </Badge>
                        <span className="text-sm text-slate-500">{v.count} tx</span>
                      </div>
                      <p className="mt-2 text-xl font-semibold tabular-nums">
                        {formatInrPrecise(v.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={cn('overflow-hidden', glassPanel)}>
            <CardHeader>
              <CardTitle className="text-lg">Commission by driver</CardTitle>
              <CardDescription className="dark:text-slate-400">
                Wallet commission credits · {revFrom} → {revTo}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {commLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : commissionDrivers.length === 0 ? (
                <p className="text-sm text-slate-500">No commission rows in this range.</p>
              ) : (
                <div className={cn('max-h-[320px] overflow-auto', glassTableShell)}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver</TableHead>
                        <TableHead className="hidden sm:table-cell">Mobile</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="text-right">Tx</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionDrivers.map((d) => (
                        <TableRow key={d.driver_id}>
                          <TableCell className="font-medium">{d.driver_name ?? '—'}</TableCell>
                          <TableCell className="hidden sm:table-cell text-slate-600 dark:text-slate-400">
                            {d.mobile_number}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatInrPrecise(d.total_commission)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {d.transaction_count}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="analytics-section-in space-y-4" style={{ animationDelay: '150ms' }}>
          <Card className={cn('overflow-hidden', glassPanel)}>
            <CardHeader className="flex flex-col gap-2 border-b border-slate-200/50 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/50">
              <div>
                <CardTitle className="text-lg">All payments</CardTitle>
                <CardDescription className="dark:text-slate-400">
                  {payMeta ? `${payMeta.total} records` : 'Paginated ledger'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Status</Label>
                  <Select
                    value={payStatus || 'all'}
                    onValueChange={(v) => setPayStatus(v === 'all' ? '' : v)}
                  >
                    <SelectTrigger className="w-full min-w-[140px] border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50 lg:w-[160px]">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {PAYMENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">From</Label>
                  <Input
                    type="date"
                    value={payFrom}
                    onChange={(e) => setPayFrom(e.target.value)}
                    className="w-full min-w-[140px] border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50 lg:w-[150px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">To</Label>
                  <Input
                    type="date"
                    value={payTo}
                    onChange={(e) => setPayTo(e.target.value)}
                    className="w-full min-w-[140px] border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50 lg:w-[150px]"
                  />
                </div>
                <form onSubmit={paySearchSubmit} className="flex flex-1 flex-col gap-2 min-w-[200px]">
                  <Label className="text-xs text-slate-500">Search</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="User, Razorpay id…"
                      value={paySearchInput}
                      onChange={(e) => setPaySearchInput(e.target.value)}
                      className="border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50"
                    />
                    <Button type="submit" variant="outline" size="icon" className="shrink-0">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>

              {payLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>When</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="hidden md:table-cell">User</TableHead>
                          <TableHead className="hidden lg:table-cell">Razorpay</TableHead>
                          <TableHead className="text-right">Tx #</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                              {formatDt(p.created_at)}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn('capitalize', statusBadgeClass(p.status))}>
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {formatInrPrecise(p.amount)}
                            </TableCell>
                            <TableCell className="hidden max-w-[140px] truncate text-sm md:table-cell">
                              {p.user?.name ?? '—'}{' '}
                              <span className="text-slate-500">{p.user?.mobile_number}</span>
                            </TableCell>
                            <TableCell className="hidden max-w-[120px] truncate font-mono text-xs lg:table-cell">
                              {p.razorpay_payment_id ?? '—'}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{p.transaction_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {payMeta && payMeta.total_pages > 1 ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-500">
                        Page {payMeta.page} of {payMeta.total_pages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={payPage <= 1}
                          onClick={() => setPayPage((x) => x - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={payPage >= payMeta.total_pages}
                          onClick={() => setPayPage((x) => x + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>

          <Card className={cn('overflow-hidden', glassPanel)}>
            <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg">Failed & pending</CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    Sync with Razorpay when a payment id exists
                  </CardDescription>
                </div>
                {(failedFrom || failedTo || failedSearch) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 self-start text-slate-500"
                    onClick={() => {
                      setFailedFrom('');
                      setFailedTo('');
                      setFailedSearch('');
                      setFailedSearchInput('');
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">From</Label>
                  <Input
                    type="date"
                    value={failedFrom}
                    onChange={(e) => setFailedFrom(e.target.value)}
                    className="w-full sm:w-[150px] border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">To</Label>
                  <Input
                    type="date"
                    value={failedTo}
                    onChange={(e) => setFailedTo(e.target.value)}
                    className="w-full sm:w-[150px] border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50"
                  />
                </div>
                <form onSubmit={failedSearchSubmit} className="flex flex-1 flex-col gap-2 min-w-[200px]">
                  <Label className="text-xs text-slate-500">Search</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="User or Razorpay id…"
                      value={failedSearchInput}
                      onChange={(e) => setFailedSearchInput(e.target.value)}
                      className="border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50"
                    />
                    <Button type="submit" variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>

              {failedLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className={cn('overflow-x-auto', glassTableShell)}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Updated</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="hidden sm:table-cell">User</TableHead>
                          <TableHead className="hidden md:table-cell">Razorpay</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {failedRows.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="whitespace-nowrap text-xs">
                              {formatDt(p.updated_at)}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn('capitalize', statusBadgeClass(p.status))}>
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatInrPrecise(p.amount)}
                            </TableCell>
                            <TableCell className="hidden max-w-[130px] truncate sm:table-cell">
                              {p.user?.name ?? '—'}
                            </TableCell>
                            <TableCell className="hidden max-w-[100px] truncate font-mono text-xs md:table-cell">
                              {p.razorpay_payment_id ?? '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="text-xs"
                                disabled={!p.razorpay_payment_id || retryingId === p.id}
                                onClick={() => void handleRetry(p.id)}
                              >
                                {retryingId === p.id ? 'Syncing…' : 'Sync Razorpay'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {failedMeta && failedMeta.total_pages > 1 ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-500">
                        Page {failedMeta.page} of {failedMeta.total_pages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={failedPage <= 1}
                          onClick={() => setFailedPage((x) => x - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={failedPage >= failedMeta.total_pages}
                          onClick={() => setFailedPage((x) => x + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
