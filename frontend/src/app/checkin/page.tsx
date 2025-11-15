'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { Loader2, QrCode, ArrowLeft, ChevronRight } from 'lucide-react';
import { Event } from '@/types';

export default function CheckInPage() {
  const router = useRouter();
  const { data: response, isLoading } = useEvents();
  const events = response?.data || [];
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleSelectEvent = (eventSlug: string) => {
    setSelectedEventId(eventSlug);
    // Navigate to the slug-based dynamic route
    router.push(`/checkin/${eventSlug}`);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pilih Event untuk Check-in</h1>
          <p className="text-gray-600">Pilih event untuk memulai proses check-in wristband peserta</p>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Belum ada event yang tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: Event) => (
              <div
                key={event.id}
                onClick={() => handleSelectEvent(event.id)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
              >
                {/* Event Image */}
                {event.imageUrl && (
                  <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}

                {/* Event Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {new Date(event.startDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{event.location}</p>

                  {/* Button */}
                  <button
                    onClick={() => handleSelectEvent(event.slug)}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    Mulai Check-in
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
