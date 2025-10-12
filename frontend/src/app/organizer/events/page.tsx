'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import { apiService } from '@/services/api';
import { Event } from '@/types/api';

export default function EOEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from API
  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMyEvents({
          page: 1,
          limit: 20
        });
        setEvents(response.data || []);
      } catch (err) {
        console.error('Failed to fetch my events:', err);
        setError('Failed to load events. Please try again later.');
        // Fallback to mock data if API fails
        setEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  // Mock data as fallback
  const mockEvents = [
    {
      id: '1',
      title: 'Konser Musik Jazz',
      description: 'Konser musik jazz dengan artis terbaik',
      startDate: '2024-02-15T19:00:00',
      endDate: '2024-02-15T22:00:00',
      location: 'Jakarta Convention Center',
      capacity: 500,
      price: 150000,
      status: 'published' as const,
      organizerId: '1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Workshop Digital Marketing',
      description: 'Workshop intensif digital marketing',
      startDate: '2024-02-20T09:00:00',
      endDate: '2024-02-21T17:00:00',
      location: 'Hotel Santika Jakarta',
      capacity: 100,
      price: 500000,
      status: 'published' as const,
      organizerId: '1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      title: 'Festival Kuliner Nusantara',
      description: 'Festival kuliner dengan berbagai makanan nusantara',
      startDate: '2024-03-01T10:00:00',
      endDate: '2024-03-03T22:00:00',
      location: 'Lapangan Banteng',
      capacity: 1000,
      price: 50000,
      status: 'draft' as const,
      organizerId: '1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              My Events
            </h1>
            <Link
              href="/eo/events/create"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Buat Event Baru
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Events List */}
          {!loading && !error && (
            <div className="space-y-6">
              {events.length > 0 ? events.map((event) => (
              <div key={event.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : event.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {event.status === 'published' ? 'Aktif' : 
                           event.status === 'draft' ? 'Draft' : 'Nonaktif'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Tanggal:</span>
                          <p>
                            {new Date(event.startDate).toLocaleDateString('id-ID')}
                            {event.startDate !== event.endDate && 
                              ` - ${new Date(event.endDate).toLocaleDateString('id-ID')}`
                            }
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Lokasi:</span>
                          <p>{event.location}</p>
                        </div>
                        <div>
                          <span className="font-medium">Kapasitas:</span>
                          <p>{(event as any).currentCapacity || 0} / {event.capacity}</p>
                        </div>
                        <div>
                          <span className="font-medium">Harga:</span>
                          <p>Rp {event.price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Progress Penjualan
                          </span>
                          <span className="text-sm text-gray-500">
                            {Math.round((event.currentCapacity / event.maxCapacity) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(event.currentCapacity / event.maxCapacity) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            {event.ticketsCount} jenis tiket
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/eo/events/${event.id}`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Lihat Detail
                          </Link>
                          <Link
                            href={`/eo/events/${event.id}/tickets`}
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                          >
                            Kelola Tiket
                          </Link>
                          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {events.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada event
              </h3>
              <p className="text-gray-500 mb-6">
                Mulai dengan membuat event pertama Anda
              </p>
              <Link
                href="/eo/events/create"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Buat Event Baru
              </Link>
            </div>
          )}

          {/* Pagination */}
          {events.length > 0 && (
            <div className="mt-8 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}