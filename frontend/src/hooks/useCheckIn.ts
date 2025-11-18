import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { CheckInRequest, CheckInResponse, Wristband } from '@/types';
import { toast } from 'sonner';

// Hook untuk check-in wristband
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation<CheckInResponse, Error, CheckInRequest>({
    mutationFn: async (data: CheckInRequest) => {
      const response = await apiService.checkIn(data);
      return response;
    },
    onSuccess: () => {
      toast.success('Check-in berhasil!');
      // Invalidate queries untuk refresh data
      queryClient.invalidateQueries({ queryKey: ['assignedWristbands'] });
      queryClient.invalidateQueries({ queryKey: ['redeemList'] });
    },
    onError: (error: any) => {
      toast.error(`Gagal check-in: ${error.message || 'Terjadi kesalahan'}`);
    },
  });
}

// Hook untuk get list assigned wristbands (yang bisa di-checkin)
// export function useAssignedWristbands() {
//   return useQuery<Wristband[], Error>({
//     queryKey: ['assignedWristbands'],
//     queryFn: async () => {
//       const response = await apiService.getAssignedWristbands();
//       console.log('🔍 Assigned Wristbands Response:', response);
//       console.log('🔍 Is Array?', Array.isArray(response));
//       // Ensure response is an array
//       return Array.isArray(response) ? response : [];
//     },
//   });
// }
