'use client';

import Link from 'next/link';
import { useEvents } from '@/hooks/useEvents';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Event } from '@/types';

export function HomeEventsCarousel() {
  const { data, isLoading, error } = useEvents({
    page: 1,
    limit: 3,
    status: 'published',
  });

  const events = (data?.data as Event[]) || [];

  if (error) {
    return null;
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-pt-serif font-bold text-gray-900 dark:text-white mb-2">
              Event Terbaru
            </h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
              Jelajahi beberapa event yang sedang berlangsung di Naik Kelas.
            </p>
          </div>
          <Link
            href="/events"
            className="hidden md:inline-flex items-center text-sm font-medium text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900 transition-colors"
          >
            Lihat Semua Event
          </Link>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[260px] md:min-w-[300px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 animate-pulse flex-shrink-0"
              >
                <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full mb-1" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-300 text-sm">
            Belum ada event yang dapat ditampilkan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md transition-all flex flex-col"
              >
                <div className="h-32 bg-gray-100 dark:bg-gray-800 relative overflow-hidden rounded-t-xl">
                  {event.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Calendar className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {new Date(event.startDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {event.location}
                  </p>
                  <div className="mt-auto flex items-center justify-between text-xs text-gray-700 dark:text-gray-200">
                    <span className="inline-flex items-center">
                      <Ticket className="h-3 w-3 mr-1" />
                      Mulai dari
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(event.basePrice || 0)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 md:hidden text-center">
          <Link
            href="/events"
            className="inline-flex items-center text-sm font-medium text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900 transition-colors"
          >
            Lihat Semua Event
          </Link>
        </div>
      </div>
    </section>
  );
}
