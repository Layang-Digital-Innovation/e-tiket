import { ApiResponse, User, CreateOrderRequest, CreateOrderResponse, CheckInResponse, Wristband, RedeemRequest, RedeemResponse } from '@/types';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

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
    return this.request(`/api/event${query ? `?${query}` : ''}`);
  }

  async getEvent(id: string) {
    return this.request(`/api/event/id/${id}`);
  }

  async getEventBySlug(slug: string) {
    return this.request(`/api/event/${slug}`);
  }

  async createEvent(eventData: any) {
    return this.request('/api/event', {
      method: 'POST',
      data: eventData,
    });
  }

  async updateEvent(id: string, eventData: any) {
    return this.request(`/api/event/id/${id}`, {
      method: 'PATCH',
      data: eventData,
    });
  }

  async deleteEvent(id: string) {
    return this.request(`/api/event/id/${id}`, {
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
    return this.request(`/api/event/my-events${query ? `?${query}` : ''}`);
  }

  // Tickets API
  async getTicketsCategoryByEventId(eventId: string) {
    return this.request(`/api/ticket-categories/event/${eventId}`);
  }

  async createTicketCategory(ticketData: any) {
    return this.request('/api/ticket-categories', {
      method: 'POST',
      data: ticketData,
    });
  }

  async updateTicketCategory(id: string, ticketData: any) {
    return this.request(`/api/ticket-categories/${id}`, {
      method: 'PATCH',
      data: ticketData,
    });
  }

  async deleteTicketCategory(id: string) {
    return this.request(`/api/ticket-categories/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTicketCategoryStatus(id: string) {
    return this.request(`/api/ticket-categories/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // Orders/Purchases API
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> {
    return this.request<ApiResponse<CreateOrderResponse>>('/api/order', {
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
    return this.request(`/api/order${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string) {
    return this.request(`/api/order/${id}`);
  }

  async getOrderByNumber(orderNumber: string) {
    return this.request(`/api/order/number/${orderNumber}`);
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
    return this.request('/api/auth/login', {
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
    return this.request('/api/auth/register', {
      method: 'POST',
      data: userData,
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    console.log('🌐 API Service: Calling /api/auth/profile...');
    const response = await this.request<ApiResponse<User>>('/api/auth/profile');
    console.log('📥 API Service: Profile response received:', response);
    return response;
  }

  // Redeem API
  async redeemTicket(redeemData: RedeemRequest): Promise<RedeemResponse> {
    return this.request<RedeemResponse>('/api/redeem', {
      method: 'POST',
      data: redeemData,
    });
  }

  async getRedeemList(): Promise<Wristband[]> {
    return this.request<Wristband[]>('/api/redeem');
  }

  async getRedeemById(id: string): Promise<Wristband> {
    return this.request<Wristband>(`/api/redeem/${id}`);
  }

  // Check-in API
  async checkIn(checkInData: { wristbandCode: string }): Promise<CheckInResponse> {
    return this.request<CheckInResponse>('/api/check-in', {
      method: 'POST',
      data: checkInData,
    });
  }

  async getAssignedWristbands(): Promise<Wristband[]> {
    return this.request<Wristband[]>('/api/check-in');
  }
}

export const apiService = new ApiService();
export default apiService;