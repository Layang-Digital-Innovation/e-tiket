import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { ApiResponse, Event } from '@/types';


export interface DashboardStats {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  activeEvents: number;
}



export interface SalesData {
  date: string;
  sales: number;
  revenue: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentEvents: Event[];
  salesChart: SalesData[];
}

// Hook untuk get dashboard stats
export function useDashboardStats() {
  return useQuery<ApiResponse<DashboardStats>, Error, DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await apiService.getDashboardStats();
      console.log('📊 Dashboard Stats Response:', response);
      return response.data;
    },
  });
}

// Hook untuk get recent events
export function useRecentEvents(limit: number = 5) {
  return useQuery<Event[], Error>({
    queryKey: ['recentEvents', limit],
    queryFn: async () => {
      const response: any = await apiService.getMyEvents({ limit });
      console.log('📋 Recent Events Response:', response);
      // Extract events from paginated response
      if (Array.isArray(response?.data)) {
        return response.data as Event[];
      }
      return [];
    },
  });
}

// Hook untuk get sales chart data
export function useSalesChart(days: number = 7) {
  return useQuery<SalesData[], Error>({
    queryKey: ['salesChart', days],
    queryFn: async () => {
      const response = await apiService.getSalesChart(days);
      console.log('📈 Sales Chart Response:', response);
      return Array.isArray(response) ? (response as SalesData[]) : [];
    },
  });
}

// Hook untuk get weekly revenue data
export function useWeeklyRevenue(weeks: number = 4) {
  return useQuery<{ week: string; revenue: number }[], Error>({
    queryKey: ['weeklyRevenue', weeks],
    queryFn: async () => {
      const response = await apiService.getWeeklyRevenue(weeks);
      console.log('📊 Weekly Revenue Response:', response);
      return Array.isArray(response) ? response : [];
    },
  });
}

// Hook untuk get complete dashboard data
export function useDashboard() {
  const stats = useDashboardStats();
  const recentEvents = useRecentEvents(5);
  const salesChart = useSalesChart(7);

  return {
    stats: stats.data,
    recentEvents: recentEvents.data || [],
    salesChart: salesChart.data || [],
    isLoading: stats.isLoading || recentEvents.isLoading || salesChart.isLoading,
    isError: stats.isError || recentEvents.isError || salesChart.isError,
    error: stats.error || recentEvents.error || salesChart.error,
  };
}
