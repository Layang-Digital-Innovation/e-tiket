'use client';

import { use, useState, useEffect } from 'react';
import { useCheckIn, useAssignedWristbands } from '@/hooks/useCheckIn';
import { Watch, CheckCircle, AlertCircle, Loader2, QrCode, Ticket, Clock, Scan, Mail, Phone, User, Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Wristband } from '@/types';
import { useRouter } from 'next/navigation';
import apiService from '@/services/api';

// Dynamic import QR Scanner to avoid SSR issues
const QrScanner = dynamic(() => import('@/components/QrScanner'), {
  ssr: false,
  loading: () => <div>Loading scanner...</div>,
});

export default function CheckInPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  const [wristbandCode, setWristbandCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedWristband, setSelectedWristband] = useState<Wristband | null>(null);
  const [eventCheckInData, setEventCheckInData] = useState<Wristband[]>([]);
  const [isLoadingEventData, setIsLoadingEventData] = useState(false);

  const checkInMutation = useCheckIn();
  const { data: assignedWristbands = [], isLoading: isLoadingList } = useAssignedWristbands();

  // Fetch check-in data for specific event
  useEffect(() => {
    if (eventId) {
      setIsLoadingEventData(true);
      apiService
        .getCheckInListByEvent(eventId)
        .then((response: any) => {
          if (response.success && Array.isArray(response.data)) {
            setEventCheckInData(response.data);
          }
        })
        .catch((error: any) => {
          console.error('Failed to fetch event check-in data:', error);
          setErrorMessage('Gagal memuat data check-in event');
        })
        .finally(() => {
          setIsLoadingEventData(false);
        });
    }
  }, [eventId]);

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
        `Check-in berhasil! Wristband ${result.wristbandCode} (Ticket: ${result.ticketCode}) telah masuk pada ${format(new Date(result.checkedInAt), 'dd MMM yyyy HH:mm:ss', { locale: id })}`
      );
      setWristbandCode('');
      
      // Refresh event check-in data after successful check-in
      if (eventId) {
        apiService.getCheckInListByEvent(eventId).then((response: any) => {
          if (response.success && Array.isArray(response.data)) {
            setEventCheckInData(response.data);
          }
        });
      }
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

  // Use event-specific data if available, otherwise use all wristbands
  const wristbandsToDisplay = eventCheckInData.length > 0 ? eventCheckInData : assignedWristbands;
  const isLoadingData = eventCheckInData.length > 0 ? isLoadingEventData : isLoadingList;

  // Filter wristbands by status
  const readyToCheckIn = Array.isArray(wristbandsToDisplay) ? wristbandsToDisplay.filter((w) => w.status === 'assigned') : [];
  const checkedIn = Array.isArray(wristbandsToDisplay) ? wristbandsToDisplay.filter((w) => w.status === 'checked_in') : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-700 mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Check-in Wristband</h1>
          <p className="text-gray-600">Scan wristband untuk check-in peserta event</p>
          {eventId && (
            <p className="text-sm text-gray-500 mt-2">
              Event ID: <span className="font-mono font-semibold">{eventId}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Check-in */}
          <div className="bg-white rounded-xl shadow p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-slate-100 rounded-lg">
                <QrCode className="w-6 h-6 text-slate-700" />
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
                    className="px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
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
                className="w-full bg-slate-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-600 font-medium mb-1">Ready to Check-in</p>
                <p className="text-3xl font-bold text-slate-900">{readyToCheckIn.length}</p>
              </div>
              <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
                <p className="text-sm text-slate-700 font-medium mb-1">Checked In</p>
                <p className="text-3xl font-bold text-slate-900">{checkedIn.length}</p>
              </div>
            </div>
          </div>

          {/* List Wristbands */}
          <div className="bg-white rounded-xl shadow p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Wristband Status</h2>
            </div>

            {isLoadingData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : wristbandsToDisplay.length === 0 ? (
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
                          className="border border-slate-200 bg-slate-50 rounded-lg p-4 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-slate-200 rounded-lg">
                                <Watch className="w-4 h-4 text-slate-700" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{wristband.wristbandCode}</p>
                                <p className="text-xs text-gray-500">Wristband Code</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-slate-200 text-slate-800 border-slate-300">
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
                          className="border border-slate-300 bg-slate-100 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-slate-300 rounded-lg">
                                <Watch className="w-4 h-4 text-slate-700" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{wristband.wristbandCode}</p>
                                <p className="text-xs text-gray-500">Wristband Code</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-slate-300 text-slate-900 border-slate-400">
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
                            <p className="text-xs text-gray-500 mb-3">
                              Checked in: {format(new Date(wristband.checkedInAt), 'dd MMM yyyy HH:mm', { locale: id })}
                            </p>
                          )}

                          {(wristband.assignedTicket?.attendee || wristband.assignedTicket?.orderItem?.attendees?.length) && (
                            <button
                              onClick={() => setSelectedWristband(wristband)}
                              className="w-full text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 px-3 rounded transition-colors font-medium"
                            >
                              Lihat Detail Peserta
                            </button>
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

      {/* Attendee Detail Modal */}
      <Dialog open={!!selectedWristband} onOpenChange={(open) => !open && setSelectedWristband(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Peserta</DialogTitle>
            <DialogDescription>
              Informasi lengkap peserta event
            </DialogDescription>
          </DialogHeader>

          {selectedWristband && (
            <div className="space-y-6">
              {/* Wristband Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Watch className="w-4 h-4 text-slate-700" />
                  Informasi Wristband
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wristband Code:</span>
                    <span className="font-mono font-semibold text-gray-900">{selectedWristband.wristbandCode}</span>
                  </div>
                  {selectedWristband.assignedTicket && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket Code:</span>
                      <span className="font-mono font-semibold text-gray-900">{selectedWristband.assignedTicket.ticketCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={selectedWristband.status === 'checked_in' ? 'bg-slate-300 text-slate-900' : 'bg-slate-200 text-slate-800'}>
                      {selectedWristband.status === 'checked_in' ? 'Sudah Check-in' : 'Siap Check-in'}
                    </Badge>
                  </div>
                  {selectedWristband.checkedInAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="text-gray-900">{format(new Date(selectedWristband.checkedInAt), 'dd MMM yyyy HH:mm', { locale: id })}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendee Info */}
              {selectedWristband.assignedTicket?.attendee ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-700" />
                    Data Peserta
                  </h4>
                  <div className="space-y-3">
                    <div className="border border-slate-200 rounded-lg p-3 bg-white">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Nama Lengkap</p>
                            <p className="font-semibold text-gray-900">{selectedWristband.assignedTicket.attendee.fullName}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-gray-900 break-all">{selectedWristband.assignedTicket.attendee.email}</p>
                          </div>
                        </div>
                        {selectedWristband.assignedTicket.attendee.phoneNumber && (
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">No. HP</p>
                              <p className="text-gray-900">{selectedWristband.assignedTicket.attendee.phoneNumber}</p>
                            </div>
                          </div>
                        )}
                        {selectedWristband.assignedTicket.attendee.identityType && selectedWristband.assignedTicket.attendee.identityNumber && (
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">{selectedWristband.assignedTicket.attendee.identityType}</p>
                              <p className="text-gray-900 font-mono">{selectedWristband.assignedTicket.attendee.identityNumber}</p>
                            </div>
                          </div>
                        )}
                        {selectedWristband.assignedTicket.attendee.gender && (
                          <div>
                            <p className="text-xs text-gray-500">Jenis Kelamin</p>
                            <p className="text-gray-900">{selectedWristband.assignedTicket.attendee.gender}</p>
                          </div>
                        )}
                        {selectedWristband.assignedTicket.attendee.address && (
                          <div>
                            <p className="text-xs text-gray-500">Alamat</p>
                            <p className="text-gray-900">{selectedWristband.assignedTicket.attendee.address}</p>
                          </div>
                        )}
                        {selectedWristband.assignedTicket.attendee.birthDate && (
                          <div>
                            <p className="text-xs text-gray-500">Tanggal Lahir</p>
                            <p className="text-gray-900">{format(new Date(selectedWristband.assignedTicket.attendee.birthDate), 'dd MMM yyyy', { locale: id })}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedWristband.assignedTicket?.orderItem?.attendees && selectedWristband.assignedTicket.orderItem.attendees.length > 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-700" />
                    Data Peserta
                  </h4>
                  <div className="space-y-3">
                    {selectedWristband.assignedTicket.orderItem.attendees.map((attendee, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-white">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Nama Lengkap</p>
                              <p className="font-semibold text-gray-900">{attendee.fullName}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-gray-900 break-all">{attendee.email}</p>
                            </div>
                          </div>
                          {attendee.phoneNumber && (
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500">No. HP</p>
                                <p className="text-gray-900">{attendee.phoneNumber}</p>
                              </div>
                            </div>
                          )}
                          {attendee.identityType && attendee.identityNumber && (
                            <div className="flex items-start gap-2">
                              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500">{attendee.identityType}</p>
                                <p className="text-gray-900 font-mono">{attendee.identityNumber}</p>
                              </div>
                            </div>
                          )}
                          {attendee.gender && (
                            <div>
                              <p className="text-xs text-gray-500">Jenis Kelamin</p>
                              <p className="text-gray-900">{attendee.gender}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Data peserta tidak tersedia</p>
                </div>
              )}

              {/* Category Info */}
              {selectedWristband.category && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-slate-700" />
                    Kategori Tiket
                  </h4>
                  <p className="text-sm text-gray-900">{selectedWristband.category.name}</p>
                  {selectedWristband.category.description && (
                    <p className="text-xs text-gray-600 mt-1">{selectedWristband.category.description}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
