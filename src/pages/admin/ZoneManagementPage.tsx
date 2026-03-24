import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ZoneTable } from './zones/ZoneTable';
import { ZoneFormModal } from './zones/ZoneFormModal';
import { ZoneDriversModal } from './zones/ZoneDriversModal';
import { ConfirmActionModal } from './drivers/ConfirmActionModal';
import { adminZonesApi, type Zone } from '@/services/api';
import { toast } from 'sonner';
import { MapPin, Plus, Search, X } from 'lucide-react';

export function ZoneManagementPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [formModal, setFormModal] = useState<{ open: boolean; zone: Zone | null }>({
    open: false,
    zone: null,
  });
  const [driversModal, setDriversModal] = useState<Zone | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Zone | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminZonesApi.list({
        page,
        limit: 10,
        search: search || undefined,
      });
      setZones(data.data);
      setMeta(data.meta);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load zones';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await adminZonesApi.delete(deleteConfirm.id);
      toast.success(`Zone "${deleteConfirm.zone_name}" deleted`);
      setDeleteConfirm(null);
      fetchZones();
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to delete zone';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  }

  function handleZoneSaved(zone: Zone) {
    setFormModal({ open: false, zone: null });
    // If it's an update, update in list. Otherwise refresh.
    const exists = zones.find((z) => z.id === zone.id);
    if (exists) {
      setZones((prev) => prev.map((z) => (z.id === zone.id ? zone : z)));
    } else {
      fetchZones();
    }
  }

  const hasSearch = !!search;

  return (
    <div className="space-y-4 text-slate-950 dark:text-slate-50">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />
            zone management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Define service zones and manage driver assignments
          </p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white self-start sm:self-auto gap-1.5"
          onClick={() => setFormModal({ open: true, zone: null })}
        >
          <Plus className="h-4 w-4" />
          Create Zone
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label className="text-xs text-slate-500">Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or city..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="max-w-xs"
                />
                <Button type="submit" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
                {hasSearch && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setSearchInput('');
                    }}
                    className="gap-1 text-slate-500"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            zones
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
              <ZoneTable
                zones={zones}
                onEdit={(zone) => setFormModal({ open: true, zone })}
                onDelete={setDeleteConfirm}
                onViewDrivers={setDriversModal}
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

      {/* Zone Form Modal */}
      <ZoneFormModal
        zone={formModal.zone}
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, zone: null })}
        onSaved={handleZoneSaved}
      />

      {/* Zone Drivers Modal */}
      <ZoneDriversModal
        zone={driversModal}
        onClose={() => setDriversModal(null)}
      />

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ConfirmActionModal
          open={!!deleteConfirm}
          onOpenChange={(o) => !o && setDeleteConfirm(null)}
          title="Delete Zone"
          message={`Are you sure you want to delete zone "${deleteConfirm.zone_name}"? This will also remove all driver assignments for this zone.`}
          confirmLabel="Delete Zone"
          variant="destructive"
          onConfirm={handleDelete}
          isLoading={deleting}
        />
      )}
    </div>
  );
}
