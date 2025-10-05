const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
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
    return this.request(`/events${query ? `?${query}` : ''}`);
  }

  async getEvent(id: string) {
    return this.request(`/events/${id}`);
  }

  async createEvent(eventData: any) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: any) {
    return this.request(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string) {
    return this.request(`/events/${id}`, {
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
    return this.request(`/events/my-events${query ? `?${query}` : ''}`);
  }

  // Tickets API
  async getTickets(eventId: string) {
    return this.request(`/tickets?eventId=${eventId}`);
  }

  async createTicket(ticketData: any) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateTicket(id: string, ticketData: any) {
    return this.request(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(ticketData),
    });
  }

  async deleteTicket(id: string) {
    return this.request(`/tickets/${id}`, {
      method: 'DELETE',
    });
  }

  // Purchases API
  async createPurchase(purchaseData: any) {
    return this.request('/purchases', {
      method: 'POST',
      body: JSON.stringify(purchaseData),
    });
  }

  async getPurchases(params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/purchases${query ? `?${query}` : ''}`);
  }

  // Auth API
  async login(credentials: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    localStorage.removeItem('authToken');
    return Promise.resolve();
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }
}

export const apiService = new ApiService();
export default apiService;