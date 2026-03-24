import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingTable } from './bookings/BookingTable';
import { BookingDetailModal } from './bookings/BookingDetailModal';
import { ConfirmActionModal } from './drivers/ConfirmActionModal';
import {
  adminBookingsApi,
  type BookingListItem,
  type BookingDetail,
  type BookingStatus,
} from '@/services/api';
import { toast } from 'sonner';
import { Search, X } from 'lucide-react';

const ALL_STATUSES: BookingStatus[] = [
  'created',
  'searching',
  'driver_assigned',
  'driver_accepted',
  'driver_on_way',
  'driver_arrived',
  'patient_onboard',
  'trip_started',
  'trip_completed',
  'cancelled',
  'no_driver_found',
  'force_cancelled',
];

export function BookingManagementPage() {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BookingStatus | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [detailBooking, setDetailBooking] = useState<BookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [forceCancelId, setForceCancelId] = useState<string | null>(null);
  const [forceCancelling, setForceCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminBookingsApi.list({
        page,
        limit: 10,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
        search: search || undefined,
      });
      setBookings(data.data);
      setMeta(data.meta);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load bookings';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, status, from, to, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [status, from, to, search]);

  async function handleView(id: string) {
    setDetailLoading(true);
    setDetailBooking(null);
    try {
      const { data } = await adminBookingsApi.getById(id);
      setDetailBooking(data);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load booking details';
      toast.error(msg);
      setDetailLoading(false);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleForceCancel(reason?: string) {
    if (!forceCancelId) return;
    setForceCancelling(true);
    try {
      await adminBookingsApi.forceCancel(forceCancelId, reason);
      toast.success('Ride force cancelled');
      setForceCancelId(null);
      fetchBookings();
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to cancel ride';
      toast.error(msg);
    } finally {
      setForceCancelling(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  function clearFilters() {
    setStatus('');
    setFrom('');
    setTo('');
    setSearch('');
    setSearchInput('');
  }

  const hasFilters = status || from || to || search;

  return (
    <div className="space-y-4 text-slate-950 dark:text-slate-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">booking management</h1>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="self-start sm:self-auto gap-1 text-slate-500">
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            {/* Status Filter */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-slate-500">Status</Label>
              <Select
                value={status || 'all'}
                onValueChange={(v) => setStatus((v === 'all' ? '' : v) as BookingStatus | '')}
              >
                <SelectTrigger className="w-[165px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-slate-500">From</Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-slate-500">To</Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-[150px]"
              />
            </div>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-1.5">
              <Label className="text-xs text-slate-500">Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Name or phone..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-[200px]"
                />
                <Button type="submit" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            bookings
            {meta && (
              <span className="ml-2 text-sm font-normal text-slate-400">
                ({meta.total} total)
              </span>
            )}
          </CardTitle>
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
              <BookingTable
                bookings={bookings}
                onView={handleView}
                onForceCancel={(id) => setForceCancelId(id)}
              />
              {meta && meta.total_pages > 1 && (
                <div className="mt-4 flex items-center justify-between">
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

      {/* Detail Modal */}
      <BookingDetailModal
        booking={detailBooking}
        loading={detailLoading}
        onClose={() => setDetailBooking(null)}
        onForceCancelled={fetchBookings}
      />

      {/* Force Cancel Confirm */}
      {forceCancelId && (
        <ConfirmActionModal
          open={!!forceCancelId}
          onOpenChange={(o) => !o && setForceCancelId(null)}
          title="Force Cancel Ride"
          message="Are you sure you want to force cancel this ride? This action cannot be undone."
          confirmLabel="Force Cancel"
          variant="destructive"
          requireReason={false}
          reasonLabel="Reason (optional)"
          onConfirm={handleForceCancel}
          isLoading={forceCancelling}
        />
      )}
    </div>
  );
}
