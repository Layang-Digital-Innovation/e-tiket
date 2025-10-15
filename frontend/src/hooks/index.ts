/**
 * Central export file for all custom hooks
 * This provides a clean import path for components
 */

// Event hooks
export {
  useEvents,
  useMyEvents,
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  eventKeys,
} from './useEvents';

// Ticket hooks
export {
  useTickets,
  useCreateTicket,
  useUpdateTicket,
  useDeleteTicket,
  ticketKeys,
} from './useTickets';

// Purchase hooks
export {
  usePurchases,
  useCreatePurchase,
  purchaseKeys,
} from './usePurchases';
