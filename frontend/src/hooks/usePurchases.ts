import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { TicketPurchase, PurchaseTicketRequest, PaginatedResponse } from '@/types';

// Query Keys
export const purchaseKeys = {
  all: ['purchases'] as const,
  lists: () => [...purchaseKeys.all, 'list'] as const,
  list: (filters: { page?: number; limit?: number }) =>
    [...purchaseKeys.lists(), filters] as const,
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Get user's purchases/orders
 */
export function usePurchases(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: purchaseKeys.list(params || {}),
    queryFn: async () => {
      const response = await apiService.getPurchases(params);
      return response as PaginatedResponse<TicketPurchase>;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create new purchase/order
 */
export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PurchaseTicketRequest) => {
      return await apiService.createPurchase(data);
    },
    onSuccess: () => {
      // Invalidate purchases list
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
      
      // Also invalidate tickets to update sold quantity
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      
      // Invalidate events to update capacity
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
