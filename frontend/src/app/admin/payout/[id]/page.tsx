'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { usePayoutDetail, useApprovePayout, useRejectPayout, useMarkPayoutAsPaid } from '@/hooks/usePayout';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { Payout } from '@/types';

export default function AdminPayoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: payout, isLoading, error } = usePayoutDetail(id);
  const approvePayoutMutation = useApprovePayout();
  const rejectPayoutMutation = useRejectPayout();
  const markPayoutAsPaidMutation = useMarkPayoutAsPaid();

  const [rejectionReason, setRejectionReason] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

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

  const handleApprove = async () => {
    try {
      await approvePayoutMutation.mutateAsync({
        payoutId: id,
        data: {},
      });
    } catch (error: any) {
      console.error('Failed to approve payout:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Alasan penolakan harus diisi');
      return;
    }
    try {
      await rejectPayoutMutation.mutateAsync({
        payoutId: id,
        data: { rejectionReason },
      });
    } catch (error: any) {
      console.error('Failed to reject payout:', error);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await markPayoutAsPaidMutation.mutateAsync({
        payoutId: id,
        referenceNumber: referenceNumber || undefined,
      });
    } catch (error: any) {
      console.error('Failed to mark as paid:', error);
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
            href="/admin/payout"
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
                  <Link href="/admin/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin/payout">Payout</Link>
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
              href="/admin/payout"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {payout.data?.organizer?.firstName} {payout.data?.organizer?.lastName}
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
              {/* Organizer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Event Organizer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Nama</label>
                    <p className="text-gray-900 font-medium">
                      {payout.data?.organizer?.firstName} {payout.data?.organizer?.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="text-gray-900 font-medium">{payout.data?.organizer?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Telepon</label>
                    <p className="text-gray-900 font-medium">{payout.data?.organizer?.phone || '-'}</p>
                  </div>
                  {payout.data?.event && (
                    <div>
                      <label className="text-sm text-gray-600">Event</label>
                      <p className="text-gray-900 font-medium">{payout.data?.event.title}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

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
                <CardContent className="">
                  <div className="">
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
                  <CardContent className="space-y-3">
                    {/* Approve Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Setujui Payout
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Setujui Payout?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Anda akan menyetujui payout sebesar {formatCurrency(payout.data?.netAmount)} untuk{' '}
                            {payout.data?.organizer?.firstName} {payout.data?.organizer?.lastName}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-3">
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleApprove}
                            disabled={approvePayoutMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {approvePayoutMutation.isPending ? 'Menyetujui...' : 'Ya, Setujui'}
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Reject Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                          <XCircle className="h-4 w-4 mr-2" />
                          Tolak Payout
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tolak Payout</DialogTitle>
                          <DialogDescription>
                            Masukkan alasan penolakan untuk {payout.data?.organizer?.firstName}{' '}
                            {payout.data?.organizer?.lastName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Alasan penolakan..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="min-h-24"
                          />
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1">
                              Batal
                            </Button>
                            <Button
                              onClick={handleReject}
                              disabled={rejectPayoutMutation.isPending || !rejectionReason.trim()}
                              className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                              {rejectPayoutMutation.isPending ? 'Menolak...' : 'Tolak'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}

              {payout.data?.status === 'approved' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Aksi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Tandai Sudah Dibayar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tandai Sudah Dibayar</DialogTitle>
                          <DialogDescription>
                            Masukkan nomor referensi transfer (opsional)
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Nomor referensi transfer..."
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                          />
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1">
                              Batal
                            </Button>
                            <Button
                              onClick={handleMarkAsPaid}
                              disabled={markPayoutAsPaidMutation.isPending}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                              {markPayoutAsPaidMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
