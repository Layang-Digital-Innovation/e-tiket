'use client';

import { use, useState } from 'react';
import { useEventBySlug } from '@/hooks/useEvents';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Calendar, MapPin, Users, Clock, Ticket, ChevronRight, Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { TicketCategory } from '@/types';

export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: event, isLoading, error } = useEventBySlug(slug);
  
  const [selectedTickets, setSelectedTickets] = useState<{ [categoryId: string]: number }>({});

  const handleQuantityChange = (categoryId: string, change: number) => {
    const category = event?.ticketCategories?.find((t: TicketCategory) => t.id === categoryId);
    if (!category) return;

    const currentQty = selectedTickets[categoryId] || 0;
    const newQty = Math.max(0, Math.min(currentQty + change, category.maxQuantity - category.sold, 10));

    if (newQty === 0) {
      const newSelected = { ...selectedTickets };
      delete newSelected[categoryId];
      setSelectedTickets(newSelected);
    } else {
      setSelectedTickets({
        ...selectedTickets,
        [categoryId]: newQty,
      });
    }
  };

  const getTotalPrice = () => {
    if (!event?.ticketCategories) return 0;
    return Object.entries(selectedTickets).reduce((total, [categoryId, quantity]) => {
      const category = event.ticketCategories?.find((t: TicketCategory) => t.id === categoryId);
      return total + (category ? category.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, qty) => total + qty, 0);
  };

  const handleCheckout = () => {
    if (getTotalTickets() === 0) return;
    
    // Save to sessionStorage
    sessionStorage.setItem('checkout', JSON.stringify({
      eventId: event?.id,
      eventSlug: slug,
      selectedTickets,
      currentStep: 1,
    }));
    
    router.push(`/checkout/${slug}`);
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat event...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !event) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg">Event tidak ditemukan</p>
            <button
              onClick={() => router.push('/events')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Kembali ke daftar event
            </button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {event.title}
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  {stripHtml(event.description).substring(0, 150)}...
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>
                      {new Date(event.startDate).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
                  <Ticket className="h-24 w-24 mx-auto mb-4 text-white/80" />
                  <p className="text-lg">Tiket Mulai Dari</p>
                  <p className="text-4xl font-bold mt-2">{formatCurrency(event.basePrice || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Event */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Tentang Event
                </h2>
                <div className="prose max-w-none text-gray-700">
                  <p>{stripHtml(event.description)}</p>
                </div>
              </div>

              {/* Event Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Informasi Event
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Lokasi</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Tanggal & Waktu</p>
                      <p className="text-gray-600">
                        {new Date(event.startDate).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-gray-600">
                        {new Date(event.startDate).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} - {new Date(event.endDate).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tickets Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Pilih Tiket
                </h2>
                <div className="space-y-4">
                  {event.ticketCategories && event.ticketCategories.length > 0 ? (
                    event.ticketCategories.map((category: TicketCategory) => {
                      const available = category.maxQuantity - category.sold;
                      const isAvailable = available > 0 && category.isActive;
                      const selectedQty = selectedTickets[category.id] || 0;

                      return (
                        <div
                          key={category.id}
                          className={`border rounded-lg p-4 ${
                            isAvailable ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {category.name}
                              </h3>
                              {category.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {category.description}
                                </p>
                              )}
                              <p className="text-sm text-gray-500 mt-2">
                                {isAvailable ? `${available} tiket tersisa` : 'Sold out'}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(category.price)}
                              </p>
                            </div>
                          </div>

                          {isAvailable && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                              <span className="text-sm text-gray-600">Jumlah:</span>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleQuantityChange(category.id, -1)}
                                  disabled={selectedQty === 0}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center font-semibold">
                                  {selectedQty}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(category.id, 1)}
                                  disabled={selectedQty >= Math.min(available, 10)}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-600 py-8">
                      Belum ada tiket tersedia untuk event ini
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Ringkasan Pesanan
                </h3>
                
                {getTotalTickets() === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    Belum ada tiket dipilih
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      {Object.entries(selectedTickets).map(([categoryId, quantity]) => {
                        const category = event.ticketCategories?.find((t: TicketCategory) => t.id === categoryId);
                        if (!category) return null;
                        
                        return (
                          <div key={categoryId} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {category.name} x {quantity}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(category.price * quantity)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCurrency(getTotalPrice())}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {getTotalTickets()} tiket
                      </p>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                    >
                      Lanjut ke Checkout
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
