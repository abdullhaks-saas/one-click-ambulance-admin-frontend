import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
        secondary: 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
        destructive: 'bg-red-600 text-white',
        success: 'bg-emerald-600 text-white',
        warning: 'bg-amber-500 text-white',
        outline: 'border border-slate-300 bg-transparent dark:border-slate-700',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
