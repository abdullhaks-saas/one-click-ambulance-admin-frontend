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
import { Eye, Check, Ban, RotateCcw } from 'lucide-react';
import type { AmbulanceListItem } from '@/services/api/admin-ambulances.api';

const statusVariant: Record<string, 'default' | 'secondary' | 'warning' | 'success' | 'destructive'> = {
  pending: 'warning',
  approved: 'success',
  suspended: 'destructive',
};

interface AmbulanceTableProps {
  ambulances: AmbulanceListItem[];
  onView: (id: string) => void;
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
  onRestore: (id: string) => void;
}

export function AmbulanceTable({
  ambulances,
  onView,
  onApprove,
  onSuspend,
  onRestore,
}: AmbulanceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Registration</TableHead>
          <TableHead className="hidden md:table-cell">Type</TableHead>
          <TableHead className="hidden md:table-cell">Driver</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden sm:table-cell">Insurance</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ambulances.map((a) => (
          <TableRow key={a.id}>
            <TableCell className="font-medium">{a.registration_number}</TableCell>
            <TableCell className="hidden md:table-cell">
              {a.ambulance_type?.name ?? '—'}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {a.driver?.name ?? '—'}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[a.status] ?? 'secondary'}>
                {a.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {a.insurance_expiry ?? '—'}
            </TableCell>
            <TableCell className="text-right">
              <ActionsDropdown
                actions={[
                  { label: 'view details', icon: Eye, onClick: () => onView(a.id) },
                  {
                    label: 'approve',
                    icon: Check,
                    onClick: () => onApprove(a.id),
                    visible: a.status === 'pending',
                  },
                  {
                    label: 'suspend',
                    icon: Ban,
                    onClick: () => onSuspend(a.id),
                    visible: a.status === 'approved',
                  },
                  {
                    label: 'restore',
                    icon: RotateCcw,
                    onClick: () => onRestore(a.id),
                    visible: a.status === 'suspended',
                  },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
