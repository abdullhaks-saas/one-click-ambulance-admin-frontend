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
import { Eye, Check, X, Ban, Unlock } from 'lucide-react';
import type { DriverListItem } from '@/services/api/admin-drivers.api';

const statusVariant: Record<string, 'default' | 'secondary' | 'warning' | 'success' | 'destructive'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
  suspended: 'secondary',
  blocked: 'destructive',
};

interface DriverTableProps {
  drivers: DriverListItem[];
  onView: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSuspend: (id: string) => void;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
}

export function DriverTable({
  drivers,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onBlock,
  onUnblock,
}: DriverTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Mobile</TableHead>
          <TableHead className="hidden md:table-cell">Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden sm:table-cell">Rating</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drivers.map((d) => (
          <TableRow key={d.id}>
            <TableCell className="font-medium">{d.name ?? '—'}</TableCell>
            <TableCell className="hidden md:table-cell">{d.mobile_number}</TableCell>
            <TableCell className="hidden md:table-cell">{d.email ?? '—'}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[d.status] ?? 'secondary'}>
                {d.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden sm:table-cell">{Number(d.rating).toFixed(1)}</TableCell>
            <TableCell className="text-right">
              <ActionsDropdown
                actions={[
                  { label: 'View Details', icon: Eye, onClick: () => onView(d.id) },
                  { label: 'Approve', icon: Check, onClick: () => onApprove(d.id) },
                  { label: 'Reject', icon: X, onClick: () => onReject(d.id) },
                  { label: 'Suspend', icon: Ban, onClick: () => onSuspend(d.id) },
                  { label: 'Block', icon: Ban, onClick: () => onBlock(d.id) },
                  { label: 'Unblock', icon: Unlock, onClick: () => onUnblock(d.id) },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
