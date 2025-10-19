import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { RedeemRequest, RedeemResponse, Wristband } from '@/types';

// Hook untuk redeem ticket
export function useRedeemTicket() {
  const queryClient = useQueryClient();

  return useMutation<RedeemResponse, Error, RedeemRequest>({
    mutationFn: async (data: RedeemRequest) => {
      const response = await apiService.redeemTicket(data);
      return response;
    },
    onSuccess: () => {
      // Invalidate queries untuk refresh data
      queryClient.invalidateQueries({ queryKey: ['redeemList'] });
      queryClient.invalidateQueries({ queryKey: ['assignedWristbands'] });
    },
  });
}

// Hook untuk get list redeem (wristband yang sudah assigned)
export function useRedeemList() {
  return useQuery<Wristband[], Error>({
    queryKey: ['redeemList'],
    queryFn: async () => {
      const response = await apiService.getRedeemList();
      console.log('🔍 Redeem List Response:', response);
      console.log('🔍 Is Array?', Array.isArray(response));
      // Ensure response is an array
      return Array.isArray(response) ? response : [];
    },
  });
}

// Hook untuk get redeem by ID
export function useRedeemById(id: string) {
  return useQuery<Wristband, Error>({
    queryKey: ['redeem', id],
    queryFn: async () => {
      const response = await apiService.getRedeemById(id);
      return response;
    },
    enabled: !!id,
  });
}
