import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminFraudApi, type RideAnomaly, type GpsMismatch, type FakeLocationDriver, type DuplicateAccounts } from '@/services/api';
import { toast } from 'sonner';
import { AlertTriangle, Map, UserX, Copy } from 'lucide-react';
import { ConfirmActionModal } from './drivers/ConfirmActionModal';

type TabType = 'anomalies' | 'gps' | 'fake_location' | 'duplicates';

export function FraudDetectionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('anomalies');

  return (
    <div className="space-y-6 text-slate-950 dark:text-slate-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Fraud Detection</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <TabButton
          active={activeTab === 'anomalies'}
          onClick={() => setActiveTab('anomalies')}
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Ride Anomalies"
        />
        <TabButton
          active={activeTab === 'gps'}
          onClick={() => setActiveTab('gps')}
          icon={<Map className="w-4 h-4" />}
          label="GPS Mismatch"
        />
        <TabButton
          active={activeTab === 'fake_location'}
          onClick={() => setActiveTab('fake_location')}
          icon={<UserX className="w-4 h-4" />}
          label="Fake Locations"
        />
        <TabButton
          active={activeTab === 'duplicates'}
          onClick={() => setActiveTab('duplicates')}
          icon={<Copy className="w-4 h-4" />}
          label="Duplicate Accounts"
        />
      </div>

      <div className="mt-4">
        {activeTab === 'anomalies' && <RideAnomaliesTab />}
        {activeTab === 'gps' && <GpsMismatchTab />}
        {activeTab === 'fake_location' && <FakeLocationTab />}
        {activeTab === 'duplicates' && <DuplicateAccountsTab />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
        active
          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30'
          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function RideAnomaliesTab() {
  const [data, setData] = useState<RideAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.booking_id.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q),
    );
  }, [data, search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFraudApi.getRideAnomalies();
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err?.apiMessage || 'Failed to load anomalies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ride Anomalies</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No anomalies detected.</div>
        ) : (
          <div className="space-y-3">
            <div className="max-w-xs space-y-1">
              <Label className="text-xs text-slate-500">Filter (booking id / reason)</Label>
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Distance (km)</TableHead>
                    <TableHead>Duration (min)</TableHead>
                    <TableHead>Avg Speed (km/h)</TableHead>
                    <TableHead>Straight Line (km)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                        No rows match this filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">{item.booking_id.slice(0, 8)}...</TableCell>
                        <TableCell className="text-red-600 font-medium">{item.reason}</TableCell>
                        <TableCell>{item.total_distance_km.toFixed(2)}</TableCell>
                        <TableCell>{item.total_duration_min.toFixed(0)}</TableCell>
                        <TableCell>{item.implied_speed_kmh.toFixed(1)}</TableCell>
                        <TableCell>{item.straight_line_km ? item.straight_line_km.toFixed(2) : 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GpsMismatchTab() {
  const [data, setData] = useState<GpsMismatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFraudApi.getGpsMismatch();
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err?.apiMessage || 'Failed to load GPS mismatch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>GPS Mismatch</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No GPS mismatches detected.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Straight Line (km)</TableHead>
                  <TableHead>Path Length (km)</TableHead>
                  <TableHead>Ratio (Path / Straight)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs">{item.booking_id.slice(0, 8)}...</TableCell>
                    <TableCell>{item.straight_line_km.toFixed(2)}</TableCell>
                    <TableCell>{item.path_length_km.toFixed(2)}</TableCell>
                    <TableCell className="text-red-600 font-medium">{item.ratio.toFixed(2)}x</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FakeLocationTab() {
  const [data, setData] = useState<FakeLocationDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [flagModal, setFlagModal] = useState<string | null>(null);
  const [flagLoading, setFlagLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFraudApi.getFakeLocationDrivers();
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err?.apiMessage || 'Failed to load fake location data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleFlag() {
    if (!flagModal) return;
    setFlagLoading(true);
    try {
      await adminFraudApi.flagDriver(flagModal, 'Flagged from Fake Location Detection');
      toast.success('Driver flagged successfully');
      setFlagModal(null);
    } catch (err: any) {
      toast.error(err?.apiMessage || 'Failed to flag driver');
    } finally {
      setFlagLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fake Location Drivers</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No fake locations detected.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver ID</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs">{item.driver_id.slice(0, 8)}...</TableCell>
                    <TableCell className="text-red-600 font-medium">{item.reason}</TableCell>
                    <TableCell className="text-xs">{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</TableCell>
                    <TableCell>{new Date(item.location_updated_at).toLocaleString()}</TableCell>
                    <TableCell>{item.is_online ? 'Online' : 'Offline'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setFlagModal(item.driver_id)}>
                        Flag Driver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {flagModal && (
          <ConfirmActionModal
            open={!!flagModal}
            onOpenChange={(o) => !o && setFlagModal(null)}
            title="Flag Driver"
            message="Are you sure you want to flag this driver for fake location review?"
            confirmLabel="Flag"
            variant="destructive"
            onConfirm={handleFlag}
            isLoading={flagLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}

function DuplicateAccountsTab() {
  const [data, setData] = useState<DuplicateAccounts | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFraudApi.getDuplicateAccounts();
      setData(res.data);
    } catch (err: any) {
      toast.error(err?.apiMessage || 'Failed to load duplicate accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const hasAnyDuplicates = 
    data.duplicate_user_mobiles.length > 0 || 
    data.duplicate_driver_mobiles.length > 0 || 
    data.duplicate_pan_documents.length > 0 || 
    data.user_and_driver_same_mobile.length > 0;

  if (!hasAnyDuplicates) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="py-8 text-center text-slate-500">No duplicate accounts detected.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.duplicate_user_mobiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Duplicate User Mobiles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mobile Number</TableHead>
                  <TableHead>Account Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.duplicate_user_mobiles.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.mobile_number}</TableCell>
                    <TableCell className="text-red-600 font-bold">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {data.duplicate_driver_mobiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Duplicate Driver Mobiles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mobile Number</TableHead>
                  <TableHead>Account Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.duplicate_driver_mobiles.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.mobile_number}</TableCell>
                    <TableCell className="text-red-600 font-bold">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {data.duplicate_pan_documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Duplicate PAN Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PAN Document URL</TableHead>
                  <TableHead>Usage Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.duplicate_pan_documents.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="truncate max-w-[300px]">{item.document_url}</TableCell>
                    <TableCell className="text-red-600 font-bold">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {data.user_and_driver_same_mobile.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User & Driver Sharing Mobile</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mobile Number</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Driver ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.user_and_driver_same_mobile.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.mobile_number}</TableCell>
                    <TableCell className="font-mono text-xs">{item.user_id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-mono text-xs">{item.driver_id.slice(0, 8)}...</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
