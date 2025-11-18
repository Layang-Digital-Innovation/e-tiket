'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Calendar, CreditCard, Receipt } from 'lucide-react';
import PublicLayout from '@/components/layouts/PublicLayout';
import { useCheckoutStore } from '@/store/checkout.store';
import { formatCurrency } from '@/lib/utils';

// Wrapper to ensure useSearchParams is under a Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
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

    // Clear checkout session on successful payment
    clearCheckoutSession();
  }, [searchParams, clearCheckoutSession]);

  const handleViewEvents = () => {
    router.push('/events');
  };

  const handleViewOrder = () => {
    if (orderId) {
      // TODO: Navigate to order details page when implemented
      router.push('/events');
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mt-4">
                Pembayaran Berhasil!
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Terima kasih atas pembelian Anda. Tiket Anda telah berhasil dibeli.
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

              {checkoutSession && (
                <div className="space-y-4">
                  <Separator />

                  <div className="flex items-center space-x-3">
                    <Receipt className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Detail Pesanan</p>
                      <p className="text-sm text-gray-600">
                        {Object.values(checkoutSession.selectedTickets).reduce((a, b) => a + b, 0)} tiket untuk event {checkoutSession.eventSlug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Event</p>
                      <p className="text-sm text-gray-600">{checkoutSession.eventSlug}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Metode Pembayaran</p>
                      <p className="text-sm text-gray-600">Transfer Bank / Virtual Account</p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Apa Selanjutnya?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• E-tiket akan dikirim ke email Anda</li>
                    <li>• Simpan e-tiket untuk check-in di lokasi event</li>
                    <li>• Redeem tiket Anda menjadi wristband saat tiba</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleViewEvents}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Lihat Event Lainnya
                  </Button>
                  {orderId && (
                    <Button
                      onClick={handleViewOrder}
                      variant="outline"
                      className="w-full"
                    >
                      Lihat Detail Pesanan
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
