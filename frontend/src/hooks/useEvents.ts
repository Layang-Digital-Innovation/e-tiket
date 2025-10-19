import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Event, CreateEventRequest, PaginatedResponse } from '@/types';

// Query Keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: { page?: number; limit?: number; status?: string }) =>
    [...eventKeys.lists(), filters] as const,
  myEvents: () => [...eventKeys.all, 'my-events'] as const,
  myEventsList: (filters: { page?: number; limit?: number }) =>
    [...eventKeys.myEvents(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (slug: string) => [...eventKeys.details(), slug] as const,
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Get all events (public)
 */
export function useEvents(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: eventKeys.list(params || {}),
    queryFn: async () => {
      const response = await apiService.getEvents(params);
      return response as PaginatedResponse<Event>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Get my events (organizer only)
 */
export function useMyEvents(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: eventKeys.myEventsList(params || {}),
    queryFn: async () => {
      const response = await apiService.getMyEvents(params);
      return response as PaginatedResponse<Event>;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get event by ID
 */
export function useEvent(id: string, enabled = true) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const response = await apiService.getEvent(id);
      return (response as any).data as Event;
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get event by slug
 */
export function useEventBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: [...eventKeys.details(), 'slug', slug] as const,
    queryFn: async () => {
      const response = await apiService.getEventBySlug(slug);
      return (response as any).data as Event;
    },
    enabled: !!slug && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventRequest) => {
      return await apiService.createEvent(data);
    },
    onSuccess: () => {
      // Invalidate and refetch my events list
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

/**
 * Update event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, slug, data }: { id: string; slug: string; data: Partial<Event> }) => {
      return await apiService.updateEvent(id, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific event detail
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: [...eventKeys.details(), 'slug', variables.slug] });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

/**
 * Delete event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiService.deleteEvent(id);
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: eventKeys.detail(id) });
            // Invalidate lists
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}
