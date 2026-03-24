import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ActionsDropdown } from '@/components/ui/actions-dropdown';
import { Eye } from 'lucide-react';
import type { RideListItem, RideStatusEnum } from '@/services/api';

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
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface RideTableProps {
  rides: RideListItem[];
  onView: (id: string) => void;
}

export function RideTable({ rides, onView }: RideTableProps) {
  if (rides.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
        No rides found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking</TableHead>
            <TableHead>Ride Status</TableHead>
            <TableHead>Pickup</TableHead>
            <TableHead>Drop</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Trip Start</TableHead>
            <TableHead>Trip End</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rides.map((ride) => (
            <TableRow key={ride.id}>
              <TableCell className="font-mono text-xs text-slate-500">
                {ride.booking_id.slice(0, 8)}…
              </TableCell>
              <TableCell>
                <Badge variant={getRideStatusVariant(ride.ride_status)}>
                  {formatStatus(ride.ride_status)}
                </Badge>
              </TableCell>
              <TableCell className="text-xs max-w-[140px] truncate">
                {ride.booking?.pickup_address ?? '—'}
              </TableCell>
              <TableCell className="text-xs max-w-[140px] truncate">
                {ride.booking?.drop_address ?? '—'}
              </TableCell>
              <TableCell className="text-sm">
                {ride.total_distance_km != null ? `${ride.total_distance_km} km` : '—'}
              </TableCell>
              <TableCell className="text-sm">
                {ride.total_duration_min != null ? `${ride.total_duration_min} min` : '—'}
              </TableCell>
              <TableCell className="text-xs whitespace-nowrap">
                {formatDateTime(ride.trip_started_at)}
              </TableCell>
              <TableCell className="text-xs whitespace-nowrap">
                {formatDateTime(ride.trip_completed_at)}
              </TableCell>
              <TableCell className="text-right">
                <ActionsDropdown
                  actions={[
                    {
                      label: 'View Details',
                      icon: Eye,
                      onClick: () => onView(ride.id),
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
