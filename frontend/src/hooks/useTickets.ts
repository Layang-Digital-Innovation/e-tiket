import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Ticket, CreateTicketRequest } from '@/types';

// Query Keys
export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (eventId: string) => [...ticketKeys.lists(), eventId] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Get tickets by event ID
 */
export function useTickets(eventId: string, enabled = true) {
  return useQuery({
    queryKey: ticketKeys.list(eventId),
    queryFn: async () => {
      const response = await apiService.getTickets(eventId);
      return (response as any).data as Ticket[];
    },
    enabled: !!eventId && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create new ticket
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTicketRequest) => {
      return await apiService.createTicket(data);
    },
    onSuccess: (_, variables) => {
      // Invalidate tickets list for this event
      if (variables.eventId) {
        queryClient.invalidateQueries({
          queryKey: ticketKeys.list(variables.eventId),
        });
      }
      // Invalidate all tickets lists
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}

/**
 * Update ticket
 */
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Ticket>;
    }) => {
      return await apiService.updateTicket(id, data);
    },
    onSuccess: (response, variables) => {
      // Invalidate specific ticket detail
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(variables.id) });
      
      // Invalidate all tickets lists
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}

/**
 * Delete ticket
 */
export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiService.deleteTicket(id);
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ticketKeys.detail(id) });
      
      // Invalidate all tickets lists
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}
