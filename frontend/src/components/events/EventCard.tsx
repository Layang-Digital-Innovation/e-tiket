import Link from 'next/link';
import { Event } from '@/types';
import { Calendar, MapPin, Tag, Clock, MoreVertical } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Helper function to strip HTML tags and get plain text
function stripHtml(html: string): string {
  const text = html.replace(/<[^>]*>/g, ' ');
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
  
  const statusConfig = {
    published: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Aktif'
    },
    draft: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      label: 'Draft'
    },
    cancelled: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      dot: 'bg-red-500',
      label: 'Dibatalkan'
    },
  };

  const status = event.status || 'draft';
  const config = statusConfig[status];

  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300">
      {/* Status Bar */}
      <div className={`h-1.5 ${config?.dot || 'bg-gray-400'}`} />
      
      <div className="p-5">
        {/* Header with Status Badge */}
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {event.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config?.bg} ${config?.text} ${config?.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config?.dot}`} />
                {config?.label || status}
              </span>
              {event.ticketCategories && event.ticketCategories.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <Tag className="h-3 w-3" />
                  {event.ticketCategories.length} Tiket
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {stripHtml(event.description)}
        </p>

        {/* Info Cards */}
        <div className="space-y-2 mb-4">
          {/* Date & Time */}
          <div className="flex items-center gap-2.5 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">
                {new Date(event.startDate).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2.5 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{event.location}</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2.5 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
              <Tag className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Mulai dari</p>
              <p className="font-bold text-green-600 text-base">
                {formatCurrency(event.basePrice || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
            <Link
              href={`/organizer/events/${event.slug}`}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-center text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Detail
            </Link>
            <Link
              href={`/organizer/events/${event.slug}/tickets`}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-center text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              Tiket
            </Link>
            <Link
              href={`/organizer/events/${event.slug}/edit`}
              className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Edit
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(event.id)}
                disabled={isDeleting}
                className="px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Hapus event"
              >
                {isDeleting ? '...' : 'Hapus'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}