export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  price: number;
  status: 'draft' | 'published' | 'cancelled';
  organizerId: string;
  organizer?: User;
  tickets?: Ticket[];
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  name: string;
  description: string;
  price: number;
  maxQuantity: number;
  soldQuantity: number;
  isActive: boolean;
  eventId: string;
  event?: Event;
  benefits?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  eventId: string;
  ticketId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  user?: User;
  event?: Event;
  ticket?: Ticket;
  createdAt: string;
  updatedAt: string;
}

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



export interface LoginResponse {
  user: User;
  token: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl?: string;
  termsAndConditions?: string;
}

export interface CreateTicketRequest {
  name: string;
  description: string;
  price: number;
  maxQuantity: number;
  eventId: string;
  benefits?: string[];
}

export interface CreatePurchaseRequest {
  eventId: string;
  tickets: {
    ticketId: string;
    quantity: number;
  }[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'event_organizer' | 'user';
}