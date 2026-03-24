import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, AlertTriangle, XCircle, CheckCircle, Clock } from 'lucide-react';
import type { BookingDetail, BookingStatus } from '@/services/api';
import { ConfirmActionModal } from '../drivers/ConfirmActionModal';
import { adminBookingsApi } from '@/services/api';
import { toast } from 'sonner';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const MAP_ID = 'bf51a910020fa566';

const ACTIVE_STATUSES: BookingStatus[] = [
  'searching',
  'driver_assigned',
  'driver_accepted',
  'driver_on_way',
  'driver_arrived',
  'patient_onboard',
  'trip_started',
];

function getStatusVariant(
  status: string
): 'success' | 'destructive' | 'secondary' | 'warning' | 'default' {
  switch (status) {
    case 'driver_assigned':
    case 'driver_accepted':
    case 'trip_completed':
      return 'success';
    case 'cancelled':
    case 'force_cancelled':
    case 'no_driver_found':
      return 'destructive';
    case 'driver_on_way':
    case 'driver_arrived':
    case 'patient_onboard':
    case 'trip_started':
      return 'warning';
    default:
      return 'secondary';
  }
}

function formatStatus(s: string) {
  return s.replace(/_/g, ' ');
}

function formatFare(fare: number | null) {
  if (fare === null || fare === undefined) return '—';
  return `₹${Number(fare).toFixed(2)}`;
}

function formatDateTime(date: string | null | undefined) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface BookingDetailModalProps {
  booking: BookingDetail | null;
  loading: boolean;
  onClose: () => void;
  onForceCancelled?: () => void;
}

export function BookingDetailModal({
  booking,
  loading,
  onClose,
  onForceCancelled,
}: BookingDetailModalProps) {
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const open = !!booking || loading;

  async function handleForceCancel(reason?: string) {
    if (!booking) return;
    setCancelling(true);
    try {
      await adminBookingsApi.forceCancel(booking.id, reason);
      toast.success('Ride force cancelled');
      setCancelConfirm(false);
      onForceCancelled?.();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to cancel ride';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  }

  const pickupCoords = booking
    ? { lat: Number(booking.pickup_latitude), lng: Number(booking.pickup_longitude) }
    : null;
  const dropCoords = booking
    ? { lat: Number(booking.drop_latitude), lng: Number(booking.drop_longitude) }
    : null;

  const mapCenter = pickupCoords ?? { lat: 12.9629, lng: 77.5775 };
  const isActive = booking ? ACTIVE_STATUSES.includes(booking.status) : false;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex min-h-[160px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-red-600" />
            </div>
          ) : !booking ? (
            <p className="py-6 text-center text-sm text-slate-500">No data.</p>
          ) : (
            <div className="space-y-5">

              {/* Booking Info */}
              <section className="rounded-xl border border-zinc-100 dark:border-slate-800 p-4 space-y-2">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600 inline-block" />
                  Booking Info
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  <p><span className="font-medium text-slate-500">ID:</span> <span className="font-mono text-xs">{booking.id.slice(0, 8)}…</span></p>
                  <p><span className="font-medium text-slate-500">Status:</span> <Badge variant={getStatusVariant(booking.status)} className="ml-1">{formatStatus(booking.status)}</Badge></p>
                  <p><span className="font-medium text-slate-500">User:</span> {booking.user?.name ?? '—'}</p>
                  <p><span className="font-medium text-slate-500">Mobile:</span> {booking.user?.mobile_number ?? '—'}</p>
                  <p><span className="font-medium text-slate-500">Ambulance:</span> {booking.ambulance_type?.name ?? '—'}</p>
                  <p><span className="font-medium text-slate-500">Zone:</span> {booking.zone?.zone_name ?? '—'}</p>
                  <p><span className="font-medium text-slate-500">Est. Fare:</span> {formatFare(booking.estimated_fare)}</p>
                  <p><span className="font-medium text-slate-500">Final Fare:</span> {formatFare(booking.final_fare)}</p>
                  <p><span className="font-medium text-slate-500">Distance:</span> {booking.estimated_distance_km ? `${booking.estimated_distance_km} km` : '—'}</p>
                  <p><span className="font-medium text-slate-500">Duration:</span> {booking.estimated_duration_min ? `${booking.estimated_duration_min} min` : '—'}</p>
                  <p><span className="font-medium text-slate-500">Created:</span> {formatDateTime(booking.created_at)}</p>
                  <p className="flex items-center gap-1">
                    <span className="font-medium text-slate-500">Emergency:</span>
                    {booking.is_emergency ? (
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" /> Yes
                      </span>
                    ) : 'No'}
                  </p>
                  {booking.cancellation_reason && (
                    <p className="col-span-2"><span className="font-medium text-slate-500">Cancel Reason:</span> {booking.cancellation_reason}</p>
                  )}
                </div>
              </section>

              {/* Map: Pickup / Drop */}
              {API_KEY && pickupCoords && dropCoords && (
                <section>
                  <h4 className="mb-2 font-semibold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 inline-block" />
                    Route
                  </h4>
                  <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-slate-800 h-52">
                    <APIProvider apiKey={API_KEY}>
                      <Map
                        defaultCenter={mapCenter}
                        defaultZoom={12}
                        mapId={MAP_ID}
                        disableDefaultUI
                        className="w-full h-full"
                      >
                        <AdvancedMarker position={pickupCoords} title="Pickup">
                          <Pin background="#16a34a" borderColor="#ffffff" glyphColor="#ffffff" />
                        </AdvancedMarker>
                        <AdvancedMarker position={dropCoords} title="Drop">
                          <Pin background="#dc2626" borderColor="#ffffff" glyphColor="#ffffff" />
                        </AdvancedMarker>
                      </Map>
                    </APIProvider>
                  </div>
                  <div className="mt-2 flex gap-6 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-green-600" />
                      {booking.pickup_address ?? 'Pickup location'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-red-600" />
                      {booking.drop_address ?? 'Drop location'}
                    </span>
                  </div>
                </section>
              )}

              {/* Status History Timeline */}
              {booking.status_history && booking.status_history.length > 0 && (
                <section>
                  <h4 className="mb-3 font-semibold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 inline-block" />
                    Status History
                  </h4>
                  <ol className="relative border-l-2 border-zinc-200 dark:border-slate-700 ml-3 space-y-3">
                    {booking.status_history.map((h, i) => {
                      const isLast = i === booking.status_history!.length - 1;
                      return (
                        <li key={h.id} className="ml-5">
                          <div className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 ${isLast ? 'bg-red-600 border-red-600' : 'bg-white dark:bg-slate-900 border-zinc-300 dark:border-slate-600'}`}>
                            {isLast ? (
                              <CheckCircle className="h-2.5 w-2.5 text-white" />
                            ) : (
                              <Clock className="h-2.5 w-2.5 text-zinc-400" />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant={getStatusVariant(h.status)} className="text-xs">
                              {formatStatus(h.status)}
                            </Badge>
                            <span className="text-xs text-slate-400">{formatDateTime(h.created_at)}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}

              {/* Ride Details */}
              {booking.ride_details && (
                <section className="rounded-xl border border-zinc-100 dark:border-slate-800 p-4 space-y-1.5 text-sm">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 inline-block" />
                    Ride Details
                  </h4>
                  <p><span className="font-medium text-slate-500">Total Distance:</span> {booking.ride_details.total_distance_km ? `${booking.ride_details.total_distance_km} km` : '—'}</p>
                  <p><span className="font-medium text-slate-500">Total Duration:</span> {booking.ride_details.total_duration_min ? `${booking.ride_details.total_duration_min} min` : '—'}</p>
                  <p><span className="font-medium text-slate-500">Trip Started:</span> {formatDateTime(booking.ride_details.trip_started_at)}</p>
                  <p><span className="font-medium text-slate-500">Trip Completed:</span> {formatDateTime(booking.ride_details.trip_completed_at)}</p>
                </section>
              )}

              {/* Payments */}
              {booking.payments && booking.payments.length > 0 && (
                <section>
                  <h4 className="mb-2 font-semibold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 inline-block" />
                    Payments
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Razorpay ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {booking.payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>₹{Number(p.amount).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === 'paid' ? 'success' : p.status === 'failed' ? 'destructive' : 'secondary'}>
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{p.razorpay_payment_id ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </section>
              )}

              {/* Driver Assignments */}
              {booking.driver_assignments && booking.driver_assignments.length > 0 && (
                <section>
                  <h4 className="mb-2 font-semibold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 inline-block" />
                    Driver Assignments
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver ID</TableHead>
                        <TableHead>Assigned At</TableHead>
                        <TableHead>Accepted At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {booking.driver_assignments.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-mono text-xs">{a.driver_id.slice(0, 8)}…</TableCell>
                          <TableCell className="text-xs">{formatDateTime(a.assigned_at)}</TableCell>
                          <TableCell className="text-xs">{a.accepted_at ? formatDateTime(a.accepted_at) : <span className="text-slate-400">Pending</span>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </section>
              )}

              {/* Force Cancel */}
              {isActive && (
                <div className="pt-2 border-t border-zinc-100 dark:border-slate-800">
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={() => setCancelConfirm(true)}
                  >
                    <XCircle className="h-4 w-4" />
                    Force Cancel Ride
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {cancelConfirm && booking && (
        <ConfirmActionModal
          open={cancelConfirm}
          onOpenChange={(o) => !o && setCancelConfirm(false)}
          title="Force Cancel Ride"
          message={`Are you sure you want to force cancel booking ${booking.id.slice(0, 8)}…? This action cannot be undone.`}
          confirmLabel="Force Cancel"
          variant="destructive"
          requireReason={false}
          reasonLabel="Reason (optional)"
          onConfirm={handleForceCancel}
          isLoading={cancelling}
        />
      )}
    </>
  );
}
