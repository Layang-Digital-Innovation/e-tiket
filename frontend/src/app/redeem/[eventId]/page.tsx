'use client';

import { useState } from 'react';
import { useRedeemTicket, useRedeemList } from '@/hooks/useRedeem';
import { Ticket, CheckCircle, AlertCircle, Loader2, QrCode, Scan } from 'lucide-react';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';

// Dynamic import QR Scanner to avoid SSR issues
const QrScanner = dynamic(() => import('@/components/QrScanner'), {
  ssr: false,
  loading: () => <div>Loading scanner...</div>,
});

export default function RedeemPage() {
  const [ticketCode, setTicketCode] = useState('');
  const [wristbandCode, setWristbandCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanningFor, setScanningFor] = useState<'ticket' | 'wristband'>('ticket');

  const { eventId } = useParams();
  const redeemMutation = useRedeemTicket();
  const { data: redeemList = [], isLoading: isLoadingList } = useRedeemList(eventId as string);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!ticketCode.trim() || !wristbandCode.trim()) {
      setErrorMessage('Mohon isi ticket code dan wristband code');
      return;
    }

    try {
      const result = await redeemMutation.mutateAsync({
        ticketCode: ticketCode.trim(),
        wristbandCode: wristbandCode.trim(),
      });

      setSuccessMessage(`Berhasil! Ticket ${result.ticketCode} telah ditukar dengan wristband ${result.wristbandCode}`);
      setTicketCode('');
      setWristbandCode('');
    } catch (error: any) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat redeem ticket');
    }
  };

  const handleScanTicket = () => {
    setScanningFor('ticket');
    setScannerOpen(true);
  };

  const handleScanWristband = () => {
    setScanningFor('wristband');
    setScannerOpen(true);
  };

  const handleScanResult = (decodedText: string) => {
    if (scanningFor === 'ticket') {
      setTicketCode(decodedText);
    } else {
      setWristbandCode(decodedText);
    }
    setScannerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Redeem Ticket</h1>
          <p className="text-gray-600">Tukar ticket code dengan wristband untuk masuk event</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Redeem */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Scan & Redeem</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ticket Code Input */}
              <div>
                <label htmlFor="ticketCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="ticketCode"
                      value={ticketCode}
                      onChange={(e) => setTicketCode(e.target.value)}
                      placeholder="Masukkan ticket code"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleScanTicket}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    title="Scan QR Code"
                  >
                    <Scan className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Wristband Code Input */}
              <div>
                <label htmlFor="wristbandCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Wristband Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="wristbandCode"
                      value={wristbandCode}
                      onChange={(e) => setWristbandCode(e.target.value)}
                      placeholder="Masukkan wristband code"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleScanWristband}
                    className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    title="Scan QR Code"
                  >
                    <Scan className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={redeemMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {redeemMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Redeem Ticket
                  </>
                )}
              </button>
            </form>
          </div>

          {/* List Redeemed Tickets */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Redeems</h2>

            {isLoadingList ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : redeemList.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada ticket yang di-redeem</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {redeemList.map((wristband) => (
                  <div
                    key={wristband.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Ticket className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{wristband.wristbandCode}</p>
                            <p className="text-xs text-gray-500">Wristband Code</p>
                          </div>
                        </div>
                        <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
                          {wristband.status}
                        </Badge>
                      </div>

                    {wristband.assignedTicket && (
                      <div className="flex items-center gap-2 mb-2">
                        <Ticket className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Ticket: <span className="font-medium">{wristband.assignedTicket.ticketCode}</span>
                        </p>
                      </div>
                    )}

                    {wristband.event && (
                      <p className="text-sm text-gray-600 mb-2">
                        Event: <span className="font-medium">{wristband.event.title}</span>
                      </p>
                    )}

                    {wristband.category && (
                      <p className="text-sm text-gray-600 mb-2">
                        Category: <span className="font-medium">{wristband.category.name}</span>
                      </p>
                    )}

                    {wristband.assignedAt && (
                      <p className="text-xs text-gray-500">
                        Assigned: {format(new Date(wristband.assignedAt), 'dd MMM yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QrScanner
        isOpen={scannerOpen}
        onScan={handleScanResult}
        onClose={() => setScannerOpen(false)}
        label={scanningFor === 'ticket' ? 'Scan Ticket QR Code' : 'Scan Wristband QR Code'}
      />
    </div>
  );
}
