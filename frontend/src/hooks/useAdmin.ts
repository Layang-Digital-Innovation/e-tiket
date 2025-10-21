import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

// Admin Dashboard Types
export interface AdminStats {
  totalUsers: number;
  totalEventOrganizers: number;
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  activeEvents: number;
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'event_created' | 'tickets_sold' | 'payment_received';
  message: string;
  timestamp: string;
  metadata?: any;
}

// Hook untuk get admin stats
export function useAdminStats() {
  return useQuery<AdminStats, Error>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      // For now, we'll simulate the data since the backend endpoints might not exist yet
      // In a real implementation, this would call an admin stats API endpoint
      return {
        totalUsers: 245,
        totalEventOrganizers: 12,
        totalEvents: 45,
        totalTicketsSold: 1234,
        totalRevenue: 45678000,
        activeEvents: 8,
      };
    },
  });
}

// Hook untuk get recent activities
export function useRecentActivities(limit: number = 10) {
  return useQuery<RecentActivity[], Error>({
    queryKey: ['recentActivities', limit],
    queryFn: async () => {
      // Simulated data - in real implementation, this would call an API
      return [
        {
          id: '1',
          type: 'user_registration',
          message: 'Event Organizer baru terdaftar: PT. Event Keren',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          metadata: { organizerName: 'PT. Event Keren' }
        },
        {
          id: '2',
          type: 'event_created',
          message: 'Event baru dibuat: Konser Musik Jazz',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          metadata: { eventName: 'Konser Musik Jazz' }
        },
        {
          id: '3',
          type: 'tickets_sold',
          message: '100 tiket terjual untuk event: Workshop Digital Marketing',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          metadata: { eventName: 'Workshop Digital Marketing', ticketsSold: 100 }
        },
        {
          id: '4',
          type: 'payment_received',
          message: 'Pembayaran diterima: Rp 2.500.000 untuk event Seminar Teknologi',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
          metadata: { eventName: 'Seminar Teknologi', amount: 2500000 }
        },
        {
          id: '5',
          type: 'user_registration',
          message: 'User baru terdaftar: john.doe@example.com',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          metadata: { email: 'john.doe@example.com' }
        },
      ];
    },
  });
}

// Hook untuk get all users (admin only)
export function useAllUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
}) {
  return useQuery({
    queryKey: ['allUsers', params],
    queryFn: async () => {
      return apiService.getAllUsers(params);
    },
    enabled: !!params, // Only run if params are provided
  });
}

// Hook untuk get all events (admin only)
export function useAllEvents(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ['allEvents', params],
    queryFn: async () => {
      return apiService.getAllEvents(params);
    },
  });
}

// Combined admin dashboard hook
export function useAdminDashboard() {
  const stats = useAdminStats();
  const activities = useRecentActivities(10);

  return {
    stats: stats.data,
    recentActivities: activities.data || [],
    isLoading: stats.isLoading || activities.isLoading,
    isError: stats.isError || activities.isError,
    error: stats.error || activities.error,
  };
}
