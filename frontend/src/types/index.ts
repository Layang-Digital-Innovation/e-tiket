// Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  role: 'admin' | 'event_organizer' | 'user';
  status?: 'active' | 'inactive' | 'suspended';
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Event Organizer Types
export interface EventOrganizer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxCapacity: number;
  currentCapacity: number;
  capacity: number; // Alias for maxCapacity
  price: number;
  isActive: boolean;
  status?: 'published' | 'draft' | 'cancelled';
  organizerId: string;
  organizer?: EventOrganizer;
  tickets?: Ticket[];
  ticketsCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Ticket Types
export interface Ticket {
  id: string;
  name: string;
  description?: string;
  price: number;
  maxQuantity: number;
  soldQuantity: number;
  isActive: boolean;
  eventId?: string;
  event?: Event;
  createdAt: string;
  updatedAt: string;
}

export interface TicketPurchase {
  id: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  ticketId: string;
  ticket?: Ticket;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface CreateEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxCapacity: number;
  price: number;
}

export interface CreateTicketRequest {
  name: string;
  description?: string;
  price: number;
  maxQuantity: number;
  eventId?: string;
}

export interface PurchaseTicketRequest {
  ticketId: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}