'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useCheckIn } from '@/hooks/useCheckIn';
import { Watch, CheckCircle, AlertCircle, Loader2, QrCode, Ticket, Clock, Scan, Mail, Phone, User, Calendar, ArrowLeft, TrendingUp, Users, Zap, Download } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Event, EventType, Wristband } from '@/types';
import { useRouter } from 'next/navigation';
import apiService from '@/services/api';
import { toast } from 'sonner';

// Dynamic import QR Scanner to avoid SSR issues
const QrScanner = dynamic(() => import('@/components/QrScanner'), {
  ssr: false,
  loading: () => <div>Loading scanner...</div>,
});

interface RecentCheckIn extends Wristband {
  timestamp: Date;
}

export default function CheckInPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId: eventSlug } = use(params);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [codeInput, setCodeInput] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedWristband, setSelectedWristband] = useState<Wristband | null>(null);
  const [eventCheckInData, setEventCheckInData] = useState<Wristband[]>([]);
  const [isLoadingEventData, setIsLoadingEventData] = useState(false);
  const [eventDetail, setEventDetail] = useState<Event | null>(null);
  const [isLoadingEventDetail, setIsLoadingEventDetail] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [lastCheckedInAttendee, setLastCheckedInAttendee] = useState<any>(null);

  const checkInMutation = useCheckIn();

  // Keyboard shortcut: Ctrl+K to focus input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch event detail
  useEffect(() => {
    if (!eventSlug) return;

    setIsLoadingEventDetail(true);
    apiService
      .getEventBySlug(eventSlug)
      .then((response: any) => {
        setEventDetail(response as Event);
      })
      .catch((error: any) => {
        console.error('Failed to fetch event detail:', error);
        setErrorMessage('Gagal memuat detail event');
      })
      .finally(() => {
        setIsLoadingEventDetail(false);
      });
  }, [eventSlug]);

  // Fetch check-in data
  useEffect(() => {
    if (eventSlug) {
      setIsLoadingEventData(true);
      apiService
        .getCheckInListByEventSlug(eventSlug)
        .then((response: any) => {
          if (response.success && Array.isArray(response.data)) {
            setEventCheckInData(response.data);
          }
        })
        .catch((error: any) => {
          console.error('Failed to fetch event check-in data:', error);
        })
        .finally(() => {
          setIsLoadingEventData(false);
        });
    }
  }, [eventSlug]);

  const refreshCheckInData = () => {
    if (eventSlug) {
      apiService.getCheckInListByEventSlug(eventSlug).then((response: any) => {
        if (response.success && Array.isArray(response.data)) {
          setEventCheckInData(response.data);
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const trimmedCode = codeInput.trim();

    if (!trimmedCode) {
      setErrorMessage('Mohon isi kode untuk check-in');
      return;
    }

    try {
      // Send the code to the backend
      const result = await checkInMutation.mutateAsync({ code: trimmedCode });

      // Debug: Log the result to see what we're getting
      console.log('🎫 Check-in result:', result);
      console.log('🎫 Assigned ticket:', result?.assignedTicket);

      // Success handling with animation
      setShowSuccessAnimation(true);

      // Extract data from the response
      const responseData = result.data || result; // Handle both response formats

      // Safely extract attendee data with proper null checks
      const assignedTicket = responseData.assignedTicket || {
        ticketCode: '',
        attendee: {
          id: '',
          fullName: 'Peserta',
          email: '',
          phoneNumber: ''
        },
        category: {
          name: 'General'
        }
      };

      // Format the attendee data for display
      const attendeeData = {
        id: assignedTicket.attendee?.id || '',
        fullName: assignedTicket.attendee?.fullName || 'Peserta',
        email: assignedTicket.attendee?.email || '',
        phoneNumber: assignedTicket.attendee?.phoneNumber || assignedTicket.attendee?.phoneNumber || '',
        ticketCode: responseData.ticketCode || assignedTicket.ticketCode || '',
        checkedInAt: responseData.checkedInAt || new Date().toISOString(),
        ticketType: assignedTicket.category?.name || 'General',
      };

      console.log('📝 Formatted attendee data:', attendeeData);

      setLastCheckedInAttendee(attendeeData);

      // Show success message with attendee name
      const attendeeName = attendeeData.fullName;
      setSuccessMessage(`✅ Check-in berhasil untuk ${attendeeName}`);

      console.log('✅ Last checked-in attendee set:', attendeeData);

      // Add to recent check-ins
      const newCheckIn: RecentCheckIn = {
        ...attendeeData,
        timestamp: new Date(),
      } as any;
      setRecentCheckIns(prev => [newCheckIn, ...prev].slice(0, 5));

      // Clear input field
      setCodeInput('');

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setSuccessMessage('');
      }, 5000);

      // Vibrate on mobile
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      toast.success('Check-in berhasil!', {
        description: `${attendeeData.ticketCode} - ${format(new Date(attendeeData.checkedInAt), 'HH:mm:ss', { locale: id })}`,
      });

      // Auto-clear after 3 seconds (but keep lastCheckedInAttendee visible)
      setTimeout(() => {
        // setShowSuccessAnimation(false); // Removed to keep modal open
        setCodeInput('');
        setSuccessMessage('');
        // Don't clear lastCheckedInAttendee - let it stay visible
      }, 3000);

      // Refresh data
      refreshCheckInData();
    } catch (error: any) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat check-in');
      toast.error('Check-in gagal', {
        description: error.message,
      });
    }
  };

  const handleScanWristband = () => {
    setScannerOpen(true);
  };

  const handleScanResult = (decodedText: string) => {
    setCodeInput(decodedText);
    setScannerOpen(false);
    // Auto-focus input after scan
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const isConcertOrRunning =
    eventDetail?.eventType === EventType.CONCERT || eventDetail?.eventType === EventType.RUNNING;

  const wristbandsToDisplay = eventCheckInData;

  const readyToCheckIn = Array.isArray(wristbandsToDisplay) ? wristbandsToDisplay.filter((w) => w.status === 'assigned') : [];
  const checkedIn = Array.isArray(wristbandsToDisplay) ? wristbandsToDisplay.filter((w) => w.status === 'checked_in') : [];

  const totalAttendees = readyToCheckIn.length + checkedIn.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 font-medium transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Kembali
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Check-in Peserta
              </h1>
            </div>
            {eventSlug && (
              <Badge variant="outline" className="text-sm font-mono">
                {eventSlug}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Check-in Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Scan {isConcertOrRunning ? 'Wristband' : 'Ticket'}</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="checkInCode" className="block text-sm font-semibold text-gray-700 mb-2">
                    {isConcertOrRunning ? 'Redeem Item Code' : 'Ticket Code'}
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Watch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        ref={inputRef}
                        type="text"
                        id="checkInCode"
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        placeholder={
                          isConcertOrRunning
                            ? 'Scan atau masukkan redeem item code'
                            : 'Scan atau masukkan ticket code'
                        }
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg font-mono"
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleScanWristband}
                      className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl hover:from-emerald-700 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                      title="Scan QR Code"
                    >
                      <Scan className="w-5 h-5" />
                      <span className="hidden sm:inline">Scan</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Tekan <kbd className="px-2 py-1 bg-gray-100 rounded border">Ctrl+K</kbd> untuk fokus ke input
                  </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <div className="flex items-start gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-800 font-medium">{successMessage}</p>
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 font-medium">{errorMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={checkInMutation.isPending || !codeInput.trim()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {checkInMutation.isPending ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Check-in Sekarang
                    </>
                  )}
                </button>
              </form>

              {/* Recent Check-ins */}
              {recentCheckIns.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Check-in Terbaru
                  </h3>
                  <div className="space-y-2">
                    {recentCheckIns.map((checkIn, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-100 animate-in slide-in-from-left"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {checkIn.assignedTicket?.attendee?.fullName?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {lastCheckedInAttendee?.fullName || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-600 font-mono">{checkIn.wristbandCode}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            ✓ Checked
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(checkIn.timestamp, 'HH:mm:ss', { locale: id })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Animation Overlay */}
      {showSuccessAnimation && lastCheckedInAttendee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Check-in Berhasil!</h2>

            {/* Attendee Info */}
            <div className="bg-gray-50 rounded-xl p-4 my-4 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">{lastCheckedInAttendee.fullName}</p>
                  <p className="text-sm text-gray-500">Peserta</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Tiket</p>
                  <p className="font-medium text-gray-900">{lastCheckedInAttendee.ticketCode}</p>
                </div>
                {lastCheckedInAttendee.ticketType && (
                  <div>
                    <p className="text-xs text-gray-500">Tipe</p>
                    <p className="font-medium text-gray-900">{lastCheckedInAttendee.ticketType}</p>
                  </div>
                )}
                {lastCheckedInAttendee.email && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 truncate">{lastCheckedInAttendee.email}</p>
                  </div>
                )}
                {lastCheckedInAttendee.phoneNumber && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">No. HP</p>
                    <p className="font-medium text-gray-900">{lastCheckedInAttendee.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>
                {format(new Date(lastCheckedInAttendee.checkedInAt), 'dd MMM yyyy, HH:mm:ss', { locale: id })}
              </span>
            </div>

            <button
              onClick={() => setShowSuccessAnimation(false)}
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

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
            <div className="space-y-4">
              {/* Wristband Info */}
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Watch className="w-4 h-4 text-emerald-600" />
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
                    <Badge className={selectedWristband.status === 'checked_in' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}>
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
              {selectedWristband.assignedTicket?.attendee && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-700" />
                    Data Peserta
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Nama Lengkap</p>
                        <p className="font-semibold text-gray-900">{selectedWristband.assignedTicket.attendee.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-gray-900 text-sm break-all">{selectedWristband.assignedTicket.attendee.email}</p>
                      </div>
                    </div>
                    {selectedWristband.assignedTicket.attendee.phoneNumber && (
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">No. HP</p>
                          <p className="text-gray-900">{selectedWristband.assignedTicket.attendee.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
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
