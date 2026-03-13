import * as React from 'react';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'left' | 'right';
  children: React.ReactNode;
}

const SheetContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: 'left' | 'right';
} | null>(null);

function Sheet({ open, onOpenChange, side = 'left', children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange, side }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) return null;
  return (
    <button type="button" onClick={() => ctx.onOpenChange(true)} {...props}>
      {children}
    </button>
  );
}

function SheetContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(SheetContext);
  if (!ctx || !ctx.open) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={() => ctx.onOpenChange(false)}
        aria-hidden
      />
      <div
        className={cn(
          'fixed top-0 z-50 h-full w-72 bg-white shadow-xl transition-transform dark:bg-slate-900 lg:static lg:flex lg:shadow-none',
          ctx.side === 'left' ? 'left-0' : 'right-0',
          !ctx.open && 'translate-x-[-100%] lg:translate-x-0',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

export { Sheet, SheetTrigger, SheetContent };
