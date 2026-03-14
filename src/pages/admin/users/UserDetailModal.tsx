import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { UserDetail } from '@/services/api/admin-users.api';

interface UserDetailModalProps {
  user: UserDetail | null;
  loading: boolean;
  onClose: () => void;
}

export function UserDetailModal({ user, loading, onClose }: UserDetailModalProps) {
  const open = !!user || loading;

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex min-h-[120px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-red-600" />
          </div>
        ) : !user ? (
          <p className="py-4 text-sm text-slate-500">No user data.</p>
        ) : (
          <div className="space-y-4">
            <section>
              <h4 className="mb-2 font-medium text-slate-700 dark:text-slate-300">Profile</h4>
              <div className="grid gap-2 text-sm">
                <p><span className="font-medium">Name:</span> {user.name ?? '—'}</p>
                <p><span className="font-medium">Mobile:</span> {user.mobile_number}</p>
                <p><span className="font-medium">Email:</span> {user.email ?? '—'}</p>
                <p><span className="font-medium">Status:</span>{' '}
                  <Badge variant={user.is_blocked ? 'destructive' : 'default'}>
                    {user.is_blocked ? 'Blocked' : 'Active'}
                  </Badge>
                </p>
                <p><span className="font-medium">Verified:</span> {user.is_verified ? 'Yes' : 'No'}</p>
                <p><span className="font-medium">Role:</span> {user.role}</p>
                <p><span className="font-medium">Joined:</span>{' '}
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                </p>
              </div>
            </section>

            {user.profile_photo_url && (
              <section>
                <h4 className="mb-2 font-medium text-slate-700 dark:text-slate-300">Profile Photo</h4>
                <img
                  src={user.profile_photo_url}
                  alt="Profile"
                  className="h-24 w-24 rounded-lg object-cover"
                />
              </section>
            )}

            <section>
              <h4 className="mb-2 font-medium text-slate-700 dark:text-slate-300">Ride History</h4>
              {user.ride_history && user.ride_history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Pickup</TableHead>
                      <TableHead>Drop</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.ride_history.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell><Badge variant="secondary">{r.status}</Badge></TableCell>
                        <TableCell className="max-w-[120px] truncate" title={r.pickup_address}>
                          {r.pickup_address ?? '—'}
                        </TableCell>
                        <TableCell className="max-w-[120px] truncate" title={r.drop_address}>
                          {r.drop_address ?? '—'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-slate-500">No ride history yet. Bookings will appear here when Phase 3 is complete.</p>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
