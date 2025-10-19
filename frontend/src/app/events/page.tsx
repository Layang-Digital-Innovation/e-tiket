'use client';

import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Calendar, MapPin, Ticket, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Event } from '@/types';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('published');
  
  const { data, isLoading, error } = useEvents({
    page: 1,
    limit: 20,
    status: statusFilter,
  });

  const filteredEvents = data?.data?.filter((event: Event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Temukan Event Terbaik
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Jelajahi berbagai event menarik dan dapatkan tiket Anda sekarang
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Cari event atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Gagal memuat event. Silakan coba lagi.</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Tidak ada event yang ditemukan</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredEvents.length} Event Tersedia
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event: Event) => (
                  <EventPublicCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

function EventPublicCard({ event }: { event: Event }) {
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  return (
    <Link href={`/events/${event.slug}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Event Image */}
        <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Calendar className="h-16 w-16 text-white opacity-50" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold shadow">
              {event.status === 'published' ? 'Tersedia' : 'Draft'}
            </span>
          </div>
        </div>

        {/* Event Info */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {event.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
            {stripHtml(event.description)}
          </p>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              <span>
                {new Date(event.startDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
              <span className="line-clamp-1">{event.location}</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Mulai dari
              </div>
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(event.basePrice || 0)}
              </div>
            </div>
          </div>

          <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            Lihat Detail
          </button>
        </div>
      </div>
    </Link>
  );
}
