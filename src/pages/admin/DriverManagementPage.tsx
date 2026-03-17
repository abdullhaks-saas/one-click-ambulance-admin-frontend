import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { DriverTable } from './drivers/DriverTable';
import { DriverDetailModal } from './drivers/DriverDetailModal';
import { ConfirmActionModal } from './drivers/ConfirmActionModal';
import { adminDriversApi, type DriverListItem, type DriverDetail, type DriverStatus } from '@/services/api';
import { toast } from 'sonner';

export function DriverManagementPage() {
  const [drivers, setDrivers] = useState<DriverListItem[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; total_pages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<DriverStatus | ''>('');
  const [detailDriver, setDetailDriver] = useState<DriverDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    action: string;
    driverId: string;
    driverName: string;
    extra?: { reason?: string };
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);


  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminDriversApi.list({
        page,
        limit: 10,
        status: status || undefined,
      });
      setDrivers(data.data);
      setMeta(data.meta);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load drivers';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  async function handleView(id: string) {
    setDetailLoading(true);
    setDetailDriver(null);
    try {
      const { data } = await adminDriversApi.getById(id);
      setDetailDriver(data);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load driver details';
      toast.error(msg);
    } finally {
      setDetailLoading(false);
    }
  }

  function openConfirm(action: string, driverId: string, driverName: string, extra?: { reason?: string }) {
    setConfirmModal({ action, driverId, driverName, extra });
  }

  async function handleConfirmAction(reason?: string) {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      const { action, driverId } = confirmModal;
      const finalReason = reason ?? confirmModal.extra?.reason;
      switch (action) {
        case 'approve':
          await adminDriversApi.approve(driverId);
          toast.success('Driver approved successfully');
          break;
        case 'reject':
          await adminDriversApi.reject(driverId, finalReason);
          toast.success('Driver rejected');
          break;
        case 'suspend':
          await adminDriversApi.suspend(driverId);
          toast.success('Driver suspended');
          break;
        case 'block':
          await adminDriversApi.block(driverId);
          toast.success('Driver blocked');
          break;
        case 'unblock':
          await adminDriversApi.unblock(driverId);
          toast.success('Driver unblocked');
          break;
      }
      setConfirmModal(null);
      fetchDrivers();
      if (detailDriver?.id === driverId) setDetailDriver(null);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Action failed';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-4 text-slate-950 dark:text-slate-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">driver management</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="status" className="sr-only">Status</Label>
            <Select
              value={status || 'all'}
              onValueChange={(v) => setStatus((v === 'all' ? '' : v) as DriverStatus | '')}
            >
              <SelectTrigger id="status" className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                <SelectItem value="pending">pending</SelectItem>
                <SelectItem value="approved">approved</SelectItem>
                <SelectItem value="rejected">rejected</SelectItem>
                <SelectItem value="suspended">suspended</SelectItem>
                <SelectItem value="blocked">blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>drivers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <DriverTable
                drivers={drivers}
                onView={handleView}
                onApprove={(id) => {
                  const d = drivers.find((x) => x.id === id);
                  openConfirm('approve', id, d?.name ?? 'Driver');
                }}
                onReject={(id) => {
                  const d = drivers.find((x) => x.id === id);
                  openConfirm('reject', id, d?.name ?? 'Driver', { reason: '' });
                }}
                onSuspend={(id) => {
                  const d = drivers.find((x) => x.id === id);
                  openConfirm('suspend', id, d?.name ?? 'Driver');
                }}
                onBlock={(id) => {
                  const d = drivers.find((x) => x.id === id);
                  openConfirm('block', id, d?.name ?? 'Driver');
                }}
                onUnblock={(id) => {
                  const d = drivers.find((x) => x.id === id);
                  openConfirm('unblock', id, d?.name ?? 'Driver');
                }}
              />
              {meta && meta.total_pages > 1 && (
                <div className="mt-4 flex justify-between">
                  <p className="text-sm text-slate-500">
                    Page {meta.page} of {meta.total_pages} ({meta.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= meta.total_pages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <DriverDetailModal
        driver={detailDriver}
        loading={detailLoading}
        onClose={() => setDetailDriver(null)}
        onDocumentVerified={
          detailDriver
            ? async () => {
                try {
                  const { data } = await adminDriversApi.getById(detailDriver.id);
                  setDetailDriver(data);
                } catch {
                  // keep current data on refresh failure
                }
              }
            : undefined
        }
      />

      {confirmModal && (
        <ConfirmActionModal
          open={!!confirmModal}
          onOpenChange={(o) => !o && setConfirmModal(null)}
          title={
            confirmModal.action === 'approve'
              ? 'Approve Driver'
              : confirmModal.action === 'reject'
                ? 'Reject Driver'
                : confirmModal.action === 'suspend'
                  ? 'Suspend Driver'
                  : confirmModal.action === 'block'
                    ? 'Block Driver'
                    : 'Unblock Driver'
          }
          message={`Are you sure you want to ${confirmModal.action} ${confirmModal.driverName}?`}
          confirmLabel={confirmModal.action.charAt(0).toUpperCase() + confirmModal.action.slice(1)}
          variant={['reject', 'block', 'suspend'].includes(confirmModal.action) ? 'destructive' : 'default'}
          requireReason={confirmModal.action === 'reject'}
          reasonLabel="Reason (optional)"
          onConfirm={handleConfirmAction}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}
