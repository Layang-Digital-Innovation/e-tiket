'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRedeemTicket, useRedeemList } from '@/hooks/useRedeem';
import { useEventBySlug } from '@/hooks/useEvents';
import { Ticket, CheckCircle, AlertCircle, Loader2, QrCode, Scan, User, Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { RedeemStrategy } from '@/types';

// Dynamic import QR Scanner to avoid SSR issues
const QrScanner = dynamic(() => import('@/components/QrScanner'), {
  ssr: false,
  loading: () => <div>Loading scanner...</div>,
});

export default function RedeemPage() {
  const [ticketCode, setTicketCode] = useState('');
  const [itemCode, setItemCode] = useState(''); // Generic item code (wristband/bib/etc)
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanningFor, setScanningFor] = useState<'ticket' | 'item'>('ticket');
  const [lastRedeemedTicket, setLastRedeemedTicket] = useState<string>('');

  const { eventId: eventSlug } = useParams(); // eventId is actually eventSlug now
  const router = useRouter();
  const redeemMutation = useRedeemTicket();
  const { data: redeemList, isLoading: isLoadingList } = useRedeemList(eventSlug as string);
  
  // Get event data to determine redeem strategy
  const { data: event, isLoading: eventLoading } = useEventBySlug(eventSlug as string);

  // Find the last redeemed wristband (memoized for performance)
  const lastRedeemedWristband = useMemo(() => {
    return lastRedeemedTicket && redeemList?.data?.find(
      wristband => wristband.assignedTicket?.ticketCode === lastRedeemedTicket
    );
  }, [lastRedeemedTicket, redeemList?.data]);

  // Get redeem strategy and item labels
  const redeemStrategy = event?.redeemStrategy || RedeemStrategy.WRISTBAND;
  const getItemLabel = useCallback(() => {
    switch (redeemStrategy) {
      case RedeemStrategy.WRISTBAND:
        return 'Wristband';
      case RedeemStrategy.BIB:
        return 'BIB Number';
      case RedeemStrategy.NONE:
        return 'Confirmation';
      default:
        return 'Item';
    }
  }, [redeemStrategy]);

  const requiresItemCode = redeemStrategy !== RedeemStrategy.NONE;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!ticketCode.trim()) {
      setErrorMessage('Mohon isi ticket code');
      return;
    }

    if (requiresItemCode && !itemCode.trim()) {
      setErrorMessage(`Mohon isi ${getItemLabel().toLowerCase()} code`);
      return;
    }

    if (!event?.id) {
      setErrorMessage('Event data belum dimuat. Mohon tunggu sebentar.');
      return;
    }

    try {
      const result = await redeemMutation.mutateAsync({
        ticketCode: ticketCode.trim(),
        // wristbandCode: requiresItemCode ? itemCode.trim() : undefined, // Legacy compatibility
        itemCode: requiresItemCode ? itemCode.trim() : undefined,
        eventId: event.id, // Now guaranteed to be string, not undefined
        redeemStrategy,
      });

      const itemLabel = getItemLabel().toLowerCase();
      const successMsg = requiresItemCode 
        ? `Berhasil! Ticket ${result.ticketCode} telah ditukar dengan ${itemLabel} ${result.wristbandCode || result.itemCode}`
        : `Berhasil! Ticket ${result.ticketCode} telah dikonfirmasi untuk redeem`;
      
      setSuccessMessage(successMsg);
      setLastRedeemedTicket(result.ticketCode);
      setTicketCode('');
      setItemCode('');
    } catch (error: any) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat redeem');
    }
  }, [ticketCode, itemCode, redeemMutation, event?.id, redeemStrategy, requiresItemCode, getItemLabel]);

  const handleScanTicket = () => {
    setScanningFor('ticket');
    setScannerOpen(true);
  };

  const handleScanItem = () => {
    setScanningFor('item');
    setScannerOpen(true);
  };

  const handleItemCodeChange = useCallback((value: string) => {
    setItemCode(value);
    // Clear previous redeemed info when user starts typing new item code
    if (value && lastRedeemedTicket) {
      setLastRedeemedTicket('');
      setSuccessMessage('');
    }
  }, [lastRedeemedTicket]);

  const handleTicketCodeChange = useCallback((value: string) => {
    setTicketCode(value);
    if (value && lastRedeemedTicket) {
      setLastRedeemedTicket('');
      setSuccessMessage('');
    }
  }, [lastRedeemedTicket]);

  const handleScanResult = useCallback((decodedText: string) => {
    if (scanningFor === 'ticket') {
      setTicketCode(decodedText);
    } else {
      setItemCode(decodedText);
    }
    setScannerOpen(false);
  }, [scanningFor]);

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
                      onChange={(e) => handleTicketCodeChange(e.target.value)}
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

              {/* Dynamic Item Code Input */}
              {requiresItemCode && (
                <div>
                  <label htmlFor="itemCode" className="block text-sm font-medium text-gray-700 mb-2">
                    {getItemLabel()} Code
                </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="itemCode"
                        value={itemCode}
                        onChange={(e) => handleItemCodeChange(e.target.value)}
                        placeholder={`Masukkan ${getItemLabel().toLowerCase()} code`}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleScanItem}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      title="Scan QR Code"
                    >
                      <Scan className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              )}

              {/* Last Redeemed Ticket Information */}
              {lastRedeemedWristband && lastRedeemedWristband.assignedTicket && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Ticket className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">Informasi Ticket yang Baru Di-redeem</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Ticket Code</p>
                          <p className="text-sm text-gray-600">{lastRedeemedWristband.assignedTicket.ticketCode}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Wristband Code</p>
                          <p className="text-sm text-gray-600">{lastRedeemedWristband.wristbandCode}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Status Ticket</p>
                          <p className="text-sm text-blue-600 font-medium">Sudah Redeem</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {lastRedeemedWristband.assignedTicket.orderItem?.ticketCategory && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Kategori</p>
                            <p className="text-sm text-gray-600">{lastRedeemedWristband.assignedTicket.orderItem?.ticketCategory?.name}</p>
                          </div>
                        </div>
                      )}

                      {lastRedeemedWristband.assignedTicket.orderItem && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Harga</p>
                            <p className="text-sm text-green-600 font-semibold">
                              {formatCurrency(lastRedeemedWristband.assignedTicket.orderItem.unitPrice)}
                            </p>
                          </div>
                        </div>
                      )}

                      {lastRedeemedWristband.assignedTicket.orderItem && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-400"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Pemesan</p>
                            <p className="text-sm text-gray-600">{lastRedeemedWristband.assignedTicket.orderItem.order?.fullName}</p>
                            <p className="text-xs text-gray-500">{lastRedeemedWristband.assignedTicket.orderItem.order?.email}</p>
                          </div>
                        </div>
                      )}

                      {lastRedeemedWristband.assignedTicket.orderItem?.order?.phoneNumber && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">No. Telepon</p>
                            <p className="text-sm text-gray-600">{lastRedeemedWristband.assignedTicket.orderItem.order.phoneNumber}</p>
                          </div>
                        </div>
                      )}

                      {lastRedeemedWristband.assignedTicket.orderItem?.attendees && lastRedeemedWristband.assignedTicket.orderItem.attendees.length > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Peserta</p>
                            <div className="mt-1 space-y-2">
                              {lastRedeemedWristband.assignedTicket.orderItem.attendees.map((attendee, index) => (
                                <div key={attendee.id} className="bg-white rounded-md p-3 border border-gray-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-900">{attendee.fullName}</p>
                                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                      Peserta {index + 1}
                                    </span>
                                  </div>
                                  <div className="space-y-1 text-xs text-gray-600">
                                    <p><span className="font-medium">Email:</span> {attendee.email}</p>
                                    {attendee.phoneNumber && (
                                      <p><span className="font-medium">Telepon:</span> {attendee.phoneNumber}</p>
                                    )}
                                    {attendee.identityType && attendee.identityNumber && (
                                      <p><span className="font-medium">{attendee.identityType}:</span> {attendee.identityNumber}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {lastRedeemedWristband.assignedTicket.redeemedAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Waktu Redeem</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(lastRedeemedWristband.assignedTicket.redeemedAt), 'dd MMM yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {lastRedeemedWristband.event && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Event</p>
                          <p className="text-sm text-gray-600">{lastRedeemedWristband.event.title}</p>
                        </div>
                      </div>
                    </div>
                  )}
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
                disabled={redeemMutation.isPending || eventLoading || !event?.id}
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
            ) : redeemList?.data?.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada ticket yang di-redeem</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {redeemList?.data?.map((wristband) => (
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
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Ticket: <span className="font-medium">{wristband.assignedTicket.ticketCode}</span>
                          </p>
                        </div>

                        {/* Ticket Status */}
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <p className="text-sm text-gray-600">
                            Status: <span className={`font-medium ${
                              wristband.assignedTicket.status === 'checked_in'
                                ? 'text-green-600'
                                : wristband.assignedTicket.status === 'redeemed'
                                ? 'text-blue-600'
                                : 'text-gray-600'
                            }`}>
                              {wristband.assignedTicket.status === 'checked_in' ? 'Sudah Check-in' :
                               wristband.assignedTicket.status === 'redeemed' ? 'Sudah Redeem' : 'Belum Digunakan'}
                            </span>
                          </p>
                        </div>

                        {/* Ticket Category and Price */}
                        {wristband.assignedTicket.orderItem?.ticketCategory && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                            <p className="text-sm text-gray-600">
                              Kategori: <span className="font-medium">{wristband.assignedTicket.orderItem.ticketCategory.name}</span>
                              <span className="ml-2 text-violet-600 font-semibold">
                                - {formatCurrency(wristband.assignedTicket.orderItem.unitPrice)}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Buyer Information */}
                        {wristband.assignedTicket.orderItem?.order && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <div className="text-sm text-gray-600">
                              <p>Pemesan: <span className="font-medium">{wristband.assignedTicket.orderItem.order.fullName}</span></p>
                              <p className="text-xs">{wristband.assignedTicket.orderItem.order.email}</p>
                            </div>
                          </div>
                        )}

                        {/* Attendee Information */}
                        {wristband.assignedTicket.orderItem?.attendees && wristband.assignedTicket.orderItem.attendees.length > 0 && (
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-400 mt-1"></div>
                            <div className="text-sm text-gray-600 flex-1">
                              <p className="font-medium mb-1">Peserta:</p>
                              <div className="space-y-1">
                                {wristband.assignedTicket.orderItem.attendees.map((attendee, index) => (
                                  <div key={attendee.id} className="bg-gray-50 rounded p-2">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-gray-900">{attendee.fullName}</p>
                                        <p className="text-xs text-gray-600">{attendee.email}</p>
                                        {attendee.phoneNumber && (
                                          <p className="text-xs text-gray-600">{attendee.phoneNumber}</p>
                                        )}
                                      </div>
                                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full ml-2">
                                        #{index + 1}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Redeemed Date */}
                        {wristband.assignedTicket.redeemedAt && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <p className="text-sm text-gray-600">
                              Di-redeem: <span className="font-medium">{format(new Date(wristband.assignedTicket.redeemedAt), 'dd MMM yyyy HH:mm')}</span>
                            </p>
                          </div>
                        )}
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
        label={scanningFor === 'ticket' ? 'Scan Ticket QR Code' : `Scan ${getItemLabel()} QR Code`}
      />
    </div>
  );
}
