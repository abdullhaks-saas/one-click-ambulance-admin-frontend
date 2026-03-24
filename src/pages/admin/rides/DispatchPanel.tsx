import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  adminDispatchApi,
  adminZonesApi,
  type AvailableDriver,
  type NearestDriver,
  type Zone,
} from '@/services/api';
import { toast } from 'sonner';
import {
  Navigation,
  Users,
  UserCheck,
  XCircle,
  RefreshCw,
  Timer,
  MapPin,
  Loader2,
} from 'lucide-react';
import { useEffect } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const MAP_ID = 'bf51a910020fa566';

export function DispatchPanel() {
  const [bookingId, setBookingId] = useState('');
  const [assignmentId, setAssignmentId] = useState('');
  const [manualDriverId, setManualDriverId] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);

  const [nearestDriver, setNearestDriver] = useState<NearestDriver | null | undefined>(undefined);
  const [availableDrivers, setAvailableDrivers] = useState<AvailableDriver[]>([]);
  const [hoveredDriverId, setHoveredDriverId] = useState<string | null>(null);

  const [findLoading, setFindLoading] = useState(false);
  const [availLoading, setAvailLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [autoAssignLoading, setAutoAssignLoading] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [timeoutLoading, setTimeoutLoading] = useState(false);

  const [showManualDialog, setShowManualDialog] = useState(false);
  const [showDriversMap, setShowDriversMap] = useState(false);

  // Load zones for the zone selector
  useEffect(() => {
    async function loadZones() {
      setZonesLoading(true);
      try {
        const { data } = await adminZonesApi.list({ limit: 100 });
        setZones(data.data);
      } catch {
        // non-critical
      } finally {
        setZonesLoading(false);
      }
    }
    loadZones();
  }, []);

  async function handleFindDriver() {
    if (!bookingId.trim()) {
      toast.error('Please enter a booking ID');
      return;
    }
    setFindLoading(true);
    setNearestDriver(undefined);
    try {
      const { data } = await adminDispatchApi.findDriver(bookingId.trim());
      setNearestDriver(data);
      if (!data) toast.info('No available driver found within 10 km radius');
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to find driver';
      toast.error(msg);
      setNearestDriver(undefined);
    } finally {
      setFindLoading(false);
    }
  }

  async function handleGetAvailableDrivers() {
    if (!selectedZoneId) {
      toast.error('Please select a zone');
      return;
    }
    setAvailLoading(true);
    setAvailableDrivers([]);
    try {
      const { data } = await adminDispatchApi.availableDrivers(selectedZoneId);
      setAvailableDrivers(data);
      setShowDriversMap(true);
      if (data.length === 0) toast.info('No online drivers in this zone');
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to fetch available drivers';
      toast.error(msg);
    } finally {
      setAvailLoading(false);
    }
  }

  async function handleAutoAssign() {
    if (!bookingId.trim()) {
      toast.error('Please enter a booking ID');
      return;
    }
    setAutoAssignLoading(true);
    try {
      const { data } = await adminDispatchApi.assignDriver(bookingId.trim());
      if (data.assignment_id) {
        toast.success(`Driver auto-assigned. Assignment: ${data.assignment_id.slice(0, 8)}…`);
      } else {
        toast.info(data.message);
      }
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Auto-assign failed';
      toast.error(msg);
    } finally {
      setAutoAssignLoading(false);
    }
  }

  async function handleManualAssign() {
    if (!bookingId.trim() || !manualDriverId.trim()) {
      toast.error('Both booking ID and driver ID are required');
      return;
    }
    setAssignLoading(true);
    try {
      const { data } = await adminDispatchApi.manualAssign(bookingId.trim(), manualDriverId.trim());
      toast.success(`Driver assigned. Assignment: ${data.assignment_id.slice(0, 8)}…`);
      setShowManualDialog(false);
      setManualDriverId('');
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Manual assign failed';
      toast.error(msg);
    } finally {
      setAssignLoading(false);
    }
  }

  async function handleCancelAssignment() {
    if (!bookingId.trim()) {
      toast.error('Please enter a booking ID');
      return;
    }
    setCancelLoading(true);
    try {
      await adminDispatchApi.cancelAssignment(bookingId.trim());
      toast.success('Assignment cancelled');
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Cancel failed';
      toast.error(msg);
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleRetryAssignment() {
    if (!bookingId.trim()) {
      toast.error('Please enter a booking ID');
      return;
    }
    setRetryLoading(true);
    try {
      const { data } = await adminDispatchApi.retryAssignment(bookingId.trim());
      if (data.assignment_id) {
        toast.success(`Driver re-assigned. Assignment: ${data.assignment_id.slice(0, 8)}…`);
      } else {
        toast.info(data.message);
      }
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Retry failed';
      toast.error(msg);
    } finally {
      setRetryLoading(false);
    }
  }

  async function handleDriverTimeout() {
    if (!assignmentId.trim()) {
      toast.error('Please enter an assignment ID');
      return;
    }
    setTimeoutLoading(true);
    try {
      await adminDispatchApi.driverTimeout(assignmentId.trim());
      toast.success('Driver timeout processed. Booking reset to searching.');
      setAssignmentId('');
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Timeout processing failed';
      toast.error(msg);
    } finally {
      setTimeoutLoading(false);
    }
  }

  const mapCenter =
    availableDrivers.length > 0
      ? { lat: Number(availableDrivers[0].latitude), lng: Number(availableDrivers[0].longitude) }
      : { lat: 12.9629, lng: 77.5775 };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-red-600" />
            dispatch panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Booking ID input — shared across all actions */}
          <div className="rounded-xl bg-zinc-50 dark:bg-slate-800/50 p-4 space-y-3">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Target Booking</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Label htmlFor="booking-id" className="sr-only">Booking ID</Label>
                <Input
                  id="booking-id"
                  placeholder="Paste booking UUID..."
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Find Nearest Driver */}
            <div className="rounded-xl border border-zinc-100 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <Navigation className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h5 className="font-medium text-sm">Find Nearest Driver</h5>
              </div>
              <p className="text-xs text-slate-500">Locate the closest available driver within 10 km for this booking.</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={handleFindDriver}
                disabled={findLoading}
              >
                {findLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Find Driver'}
              </Button>
              {nearestDriver !== undefined && (
                <div className={`rounded-lg p-3 text-sm ${nearestDriver ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-zinc-50 dark:bg-slate-800'}`}>
                  {nearestDriver ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4" />
                        Driver Found
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">{nearestDriver.name ?? 'Unknown'}</p>
                      <p className="text-slate-500">{nearestDriver.mobile_number}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {nearestDriver.distance_km} km away
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs italic">No driver found in radius.</p>
                  )}
                </div>
              )}
            </div>

            {/* Auto Assign */}
            <div className="rounded-xl border border-zinc-100 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h5 className="font-medium text-sm">Auto Assign</h5>
              </div>
              <p className="text-xs text-slate-500">Automatically find and assign the nearest available driver.</p>
              <Button
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleAutoAssign}
                disabled={autoAssignLoading}
              >
                {autoAssignLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Auto Assign'}
              </Button>
            </div>

            {/* Manual Assign */}
            <div className="rounded-xl border border-zinc-100 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                  <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <h5 className="font-medium text-sm">Manual Assign</h5>
              </div>
              <p className="text-xs text-slate-500">Manually select and assign a specific driver to this booking.</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setShowManualDialog(true)}
              >
                Assign Driver
              </Button>
            </div>

            {/* Cancel Assignment */}
            <div className="rounded-xl border border-zinc-100 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <h5 className="font-medium text-sm">Cancel Assignment</h5>
              </div>
              <p className="text-xs text-slate-500">Cancel the current driver assignment and reset booking to searching.</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                onClick={handleCancelAssignment}
                disabled={cancelLoading}
              >
                {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel Assignment'}
              </Button>
            </div>

            {/* Retry Assignment */}
            <div className="rounded-xl border border-zinc-100 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h5 className="font-medium text-sm">Retry Assignment</h5>
              </div>
              <p className="text-xs text-slate-500">Mark current assignment as rejected and find a new driver.</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400"
                onClick={handleRetryAssignment}
                disabled={retryLoading}
              >
                {retryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Retry'}
              </Button>
            </div>

            {/* Driver Timeout */}
            <div className="rounded-xl border border-zinc-100 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Timer className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <h5 className="font-medium text-sm">Driver Timeout</h5>
              </div>
              <p className="text-xs text-slate-500">Process a 15-second acceptance timeout for an assignment.</p>
              <Input
                placeholder="Assignment UUID..."
                value={assignmentId}
                onChange={(e) => setAssignmentId(e.target.value)}
                className="font-mono text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={handleDriverTimeout}
                disabled={timeoutLoading}
              >
                {timeoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Process Timeout'}
              </Button>
            </div>
          </div>

          {/* Available Drivers by Zone */}
          <div className="rounded-xl border border-zinc-100 dark:border-slate-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="h-8 w-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h5 className="font-medium text-sm">Available Drivers by Zone</h5>
                  <p className="text-xs text-slate-500">View all online drivers in a zone on the map.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedZoneId}
                  onValueChange={setSelectedZoneId}
                  disabled={zonesLoading}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={zonesLoading ? 'Loading…' : 'Select zone'} />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.zone_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGetAvailableDrivers}
                  disabled={availLoading || !selectedZoneId}
                  className="shrink-0"
                >
                  {availLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'View Drivers'}
                </Button>
              </div>
            </div>

            {/* Drivers count badge */}
            {showDriversMap && (
              <div className="flex items-center gap-2">
                <Badge variant={availableDrivers.length > 0 ? 'success' : 'secondary'}>
                  {availableDrivers.length} driver{availableDrivers.length !== 1 ? 's' : ''} online
                </Badge>
              </div>
            )}

            {/* Drivers Map */}
            {showDriversMap && API_KEY && (
              <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-slate-800 h-72">
                <APIProvider apiKey={API_KEY}>
                  <Map
                    defaultCenter={mapCenter}
                    defaultZoom={12}
                    mapId={MAP_ID}
                    disableDefaultUI
                    className="w-full h-full"
                  >
                    {availableDrivers.map((driver) => (
                      <AdvancedMarker
                        key={driver.driver_id}
                        position={{ lat: Number(driver.latitude), lng: Number(driver.longitude) }}
                        title={driver.name ?? driver.mobile_number}
                        onMouseEnter={() => setHoveredDriverId(driver.driver_id)}
                        onMouseLeave={() => setHoveredDriverId(null)}
                      >
                        <Pin background="#2563eb" borderColor="#ffffff" glyphColor="#ffffff" />
                      </AdvancedMarker>
                    ))}
                    {hoveredDriverId && (() => {
                      const d = availableDrivers.find((x) => x.driver_id === hoveredDriverId);
                      if (!d) return null;
                      return (
                        <InfoWindow
                          position={{ lat: Number(d.latitude), lng: Number(d.longitude) }}
                          onCloseClick={() => setHoveredDriverId(null)}
                        >
                          <div className="text-xs space-y-0.5 min-w-[100px]">
                            <p className="font-semibold">{d.name ?? 'Unknown Driver'}</p>
                            <p className="text-slate-500">{d.mobile_number}</p>
                          </div>
                        </InfoWindow>
                      );
                    })()}
                  </Map>
                </APIProvider>
              </div>
            )}

            {/* Drivers List */}
            {showDriversMap && availableDrivers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {availableDrivers.map((driver) => (
                  <div
                    key={driver.driver_id}
                    className="flex items-center gap-2 rounded-lg border border-zinc-100 dark:border-slate-800 p-2.5 text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors"
                    onMouseEnter={() => setHoveredDriverId(driver.driver_id)}
                    onMouseLeave={() => setHoveredDriverId(null)}
                  >
                    <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                      <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">{driver.name ?? 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{driver.mobile_number}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto shrink-0 h-7 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      onClick={() => {
                        setManualDriverId(driver.driver_id);
                        setShowManualDialog(true);
                      }}
                    >
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Assign Dialog */}
      <Dialog open={showManualDialog} onOpenChange={(o) => !o && setShowManualDialog(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Manual Driver Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Booking ID</Label>
              <Input
                placeholder="Booking UUID..."
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Driver ID</Label>
              <Input
                placeholder="Driver UUID..."
                value={manualDriverId}
                onChange={(e) => setManualDriverId(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowManualDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleManualAssign}
                disabled={assignLoading || !bookingId.trim() || !manualDriverId.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {assignLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign Driver'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
