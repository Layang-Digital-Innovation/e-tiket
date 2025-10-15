import Link from 'next/link';
import { Event } from '@/types';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';

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
  const progress = ((event.currentCapacity || 0) / (event.capacity || event.maxCapacity || 1)) * 100;
  
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
          {event.description}
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
            <Users className="h-4 w-4 text-gray-400" />
            <span>
              {event.currentCapacity || 0} / {event.capacity || event.maxCapacity}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span>Rp {event.price?.toLocaleString('id-ID') || 0}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">
              Penjualan Tiket
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
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
                href={`/organizer/events/${event.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Detail
              </Link>
              <Link
                href={`/organizer/events/${event.id}/tickets`}
                className="text-sm font-medium text-green-600 hover:text-green-700"
              >
                Tiket
              </Link>
              <Link
                href={`/organizer/events/${event.id}/edit`}
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
