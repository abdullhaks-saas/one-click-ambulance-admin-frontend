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
import type { AmbulanceDetail } from '@/services/api/admin-ambulances.api';

interface AmbulanceDetailModalProps {
  ambulance: AmbulanceDetail | null;
  loading: boolean;
  onClose: () => void;
}

export function AmbulanceDetailModal({
  ambulance,
  loading,
  onClose,
}: AmbulanceDetailModalProps) {
  const open = !!ambulance || loading;

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ambulance Details</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex min-h-[120px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-red-600" />
          </div>
        ) : !ambulance ? (
          <p className="py-4 text-sm text-slate-500">No ambulance data.</p>
        ) : (
          <div className="space-y-4">
            <section>
              <h4 className="mb-2 font-medium text-slate-700 dark:text-slate-300">
                Basic Info
              </h4>
              <div className="grid gap-2 text-sm">
                <p>
                  <span className="font-medium">Registration:</span>{' '}
                  {ambulance.registration_number}
                </p>
                <p>
                  <span className="font-medium">Vehicle No:</span>{' '}
                  {ambulance.vehicle_number ?? '—'}
                </p>
                <p>
                  <span className="font-medium">Type:</span>{' '}
                  {ambulance.ambulance_type?.name ?? '—'}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <Badge variant="secondary">{ambulance.status}</Badge>
                </p>
                <p>
                  <span className="font-medium">Insurance Expiry:</span>{' '}
                  {ambulance.insurance_expiry ?? '—'}
                </p>
                {ambulance.suspend_reason && (
                  <p>
                    <span className="font-medium">Suspend Reason:</span>{' '}
                    {ambulance.suspend_reason}
                  </p>
                )}
              </div>
            </section>

            {ambulance.driver && (
              <section>
                <h4 className="mb-2 font-medium text-slate-700 dark:text-slate-300">
                  Driver
                </h4>
                <p className="text-sm">
                  {ambulance.driver.name ?? '—'} ({ambulance.driver.id})
                </p>
              </section>
            )}

            {ambulance.equipment && ambulance.equipment.length > 0 && (
              <section>
                <h4 className="mb-2 font-medium text-slate-700 dark:text-slate-300">
                  Equipment
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ambulance.equipment.map((eq) => (
                      <TableRow key={eq.id}>
                        <TableCell>{eq.name}</TableCell>
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
