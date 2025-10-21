'use client';

import { useState } from 'react';
import { useCheckIn, useAssignedWristbands } from '@/hooks/useCheckIn';
import { Watch, CheckCircle, AlertCircle, Loader2, QrCode, Ticket, Clock, Scan } from 'lucide-react';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';

// Dynamic import QR Scanner to avoid SSR issues
const QrScanner = dynamic(() => import('@/components/QrScanner'), {
  ssr: false,
  loading: () => <div>Loading scanner...</div>,
});

export default function CheckInPage() {
  const [wristbandCode, setWristbandCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);

  const checkInMutation = useCheckIn();
  const { data: assignedWristbands = [], isLoading: isLoadingList } = useAssignedWristbands();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!wristbandCode.trim()) {
      setErrorMessage('Mohon isi wristband code');
      return;
    }

    try {
      const result = await checkInMutation.mutateAsync({
        wristbandCode: wristbandCode.trim(),
      });

      setSuccessMessage(
        `Check-in berhasil! Wristband ${result.wristbandCode} (Ticket: ${result.ticketCode}) telah masuk pada ${format(new Date(result.checkedInAt), 'HH:mm:ss')}`
      );
      setWristbandCode('');
    } catch (error: any) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat check-in');
    }
  };

  const handleScanWristband = () => {
    setScannerOpen(true);
  };

  const handleScanResult = (decodedText: string) => {
    setWristbandCode(decodedText);
    setScannerOpen(false);
  };

  // Filter wristbands by status
  const readyToCheckIn = Array.isArray(assignedWristbands) ? assignedWristbands.filter((w) => w.status === 'assigned') : [];
  const checkedIn = Array.isArray(assignedWristbands) ? assignedWristbands.filter((w) => w.status === 'checked_in') : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Check-in Wristband</h1>
          <p className="text-gray-600">Scan wristband untuk check-in peserta event</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Check-in */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <QrCode className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Scan Wristband</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Wristband Code Input */}
              <div>
                <label htmlFor="wristbandCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Wristband Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Watch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="wristbandCode"
                      value={wristbandCode}
                      onChange={(e) => setWristbandCode(e.target.value)}
                      placeholder="Scan atau masukkan wristband code"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleScanWristband}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
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
                disabled={checkInMutation.isPending}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {checkInMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Check-in
                  </>
                )}
              </button>
            </form>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium mb-1">Ready to Check-in</p>
                <p className="text-3xl font-bold text-blue-900">{readyToCheckIn.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium mb-1">Checked In</p>
                <p className="text-3xl font-bold text-green-900">{checkedIn.length}</p>
              </div>
            </div>
          </div>

          {/* List Wristbands */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Wristband Status</h2>
            </div>

            {isLoadingList ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : assignedWristbands.length === 0 ? (
              <div className="text-center py-12">
                <Watch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada wristband yang assigned</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Ready to Check-in Section */}
                {readyToCheckIn.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Ready to Check-in ({readyToCheckIn.length})
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {readyToCheckIn.map((wristband) => (
                        <div
                          key={wristband.id}
                          className="border border-blue-200 bg-blue-50 rounded-lg p-4 hover:border-blue-400 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Watch className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{wristband.wristbandCode}</p>
                                <p className="text-xs text-gray-500">Wristband Code</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                              {wristband.status}
                            </Badge>
                          </div>

                          {wristband.assignedTicket && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Ticket className="w-4 h-4" />
                              <span className="font-medium">{wristband.assignedTicket.ticketCode}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checked In Section */}
                {checkedIn.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Checked In ({checkedIn.length})
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {checkedIn.map((wristband) => (
                        <div
                          key={wristband.id}
                          className="border border-green-200 bg-green-50 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Watch className="w-4 h-4 text-green-600" />
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
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Ticket className="w-4 h-4" />
                              <span className="font-medium">{wristband.assignedTicket.ticketCode}</span>
                            </div>
                          )}

                          {wristband.checkedInAt && (
                            <p className="text-xs text-gray-500">
                              Checked in: {format(new Date(wristband.checkedInAt), 'dd MMM yyyy HH:mm:ss')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
        label="Scan Wristband QR Code"
      />
    </div>
  );
}
