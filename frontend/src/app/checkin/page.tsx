'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { Loader2, QrCode, ArrowLeft, ChevronRight, Calendar, MapPin, Sparkles } from 'lucide-react';
import { Event } from '@/types';
import Image from 'next/image';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function CheckInPage() {
  const router = useRouter();
  const { data: response, isLoading } = useEvents();
  const events = response?.data || [];
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleSelectEvent = (eventSlug: string) => {
    setSelectedEventId(eventSlug);
    router.push(`/checkin/${eventSlug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 font-medium transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Kembali
          </button>
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Check-in System
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Pilih Event untuk Check-in
            </h1>
            <p className="text-gray-600 text-lg">
              Pilih event untuk memulai proses check-in peserta
            </p>
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
            <p className="text-gray-600">Memuat event...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center max-w-md mx-auto border border-white">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Event</h3>
            <p className="text-gray-600">Belum ada event yang tersedia untuk check-in</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {events.map((event: Event) => (
              <div
                key={event.id}
                onClick={() => handleSelectEvent(event.slug)}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer group border border-white transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Event Image */}
                <div className="relative h-48 bg-gradient-to-br from-emerald-400 via-blue-400 to-purple-400 overflow-hidden">
                  {event.imageUrl ? (
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Event Type Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                      {event.eventType || 'Event'}
                    </span>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>
                        {format(new Date(event.startDate), 'dd MMMM yyyy', { locale: id })}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectEvent(event.slug);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl group-hover:scale-105"
                  >
                    <QrCode className="w-5 h-5" />
                    Mulai Check-in
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
