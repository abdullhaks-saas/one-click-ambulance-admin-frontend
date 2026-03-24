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
import { RideTable } from './rides/RideTable';
import { RideDetailModal } from './rides/RideDetailModal';
import { DispatchPanel } from './rides/DispatchPanel';
import {
  adminRidesApi,
  type RideListItem,
  type RideDetail,
  type RideStatusEnum,
} from '@/services/api';
import { toast } from 'sonner';
import { Search, X } from 'lucide-react';

const ALL_RIDE_STATUSES: RideStatusEnum[] = [
  'accepted',
  'arrived',
  'patient_onboard',
  'trip_started',
  'trip_completed',
];

export function RideManagementPage() {
  const [rides, setRides] = useState<RideListItem[]>([]);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<RideStatusEnum | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [detailRide, setDetailRide] = useState<RideDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminRidesApi.list({
        page,
        limit: 10,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
        search: search || undefined,
      });
      setRides(data.data);
      setMeta(data.meta);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load rides';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, status, from, to, search]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  useEffect(() => {
    setPage(1);
  }, [status, from, to, search]);

  async function handleView(id: string) {
    setDetailLoading(true);
    setDetailRide(null);
    try {
      const { data } = await adminRidesApi.getById(id);
      setDetailRide(data);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load ride details';
      toast.error(msg);
    } finally {
      setDetailLoading(false);
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
    <div className="space-y-6 text-slate-950 dark:text-slate-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">rides & dispatch</h1>
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
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-slate-500">Ride Status</Label>
              <Select
                value={status || 'all'}
                onValueChange={(v) => setStatus((v === 'all' ? '' : v) as RideStatusEnum | '')}
              >
                <SelectTrigger className="w-[165px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {ALL_RIDE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

      {/* Rides Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            rides
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
              <RideTable rides={rides} onView={handleView} />
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

      {/* Dispatch Panel */}
      <DispatchPanel />

      {/* Ride Detail Modal */}
      <RideDetailModal
        ride={detailRide}
        loading={detailLoading}
        onClose={() => setDetailRide(null)}
      />
    </div>
  );
}
