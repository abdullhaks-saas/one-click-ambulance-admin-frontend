import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  adminRatingsApi,
  type RideRatingItem,
  type RatingsListResponse,
  type RatingsStatsResponse,
} from '@/services/api';
import { toast } from 'sonner';
import { Star, RefreshCw, AlertTriangle, TrendingDown } from 'lucide-react';

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= count ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
        />
      ))}
    </div>
  );
}

export function RatingsReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<RideRatingItem[]>([]);
  const [meta, setMeta] = useState<RatingsListResponse['meta'] | null>(null);
  const [stats, setStats] = useState<RatingsStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [maxRating, setMaxRating] = useState<string>('all');
  const [driverFilter, setDriverFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminRatingsApi.list({
        page,
        limit: 20,
        max_rating: maxRating !== 'all' ? Number(maxRating) : undefined,
        driver_id: driverFilter.trim() || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setRatings(data.data);
      setMeta(data.meta);
    } catch {
      toast.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  }, [page, maxRating, driverFilter, fromDate, toDate]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await adminRatingsApi.stats();
      setStats(data);
    } catch {
      toast.error('Failed to load rating stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setPage(1);
  }, [maxRating, driverFilter, fromDate, toDate]);

  return (
    <div className="space-y-6 text-slate-950 dark:text-slate-50">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Ratings & Reviews
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor driver ratings, review comments, and identify low-rated drivers
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { fetchRatings(); fetchStats(); }}
          disabled={loading}
          className="self-start sm:self-auto gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500 font-medium">Total Reviews</p>
              <p className="text-2xl font-bold mt-1">{stats.total_ratings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500 font-medium">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold">{stats.average_rating}</p>
                <Stars count={Math.round(Number(stats.average_rating))} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500 font-medium">Distribution</p>
              <div className="flex items-end gap-1 mt-2 h-10">
                {[1, 2, 3, 4, 5].map((s) => {
                  const entry = stats.distribution.find((d) => d.stars === s);
                  const count = entry?.count ?? 0;
                  const maxCount = Math.max(...stats.distribution.map((d) => d.count), 1);
                  const height = Math.max((count / maxCount) * 100, 4);
                  return (
                    <div key={s} className="flex flex-col items-center flex-1 gap-0.5">
                      <div
                        className="w-full rounded-t bg-amber-400"
                        style={{ height: `${height}%` }}
                        title={`${s} star: ${count}`}
                      />
                      <span className="text-[10px] text-slate-500">{s}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Low-Rated Drivers Alert */}
      {stats && stats.low_rated_drivers.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <TrendingDown className="h-4 w-4" />
              Low-Rated Drivers (avg &le; 3 stars)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.low_rated_drivers.map((d) => (
                <div
                  key={d.driver_id}
                  className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-sm">{d.driver_name ?? d.driver_id.slice(0, 8)}</p>
                    <p className="text-xs text-slate-500">{d.review_count} reviews</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-bold text-sm">{d.avg_rating}</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Max Stars</Label>
              <Select value={maxRating} onValueChange={setMaxRating}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ratings</SelectItem>
                  <SelectItem value="1">1 star</SelectItem>
                  <SelectItem value="2">&le; 2 stars</SelectItem>
                  <SelectItem value="3">&le; 3 stars</SelectItem>
                  <SelectItem value="4">&le; 4 stars</SelectItem>
                  <SelectItem value="5">&le; 5 stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Driver ID</Label>
              <Input
                placeholder="UUID"
                className="w-[200px]"
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">From</Label>
              <Input
                type="date"
                className="w-[150px]"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">To</Label>
              <Input
                type="date"
                className="w-[150px]"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ratings Table */}
      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : ratings.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Star className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No ratings found</p>
              <p className="text-sm mt-1">Ratings will appear here after rides are completed and reviewed.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Booking</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ratings.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {new Date(r.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{r.user_name ?? '—'}</p>
                            <p className="text-xs text-slate-500">{r.user_mobile ?? ''}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{r.driver_name ?? '—'}</p>
                            <p className="text-xs text-slate-500">{r.driver_mobile ?? ''}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Stars count={r.rating} />
                            <Badge
                              variant={r.rating <= 2 ? 'destructive' : r.rating <= 3 ? 'secondary' : 'default'}
                              className="text-xs"
                            >
                              {r.rating}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate" title={r.review ?? ''}>
                            {r.review || <span className="italic text-slate-400">No review</span>}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-slate-400">
                            {r.booking_id.slice(0, 8)}...
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {meta && meta.total_pages > 1 && (
                <div className="flex items-center justify-between pt-4">
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
    </div>
  );
}
