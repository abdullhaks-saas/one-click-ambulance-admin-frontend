import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ActionsDropdown } from '@/components/ui/actions-dropdown';
import { Eye, Pencil, Trash2, Users } from 'lucide-react';
import type { Zone } from '@/services/api';

interface ZoneTableProps {
  zones: Zone[];
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
  onViewDrivers: (zone: Zone) => void;
}

export function ZoneTable({ zones, onEdit, onDelete, onViewDrivers }: ZoneTableProps) {
  if (zones.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
        No zones found. Create your first service zone.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Zone Name</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Coordinates</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {zones.map((zone) => (
            <TableRow key={zone.id}>
              <TableCell className="font-medium">{zone.zone_name}</TableCell>
              <TableCell className="text-sm text-slate-500">{zone.city ?? '—'}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
                  {zone.coordinates.length} point{zone.coordinates.length !== 1 ? 's' : ''}
                </span>
              </TableCell>
              <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                {new Date(zone.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell className="text-right">
                <ActionsDropdown
                  actions={[
                    {
                      label: 'Edit Zone',
                      icon: Pencil,
                      onClick: () => onEdit(zone),
                    },
                    {
                      label: 'View Drivers',
                      icon: Users,
                      onClick: () => onViewDrivers(zone),
                    },
                    {
                      label: 'Delete Zone',
                      icon: Trash2,
                      onClick: () => onDelete(zone),
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { Eye };
