import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Attendee } from '@/types';

export const useAttendeesBySlug = (eventSlug?: string, status?: string) => {
  return useQuery({
    queryKey: ['attendees', 'slug', eventSlug, status],
    queryFn: () => {
      if (!eventSlug) {
        throw new Error('Event slug is required');
      }
      return apiService.getAttendeesByEventSlug(eventSlug, status);
    },
    enabled: !!eventSlug,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Backward compatibility
export const useAttendees = (eventId?: string, status?: string) => {
  return useQuery({
    queryKey: ['attendees', eventId, status],
    queryFn: () => {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      return apiService.getAttendeesByEvent(eventId, status);
    },
    enabled: !!eventId,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExportAttendees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventSlug, status }: { eventSlug: string; status?: string }) =>
      apiService.exportAttendeesBySlug(eventSlug, status),
    onSuccess: () => {
      // Optional: Show success notification
      console.log('Attendees exported successfully');
    },
    onError: (error) => {
      console.error('Export attendees failed:', error);
      // Optional: Show error notification
    },
  });
};

export const useAttendeeStats = (eventId?: string) => {
  return useQuery({
    queryKey: ['attendee-stats', eventId],
    queryFn: async () => {
      if (!eventId) {
        throw new Error('Event ID is required for stats');
      }

      try {
        const [unusedData, redeemedData, checkedInData] = await Promise.all([
          apiService.getAttendeesByEvent(eventId, 'UNUSED'),
          apiService.getAttendeesByEvent(eventId, 'REDEEMED'),
          apiService.getAttendeesByEvent(eventId, 'CHECKED_IN'),
        ]);

        return {
          total: unusedData.data.length + redeemedData.data.length + checkedInData.data.length,
          unused: unusedData.data.length,
          redeemed: redeemedData.data.length,
          checkedIn: checkedInData.data.length,
        };
      } catch (error) {
        console.error('Failed to fetch attendee stats:', error);
        return {
          total: 0,
          unused: 0,
          redeemed: 0,
          checkedIn: 0,
        };
      }
    },
    enabled: !!eventId,
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
