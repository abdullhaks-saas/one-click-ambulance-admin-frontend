import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface DashboardMetricCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  loading?: boolean;
  className?: string;
}

export function DashboardMetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  loading,
  className,
}: DashboardMetricCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden border-slate-200/80 dark:border-slate-800 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-9 w-24 sm:h-10 sm:w-28" />
            ) : (
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
                {value}
              </p>
            )}
            {description ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
            ) : null}
          </div>
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm sm:h-12 sm:w-12',
              iconClassName ?? 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900'
            )}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
