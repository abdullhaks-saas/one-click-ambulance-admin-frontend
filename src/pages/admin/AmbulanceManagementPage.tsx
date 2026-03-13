import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AmbulanceTable } from './ambulances/AmbulanceTable';
import { AmbulanceDetailModal } from './ambulances/AmbulanceDetailModal';
import { ConfirmActionModal } from './drivers/ConfirmActionModal';
import {
  adminAmbulancesApi,
  type AmbulanceListItem,
  type AmbulanceDetail,
  type AmbulanceStatus,
} from '@/services/api';
import { toast } from 'sonner';

export function AmbulanceManagementPage() {
  const [ambulances, setAmbulances] = useState<AmbulanceListItem[]>([]);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AmbulanceStatus | ''>('');
  const [search, setSearch] = useState('');
  const [detailAmbulance, setDetailAmbulance] = useState<AmbulanceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    action: 'approve' | 'suspend' | 'restore';
    id: string;
    label: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAmbulances = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAmbulancesApi.list({
        page,
        limit: 10,
        status: status || undefined,
        search: search.trim() || undefined,
      });
      setAmbulances(data.data);
      setMeta(data.meta);
    } catch (err: unknown) {
      const msg =
        (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load ambulances';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchAmbulances();
  }, [fetchAmbulances]);

  async function handleView(id: string) {
    setDetailLoading(true);
    setDetailAmbulance(null);
    try {
      const { data } = await adminAmbulancesApi.getById(id);
      setDetailAmbulance(data);
    } catch (err: unknown) {
      const msg =
        (err as { apiMessage?: string })?.apiMessage ??
        'Failed to load ambulance details';
      toast.error(msg);
    } finally {
      setDetailLoading(false);
    }
  }

  function openConfirm(
    action: 'approve' | 'suspend' | 'restore',
    id: string,
    label: string
  ) {
    setConfirmModal({ action, id, label });
  }

  async function handleConfirmAction(reason?: string) {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      const { action, id } = confirmModal;
      switch (action) {
        case 'approve':
          await adminAmbulancesApi.approve(id);
          toast.success('Ambulance approved successfully');
          break;
        case 'suspend':
          await adminAmbulancesApi.suspendWithReason(id, reason);
          toast.success('Ambulance suspended');
          break;
        case 'restore':
          await adminAmbulancesApi.restore(id);
          toast.success('Ambulance restored');
          break;
      }
      setConfirmModal(null);
      fetchAmbulances();
      if (detailAmbulance?.id === id) setDetailAmbulance(null);
    } catch (err: unknown) {
      const msg =
        (err as { apiMessage?: string })?.apiMessage ?? 'Action failed';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-4 text-slate-950 dark:text-slate-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Ambulance Management</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search registration..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[160px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="status" className="sr-only">
              Status
            </Label>
            <Select
              id="status"
              value={status || 'all'}
              onChange={(e) =>
                setStatus(
                  (e.target.value === 'all' ? '' : e.target.value) as
                    | AmbulanceStatus
                    | ''
                )
              }
              className="w-[140px]"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ambulances</CardTitle>
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
              <AmbulanceTable
                ambulances={ambulances}
                onView={handleView}
                onApprove={(id) => {
                  const a = ambulances.find((x) => x.id === id);
                  openConfirm('approve', id, a?.registration_number ?? 'Ambulance');
                }}
                onSuspend={(id) => {
                  const a = ambulances.find((x) => x.id === id);
                  openConfirm('suspend', id, a?.registration_number ?? 'Ambulance');
                }}
                onRestore={(id) => {
                  const a = ambulances.find((x) => x.id === id);
                  openConfirm('restore', id, a?.registration_number ?? 'Ambulance');
                }}
              />
              {meta && meta.total_pages > 1 && (
                <div className="mt-4 flex justify-between">
                  <p className="text-sm text-slate-500">
                    Page {meta.page} of {meta.total_pages} ({meta.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
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

      <AmbulanceDetailModal
        ambulance={detailAmbulance}
        loading={detailLoading}
        onClose={() => setDetailAmbulance(null)}
      />

      {confirmModal && (
        <ConfirmActionModal
          open={!!confirmModal}
          onOpenChange={(o) => !o && setConfirmModal(null)}
          title={
            confirmModal.action === 'approve'
              ? 'Approve Ambulance'
              : confirmModal.action === 'suspend'
                ? 'Suspend Ambulance'
                : 'Restore Ambulance'
          }
          message={`Are you sure you want to ${confirmModal.action} ${confirmModal.label}?`}
          confirmLabel={
            confirmModal.action.charAt(0).toUpperCase() +
            confirmModal.action.slice(1)
          }
          variant={
            confirmModal.action === 'suspend' ? 'destructive' : 'default'
          }
          requireReason={confirmModal.action === 'suspend'}
          reasonLabel="Reason (optional)"
          onConfirm={handleConfirmAction}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}
