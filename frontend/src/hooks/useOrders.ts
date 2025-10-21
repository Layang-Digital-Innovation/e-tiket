import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { ApiResponse, CreateOrderRequest, CreateOrderResponse, Order } from '@/types';
import { eventKeys } from './useEvents';
import { toast } from 'sonner';

// Query Keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: { page?: number; limit?: number }) =>
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  byNumber: (orderNumber: string) => [...orderKeys.details(), 'number', orderNumber] as const,
};

/**
 * Get all orders
 */
export function useOrders(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: orderKeys.list(params || {}),
    queryFn: async () => {
      return await apiService.getOrders(params);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get order by ID
 */
export function useOrder(id: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const response = await apiService.getOrder(id);
      return (response as any).data as Order;
    },
    enabled: !!id && enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Get order by order number
 */
export function useOrderByNumber(orderNumber: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.byNumber(orderNumber),
    queryFn: async () => {
      const response = await apiService.getOrderByNumber(orderNumber);
      return (response as any).data as Order;
    },
    enabled: !!orderNumber && enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Create new order
 */
export function useCreateOrder(eventSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<CreateOrderResponse>, Error, CreateOrderRequest>({
    mutationFn: async (data: CreateOrderRequest) => {
      return await apiService.createOrder(data);
    },
    onSuccess: () => {
      toast.success('Pesanan berhasil dibuat!');
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      
      // Invalidate specific event detail if slug provided (for real-time availability updates)
      if (eventSlug) {
        queryClient.invalidateQueries({ 
          queryKey: ['events', 'detail', 'slug', eventSlug] 
        });
      }
    },
    onError: (error: any) => {
      toast.error(`Gagal membuat pesanan: ${error.message || 'Terjadi kesalahan'}`);
    },
  });
}
