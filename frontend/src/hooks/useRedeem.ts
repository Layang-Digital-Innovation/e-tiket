import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { ApiResponse, RedeemRequest, RedeemResponse, Wristband } from '@/types';
import { toast } from 'sonner';

// Hook untuk redeem ticket
export function useRedeemTicket() {
  const queryClient = useQueryClient();

  return useMutation<RedeemResponse, Error, RedeemRequest>({
    mutationFn: async (data: RedeemRequest) => {
      const response = await apiService.redeemTicket(data);
      return response;
    },
    onSuccess: () => {
      toast.success('Tiket berhasil diredeem!');
      // Invalidate queries untuk refresh data
      queryClient.invalidateQueries({ queryKey: ['redeemList'] });
      queryClient.invalidateQueries({ queryKey: ['assignedWristbands'] });
    },
    onError: (error: any) => {
      toast.error(`Gagal redeem tiket: ${error.message || 'Terjadi kesalahan'}`);
    },
  });
}

// Hook untuk get list redeem (wristband yang sudah assigned)
export function useRedeemList(eventId: string) {
  return useQuery({
    queryKey: ['redeemList', eventId],
    queryFn: async () => {
      const response = await apiService.getRedeemList(eventId);
      return response;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

// Hook untuk get redeem by ID
export function useRedeemById(id: string) {
  return useQuery({
    queryKey: ['redeem', id],
    queryFn: async () => {
      const response = await apiService.getRedeemById(id);
      return response;
    },
    enabled: !!id,
  });
}
