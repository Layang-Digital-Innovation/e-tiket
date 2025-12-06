import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const getPayoutColumns = (): ColumnDef<any>[] => [
  {
    accessorKey: 'organizer',
    header: 'Event Organizer',
    cell: ({ row }) => {
      const organizer = row.original.organizer;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {organizer?.firstName} {organizer?.lastName}
          </span>
          <span className="text-xs text-gray-500">{organizer?.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'event',
    header: 'Event',
    cell: ({ row }) => {
      const event = row.original.event;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{event?.title || '-'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'grossAmount',
    header: 'Gross Amount',
    cell: ({ row }) => {
      return <span>{formatCurrency(row.original.grossAmount)}</span>;
    },
  },
  {
    accessorKey: 'platformFee',
    header: 'Platform Fee',
    cell: ({ row }) => {
      return <span className="text-red-600">-{formatCurrency(row.original.platformFee)}</span>;
    },
  },
  {
    accessorKey: 'netAmount',
    header: 'Net Amount',
    cell: ({ row }) => {
      return <span className="font-semibold text-green-600">{formatCurrency(row.original.netAmount)}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const statusConfig: Record<string, { label: string; variant: any }> = {
        pending: { label: 'Menunggu', variant: 'outline' },
        approved: { label: 'Disetujui', variant: 'secondary' },
        rejected: { label: 'Ditolak', variant: 'destructive' },
        paid: { label: 'Dibayar', variant: 'default' },
        cancelled: { label: 'Dibatalkan', variant: 'outline' },
      };
      const config = statusConfig[status] || { label: status, variant: 'outline' };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      return (
        <Link href={`/admin/payout/${row.original.id}`}>
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      );
    },
  },
];
