'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyEvents, useDeleteEvent } from '@/hooks';
import { EventCard } from '@/components/events/EventCard';
import { Plus, RefreshCw } from 'lucide-react';

export default function EOEventsPage() {
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const limit = 20;

  // Fetch my events using React Query
  const { data, isLoading, error, refetch } = useMyEvents({ page, limit });
  const deleteEventMutation = useDeleteEvent();

  const events = data?.data || [];
  const totalPages = data?.totalPages || 1;

  // Handle delete event
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return;

    try {
      setDeletingId(id);
      await deleteEventMutation.mutateAsync(id);
      alert('Event berhasil dihapus');
    } catch (error) {
      alert('Gagal menghapus event');
      console.error('Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Events
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Kelola dan pantau event Anda
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <Link
                href="/organizer/events/create"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Buat Event
              </Link>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600">{error.message || 'Failed to load events'}</p>
            </div>
          )}

          {/* Events List */}
          {!isLoading && !error && (
            <div className="space-y-4">
              {events.length > 0 ? (
                events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDelete={handleDelete}
                    isDeleting={deletingId === event.id}
                  />
                ))
              ) : (
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