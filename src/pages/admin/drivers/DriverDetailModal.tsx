import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDocumentViewer } from '@/components/document';
import { ConfirmActionModal } from './ConfirmActionModal';
import { adminDriversApi } from '@/services/api';
import type { DriverDetail } from '@/services/api/admin-drivers.api';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

interface DriverDetailModalProps {
  driver: DriverDetail | null;
  loading: boolean;
  onClose: () => void;
  onDocumentVerified?: () => void;
}

export function DriverDetailModal({ driver, loading, onClose, onDocumentVerified }: DriverDetailModalProps) {
  const { openDocument } = useDocumentViewer();
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [confirmDoc, setConfirmDoc] = useState<{
    docId: string;
    docType: string;
    status: 'verified' | 'rejected';
  } | null>(null);
  const open = !!driver || loading;

  async function handleConfirmVerify() {
    if (!confirmDoc) return;
    const { docId, status } = confirmDoc;
    setVerifyingDocId(docId);
    try {
      await adminDriversApi.verifyDocument(docId, status);
      toast.success(status === 'verified' ? 'Document approved' : 'Document rejected');
      onDocumentVerified?.();
      setConfirmDoc(null);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to update document';
      toast.error(msg);
    } finally {
      setVerifyingDocId(null);
    }
  }

  return (
    <>
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
            <div className="flex flex-col sm:flex-row gap-4">
              {driver.profile_photo && (
                <div className="shrink-0">
                  <img
                    src={driver.profile_photo}
                    alt={driver.name ?? 'Driver'}
                    className="h-20 w-20 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}
              <div className="grid gap-2 text-sm flex-1">
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.document_type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            doc.verification_status === 'verified'
                              ? 'success'
                              : doc.verification_status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {doc.verification_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-red-600 hover:text-red-700 dark:text-red-400"
                            onClick={() => openDocument(doc.document_url, `${doc.document_type} - Document`)}
                          >
                            View
                          </Button>
                          {doc.verification_status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/50"
                                onClick={() => setConfirmDoc({ docId: doc.id, docType: doc.document_type, status: 'verified' })}
                                disabled={verifyingDocId === doc.id}
                                title="Approve"
                              >
                                {verifyingDocId === doc.id ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                onClick={() => setConfirmDoc({ docId: doc.id, docType: doc.document_type, status: 'rejected' })}
                                disabled={verifyingDocId === doc.id}
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
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

    {confirmDoc && (
      <ConfirmActionModal
        open={!!confirmDoc}
        onOpenChange={(o) => !o && setConfirmDoc(null)}
        title={confirmDoc.status === 'verified' ? 'Approve document?' : 'Reject document?'}
        message={`Are you sure you want to ${confirmDoc.status === 'verified' ? 'approve' : 'reject'} the ${confirmDoc.docType} document?`}
        confirmLabel={confirmDoc.status === 'verified' ? 'Approve' : 'Reject'}
        variant={confirmDoc.status === 'rejected' ? 'destructive' : 'default'}
        onConfirm={handleConfirmVerify}
        isLoading={!!verifyingDocId}
      />
    )}
    </>
  );
}
