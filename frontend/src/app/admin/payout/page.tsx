'use client';

import { useState } from 'react';
import { useAllPayouts } from '@/hooks/usePayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/table/DataTable';
import { formatCurrency } from '@/lib/utils';
import { PayoutStatus } from '@/types';
import { getPayoutColumns } from '@/components/table/payout-columns';

export default function AdminPayoutPage() {
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | ''>('');
  const { data: payouts, isLoading, error } = useAllPayouts(statusFilter || undefined);

  const payoutList = (payouts?.data || []) as any[];
  const columns = getPayoutColumns();
  const totalAmount = payoutList.reduce((sum: number, payout: any) => sum + (payout.netAmount || 0), 0);
  const pendingCount = payoutList.filter((p: any) => p.status === 'pending').length;
  const approvedCount = payoutList.filter((p: any) => p.status === 'approved').length;
  const paidCount = payoutList.filter((p: any) => p.status === 'paid').length;

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
          <p className="text-gray-600">{error?.message || 'Terjadi kesalahan'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Payout</h1>
            <p className="text-gray-600 mt-1">Kelola permintaan payout dari event organizer</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Payout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
                <p className="text-xs text-gray-500 mt-1">{payoutList.length} permintaan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Menunggu Persetujuan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                <p className="text-xs text-gray-500 mt-1">Perlu ditindaklanjuti</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Disetujui</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{approvedCount}</div>
                <p className="text-xs text-gray-500 mt-1">Menunggu pembayaran</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Sudah Dibayar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{paidCount}</div>
                <p className="text-xs text-gray-500 mt-1">Selesai</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="mb-6 flex gap-4">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PayoutStatus | '')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="paid">Dibayar</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* DataTable */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Payout</CardTitle>
            </CardHeader>
            <CardContent>
              {payoutList.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500">Tidak ada data payout</p>
                </div>
              ) : (
                <DataTable columns={columns} data={payoutList} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
