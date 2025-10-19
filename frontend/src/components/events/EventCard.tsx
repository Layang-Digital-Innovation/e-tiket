import Link from 'next/link';
import { Event } from '@/types';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Helper function to strip HTML tags and get plain text
function stripHtml(html: string): string {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, ' ');
  // Replace multiple spaces with single space
  return text.replace(/\s+/g, ' ').trim();
}

interface EventCardProps {
  event: Event;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  showActions?: boolean;
}

export function EventCard({ 
  event, 
  onDelete, 
  isDeleting = false,
  showActions = true 
}: EventCardProps) {
  
  const statusColors = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    published: 'Aktif',
    draft: 'Draft',
    cancelled: 'Dibatalkan',
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-6 py-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {event.title}
          </h3>
          {event.status && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[event.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {statusLabels[event.status] || event.status}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {stripHtml(event.description)}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="truncate">
              {new Date(event.startDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="truncate">{event.location}</span>
          </div>



          <div className="flex items-center gap-2 text-sm text-gray-600">
            Harga Tiket Mulai Dari :
            <span>{formatCurrency(event.basePrice || 0)}</span>
          </div>
        </div>



        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              {event.ticketsCount || 0} jenis tiket
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/organizer/events/${event.slug}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Detail
              </Link>
              <Link
                href={`/organizer/events/${event.slug}/tickets`}
                className="text-sm font-medium text-green-600 hover:text-green-700"
              >
                Tiket
              </Link>
              <Link
                href={`/organizer/events/${event.slug}/edit`}
                className="text-sm font-medium text-gray-600 hover:text-gray-700"
              >
                Edit
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(event.id)}
                  disabled={isDeleting}
                  className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Menghapus...' : 'Hapus'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
