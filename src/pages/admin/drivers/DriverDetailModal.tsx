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
import type { DriverDetail } from '@/services/api/admin-drivers.api';

interface DriverDetailModalProps {
  driver: DriverDetail | null;
  loading: boolean;
  onClose: () => void;
}

export function DriverDetailModal({ driver, loading, onClose }: DriverDetailModalProps) {
  const open = !!driver || loading;

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Driver Details</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex min-h-[120px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-red-600" />
          </div>
        ) : !driver ? (
          <p className="py-4 text-sm text-slate-500">No driver data.</p>
        ) : (
        <div className="space-y-4">
          <section>
            <h4 className="mb-2 font-medium text-slate-700 dark:text-slate-300">Basic Info</h4>
            <div className="grid gap-2 text-sm">
              <p><span className="font-medium">Name:</span> {driver.name ?? '—'}</p>
              <p><span className="font-medium">Mobile:</span> {driver.mobile_number}</p>
              <p><span className="font-medium">Email:</span> {driver.email ?? '—'}</p>
              <p><span className="font-medium">Status:</span> <Badge variant="secondary">{driver.status}</Badge></p>
              <p><span className="font-medium">Rating:</span> {Number(driver.rating).toFixed(1)}</p>
              <p><span className="font-medium">Total Rides:</span> {driver.total_rides}</p>
              <p><span className="font-medium">Verified:</span> {driver.is_verified ? 'Yes' : 'No'}</p>
              <p><span className="font-medium">Online:</span> {driver.is_online ? 'Yes' : 'No'}</p>
              <p><span className="font-medium">Blocked:</span> {driver.is_blocked ? 'Yes' : 'No'}</p>
            </div>
          </section>

          {driver.documents && driver.documents.length > 0 && (
            <section>
              <h4 className="mb-2 font-medium text-slate-700 dark:text-slate-300">Documents</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.document_type}</TableCell>
                      <TableCell>{doc.verification_status}</TableCell>
                      <TableCell>
                        <a
                          href={doc.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:underline dark:text-red-400"
                        >
                          View
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          )}

          {driver.bank_accounts && driver.bank_accounts.length > 0 && (
            <section>
              <h4 className="mb-2 font-medium text-slate-700 dark:text-slate-300">Bank Accounts</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account Holder</TableHead>
                    <TableHead>IFSC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.bank_accounts.map((acc) => (
                    <TableRow key={acc.id}>
                      <TableCell>{acc.bank_name}</TableCell>
                      <TableCell>{acc.account_holder_name ?? '—'}</TableCell>
                      <TableCell>{acc.ifsc_code}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          )}
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
