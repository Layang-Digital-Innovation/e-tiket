'use client';

import Link from 'next/link';
import { useRecentEvents } from '@/hooks/useDashboard';
import { Calendar, ArrowRight, Ticket } from 'lucide-react';
import { format } from 'date-fns';

export default function RedeemPage() {
  const { data: events = [], isLoading } = useRecentEvents(50); // Get more events for selection

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Redeem Ticket</h1>
          <p className="text-gray-600">Pilih event untuk melakukan redeem tiket</p>
        </div>

        {/* Events List */}
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada event</h3>
              <p className="text-gray-500">Buat event terlebih dahulu untuk dapat melakukan redeem tiket</p>
              <Link
                href="/organizer/events/create"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Buat Event Baru</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(event.startDate), 'dd MMM yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Ticket className="w-4 h-4" />
                          {event.ticketCategories?.reduce((total, category) => total + category.sold, 0) || 0} tiket terjual
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        key={event.id}
                        href={`/redeem/${event.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                      >
                        <span>Redeem Tiket</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
