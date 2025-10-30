'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePayoutDetail, useCancelPayout } from '@/hooks/usePayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Payout } from '@/types';

export default function PayoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: payout, isLoading, error } = usePayoutDetail(id);
  const cancelPayoutMutation = useCancelPayout();

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      pending: { label: 'Menunggu', variant: 'outline' },
      approved: { label: 'Disetujui', variant: 'secondary' },
      rejected: { label: 'Ditolak', variant: 'destructive' },
      paid: { label: 'Dibayar', variant: 'default' },
      cancelled: { label: 'Dibatalkan', variant: 'outline' },
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleCancel = async () => {
    try {
      await cancelPayoutMutation.mutateAsync(id);
      router.push('/organizer/payout');
    } catch (error: any) {
      console.error('Failed to cancel payout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail payout...</p>
        </div>
      </div>
    );
  }

  if (error || !payout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Detail</h2>
          <p className="text-gray-600 mb-4">{error?.message || 'Payout tidak ditemukan'}</p>
          <Link
            href="/organizer/payout"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Kembali ke Daftar Payout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
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
                <BreadcrumbLink asChild>
                  <Link href="/organizer/payout">Payout</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Detail Payout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="mb-8">
            <Link
              href="/organizer/payout"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {payout.data?.event?.title || 'Payout Umum'}
                </h1>
                <p className="text-gray-600 mt-1">ID: {payout.data?.id}</p>
              </div>
              {getStatusBadge(payout.data?.status)}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Amount Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Nominal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Gross Amount</span>
                    <span className="text-lg font-semibold">{formatCurrency(payout.data?.grossAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="text-lg font-semibold text-red-600">
                      -{formatCurrency(payout.data?.platformFee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-900 font-medium">Net Amount (Akan Diterima)</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(payout.data?.netAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detail Rekening Bank</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Nama Pemilik Rekening</label>
                    <p className="text-gray-900 font-medium">{payout.data?.bankAccountName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Bank</label>
                    <p className="text-gray-900 font-medium uppercase">{payout.data?.bankType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Nomor Rekening</label>
                    <p className="text-gray-900 font-medium">{payout.data?.bankAccountNumber}</p>
                  </div>
                  {payout.data?.bankBranch && (
                    <div>
                      <label className="text-sm text-gray-600">Cabang Bank</label>
                      <p className="text-gray-900 font-medium">{payout.data?.bankBranch}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes & Rejection Reason */}
              {(payout.data?.notes || payout.data?.rejectionReason) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Tambahan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {payout.data?.notes && (
                      <div>
                        <label className="text-sm text-gray-600">Catatan</label>
                        <p className="text-gray-900 mt-1">{payout.data?.notes}</p>
                      </div>
                    )}
                    {payout.data?.rejectionReason && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <label className="text-sm text-red-700 font-medium">Alasan Penolakan</label>
                        <p className="text-red-900 mt-1">{payout.data?.rejectionReason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Timeline & Actions */}
            <div className="space-y-6">
              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        <div className="w-0.5 h-8 bg-gray-300"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Dibuat</p>
                        <p className="text-xs text-gray-600">
                          {new Date(payout.data?.createdAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    {payout.data?.approvedAt && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-green-600"></div>
                          <div className="w-0.5 h-8 bg-gray-300"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Disetujui</p>
                          <p className="text-xs text-gray-600">
                            {new Date(payout.data?.approvedAt).toLocaleString('id-ID')}
                          </p>
                          {payout.data?.approvedBy && (
                            <p className="text-xs text-gray-500 mt-1">
                              oleh {payout.data?.approvedBy.firstName} {payout.data?.approvedBy.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {payout.data?.paidAt && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-green-600"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Dibayar</p>
                          <p className="text-xs text-gray-600">
                            {new Date(payout.data?.paidAt).toLocaleString('id-ID')}
                          </p>
                          {payout.data?.referenceNumber && (
                            <p className="text-xs text-gray-500 mt-1">
                              Ref: {payout.data?.referenceNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {payout.data?.rejectedAt && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Ditolak</p>
                          <p className="text-xs text-gray-600">
                            {new Date(payout.data?.rejectedAt).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {payout.data?.status === 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Aksi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Batalkan Payout
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Batalkan Payout?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin membatalkan payout ini? Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-3">
                          <AlertDialogCancel>Tidak</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancel}
                            disabled={cancelPayoutMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {cancelPayoutMutation.isPending ? 'Membatalkan...' : 'Ya, Batalkan'}
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
