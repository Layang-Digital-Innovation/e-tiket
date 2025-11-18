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
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
}

// Event Types
export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  eventType?: EventType;
  redeemStrategy?: RedeemStrategy;
  imageUrl?: string;
  basePrice?: number;
  termsAndConditions?: string;
  isActive: boolean;
  status?: 'published' | 'draft' | 'cancelled' ;
  organizerId: string;
  organizer?: EventOrganizer;
  ticketCategories?: TicketCategory[];
  createdAt: string;
  updatedAt: string;
}

// Event type and redeem strategy enums (frontend)
export enum EventType {
  CONCERT = 'CONCERT',
  RUNNING = 'RUNNING',
  SEMINAR = 'SEMINAR',
}

export enum RedeemStrategy {
  WRISTBAND = 'WRISTBAND',
  BIB = 'BIB',
  NONE = 'NONE',
}


// Ticket Category Types
export interface TicketCategory {
  id: string;
  name: string;
  description?: string;
  price: number;
  maxQuantity: number;
  sold: number;
  reserved: number;
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
  ticket?: TicketCategory;
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
  success: boolean;
  message?: string;
  data: T;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  statusCode?: number;
}

// Form Types
export interface CreateEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxCapacity: number;
  termsAndConditions?: string;
  eventType: EventType;
  redeemStrategy?: RedeemStrategy;
  deliveryMode: 'online' | 'onsite' | 'hybrid';
  webinarJoinUrl?: string;
  basePrice?: number;
  imageUrl?: string;
  status?: 'published' | 'draft' | 'cancelled' | 'completed';
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

// Order Types
  export interface AttendeeDetail {
  fullName: string;
  email: string;
  phoneNumber: string;
  identityType?: string;
  identityNumber?: string;
}

export interface OrderItem {
  categoryId: string;
  quantity: number;
  detailAtendee: AttendeeDetail[];
}

export interface CreateOrderRequest {
  buyerFullName: string;
  buyerEmail: string;
  buyerIdentityType?: string;
  buyerIdentityNumber?: string;
  buyerPhoneNumber: string;
  items: OrderItem[];
}

export interface CreateOrderResponse extends Order {
  paymentUrl: string;
}

// Legacy - for backward compatibility
export interface AttendeeData {
  name: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  address?:string;
  identityType?: string;
  identityNumber?: string;
  ticketCategoryId: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  eventId: string;
  event?: Event;
  userId?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'expired';
  paymentMethod?: string;
  paymentProof?: string;
  orderItems: OrderItemDetail[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface OrderItemDetail {
  id: string;
  ticketCategoryId: string;
  ticketCategory?: TicketCategory;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  order?: Order;
  attendees?: Attendee[];
}

export interface BuyerData {
  name: string;
  email: string;
  phone: string;
}

// Checkout State Types
export interface CheckoutState {
  eventId: string;
  eventSlug: string;
  selectedTickets: { [categoryId: string]: number };
  attendees: AttendeeData[];
  buyer: BuyerData;
  currentStep: 1 | 2 | 3;
}

// Redeem Types
export interface RedeemRequest {
  ticketCode: string;
  wristbandCode?: string; // Legacy compatibility
  itemCode?: string;
  eventId?: string;
  redeemStrategy?: string;
}

// Attendee Types
export interface Attendee {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  identityType?: string;
  identityNumber?: string;
  gender?: string;
  address?: string;
  birthDate?: string;
  ticket?: {
    ticketCode: string;
    status: string;
    category?: {
      id: string;
      name: string;
      eventId: string;
    };
  };
  orderItem?: {
    id: string;
    quantity: number;
    price: number;
  };
}

export interface RedeemResponse {
  message: string;
  ticketCode: string;
  wristbandCode: string;
  itemCode?: string; // For WRISTBAND/BIB strategies
}

// Check-in Types
export interface CheckInRequest {
  wristbandCode?: string; // Legacy compatibility
  itemCode?: string; // For WRISTBAND/BIB strategies
  ticketCode?: string; // For NONE strategy
}

export interface CheckInResponse {
  message: string;
  wristbandCode?: string; // Legacy compatibility
  itemCode?: string; // For WRISTBAND/BIB strategies
  ticketCode: string;
  checkedInAt: string;
}

// Wristband Types
export interface Wristband {
  id: string;
  wristbandCode: string;
  status: 'unused' | 'assigned' | 'checked_in';
  assignedAt?: string;
  checkedInAt?: string;
  assignedTicket?: Ticket;
  event?: Event;
  category?: TicketCategory;
  createdAt: string;
  updatedAt: string;
}

// Ticket Types
export interface Ticket {
  id: string;
  ticketCode: string;
  status: 'unused' | 'redeemed' | 'checked_in';
  redeemedAt?: string;
  // Removed assignedWristband to prevent circular reference
  attendee?: Attendee;
  orderItem?: OrderItemDetail;
  createdAt: string;
  updatedAt: string;
}

// Payout Types
export type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
export type BankType = 'bca' | 'mandiri' | 'bni' | 'cimb' | 'permata' | 'other';

export interface Payout {
  id: string;
  organizerId: string;
  organizer?: User;
  eventId?: string;
  event?: Event;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  status: PayoutStatus;
  bankAccountName: string;
  bankAccountNumber: string;
  bankType: BankType;
  bankBranch?: string;
  notes?: string;
  rejectionReason?: string;
  referenceNumber?: string;
  approvedAt?: string;
  paidAt?: string;
  rejectedAt?: string;
  approvedById?: string;
  approvedBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayoutRequest {
  eventId?: string;
  netAmount: number;
  bankAccountName: string;
  bankAccountNumber: string;
  bankType: BankType;
  bankBranch?: string;
  notes?: string;
}

export interface ApprovePayoutRequest {
  notes?: string;
  referenceNumber?: string;
}

export interface RejectPayoutRequest {
  rejectionReason: string;
}