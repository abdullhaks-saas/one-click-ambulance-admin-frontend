import { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import type { RideDetail, RideStatusEnum } from '@/services/api';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const MAP_ID = 'bf51a910020fa566';

function getRideStatusVariant(
  status: RideStatusEnum
): 'success' | 'warning' | 'secondary' {
  switch (status) {
    case 'trip_completed':
      return 'success';
    case 'trip_started':
    case 'patient_onboard':
    case 'arrived':
      return 'warning';
    default:
      return 'secondary';
  }
}

function formatStatus(s: string) {
  return s.replace(/_/g, ' ');
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

// Inner component that draws the polyline using map ref
function RidePolyline({ path }: { path: google.maps.LatLngLiteral[] }) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !mapsLib || path.length === 0) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    polylineRef.current = new mapsLib.Polyline({
      path,
      geodesic: true,
      strokeColor: '#dc2626',
      strokeOpacity: 0.9,
      strokeWeight: 4,
    });
    polylineRef.current.setMap(map);

    // Fit bounds to path
    const bounds = new google.maps.LatLngBounds();
    path.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, 40);

    return () => {
      polylineRef.current?.setMap(null);
    };
  }, [map, mapsLib, path]);

  return null;
}

interface RideMapProps {
  ride: RideDetail;
}

function RideMap({ ride }: RideMapProps) {
  const trackingPath: google.maps.LatLngLiteral[] = ride.ride_tracking.map(
    (t) => ({ lat: Number(t.latitude), lng: Number(t.longitude) })
  );

  const startPoint = trackingPath[0];
  const endPoint = trackingPath[trackingPath.length - 1];

  const center = startPoint ?? { lat: 12.9629, lng: 77.5775 };

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        defaultCenter={center}
        defaultZoom={13}
        mapId={MAP_ID}
        disableDefaultUI
        className="w-full h-full"
      >
        {trackingPath.length > 0 && <RidePolyline path={trackingPath} />}

        {startPoint && (
          <AdvancedMarker position={startPoint} title="Trip Start">
            <Pin background="#16a34a" borderColor="#ffffff" glyphColor="#ffffff" />
          </AdvancedMarker>
        )}
        {endPoint && startPoint !== endPoint && (
          <AdvancedMarker position={endPoint} title="Trip End">
            <Pin background="#dc2626" borderColor="#ffffff" glyphColor="#ffffff" />
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
}

interface RideDetailModalProps {
  ride: RideDetail | null;
  loading: boolean;
  onClose: () => void;
}

export function RideDetailModal({ ride, loading, onClose }: RideDetailModalProps) {
  const open = !!ride || loading;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ride Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-[160px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-red-600" />
          </div>
        ) : !ride ? (
          <p className="py-6 text-center text-sm text-slate-500">No data.</p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Left: Metadata */}
            <div className="space-y-4">
              <section className="rounded-xl border border-zinc-100 dark:border-slate-800 p-4 space-y-2">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 mb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600 inline-block" />
                  Ride Info
                </h4>
                <div className="grid gap-1.5 text-sm">
                  <p><span className="font-medium text-slate-500">Ride ID:</span> <span className="font-mono text-xs">{ride.id.slice(0, 8)}…</span></p>
                  <p><span className="font-medium text-slate-500">Booking ID:</span> <span className="font-mono text-xs">{ride.booking_id.slice(0, 8)}…</span></p>
                  <p>
                    <span className="font-medium text-slate-500">Status:</span>{' '}
                    <Badge variant={getRideStatusVariant(ride.ride_status)} className="ml-1">
                      {formatStatus(ride.ride_status)}
                    </Badge>
                  </p>
                  <p><span className="font-medium text-slate-500">Distance:</span> {ride.total_distance_km != null ? `${ride.total_distance_km} km` : '—'}</p>
                  <p><span className="font-medium text-slate-500">Duration:</span> {ride.total_duration_min != null ? `${ride.total_duration_min} min` : '—'}</p>
                  <p><span className="font-medium text-slate-500">Trip Started:</span> {formatDateTime(ride.trip_started_at)}</p>
                  <p><span className="font-medium text-slate-500">Trip Completed:</span> {formatDateTime(ride.trip_completed_at)}</p>
                </div>
              </section>

              <section className="rounded-xl border border-zinc-100 dark:border-slate-800 p-4 space-y-2">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 mb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600 inline-block" />
                  Booking Info
                </h4>
                <div className="grid gap-1.5 text-sm">
                  <p><span className="font-medium text-slate-500">Booking Status:</span> <Badge variant="secondary" className="ml-1">{formatStatus(ride.booking.status)}</Badge></p>
                  <p><span className="font-medium text-slate-500">Pickup:</span> {ride.booking.pickup_address ?? '—'}</p>
                  <p><span className="font-medium text-slate-500">Drop:</span> {ride.booking.drop_address ?? '—'}</p>
                </div>
              </section>

              {ride.ride_tracking.length > 0 && (
                <section className="rounded-xl border border-zinc-100 dark:border-slate-800 p-4">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 inline-block" />
                    Tracking Points
                  </h4>
                  <p className="text-sm text-slate-500">{ride.ride_tracking.length} GPS coordinates recorded</p>
                  <div className="mt-2 max-h-36 overflow-y-auto space-y-1">
                    {ride.ride_tracking.slice(0, 5).map((t, i) => (
                      <p key={i} className="text-xs font-mono text-slate-400">
                        {Number(t.latitude).toFixed(6)}, {Number(t.longitude).toFixed(6)}
                      </p>
                    ))}
                    {ride.ride_tracking.length > 5 && (
                      <p className="text-xs text-slate-400">…and {ride.ride_tracking.length - 5} more</p>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Right: Map */}
            <div className="flex flex-col">
              <h4 className="mb-2 font-semibold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600 inline-block" />
                Tracking Map
              </h4>
              <div className="flex-1 min-h-[280px] rounded-xl overflow-hidden border border-zinc-100 dark:border-slate-800">
                {API_KEY ? (
                  ride.ride_tracking.length > 0 ? (
                    <RideMap ride={ride} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-slate-800 text-slate-400 text-sm italic">
                      No tracking data available.
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-slate-800 text-slate-400 text-sm italic p-4 text-center">
                    Google Maps API Key not configured.
                  </div>
                )}
              </div>
              <div className="mt-2 flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-600" />
                  Trip Start
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-600" />
                  Trip End
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1 w-8 rounded-full bg-red-500" />
                  Route
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
