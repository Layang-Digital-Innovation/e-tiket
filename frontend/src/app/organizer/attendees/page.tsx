'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMyEvents } from '@/hooks/useEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const EventsPage = () => {
  const router = useRouter();
  const { data: eventsData, isLoading } = useMyEvents();
  const events = eventsData?.data || [];

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      DRAFT: { label: 'Draft', variant: 'secondary' as const },
      PUBLISHED: { label: 'Published', variant: 'default' as const },
      COMPLETED: { label: 'Selesai', variant: 'outline' as const },
      CANCELLED: { label: 'Dibatalkan', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status || 'Draft', variant: 'secondary' as const };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleManageAttendees = (eventSlug: string) => {
    router.push(`/organizer/events/${eventSlug}/attendees`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Kelola Kehadiran Peserta
        </h1>
        <p className="text-gray-600">
          Pilih event untuk melihat dan mengexport data kehadiran peserta seminar
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada event
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Buat event terlebih dahulu untuk dapat mengelola data kehadiran peserta
            </p>
            <Button onClick={() => router.push('/organizer/events/create')}>
              Buat Event Baru
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {event.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(event.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      {format(new Date(event.startDate), 'dd MMMM yyyy', { locale: id })}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Event ID: {event.id}</span>
                  </div>

                  <div className="pt-3 border-t">
                    <Button
                      onClick={() => handleManageAttendees(event.slug)}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <span>Kelola Kehadiran</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
