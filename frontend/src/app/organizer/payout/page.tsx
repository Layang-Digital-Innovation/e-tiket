'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { useAuthStore } from '@/store/auth.store';
import { useOrganizerPayouts } from '@/hooks/usePayout';
import { DataTable } from '@/components/table/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Plus, Eye, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { PayoutStatus, Payout } from '@/types';

export default function PayoutPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedStatus, setSelectedStatus] = useState<PayoutStatus | undefined>();
  
  const { data : payouts, isLoading, error } = useOrganizerPayouts(user?.id || '', selectedStatus);

  const getStatusBadge = (status: PayoutStatus) => {
    const statusConfig: Record<PayoutStatus, { label: string; variant: any }> = {
      pending: { label: 'Menunggu', variant: 'outline' },
      approved: { label: 'Disetujui', variant: 'secondary' },
      rejected: { label: 'Ditolak', variant: 'destructive' },
      paid: { label: 'Dibayar', variant: 'default' },
      cancelled: { label: 'Dibatalkan', variant: 'outline' },
    };
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: ColumnDef<Payout>[] = useMemo(
    () => [
      {
        accessorKey: 'event.title',
        header: 'Event',
        cell: ({ row }) => {
          const event = row.original.event?.title || 'Payout Umum';
          return <span className="font-medium text-gray-900">{event}</span>;
        },
      },
      {
        accessorKey: 'grossAmount',
        header: 'Gross Amount',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ArrowUpRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900">{formatCurrency(row.original.grossAmount)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'platformFee',
        header: 'Platform Fee',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ArrowDownLeft className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900">{formatCurrency(row.original.platformFee)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'netAmount',
        header: 'Net Amount',
        cell: ({ row }) => (
          <span className="font-semibold text-green-600">{formatCurrency(row.original.netAmount)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: 'createdAt',
        header: 'Tanggal',
        cell: ({ row }) => (
          <span className="text-gray-600 text-sm">
            {new Date(row.original.createdAt).toLocaleDateString('id-ID')}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <Link
            href={`/organizer/payout/${row.original.id}`}
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Eye className="h-4 w-4" />
            Detail
          </Link>
        ),
      },
    ],
    []
  );

  const tableData = useMemo(() => payouts?.data || [], [payouts?.data]);

  const statusFilters: { label: string; value: PayoutStatus | undefined }[] = [
    { label: 'Semua', value: undefined },
    { label: 'Menunggu', value: 'pending' },
    { label: 'Disetujui', value: 'approved' },
    { label: 'Dibayar', value: 'paid' },
    { label: 'Ditolak', value: 'rejected' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data payout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
          <p className="text-gray-600 mb-4">{error.message || 'Terjadi kesalahan saat memuat data payout'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/organizer/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Payout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Manajemen Payout
              </h1>
              <p className="text-gray-600">
                Kelola permintaan pencairan dana Anda
              </p>
            </div>
            <Link
              href="/organizer/payout/create"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Buat Payout Baru
            </Link>
          </div>

          {/* Status Filters */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {statusFilters.map((filter) => (
              <button
                key={filter.value || 'all'}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Payouts Table */}
          {tableData.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Payout</h3>
                <p className="text-gray-600 text-center mb-4">
                  Anda belum memiliki permintaan payout. Buat permintaan payout baru untuk mulai.
                </p>
                <Link
                  href="/organizer/payout/create"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Buat Payout Baru
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <DataTable columns={columns} data={tableData} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
