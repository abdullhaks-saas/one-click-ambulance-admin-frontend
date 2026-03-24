import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface DashboardRidesTrendProps {
  days: { date: string; ride_count: number }[];
  loading?: boolean;
  error?: string | null;
  className?: string;
}

function shortLabel(ymd: string): string {
  const [, m, d] = ymd.split('-');
  if (!m || !d) return ymd;
  return `${m}/${d}`;
}

export function DashboardRidesTrend({
  days,
  loading,
  error,
  className,
}: DashboardRidesTrendProps) {
  const max = Math.max(1, ...days.map((d) => d.ride_count));

  return (
    <Card
      className={cn(
        'flex h-full min-h-[280px] flex-col border-slate-200/80 dark:border-slate-800 shadow-sm',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Ride activity</CardTitle>
        <CardDescription>New bookings per day (selected range)</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end pb-6">
        {loading ? (
          <div className="flex flex-1 items-end gap-2 pt-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="flex-1 rounded-md" style={{ height: `${40 + i * 8}px` }} />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : days.length === 0 ? (
          <p className="text-sm text-slate-500">No data in this range.</p>
        ) : (
          <div className="flex flex-1 items-end gap-1.5 sm:gap-2" role="img" aria-label="Ride counts by day">
            {days.map((d) => {
              const h = Math.round((d.ride_count / max) * 100);
              return (
                <div
                  key={d.date}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-36 w-full items-end justify-center sm:h-40">
                    <div
                      className="w-full max-w-10 rounded-t-md bg-slate-900 dark:bg-slate-200 transition-all"
                      style={{
                        height: `${Math.max(h, d.ride_count > 0 ? 8 : 4)}%`,
                        minHeight: d.ride_count > 0 ? '0.5rem' : '0.25rem',
                      }}
                      title={`${d.date}: ${d.ride_count} rides`}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 sm:text-xs">
                    {shortLabel(d.date)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
