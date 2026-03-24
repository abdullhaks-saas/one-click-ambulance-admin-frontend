import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface AnalyticsHorizontalBarItem {
  key: string;
  label: string;
  value: number;
  sublabel?: string;
}

export interface AnalyticsHorizontalBarsCardProps {
  title: string;
  description?: string;
  items: AnalyticsHorizontalBarItem[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  barClassName?: string;
  className?: string;
  maxHeightClassName?: string;
  valueFormatter?: (n: number) => string;
}

export function AnalyticsHorizontalBarsCard({
  title,
  description,
  items,
  loading,
  error,
  emptyMessage = 'No data in this range.',
  barClassName = 'bg-red-600 dark:bg-red-500',
  className,
  maxHeightClassName = 'max-h-[280px] overflow-y-auto pr-1',
  valueFormatter = (n) => String(n),
}: AnalyticsHorizontalBarsCardProps) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <Card
      className={cn(
        'group flex flex-col overflow-hidden border-white/50 bg-white/80 shadow-lg shadow-slate-900/[0.07] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/40',
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
      <CardContent className="relative z-10 pb-6">
        {loading ? (
          <div className="space-y-4 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        ) : (
          <ul className={cn('space-y-3.5', maxHeightClassName)}>
            {items.map((item, i) => {
              const pct = Math.round((item.value / max) * 100);
              const delayMs = Math.min(i * 45, 400);
              return (
                <li key={item.key} className="analytics-section-in" style={{ animationDelay: `${delayMs}ms` }}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate font-medium text-slate-800 dark:text-slate-100">
                      {item.label}
                      {item.sublabel ? (
                        <span className="ml-1 font-normal text-slate-500 dark:text-slate-400">
                          {item.sublabel}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 tabular-nums text-slate-600 dark:text-slate-300">
                      {valueFormatter(item.value)}
                    </span>
                  </div>
                  <div
                    className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100/90 shadow-inner dark:bg-slate-800/90"
                    role="presentation"
                  >
                    <div
                      className={cn(
                        'analytics-hbar-fill-inner h-full rounded-full shadow-sm',
                        barClassName
                      )}
                      style={{
                        width: `${Math.max(pct, item.value > 0 ? 4 : 0)}%`,
                        animationDelay: `${delayMs + 80}ms`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
