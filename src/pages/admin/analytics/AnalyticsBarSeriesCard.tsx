import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface AnalyticsBarPoint {
  key: string;
  label: string;
  value: number;
  title?: string;
}

export interface AnalyticsBarSeriesCardProps {
  title: string;
  description?: string;
  points: AnalyticsBarPoint[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  barClassName?: string;
  className?: string;
  /** Fixed height of the bar plot area (required so bar % heights resolve). */
  chartPlotHeightClassName?: string;
}

const COL_WIDTH = 'w-[3rem] sm:w-[3.25rem]';
const BAR_WIDTH = 'w-7 sm:w-8';

const scrollShell =
  'overflow-x-auto scroll-smooth pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-color:rgba(148,163,184,0.5)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/70 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500';

export function AnalyticsBarSeriesCard({
  title,
  description,
  points,
  loading,
  error,
  emptyMessage = 'No data in this range.',
  barClassName = 'bg-slate-900 dark:bg-slate-200',
  className,
  chartPlotHeightClassName = 'h-40 sm:h-44',
}: AnalyticsBarSeriesCardProps) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const skeletonCols = Math.min(24, Math.max(8, points.length || 12));

  return (
    <Card
      className={cn(
        'group flex min-h-[260px] flex-col overflow-hidden border-white/50 bg-white/80 shadow-lg shadow-slate-900/[0.07] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/40',
        'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/10 motion-safe:dark:hover:shadow-black/50',
        className
      )}
    >
      <CardHeader className="relative z-10 border-b border-slate-200/60 bg-gradient-to-br from-white/80 to-transparent pb-3 dark:border-slate-700/50 dark:from-slate-800/40">
        <CardTitle className="text-lg tracking-tight">{title}</CardTitle>
        {description ? (
          <CardDescription className="dark:text-slate-400">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="relative z-10 flex flex-1 flex-col pt-4 pb-2">
        {loading ? (
          <div
            className={cn(
              'rounded-lg border border-slate-200/40 bg-slate-50/50 dark:border-slate-700/40 dark:bg-slate-950/30',
              scrollShell
            )}
          >
            <div className="flex min-w-max gap-2 px-3 pb-2 pt-3">
              {Array.from({ length: skeletonCols }).map((_, i) => (
                <div key={i} className={cn('flex shrink-0 flex-col items-center', COL_WIDTH)}>
                  <div className={cn('flex w-full items-end justify-center', chartPlotHeightClassName)}>
                    <Skeleton
                      className={cn('rounded-t-lg', BAR_WIDTH)}
                      style={{ height: `${28 + (i % 6) * 10}%` }}
                    />
                  </div>
                  <div className="h-14 w-full shrink-0 pt-1">
                    <Skeleton className="mx-auto mt-2 h-3 w-8 rotate-[-35deg]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : points.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        ) : (
          <div className="relative rounded-lg border border-slate-200/40 bg-slate-50/50 dark:border-slate-700/40 dark:bg-slate-950/30">
            <p className="sr-only">
              {title}. Scroll horizontally to see all dates when the range is long.
            </p>
            <div className={scrollShell}>
              <div className="flex min-w-max gap-2 px-3 pb-2 pt-3" role="img" aria-label={title}>
                {points.map((p, i) => {
                  const h = Math.round((p.value / max) * 100);
                  const delayMs = Math.min(i * 28, 480);
                  return (
                    <div key={p.key} className={cn('flex shrink-0 flex-col items-center', COL_WIDTH)}>
                      <div
                        className={cn(
                          'flex w-full items-end justify-center',
                          chartPlotHeightClassName
                        )}
                      >
                        <div
                          className={cn(
                            'analytics-bar-rise rounded-t-lg shadow-md ring-1 ring-black/5 dark:ring-white/10',
                            barClassName,
                            BAR_WIDTH,
                            'max-w-full'
                          )}
                          style={{
                            height: `${Math.max(h, p.value > 0 ? 10 : 5)}%`,
                            minHeight: p.value > 0 ? '0.5rem' : '0.25rem',
                            animationDelay: `${delayMs}ms`,
                          }}
                          title={p.title ?? `${p.label}: ${p.value}`}
                        />
                      </div>
                      <div className="relative flex h-14 w-full shrink-0 items-start justify-center pt-1">
                        <span
                          className="pointer-events-none origin-bottom translate-y-1 rotate-[-38deg] whitespace-nowrap text-[10px] font-semibold tracking-tight text-slate-600 tabular-nums dark:text-slate-300 sm:text-[11px]"
                          title={p.title ?? `${p.label}: ${p.value}`}
                        >
                          {p.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {!loading && !error && points.length > 10 ? (
          <p className="mt-2 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Swipe or scroll horizontally to read all date labels
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
