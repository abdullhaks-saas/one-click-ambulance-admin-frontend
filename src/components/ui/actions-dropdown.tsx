import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  /** When false, the action is hidden. Defaults to true. */
  visible?: boolean;
}

export interface ActionsDropdownProps {
  actions: ActionItem[];
  className?: string;
  /** Align dropdown to trigger. Defaults to "end". */
  align?: 'start' | 'center' | 'end';
}

export function ActionsDropdown({
  actions,
  className,
  align = 'end',
}: ActionsDropdownProps) {
  const visibleActions = actions.filter((a) => a.visible !== false);

  if (visibleActions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8 rounded-lg transition-colors', className)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {visibleActions.map(({ label, icon: Icon, onClick }) => (
          <DropdownMenuItem key={label} onClick={onClick}>
            <Icon className="h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
