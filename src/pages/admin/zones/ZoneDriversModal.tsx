import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { adminZonesApi, type ZoneDriver, type Zone } from '@/services/api';
import { toast } from 'sonner';
import { Users, UserPlus, Loader2 } from 'lucide-react';

function getDriverStatusVariant(status: string): 'success' | 'destructive' | 'secondary' | 'warning' {
  switch (status) {
    case 'approved': return 'success';
    case 'suspended': return 'warning';
    case 'blocked': return 'destructive';
    default: return 'secondary';
  }
}

interface ZoneDriversModalProps {
  zone: Zone | null;
  onClose: () => void;
}

export function ZoneDriversModal({ zone, onClose }: ZoneDriversModalProps) {
  const [drivers, setDrivers] = useState<ZoneDriver[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; total_pages: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [driverIdInput, setDriverIdInput] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);

  const fetchDrivers = useCallback(async () => {
    if (!zone) return;
    setLoading(true);
    try {
      const { data } = await adminZonesApi.getZoneDrivers(zone.id, { page, limit: 10 });
      setDrivers(data.data);
      setMeta(data.meta);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load zone drivers';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [zone, page]);

  useEffect(() => {
    if (zone) {
      setPage(1);
      setDrivers([]);
    }
  }, [zone]);

  useEffect(() => {
    if (zone) {
      fetchDrivers();
    }
  }, [fetchDrivers, zone]);

  async function handleAssignDriver() {
    if (!zone || !driverIdInput.trim()) {
      toast.error('Please enter a driver ID');
      return;
    }
    setAssigning(true);
    try {
      await adminZonesApi.assignDriver(zone.id, driverIdInput.trim());
      toast.success('Driver assigned to zone');
      setDriverIdInput('');
      setShowAssignForm(false);
      fetchDrivers();
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to assign driver';
      toast.error(msg);
    } finally {
      setAssigning(false);
    }
  }

  const open = !!zone;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600" />
            {zone?.zone_name} — Drivers
          </DialogTitle>
        </DialogHeader>

        {zone && (
          <div className="space-y-4">
            {/* Assign Driver section */}
            <div className="rounded-xl border border-zinc-100 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-medium text-sm">Assign Driver</h5>
                  <p className="text-xs text-slate-500">Add a driver to this service zone</p>
                </div>
                <Button
                  size="sm"
                  variant={showAssignForm ? 'outline' : 'default'}
                  className={showAssignForm ? '' : 'bg-red-600 hover:bg-red-700 text-white'}
                  onClick={() => setShowAssignForm(!showAssignForm)}
                >
                  {showAssignForm ? 'Cancel' : (
                    <>
                      <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                      Assign Driver
                    </>
                  )}
                </Button>
              </div>

              {showAssignForm && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="driver-id-input" className="sr-only">Driver UUID</Label>
                    <Input
                      id="driver-id-input"
                      placeholder="Paste driver UUID..."
                      value={driverIdInput}
                      onChange={(e) => setDriverIdInput(e.target.value)}
                      className="font-mono text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleAssignDriver()}
                    />
                  </div>
                  <Button
                    onClick={handleAssignDriver}
                    disabled={assigning || !driverIdInput.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                  >
                    {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
                  </Button>
                </div>
              )}
            </div>

            {/* Drivers Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-sm text-slate-700 dark:text-slate-300">
                  Assigned Drivers
                  {meta && (
                    <span className="ml-2 text-xs font-normal text-slate-400">({meta.total} total)</span>
                  )}
                </h5>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : drivers.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-5 w-5 text-zinc-400" />
                  </div>
                  No drivers assigned to this zone.
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((zd) => (
                        <TableRow key={zd.id}>
                          <TableCell className="font-medium text-sm">
                            {zd.driver?.name ?? '—'}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {zd.driver?.mobile_number ?? '—'}
                          </TableCell>
                          <TableCell>
                            {zd.driver?.status ? (
                              <Badge variant={getDriverStatusVariant(zd.driver.status)}>
                                {zd.driver.status}
                              </Badge>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                            {new Date(zd.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {meta && meta.total_pages > 1 && (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Page {meta.page} of {meta.total_pages}
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
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
