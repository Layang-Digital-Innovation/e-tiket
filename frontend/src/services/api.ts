import { ApiResponse, User, Event, CreateOrderRequest, CreateOrderResponse, CheckInResponse, Wristband, RedeemRequest, RedeemResponse, PaginatedResponse, Payout } from '@/types';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: AxiosRequestConfig = {
      url,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      withCredentials: true, // Important: Send cookies with requests
      ...options,
    };

    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        const errorMessage = axiosError.response?.data?.message || axiosError.message;
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  }

  // Events API
  async getEvents(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    return this.request(`/event${query ? `?${query}` : ''}`);
  }

  async getEvent(id: string) {
    return this.request(`/event/id/${id}`);
  }

  async getEventBySlug(slug: string) {
    return this.request(`/event/${slug}`);
  }

  async createEvent(eventData: any) {
    return this.request('/event', {
      method: 'POST',
      data: eventData,
    });
  }

  async updateEvent(id: string, eventData: any) {
    return this.request(`/event/id/${id}`, {
      method: 'PATCH',
      data: eventData,
    });
  }

  async deleteEvent(id: string) {
    return this.request(`/event/id/${id}`, {
      method: 'DELETE',
    });
  }

  // My Events (for event organizers)
  async getMyEvents(params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/event/my-events${query ? `?${query}` : ''}`);
  }

  // Dashboard API
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/organizer-dashboard/overview');
  }

  async getSalesChart(days: number = 7): Promise<any> {
    return this.request<any>(`/organizer-dashboard/sales?days=${days}`);
  }

  async getWeeklyRevenue(weeks: number = 4): Promise<any> {
    return this.request<any>(`/organizer-dashboard/revenue/weekly?weeks=${weeks}`);
  }

  // Tickets API
  async getTicketsCategoryByEventId(eventId: string) {
    return this.request(`/ticket-categories/event/${eventId}`);
  }

  async createTicketCategory(ticketData: any) {
    return this.request('/ticket-categories', {
      method: 'POST',
      data: ticketData,
    });
  }

  async updateTicketCategory(id: string, ticketData: any) {
    return this.request(`/ticket-categories/${id}`, {
      method: 'PATCH',
      data: ticketData,
    });
  }

  async deleteTicketCategory(id: string) {
    return this.request(`/ticket-categories/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTicketCategoryStatus(id: string) {
    return this.request(`/ticket-categories/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // Orders/Purchases API
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> {
    return this.request<ApiResponse<CreateOrderResponse>>('/order', {
      method: 'POST',
      data: orderData,
    });
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/order${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string) {
    return this.request(`/order/${id}`);
  }

  async getOrderByNumber(orderNumber: string) {
    return this.request(`/order/number/${orderNumber}`);
  }

  // Legacy - keep for backward compatibility
  async createPurchase(purchaseData: any) {
    return this.createOrder(purchaseData);
  }

  async getPurchases(params?: { page?: number; limit?: number }) {
    return this.getOrders(params);
  }

  // Auth API
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      data: credentials,
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName : string;
    lastName : string;
    phone : string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      data: userData,
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    console.log('🌐 API Service: Calling /auth/profile...');
    const response = await this.request<ApiResponse<User>>('/auth/profile');
    return response;
  }

  // Redeem API
  async redeemTicket(data: { 
    ticketCode: string; 
    wristbandCode?: string; 
    itemCode?: string;
    eventId?: string;
    redeemStrategy?: string;
  }): Promise<RedeemResponse> {
    return this.request<RedeemResponse>('/redeem', {
      method: 'POST',
      data,
    });
  }

  async getRedeemList(eventId: string): Promise<ApiResponse<Wristband[]>> {
    return this.request<ApiResponse<Wristband[]>>('/redeem/event/' + eventId);
  }

  async getRedeemById(id: string): Promise<ApiResponse<Wristband>> {
    return this.request<ApiResponse<Wristband>>(`/redeem/${id}`);
  }

  async generateRedeemItems(payload: { ticketCategoryId: string; quantity: number }): Promise<{ itemsGenerated: number } & any> {
    return this.request(`/redeem/generate-items`, {
      method: 'POST',
      data: payload,
    });
  }

  // Check-in API
  async checkIn(checkInData: { 
    wristbandCode?: string; // Legacy compatibility
    itemCode?: string; // For WRISTBAND/BIB strategies
    ticketCode?: string; // For NONE strategy
  }): Promise<CheckInResponse> {
    return this.request<CheckInResponse>('/check-in', {
      method: 'POST',
      data: checkInData,
    });
  }

  async getCheckInList(eventId: string): Promise<ApiResponse<Wristband[]>> {
    return this.request<ApiResponse<Wristband[]>>('/check-in/event/' + eventId);
  }

  async getCheckInListByEvent(eventId: string): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>(`/check-in/event/${eventId}`);
  }

  async getCheckInListByEventSlug(eventSlug: string): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>(`/check-in/event-slug/${eventSlug}`);
  }



  async getAllEvents(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) : Promise<PaginatedResponse<Event[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    
    const query = searchParams.toString();
    return this.request <PaginatedResponse<Event[]>>(`/event${query ? `?${query}` : ''}`);
  }

  async getAdminStats() {
    return this.request('/admin-dashboard/stats');
  }

  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }) : Promise<PaginatedResponse<User[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.role) searchParams.append('role', params.role);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    return this.request(`/admin-dashboard/users${query ? `?${query}` : ''}`);
  }

  // Payout API
  async getOrganizerPayouts(organizerId: string, status?: string) : Promise<PaginatedResponse<Payout[]>> {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    const query = searchParams.toString();
    return this.request<PaginatedResponse<Payout[]>>(`/payouts/organizer/${organizerId}${query ? `?${query}` : ''}`);
  }

  async getAllPayouts(status?: string, organizerId?: string) : Promise<PaginatedResponse<Payout[]>> {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    if (organizerId) searchParams.append('organizerId', organizerId);
    const query = searchParams.toString();
    return this.request<PaginatedResponse<Payout[]>>(`/payouts${query ? `?${query}` : ''}`);
  }

  async getPayoutDetail(payoutId: string) : Promise<ApiResponse<Payout>> {
    return this.request<ApiResponse<Payout>>(`/payouts/${payoutId}`);
  }

  async createPayout(payoutData: any): Promise<Payout> {
    return this.request<Payout>('/payouts', {
      method: 'POST',
      data: payoutData,
    });
  }

  async approvePayout(payoutId: string, approveData: any): Promise<Payout> {
    return this.request<Payout>(`/payouts/${payoutId}/approve`, {
      method: 'PATCH',
      data: approveData,
    });
  }

  async rejectPayout(payoutId: string, rejectData: any): Promise<Payout> {
    return this.request<Payout>(`/payouts/${payoutId}/reject`, {
      method: 'PATCH',
      data: rejectData,
    });
  }

  async markPayoutAsPaid(payoutId: string, referenceNumber?: string): Promise<Payout> {
    return this.request<Payout>(`/payouts/${payoutId}/mark-paid`, {
      method: 'PATCH',
      data: referenceNumber ? { referenceNumber } : {},
    });
  }

  async cancelPayout(payoutId: string): Promise<Payout> {
    return this.request<Payout>(`/payouts/${payoutId}/cancel`, {
      method: 'PATCH',
    });
  }

  // Attendees API (slug-based)
  async getAttendeesByEventSlug(eventSlug: string, status?: string): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    const query = searchParams.toString();
    return this.request<ApiResponse<any[]>>(`/attendees/event/${eventSlug}${query ? `?${query}` : ''}`);
  }

  async exportAttendeesBySlug(eventSlug: string, status?: string): Promise<void> {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    const query = searchParams.toString();
    
    const url = `${this.baseURL}/attendees/event/${eventSlug}/export${query ? `?${query}` : ''}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'text/csv',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `attendees-${eventSlug}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export attendees failed:', error);
      throw error;
    }
  }

  // Backward compatibility methods (deprecated)
  async getAttendeesByEvent(eventId: string, status?: string): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    const query = searchParams.toString();
    return this.request<ApiResponse<any[]>>(`/attendees/event-id/${eventId}${query ? `?${query}` : ''}`);
  }

  async exportAttendees(eventId: string, status?: string): Promise<void> {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    const query = searchParams.toString();
    
    const url = `${this.baseURL}/attendees/event-id/${eventId}/export${query ? `?${query}` : ''}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'text/csv',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `attendees-${eventId}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export attendees failed:', error);
      throw error;
    }
  }

  // Upload API
  async uploadImage(file: File): Promise<{ url: string; key: string }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use axios with withCredentials to send cookies automatically
      const response = await axios.post(`${this.baseURL}/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (!response.data.success || !response.data.data?.url) {
        throw new Error('Response tidak valid');
      }

      return response.data.data;
    } catch (error) {
      console.error('Upload image failed:', error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        const errorMessage = axiosError.response?.data?.message || axiosError.message;
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  }

  async deleteImage(key: string): Promise<void> {
    try {
      // Use axios with withCredentials to send cookies automatically
      await axios.delete(`${this.baseURL}/upload/${key}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Delete image failed:', error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        const errorMessage = axiosError.response?.data?.message || axiosError.message;
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;