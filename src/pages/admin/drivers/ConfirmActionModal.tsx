import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConfirmActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'default' | 'destructive';
  requireReason?: boolean;
  reasonLabel?: string;
  onConfirm: (reason?: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function ConfirmActionModal({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'default',
  requireReason = false,
  reasonLabel = 'Reason (optional)',
  onConfirm,
  isLoading = false,
}: ConfirmActionModalProps) {
  const [reason, setReason] = useState('');

  async function handleConfirm() {
    await onConfirm(requireReason ? reason : undefined);
    setReason('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
        {requireReason && (
          <div className="space-y-2">
            <Label htmlFor="reason">{reasonLabel}</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
              disabled={isLoading}
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading || (requireReason && !reason.trim())}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
