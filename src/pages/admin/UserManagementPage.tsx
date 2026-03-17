import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { UserTable } from './users/UserTable';
import { UserDetailModal } from './users/UserDetailModal';
import { ConfirmActionModal } from './drivers/ConfirmActionModal';
import {
  adminUsersApi,
  type UserListItem,
  type UserDetail,
  type UserStatus,
} from '@/services/api';
import { toast } from 'sonner';
import { Search } from 'lucide-react';

export function UserManagementPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; total_pages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<UserStatus>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    action: 'block' | 'unblock';
    userId: string;
    userName: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminUsersApi.list({
        page,
        limit: 10,
        status: status === 'all' ? undefined : status,
        search: search.trim() || undefined,
      });
      setUsers(data.data);
      setMeta(data.meta);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load users';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  async function handleView(id: string) {
    setDetailLoading(true);
    setDetailUser(null);
    try {
      const { data } = await adminUsersApi.getById(id);
      setDetailUser(data);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load user details';
      toast.error(msg);
    } finally {
      setDetailLoading(false);
    }
  }

  function openConfirm(action: 'block' | 'unblock', userId: string, userName: string) {
    setConfirmModal({ action, userId, userName });
  }

  async function handleConfirmAction() {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      const { action, userId } = confirmModal;
      if (action === 'block') {
        await adminUsersApi.block(userId);
        toast.success('User blocked successfully');
      } else {
        await adminUsersApi.unblock(userId);
        toast.success('User unblocked successfully');
      }
      setConfirmModal(null);
      fetchUsers();
      if (detailUser?.id === userId) setDetailUser(null);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Action failed';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-4 text-slate-950 dark:text-slate-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">user management</h1>
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <Label htmlFor="search" className="sr-only">Search</Label>
            <Input
              id="search"
              type="search"
              placeholder="Search name, mobile, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-[180px]"
            />
            <Button type="submit" variant="outline" size="icon" title="Search">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <div className="flex items-center gap-2">
            <Label htmlFor="status" className="sr-only">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as UserStatus);
                setPage(1);
              }}
            >
              <SelectTrigger id="status" className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              {search || status !== 'all'
                ? 'No users match your filters. Try adjusting search or status.'
                : 'No users found.'}
            </div>
          ) : (
            <>
              <UserTable
                users={users}
                onView={handleView}
                onBlock={(id) => {
                  const u = users.find((x) => x.id === id);
                  openConfirm('block', id, u?.name ?? 'User');
                }}
                onUnblock={(id) => {
                  const u = users.find((x) => x.id === id);
                  openConfirm('unblock', id, u?.name ?? 'User');
                }}
              />
              {meta && meta.total_pages > 1 && (
                <div className="mt-4 flex justify-between">
                  <p className="text-sm text-slate-500">
                    Page {meta.page} of {meta.total_pages} ({meta.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= meta.total_pages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <UserDetailModal
        user={detailUser}
        loading={detailLoading}
        onClose={() => setDetailUser(null)}
      />

      {confirmModal && (
        <ConfirmActionModal
          open={!!confirmModal}
          onOpenChange={(o) => !o && setConfirmModal(null)}
          title={confirmModal.action === 'block' ? 'Block User' : 'Unblock User'}
          message={`Are you sure you want to ${confirmModal.action} ${confirmModal.userName}?`}
          confirmLabel={confirmModal.action === 'block' ? 'Block' : 'Unblock'}
          variant={confirmModal.action === 'block' ? 'destructive' : 'default'}
          onConfirm={handleConfirmAction}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}
