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
import { Eye, XCircle, AlertTriangle } from 'lucide-react';
import type { BookingListItem, BookingStatus } from '@/services/api';

function getBookingStatusVariant(
  status: BookingStatus
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
    case 'created':
    case 'searching':
    default:
      return 'secondary';
  }
}

const ACTIVE_STATUSES: BookingStatus[] = [
  'searching',
  'driver_assigned',
  'driver_accepted',
  'driver_on_way',
  'driver_arrived',
  'patient_onboard',
  'trip_started',
];

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function formatFare(fare: number | null) {
  if (fare === null || fare === undefined) return '—';
  return `₹${Number(fare).toFixed(2)}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface BookingTableProps {
  bookings: BookingListItem[];
  onView: (id: string) => void;
  onForceCancel: (id: string) => void;
}

export function BookingTable({ bookings, onView, onForceCancel }: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
        No bookings found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Ambulance Type</TableHead>
            <TableHead>Zone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Emergency</TableHead>
            <TableHead>Est. Fare</TableHead>
            <TableHead>Final Fare</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const isActive = ACTIVE_STATUSES.includes(booking.status);
            return (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">
                      {booking.user?.name ?? '—'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {booking.user?.mobile_number ?? booking.user_id.slice(0, 8)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {booking.ambulance_type?.name ?? '—'}
                </TableCell>
                <TableCell className="text-sm">
                  {booking.zone?.zone_name ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={getBookingStatusVariant(booking.status)}>
                    {formatStatus(booking.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {booking.is_emergency ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Yes
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">No</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {formatFare(booking.estimated_fare)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatFare(booking.final_fare)}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatDate(booking.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <ActionsDropdown
                    actions={[
                      {
                        label: 'View Details',
                        icon: Eye,
                        onClick: () => onView(booking.id),
                      },
                      {
                        label: 'Force Cancel',
                        icon: XCircle,
                        onClick: () => onForceCancel(booking.id),
                        visible: isActive,
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
