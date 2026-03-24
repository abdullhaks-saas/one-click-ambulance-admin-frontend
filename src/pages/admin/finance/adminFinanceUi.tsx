import { cn } from '@/lib/utils';

export const glassPanel = cn(
  'border-white/45 bg-white/72 shadow-xl shadow-slate-900/[0.07] backdrop-blur-xl ring-1 ring-slate-200/35 transition-all duration-300',
  'dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/40 dark:ring-white/5',
  'motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-2xl dark:motion-safe:hover:shadow-black/50'
);

export const glassTableShell = cn(
  'rounded-xl border border-white/35 bg-white/45 shadow-inner backdrop-blur-sm',
  'dark:border-slate-700/50 dark:bg-slate-950/35'
);

export function FinanceBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute -left-24 top-[-8%] h-[min(380px,90vw)] w-[min(380px,90vw)] rounded-full bg-gradient-to-br from-emerald-500/12 to-transparent blur-3xl dark:from-emerald-600/18" />
      <div className="absolute right-[-10%] top-[20%] h-[min(320px,80vw)] w-[min(320px,80vw)] rounded-full bg-gradient-to-bl from-red-500/10 to-transparent blur-3xl dark:from-red-600/16" />
    </div>
  );
}
