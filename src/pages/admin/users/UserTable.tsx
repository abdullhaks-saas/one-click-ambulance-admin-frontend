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
import { Eye, Ban, Unlock } from 'lucide-react';
import type { UserListItem } from '@/services/api/admin-users.api';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  blocked: 'destructive',
};

interface UserTableProps {
  users: UserListItem[];
  onView: (id: string) => void;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
}

export function UserTable({
  users,
  onView,
  onBlock,
  onUnblock,
}: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Mobile</TableHead>
          <TableHead className="hidden md:table-cell">Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden sm:table-cell">Verified</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell className="font-medium">{u.name ?? '—'}</TableCell>
            <TableCell className="hidden md:table-cell">{u.mobile_number}</TableCell>
            <TableCell className="hidden md:table-cell">{u.email ?? '—'}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[u.is_blocked ? 'blocked' : 'active'] ?? 'secondary'}>
                {u.is_blocked ? 'Blocked' : 'Active'}
              </Badge>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {u.is_verified ? 'Yes' : 'No'}
            </TableCell>
            <TableCell className="text-right">
              <ActionsDropdown
                actions={[
                  { label: 'View Details', icon: Eye, onClick: () => onView(u.id) },
                  {
                    label: 'Block',
                    icon: Ban,
                    onClick: () => onBlock(u.id),
                    visible: !u.is_blocked,
                  },
                  {
                    label: 'Unblock',
                    icon: Unlock,
                    onClick: () => onUnblock(u.id),
                    visible: !!u.is_blocked,
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
