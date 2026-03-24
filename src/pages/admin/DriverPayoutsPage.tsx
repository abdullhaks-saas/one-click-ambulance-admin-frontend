import { useCallback, useEffect, useState } from 'react';
import { Banknote, Plus, RefreshCw, Search, X } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { FinanceBackdrop, glassPanel, glassTableShell } from './finance/adminFinanceUi';
import { formatInrPrecise } from './dashboard/formatters';
import { adminPayoutsApi, type PayoutListItem } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PAYOUT_STATUSES = ['pending', 'processing', 'completed', 'failed'] as const;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function payoutBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === 'completed') return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300';
  if (s === 'failed') return 'bg-red-500/15 text-red-800 dark:text-red-300';
  if (s === 'processing') return 'bg-sky-500/15 text-sky-900 dark:text-sky-200';
  return 'bg-amber-500/15 text-amber-900 dark:text-amber-200';
}

function formatDt(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function DriverPayoutsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [driverInput, setDriverInput] = useState('');

  const [rows, setRows] = useState<PayoutListItem[]>([]);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [processOpen, setProcessOpen] = useState(false);
  const [minBalance, setMinBalance] = useState('0.01');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [driverIdsText, setDriverIdsText] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    const params = {
      page,
      limit: 15,
      status: status || undefined,
      from: from || undefined,
      to: to || undefined,
    };
    try {
      if (driverFilter && UUID_RE.test(driverFilter.trim())) {
        const { data } = await adminPayoutsApi.listByDriver(driverFilter.trim(), params);
        const mapped: PayoutListItem[] = data.data.map((r) => ({
          id: r.id,
          driver_id: data.driver_id,
          driver_bank_account_id: null,
          amount: r.amount,
          currency: r.currency,
          status: r.status,
          period_start: r.period_start,
          period_end: r.period_end,
          failure_reason: r.failure_reason,
          created_at: r.created_at,
          updated_at: r.created_at,
          bank: r.bank,
        }));
        setRows(mapped);
        setMeta(data.meta);
      } else {
        const { data } = await adminPayoutsApi.list(params);
        setRows(data.data);
        setMeta(data.meta);
      }
    } catch (e: unknown) {
      toast.error((e as { apiMessage?: string })?.apiMessage ?? 'Failed to load payouts');
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, status, from, to, driverFilter]);

  useEffect(() => {
    void fetchPayouts();
  }, [fetchPayouts]);

  useEffect(() => {
    setPage(1);
  }, [status, from, to, driverFilter]);

  function applyDriverFilter(e: React.FormEvent) {
    e.preventDefault();
    const t = driverInput.trim();
    if (t && !UUID_RE.test(t)) {
      toast.error('Enter a valid driver UUID');
      return;
    }
    setDriverFilter(t);
  }

  function clearDriverFilter() {
    setDriverInput('');
    setDriverFilter('');
  }

  function parseDriverIds(raw: string): string[] | undefined {
    const parts = raw
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const valid = parts.filter((id) => UUID_RE.test(id));
    if (valid.length === 0) return undefined;
    return valid;
  }

  async function submitProcess() {
    const min = parseFloat(minBalance);
    if (Number.isNaN(min) || min < 0) {
      toast.error('Min balance must be a non-negative number');
      return;
    }
    setProcessing(true);
    try {
      const driver_ids = parseDriverIds(driverIdsText);
      const { data } = await adminPayoutsApi.process({
        driver_ids,
        min_balance: min,
        period_start: periodStart ? new Date(periodStart).toISOString() : undefined,
        period_end: periodEnd ? new Date(periodEnd).toISOString() : undefined,
      });
      const skipNote =
        data.skipped?.length > 0 ? ` · ${data.skipped.length} driver(s) skipped` : '';
      toast.success(`${data.message}${skipNote}`);
      setProcessOpen(false);
      setDriverIdsText('');
      void fetchPayouts();
    } catch (e: unknown) {
      toast.error((e as { apiMessage?: string })?.apiMessage ?? 'Process failed');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="relative min-h-full">
      <FinanceBackdrop />

      <div className="relative mx-auto max-w-[1600px] space-y-6 pb-10">
        <div className="analytics-section-in flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-semibold tracking-tight text-transparent dark:from-white dark:to-slate-300">
              Driver payouts
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Ledger payouts, bank linkage, and weekly processing (wallet debit).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 border-white/50 bg-white/60 shadow-md backdrop-blur-md dark:border-slate-600 dark:bg-slate-800/60"
              onClick={() => void fetchPayouts()}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-2 shadow-md shadow-red-600/20"
              onClick={() => setProcessOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Process payouts
            </Button>
          </div>
        </div>

        <Card className={cn('analytics-section-in overflow-hidden', glassPanel)} style={{ animationDelay: '50ms' }}>
          <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Banknote className="h-5 w-5 text-red-600" aria-hidden />
              Payout records
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              {meta ? `${meta.total} total` : 'Filter by status, dates, or one driver'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-end">
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Status</Label>
                <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-full min-w-[140px] border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50 xl:w-[160px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {PAYOUT_STATUSES.map((s) => (
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
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full min-w-[140px] border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50 xl:w-[150px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">To</Label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full min-w-[140px] border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50 xl:w-[150px]"
                />
              </div>
              <form onSubmit={applyDriverFilter} className="flex min-w-0 flex-1 flex-col gap-2 sm:min-w-[260px]">
                <Label className="text-xs text-slate-500">Driver ID (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="UUID to show one driver’s history"
                    value={driverInput}
                    onChange={(e) => setDriverInput(e.target.value)}
                    className="min-w-0 border-slate-200/80 bg-white/70 font-mono text-xs backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50"
                  />
                  <Button type="submit" variant="outline" size="icon" className="shrink-0">
                    <Search className="h-4 w-4" />
                  </Button>
                  {driverFilter ? (
                    <Button type="button" variant="ghost" size="icon" onClick={clearDriverFilter}>
                      <X className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </form>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className={cn('overflow-x-auto', glassTableShell)}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Created</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead className="hidden md:table-cell">Bank</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="hidden lg:table-cell">Period</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                            No payouts match your filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                              {formatDt(r.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[140px]">
                                <p className="truncate font-medium">{r.driver?.name ?? '—'}</p>
                                <p className="truncate font-mono text-[11px] text-slate-500">
                                  {r.driver_id.slice(0, 8)}…
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {r.bank ? (
                                <span className="text-sm">
                                  {r.bank.bank_name}
                                  {r.bank.account_number_last4 ? (
                                    <span className="text-slate-500"> · …{r.bank.account_number_last4}</span>
                                  ) : null}
                                </span>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn('capitalize', payoutBadgeClass(r.status))}>
                                {r.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {formatInrPrecise(r.amount)} {r.currency}
                            </TableCell>
                            <TableCell className="hidden text-xs text-slate-600 lg:table-cell dark:text-slate-400">
                              {formatDt(r.period_start)} → {formatDt(r.period_end)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {meta && meta.total_pages > 1 ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Page {meta.page} of {meta.total_pages}
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
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-white/40 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Process payouts</DialogTitle>
            <DialogDescription>
              Debits driver wallets and records payouts in the ledger. Drivers need a bank account on
              file; optional UUID list limits who is included; otherwise all wallets above the minimum
              balance are processed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="min-bal">Minimum wallet balance</Label>
              <Input
                id="min-bal"
                type="number"
                step="0.01"
                min={0}
                value={minBalance}
                onChange={(e) => setMinBalance(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-start">Period start (optional)</Label>
                <Input
                  id="p-start"
                  type="datetime-local"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-end">Period end (optional)</Label>
                <Input
                  id="p-end"
                  type="datetime-local"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver-ids">Driver IDs (optional)</Label>
              <textarea
                id="driver-ids"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="One UUID per line or comma-separated. Leave empty for all qualifying wallets."
                value={driverIdsText}
                onChange={(e) => setDriverIdsText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setProcessOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={processing} onClick={() => void submitProcess()}>
              {processing ? 'Processing…' : 'Run payout job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
