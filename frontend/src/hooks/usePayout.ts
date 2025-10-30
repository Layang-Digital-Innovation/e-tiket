import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { ApiResponse, Payout, PayoutStatus } from '@/types';

export function useOrganizerPayouts(organizerId: string, status?: PayoutStatus) {
  return useQuery({
    queryKey: ['payouts', organizerId, status],
    queryFn: () => apiService.getOrganizerPayouts(organizerId, status),
    enabled: !!organizerId,
  });
}

export function useAllPayouts(status?: PayoutStatus, organizerId?: string) {
  return useQuery({
    queryKey: ['payouts', 'all', status, organizerId],
    queryFn: () => apiService.getAllPayouts(status, organizerId),
  });
}

export function usePayoutDetail(payoutId: string) {
  return useQuery<ApiResponse<Payout>, Error>({
    queryKey: ['payout', payoutId],
    queryFn: () => apiService.getPayoutDetail(payoutId),
    enabled: !!payoutId,
  });
}

export function useCreatePayout() {
  const queryClient = useQueryClient();

  return useMutation<Payout, Error, any>({
    mutationFn: (data: any) => apiService.createPayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payout'] });
    },
  });
}

export function useApprovePayout() {
  const queryClient = useQueryClient();

  return useMutation<Payout, Error, { payoutId: string; data: any }>({
    mutationFn: ({ payoutId, data }: { payoutId: string; data: any }) =>
      apiService.approvePayout(payoutId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payout'] });
    },
  });
}

export function useRejectPayout() {
  const queryClient = useQueryClient();

  return useMutation<Payout, Error, { payoutId: string; data: any }>({
    mutationFn: ({ payoutId, data }: { payoutId: string; data: any }) =>
      apiService.rejectPayout(payoutId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payout'] });
    },
  });
}

export function useMarkPayoutAsPaid() {
  const queryClient = useQueryClient();

  return useMutation<Payout, Error, { payoutId: string; referenceNumber?: string }>({
    mutationFn: ({ payoutId, referenceNumber }: { payoutId: string; referenceNumber?: string }) =>
      apiService.markPayoutAsPaid(payoutId, referenceNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payout'] });
    },
  });
}

export function useCancelPayout() {
  const queryClient = useQueryClient();

  return useMutation<Payout, Error, string>({
    mutationFn: (payoutId: string) => apiService.cancelPayout(payoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payout'] });
    },
  });
}
