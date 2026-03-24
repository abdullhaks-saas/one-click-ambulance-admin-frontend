import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarRange,
  RefreshCw,
  Timer,
  TrendingDown,
  TrendingUp,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { AnalyticsBarSeriesCard } from './analytics/AnalyticsBarSeriesCard';
import { AnalyticsHorizontalBarsCard } from './analytics/AnalyticsHorizontalBarsCard';
import { DashboardMetricCard } from './dashboard/DashboardMetricCard';
import { rollingDaysRange } from './dashboard/dateRange';
import { formatInr, formatInrPrecise, formatResponseTime } from './dashboard/formatters';
import {
  adminAnalyticsApi,
  adminPricingApi,
  adminZonesApi,
  type AmbulanceTypeDemandResponse,
  type AverageResponseTimeResponse,
  type DailyRidesResponse,
  type DriverUtilizationResponse,
  type MonthlyRidesResponse,
  type RevenueSummaryResponse,
  type RideCancellationsResponse,
  type TopDriversResponse,
  type WeeklyRidesResponse,
  type ZoneDemandResponse,
  type Zone,
} from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ALL_VALUE = '__all__';

const glassPanel =
  'border-white/45 bg-white/72 shadow-xl shadow-slate-900/[0.07] backdrop-blur-xl ring-1 ring-slate-200/35 transition-all duration-300 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/40 dark:ring-white/5 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-2xl dark:motion-safe:hover:shadow-black/50';

const glassTableShell =
  'rounded-xl border border-white/35 bg-white/45 shadow-inner backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-950/35';

function presetClass(active: boolean) {
  return cn(
    'rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-300',
    'motion-safe:hover:scale-[1.04] motion-safe:active:scale-[0.97]',
    active
      ? 'bg-red-600 text-white shadow-red-600/25 ring-2 ring-red-500/30'
      : 'bg-white/70 text-slate-600 shadow-slate-900/5 ring-1 ring-slate-200/60 hover:bg-white dark:bg-slate-800/70 dark:text-slate-300 dark:ring-slate-600/50 dark:hover:bg-slate-800'
  );
}

type AnalyticsKey =
  | 'dailyRides'
  | 'weeklyRides'
  | 'monthlyRides'
  | 'revenue'
  | 'driverUtil'
  | 'responseTime'
  | 'topDrivers'
  | 'cancellations'
  | 'zoneDemand'
  | 'ambulanceDemand';

interface AnalyticsBundle {
  dailyRides: DailyRidesResponse | null;
  weeklyRides: WeeklyRidesResponse | null;
  monthlyRides: MonthlyRidesResponse | null;
  revenue: RevenueSummaryResponse | null;
  driverUtil: DriverUtilizationResponse | null;
  responseTime: AverageResponseTimeResponse | null;
  topDrivers: TopDriversResponse | null;
  cancellations: RideCancellationsResponse | null;
  zoneDemand: ZoneDemandResponse | null;
  ambulanceDemand: AmbulanceTypeDemandResponse | null;
}

const EMPTY_BUNDLE: AnalyticsBundle = {
  dailyRides: null,
  weeklyRides: null,
  monthlyRides: null,
  revenue: null,
  driverUtil: null,
  responseTime: null,
  topDrivers: null,
  cancellations: null,
  zoneDemand: null,
  ambulanceDemand: null,
};

function shortDateLabel(ymd: string): string {
  const [, m, d] = ymd.split('-');
  if (!m || !d) return ymd;
  return `${m}/${d}`;
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-');
  if (!y || !m) return ym;
  const idx = parseInt(m, 10) - 1;
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[idx] ?? m} ${y.slice(2)}`;
}

export function AdminAnalyticsPage() {
  const defaultRange = useMemo(() => rollingDaysRange(30), []);
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [zoneId, setZoneId] = useState<string>(ALL_VALUE);
  const [ambulanceTypeId, setAmbulanceTypeId] = useState<string>(ALL_VALUE);

  const [zones, setZones] = useState<Zone[]>([]);
  const [ambulanceTypes, setAmbulanceTypes] = useState<{ id: string; name: string }[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  const [bundle, setBundle] = useState<AnalyticsBundle>(EMPTY_BUNDLE);
  const [errors, setErrors] = useState<Partial<Record<AnalyticsKey, string>>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const activePreset = useMemo(() => {
    const r7 = rollingDaysRange(7);
    const r30 = rollingDaysRange(30);
    const r90 = rollingDaysRange(90);
    if (from === r7.from && to === r7.to) return 7;
    if (from === r30.from && to === r30.to) return 30;
    if (from === r90.from && to === r90.to) return 90;
    return null;
  }, [from, to]);

  const rangeParams = useMemo(() => {
    const p: { from: string; to: string; zone_id?: string; ambulance_type_id?: string } = {
      from,
      to,
    };
    if (zoneId !== ALL_VALUE) p.zone_id = zoneId;
    if (ambulanceTypeId !== ALL_VALUE) p.ambulance_type_id = ambulanceTypeId;
    return p;
  }, [from, to, zoneId, ambulanceTypeId]);

  const loadFilters = useCallback(async () => {
    setFiltersLoading(true);
    try {
      const [zRes, pRes] = await Promise.allSettled([
        adminZonesApi.list({ page: 1, limit: 200 }),
        adminPricingApi.list(),
      ]);
      if (zRes.status === 'fulfilled') {
        const payload = zRes.value.data as { data: Zone[] };
        setZones(payload.data ?? []);
      }
      if (pRes.status === 'fulfilled') {
        const rules = pRes.value.data;
        const list = Array.isArray(rules)
          ? rules.map((r) => ({ id: r.ambulance_type_id, name: r.ambulance_type_name }))
          : [];
        const seen = new Set<string>();
        setAmbulanceTypes(list.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true))));
      }
    } catch {
      toast.error('Failed to load filter options');
    } finally {
      setFiltersLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const tasks: { key: AnalyticsKey; run: () => Promise<unknown> }[] = [
      {
        key: 'dailyRides',
        run: () => adminAnalyticsApi.dailyRides(rangeParams).then((r) => r.data),
      },
      {
        key: 'weeklyRides',
        run: () => adminAnalyticsApi.weeklyRides(rangeParams).then((r) => r.data),
      },
      {
        key: 'monthlyRides',
        run: () => adminAnalyticsApi.monthlyRides(rangeParams).then((r) => r.data),
      },
      {
        key: 'revenue',
        run: () => adminAnalyticsApi.revenueSummary(rangeParams).then((r) => r.data),
      },
      {
        key: 'driverUtil',
        run: () => adminAnalyticsApi.driverUtilization(rangeParams).then((r) => r.data),
      },
      {
        key: 'responseTime',
        run: () => adminAnalyticsApi.averageResponseTime(rangeParams).then((r) => r.data),
      },
      {
        key: 'topDrivers',
        run: () => adminAnalyticsApi.topDrivers({ ...rangeParams, limit: 15 }).then((r) => r.data),
      },
      {
        key: 'cancellations',
        run: () => adminAnalyticsApi.rideCancellations(rangeParams).then((r) => r.data),
      },
      {
        key: 'zoneDemand',
        run: () => adminAnalyticsApi.zoneDemand(rangeParams).then((r) => r.data),
      },
      {
        key: 'ambulanceDemand',
        run: () => adminAnalyticsApi.ambulanceTypeDemand(rangeParams).then((r) => r.data),
      },
    ];

    const next: AnalyticsBundle = { ...EMPTY_BUNDLE };
    const nextErr: Partial<Record<AnalyticsKey, string>> = {};

    await Promise.all(
      tasks.map(async ({ key, run }) => {
        try {
          const data = (await run()) as AnalyticsBundle[typeof key];
          next[key] = data as never;
        } catch (e: unknown) {
          const msg = (e as { apiMessage?: string })?.apiMessage ?? 'Failed to load';
          nextErr[key] = msg;
        }
      })
    );

    setBundle(next);
    setErrors(nextErr);
    setLoading(false);

    const failed = Object.keys(nextErr).length;
    if (failed > 0 && failed === tasks.length) {
      toast.error('Could not load analytics. Check your session or date range.');
    } else if (failed > 0) {
      toast.message('Some analytics sections failed to load');
    }
  }, [rangeParams]);

  useEffect(() => {
    void loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  }

  function applyPreset(days: number) {
    const r = rollingDaysRange(days);
    setFrom(r.from);
    setTo(r.to);
  }

  const dailyPoints = useMemo(
    () =>
      (bundle.dailyRides?.days ?? []).map((d) => ({
        key: d.date,
        label: shortDateLabel(d.date),
        value: d.ride_count,
        title: `${d.date}: ${d.ride_count} bookings`,
      })),
    [bundle.dailyRides]
  );

  const weeklyPoints = useMemo(
    () =>
      (bundle.weeklyRides?.weeks ?? []).map((w) => ({
        key: w.week_start,
        label: shortDateLabel(w.week_start),
        value: w.ride_count,
        title: `Week of ${w.week_start}: ${w.ride_count} bookings`,
      })),
    [bundle.weeklyRides]
  );

  const monthlyPoints = useMemo(
    () =>
      (bundle.monthlyRides?.months ?? []).map((m) => ({
        key: m.year_month,
        label: monthLabel(m.year_month),
        value: m.ride_count,
        title: `${m.year_month}: ${m.ride_count} bookings`,
      })),
    [bundle.monthlyRides]
  );

  const revenuePoints = useMemo(
    () =>
      (bundle.revenue?.by_day ?? []).map((d) => ({
        key: d.date,
        label: shortDateLabel(d.date),
        value: d.revenue,
        title: `${d.date}: ${formatInr(d.revenue)}`,
      })),
    [bundle.revenue]
  );

  const responsePoints = useMemo(
    () =>
      (bundle.responseTime?.by_day ?? []).map((d) => ({
        key: d.date,
        label: shortDateLabel(d.date),
        value: d.average_response_time_seconds,
        title: `${d.date}: ${formatResponseTime(d.average_response_time_seconds)} avg`,
      })),
    [bundle.responseTime]
  );

  const zoneBarItems = useMemo(() => {
    const rows = [...(bundle.zoneDemand?.zones ?? [])].sort((a, b) => b.ride_count - a.ride_count);
    return rows.map((z) => ({
      key: z.zone_id ?? 'unknown',
      label: z.zone_name ?? 'Unassigned',
      value: z.ride_count,
    }));
  }, [bundle.zoneDemand]);

  const ambulanceBarItems = useMemo(() => {
    const rows = [...(bundle.ambulanceDemand?.ambulance_types ?? [])].sort(
      (a, b) => b.ride_count - a.ride_count
    );
    return rows.map((t) => ({
      key: t.ambulance_type_id,
      label: t.ambulance_type_name,
      value: t.ride_count,
    }));
  }, [bundle.ambulanceDemand]);

  const cancellationReasonRows = useMemo(() => {
    const r = [...(bundle.cancellations?.by_reason ?? [])].sort((a, b) => b.count - a.count);
    return r;
  }, [bundle.cancellations]);

  const sortedUtilDrivers = useMemo(() => {
    const d = [...(bundle.driverUtil?.drivers ?? [])].sort((a, b) => b.completed_rides - a.completed_rides);
    return d;
  }, [bundle.driverUtil]);

  return (
    <div className="relative min-h-full">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-[-8%] h-[min(420px,90vw)] w-[min(420px,90vw)] rounded-full bg-gradient-to-br from-red-500/15 to-transparent blur-3xl dark:from-red-600/25" />
        <div className="absolute right-[-12%] top-[22%] h-[min(360px,80vw)] w-[min(360px,80vw)] rounded-full bg-gradient-to-bl from-violet-500/12 to-transparent blur-3xl dark:from-violet-500/22" />
        <div className="absolute bottom-[-5%] left-[18%] h-[min(300px,70vw)] w-[min(300px,70vw)] rounded-full bg-gradient-to-tr from-sky-400/14 to-transparent blur-3xl dark:from-sky-500/20" />
      </div>

      <div className="relative mx-auto max-w-[1600px] space-y-6 pb-10 text-foreground">
        <div
          className="analytics-section-in flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
          style={{ animationDelay: '30ms' }}
        >
          <div>
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-semibold tracking-tight text-transparent dark:from-white dark:to-slate-300">
              Analytics
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Bookings, revenue, response times, and demand for the selected range. Filters apply to all
              charts and tables.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'shrink-0 gap-2 self-start border-white/50 bg-white/60 shadow-md backdrop-blur-md transition-all duration-300 lg:self-auto',
              'hover:bg-white/90 hover:shadow-lg dark:border-slate-600/60 dark:bg-slate-800/60 dark:hover:bg-slate-800/90'
            )}
            onClick={() => void handleRefresh()}
            disabled={refreshing || loading}
          >
            <RefreshCw className={cn('h-4 w-4', refreshing ? 'animate-spin' : '')} />
            Refresh
          </Button>
        </div>

        <div className="analytics-section-in" style={{ animationDelay: '70ms' }}>
          <Card className={cn('overflow-hidden', glassPanel)}>
        <CardHeader className="space-y-4 border-b border-slate-200/50 bg-gradient-to-r from-white/50 to-transparent pb-4 dark:border-slate-700/50 dark:from-slate-800/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <CalendarRange className="h-5 w-5 text-red-600" aria-hidden />
              <CardTitle className="text-base font-semibold">Range & filters</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={presetClass(activePreset === 7)} onClick={() => applyPreset(7)}>
                7 days
              </button>
              <button type="button" className={presetClass(activePreset === 30)} onClick={() => applyPreset(30)}>
                30 days
              </button>
              <button type="button" className={presetClass(activePreset === 90)} onClick={() => applyPreset(90)}>
                90 days
              </button>
            </div>
          </div>
          <CardDescription className="dark:text-slate-400">
            Backend default is 30 days when dates are omitted; explicit range is capped at 366 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="analytics-from">From</Label>
            <Input
              id="analytics-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="analytics-to">To</Label>
            <Input
              id="analytics-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50"
            />
          </div>
          <div className="space-y-2">
            <Label>Zone</Label>
            <Select
              value={zoneId}
              onValueChange={setZoneId}
              disabled={filtersLoading}
            >
              <SelectTrigger className="border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50">
                <SelectValue placeholder="All zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All zones</SelectItem>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.zone_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ambulance type</Label>
            <Select
              value={ambulanceTypeId}
              onValueChange={setAmbulanceTypeId}
              disabled={filtersLoading}
            >
              <SelectTrigger className="border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/50">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All types</SelectItem>
                {ambulanceTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
        </div>

        <div
          className="analytics-section-in grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          style={{ animationDelay: '110ms' }}
        >
        <DashboardMetricCard
          title="Total revenue"
          value={bundle.revenue ? formatInr(bundle.revenue.total_revenue) : '—'}
          description={`${from} → ${to} · successful payments`}
          icon={TrendingUp}
          iconClassName="bg-emerald-600 dark:bg-emerald-500"
          loading={loading && !errors.revenue}
          className={glassPanel}
        />
        <DashboardMetricCard
          title="Avg response time"
          value={
            bundle.responseTime
              ? formatResponseTime(bundle.responseTime.overall_average_response_time_seconds)
              : '—'
          }
          description="Assign → accept (overall in range)"
          icon={Timer}
          iconClassName="bg-orange-600 dark:bg-orange-500"
          loading={loading && !errors.responseTime}
          className={glassPanel}
        />
        <DashboardMetricCard
          title="Cancellation rate"
          value={
            bundle.cancellations ? `${bundle.cancellations.cancellation_rate.toFixed(1)}%` : '—'
          }
          description={
            bundle.cancellations
              ? `${bundle.cancellations.cancelled_bookings} of ${bundle.cancellations.total_bookings} bookings`
              : undefined
          }
          icon={TrendingDown}
          iconClassName="bg-rose-600 dark:bg-rose-500"
          loading={loading && !errors.cancellations}
          className={glassPanel}
        />
        <DashboardMetricCard
          title="Leading driver"
          value={bundle.topDrivers?.drivers?.[0]?.completed_rides ?? '—'}
          description={
            bundle.topDrivers?.drivers?.[0]?.driver_name
              ? `${bundle.topDrivers.drivers[0].driver_name} · top of ${bundle.topDrivers.limit}`
              : 'Highest completed rides in range'
          }
          icon={BarChart3}
          iconClassName="bg-violet-600 dark:bg-violet-500"
          loading={loading && !errors.topDrivers}
          className={glassPanel}
        />
      </div>

      <div
        className="analytics-section-in grid grid-cols-1 gap-4 xl:grid-cols-2"
        style={{ animationDelay: '150ms' }}
      >
        <AnalyticsBarSeriesCard
          title="Daily bookings"
          description="New bookings created per day"
          points={dailyPoints}
          loading={loading}
          error={errors.dailyRides}
        />
        <AnalyticsBarSeriesCard
          title="Daily revenue"
          description="Successful payment totals by day"
          points={revenuePoints}
          loading={loading}
          error={errors.revenue}
          barClassName="bg-emerald-700 dark:bg-emerald-400"
        />
      </div>

      <div
        className="analytics-section-in grid grid-cols-1 gap-4 lg:grid-cols-2"
        style={{ animationDelay: '180ms' }}
      >
        <AnalyticsBarSeriesCard
          title="Weekly bookings"
          description="Aggregated by week (Monday start)"
          points={weeklyPoints}
          loading={loading}
          error={errors.weeklyRides}
          chartPlotHeightClassName="h-32 sm:h-36"
        />
        <AnalyticsBarSeriesCard
          title="Monthly bookings"
          description="Aggregated by calendar month"
          points={monthlyPoints}
          loading={loading}
          error={errors.monthlyRides}
          chartPlotHeightClassName="h-32 sm:h-36"
        />
      </div>

      <div
        className="analytics-section-in grid grid-cols-1 gap-4 xl:grid-cols-2"
        style={{ animationDelay: '210ms' }}
      >
        <AnalyticsBarSeriesCard
          title="Response time by day"
          description="Mean seconds from assignment to acceptance"
          points={responsePoints}
          loading={loading}
          error={errors.responseTime}
          barClassName="bg-amber-600 dark:bg-amber-500"
        />
        <AnalyticsHorizontalBarsCard
          title="Demand by zone"
          description="Booking counts per zone"
          items={zoneBarItems}
          loading={loading}
          error={errors.zoneDemand}
        />
      </div>

      <div
        className="analytics-section-in grid grid-cols-1 gap-4 xl:grid-cols-2"
        style={{ animationDelay: '240ms' }}
      >
        <AnalyticsHorizontalBarsCard
          title="Demand by ambulance type"
          description="Booking counts per vehicle type"
          items={ambulanceBarItems}
          loading={loading}
          error={errors.ambulanceDemand}
          barClassName="bg-sky-600 dark:bg-sky-500"
        />
        <Card className={cn('overflow-hidden', glassPanel)}>
          <CardHeader className="border-b border-slate-200/50 bg-gradient-to-r from-white/50 to-transparent dark:border-slate-700/50 dark:from-slate-800/30">
            <CardTitle className="text-lg">Cancellations by reason</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Cancelled and force-cancelled bookings in range
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !errors.cancellations ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : errors.cancellations ? (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.cancellations}</p>
            ) : cancellationReasonRows.length === 0 ? (
              <p className="text-sm text-slate-500">No cancellations in this range.</p>
            ) : (
              <div className={cn('max-h-[280px] overflow-x-auto overflow-y-auto', glassTableShell)}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cancellationReasonRows.map((row) => (
                      <TableRow key={row.reason}>
                        <TableCell className="max-w-[200px] truncate font-medium">{row.reason}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div
        className="analytics-section-in grid grid-cols-1 gap-4 xl:grid-cols-2"
        style={{ animationDelay: '270ms' }}
      >
        <Card className={cn('overflow-hidden', glassPanel)}>
          <CardHeader className="border-b border-slate-200/50 bg-gradient-to-r from-white/50 to-transparent dark:border-slate-700/50 dark:from-slate-800/30">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Top drivers</CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Completed rides and commission credited in range
                </CardDescription>
              </div>
              {bundle.topDrivers ? (
                <Badge
                  variant="secondary"
                  className="w-fit border-white/40 bg-white/60 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/70"
                >
                  limit {bundle.topDrivers.limit}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {loading && !errors.topDrivers ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : errors.topDrivers ? (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.topDrivers}</p>
            ) : !bundle.topDrivers?.drivers?.length ? (
              <p className="text-sm text-slate-500">No driver stats in this range.</p>
            ) : (
              <div className={cn('max-h-[360px] overflow-auto', glassTableShell)}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead className="hidden sm:table-cell">Mobile</TableHead>
                      <TableHead className="text-right">Rides</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bundle.topDrivers.drivers.map((d) => (
                      <TableRow key={d.driver_id}>
                        <TableCell className="font-medium">{d.driver_name ?? '—'}</TableCell>
                        <TableCell className="hidden text-slate-600 sm:table-cell dark:text-slate-400">
                          {d.mobile_number ?? '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{d.completed_rides}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatInrPrecise(d.commission_credited)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cn('overflow-hidden', glassPanel)}>
          <CardHeader className="border-b border-slate-200/50 bg-gradient-to-r from-white/50 to-transparent dark:border-slate-700/50 dark:from-slate-800/30">
            <CardTitle className="text-lg">Driver utilization</CardTitle>
            <CardDescription className="dark:text-slate-400">
              {bundle.driverUtil?.note ??
                'Trip duration and distance from completed rides (per driver).'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !errors.driverUtil ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : errors.driverUtil ? (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.driverUtil}</p>
            ) : sortedUtilDrivers.length === 0 ? (
              <p className="text-sm text-slate-500">No completed trips in this range.</p>
            ) : (
              <div className={cn('max-h-[360px] overflow-auto', glassTableShell)}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead className="text-right">Rides</TableHead>
                      <TableHead className="text-right">Minutes</TableHead>
                      <TableHead className="text-right">km</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUtilDrivers.map((d) => (
                      <TableRow key={d.driver_id}>
                        <TableCell className="max-w-[140px] truncate font-medium">
                          {d.driver_name ?? '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{d.completed_rides}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {Math.round(d.total_ride_duration_min)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {d.total_ride_distance_km.toFixed(1)}
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
      </div>
    </div>
  );
}
