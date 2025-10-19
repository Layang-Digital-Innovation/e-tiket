import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { CheckInRequest, CheckInResponse, Wristband } from '@/types';

// Hook untuk check-in wristband
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation<CheckInResponse, Error, CheckInRequest>({
    mutationFn: async (data: CheckInRequest) => {
      const response = await apiService.checkIn(data);
      return response;
    },
    onSuccess: () => {
      // Invalidate queries untuk refresh data
      queryClient.invalidateQueries({ queryKey: ['assignedWristbands'] });
      queryClient.invalidateQueries({ queryKey: ['redeemList'] });
    },
  });
}

// Hook untuk get list assigned wristbands (yang bisa di-checkin)
export function useAssignedWristbands() {
  return useQuery<Wristband[], Error>({
    queryKey: ['assignedWristbands'],
    queryFn: async () => {
      const response = await apiService.getAssignedWristbands();
      return response;
    },
  });
}
