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
import { MoreHorizontal, Eye, Check, X, Ban, Unlock } from 'lucide-react';
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(d.id)}>
                    <Eye className="h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onApprove(d.id)}>
                    <Check className="h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onReject(d.id)}>
                    <X className="h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSuspend(d.id)}>
                    <Ban className="h-4 w-4" />
                    Suspend
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onBlock(d.id)}>
                    <Ban className="h-4 w-4" />
                    Block
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUnblock(d.id)}>
                    <Unlock className="h-4 w-4" />
                    Unblock
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
