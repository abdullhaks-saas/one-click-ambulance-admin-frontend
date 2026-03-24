import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  DollarSign,
  RefreshCw,
  Timer,
  TrendingUp,
  Users,
} from 'lucide-react';
import { DashboardMap } from '@/components/map/DashboardMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { adminAnalyticsApi, adminDashboardApi, type AdminDashboardMetrics } from '@/services/api';
import { toast } from 'sonner';
import { DashboardMetricCard } from './dashboard/DashboardMetricCard';
import { DashboardRidesTrend } from './dashboard/DashboardRidesTrend';
import { rollingDaysRange } from './dashboard/dateRange';
import { formatInr, formatResponseTime } from './dashboard/formatters';

const EMPTY_METRICS: AdminDashboardMetrics = {
  total_rides_today: 0,
  active_drivers: 0,
  completed_rides: 0,
  total_revenue: 0,
  driver_utilization_rate: 0,
  average_response_time_seconds: 0,
};

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics>(EMPTY_METRICS);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [trendDays, setTrendDays] = useState<{ date: string; ride_count: number }[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const { data } = await adminDashboardApi.getMetrics();
      setMetrics(data);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load dashboard';
      toast.error(msg);
      setMetrics(EMPTY_METRICS);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const loadTrend = useCallback(async () => {
    setTrendLoading(true);
    setTrendError(null);
    const range = rollingDaysRange(7);
    try {
      const { data } = await adminAnalyticsApi.dailyRides(range);
      setTrendDays(data.days ?? []);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load ride trend';
      setTrendError(msg);
      setTrendDays([]);
    } finally {
      setTrendLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadDashboard(), loadTrend()]);
    setRefreshing(false);
  }, [loadDashboard, loadTrend]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    void loadTrend();
  }, [loadTrend]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8 text-foreground">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Today&apos;s operations snapshot · Last 7 days ride volume
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 self-start sm:self-auto"
          onClick={() => void refreshAll()}
          disabled={refreshing || metricsLoading}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardMetricCard
          title="Total rides today"
          value={metrics.total_rides_today}
          description="Bookings created today"
          icon={Activity}
          loading={metricsLoading}
        />
        <DashboardMetricCard
          title="Active drivers"
          value={metrics.active_drivers}
          description="Online (driver_status)"
          icon={Users}
          iconClassName="bg-emerald-600 dark:bg-emerald-500"
          loading={metricsLoading}
        />
        <DashboardMetricCard
          title="Completed rides"
          value={metrics.completed_rides}
          description="Trips completed today"
          icon={TrendingUp}
          iconClassName="bg-violet-600 dark:bg-violet-500"
          loading={metricsLoading}
        />
        <DashboardMetricCard
          title="Revenue today"
          value={formatInr(metrics.total_revenue)}
          description="Successful online payments"
          icon={DollarSign}
          iconClassName="bg-green-600 dark:bg-green-500"
          loading={metricsLoading}
        />
        <DashboardMetricCard
          title="Driver utilization"
          value={`${metrics.driver_utilization_rate.toFixed(1)}%`}
          description="Share of online drivers on a trip"
          icon={Activity}
          iconClassName="bg-sky-600 dark:bg-sky-500"
          loading={metricsLoading}
        />
        <DashboardMetricCard
          title="Avg response time"
          value={formatResponseTime(metrics.average_response_time_seconds)}
          description="Assign → accept (today)"
          icon={Timer}
          iconClassName="bg-orange-600 dark:bg-orange-500"
          loading={metricsLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        <div className="lg:col-span-5 xl:col-span-4">
          <DashboardRidesTrend
            days={trendDays}
            loading={trendLoading}
            error={trendError}
            className="h-full min-h-[320px]"
          />
        </div>

        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="flex h-full min-h-[320px] flex-col overflow-hidden border-slate-200/80 dark:border-slate-800 shadow-sm lg:min-h-[420px]">
            <CardHeader className="border-b border-slate-100 bg-white/90 pb-4 dark:border-slate-800 dark:bg-slate-900/90">
              <CardTitle className="text-lg">Operations map</CardTitle>
              <CardDescription>Live overview — add fleet markers when available</CardDescription>
            </CardHeader>
            <CardContent className="relative flex-1 p-0">
              <div className="absolute inset-0 min-h-[280px] lg:min-h-0">
                <DashboardMap />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
