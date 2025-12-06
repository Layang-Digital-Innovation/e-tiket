'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import PublicLayout from '@/components/layouts/PublicLayout';
import { useCheckoutStore } from '@/store/checkout.store';

// Wrapper to ensure useSearchParams is under a Suspense boundary
export default function PaymentFailurePage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailureContent />
    </Suspense>
  );
}

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCheckoutSession, checkoutSession } = useCheckoutStore();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Get order_id from URL parameters
    const orderIdParam = searchParams.get('order_id');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }

    // Clear checkout session on payment failure
    clearCheckoutSession();
  }, [searchParams, clearCheckoutSession]);

  const handleRetryPayment = () => {
    if (checkoutSession?.eventSlug) {
      // If we have checkout session data, redirect to checkout to retry
      router.push(`/checkout/${checkoutSession.eventSlug}`);
    } else if (orderId) {
      // If no session but we have order_id, try to reconstruct or go to events
      router.push('/events');
    } else {
      router.push('/events');
    }
  };

  const handleViewEvents = () => {
    router.push('/events');
  };

  const handleContactSupport = () => {
    // TODO: Implement contact support functionality
    window.location.href = 'mailto:support@ticketingapp.com?subject=Pembayaran Gagal&body=Halo, saya mengalami masalah dengan pembayaran. Order ID: ' + (orderId || 'Tidak diketahui');
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mt-4">
                Pembayaran Gagal
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi atau hubungi dukungan.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {orderId && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Nomor Pesanan</span>
                    <span className="text-sm font-mono font-bold text-gray-900">{orderId}</span>
                  </div>
                </div>
              )}

              <Separator />

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 mb-2">Mengapa pembayaran gagal?</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Saldo tidak mencukupi</li>
                      <li>• Koneksi internet terputus</li>
                      <li>• Waktu pembayaran habis</li>
                      <li>• Masalah dengan metode pembayaran</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Apa yang bisa Anda lakukan?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Coba lagi dengan metode pembayaran yang sama</li>
                    <li>• Gunakan metode pembayaran yang berbeda</li>
                    <li>• Pastikan saldo mencukupi</li>
                    <li>• Hubungi dukungan jika masalah berlanjut</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleRetryPayment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Coba Lagi
                  </Button>
                  <Button
                    onClick={handleViewEvents}
                    variant="outline"
                    className="w-full"
                  >
                    Lihat Event Lainnya
                  </Button>
                  <Button
                    onClick={handleContactSupport}
                    variant="outline"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Hubungi Dukungan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
