import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { TicketCategory, CreateTicketRequest } from '@/types';

// Query Keys
export const ticketCategoryKeys = {
  all: ['ticketCategories'] as const,
  lists: () => [...ticketCategoryKeys.all, 'list'] as const,
  list: (eventId: string) => [...ticketCategoryKeys.lists(), eventId] as const,
  details: () => [...ticketCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketCategoryKeys.details(), id] as const,
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Get ticket categories by event ID
 */
export function useTicketCategories(eventId: string, enabled = true) {
  return useQuery({
    queryKey: ticketCategoryKeys.list(eventId),
    queryFn: async () => {
      const response = await apiService.getTicketsCategoryByEventId(eventId);
      return (response as any).data as TicketCategory[];
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
 * Create new ticket category
 */
export function useCreateTicketCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTicketRequest) => {
      return await apiService.createTicketCategory(data);
    },
    onSuccess: (_, variables) => {
      // Invalidate ticket categories list for this event
      if (variables.eventId) {
        queryClient.invalidateQueries({
          queryKey: ticketCategoryKeys.list(variables.eventId),
        });
      }
      // Invalidate all ticket categories lists
      queryClient.invalidateQueries({ queryKey: ticketCategoryKeys.lists() });
    },
  });
}

/**
 * Update ticket category
 */
export function useUpdateTicketCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      eventId,
      data,
    }: {
      id: string;
      eventId: string;
      data: Partial<TicketCategory>;
    }) => {
      return await apiService.updateTicketCategory(id, data);
    },
    onSuccess: (response, variables) => {
      // Invalidate specific ticket category detail
      queryClient.invalidateQueries({ queryKey: ticketCategoryKeys.detail(variables.id) });
      
      // Invalidate ticket categories list for this event
      if (variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ticketCategoryKeys.list(variables.eventId) });
      }
      
      // Invalidate all ticket categories lists
      queryClient.invalidateQueries({ queryKey: ticketCategoryKeys.lists() });
    },
  });
}

/**
 * Delete ticket category
 */
export function useDeleteTicketCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiService.deleteTicketCategory(id);
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ticketCategoryKeys.detail(id) });
      
      // Invalidate all ticket categories lists
      queryClient.invalidateQueries({ queryKey: ticketCategoryKeys.lists() });
    },
  });
}

/**
 * Toggle ticket category status
 */
export function useToggleTicketCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiService.toggleTicketCategoryStatus(id);
    },
    onSuccess: (_, id) => {
      // Invalidate specific ticket category detail
      queryClient.invalidateQueries({ queryKey: ticketCategoryKeys.detail(id) });
      
      // Invalidate all ticket categories lists
      queryClient.invalidateQueries({ queryKey: ticketCategoryKeys.lists() });
    },
  });
}

