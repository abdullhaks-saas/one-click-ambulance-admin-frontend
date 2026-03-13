import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Check, Ban, RotateCcw } from 'lucide-react';
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(a.id)}>
                    <Eye className="h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  {a.status === 'pending' && (
                    <DropdownMenuItem onClick={() => onApprove(a.id)}>
                      <Check className="h-4 w-4" />
                      Approve
                    </DropdownMenuItem>
                  )}
                  {a.status === 'approved' && (
                    <DropdownMenuItem onClick={() => onSuspend(a.id)}>
                      <Ban className="h-4 w-4" />
                      Suspend
                    </DropdownMenuItem>
                  )}
                  {a.status === 'suspended' && (
                    <DropdownMenuItem onClick={() => onRestore(a.id)}>
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
