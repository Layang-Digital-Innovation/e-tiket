# React Query Hooks Documentation

Clean and organized custom hooks for data fetching and mutations using TanStack Query (React Query).

## 📁 Structure

```
hooks/
├── index.ts           # Central export file
├── useEvents.ts       # Event-related hooks
├── useTickets.ts      # Ticket-related hooks
├── usePurchases.ts    # Purchase/Order hooks
└── README.md          # This file
```

## 🎯 Features

- ✅ **Type-safe** - Full TypeScript support
- ✅ **Optimized caching** - Smart cache invalidation
- ✅ **Auto-refetch** - Stale data management
- ✅ **Loading & error states** - Built-in state management
- ✅ **Optimistic updates** - Instant UI feedback
- ✅ **Clean API** - Simple and intuitive

## 📚 Usage Examples

### Events

#### Get All Events (Public)
```tsx
import { useEvents } from '@/hooks';

function EventsList() {
  const { data, isLoading, error } = useEvents({
    page: 1,
    limit: 10,
    status: 'published'
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

#### Get My Events (Organizer)
```tsx
import { useMyEvents } from '@/hooks';

function MyEventsList() {
  const { data, isLoading, error, refetch } = useMyEvents({
    page: 1,
    limit: 20
  });

  const events = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

#### Get Event Detail
```tsx
import { useEvent } from '@/hooks';

function EventDetail({ eventId }: { eventId: string }) {
  const { data: event, isLoading, error } = useEvent(eventId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
    </div>
  );
}
```

#### Create Event
```tsx
import { useCreateEvent } from '@/hooks';
import { toast } from 'sonner';

function CreateEventForm() {
  const createEvent = useCreateEvent();

  const handleSubmit = async (data: CreateEventRequest) => {
    try {
      await createEvent.mutateAsync(data);
      toast.success('Event created successfully!');
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={createEvent.isPending}
      >
        {createEvent.isPending ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}
```

#### Update Event
```tsx
import { useUpdateEvent } from '@/hooks';

function EditEventForm({ eventId }: { eventId: string }) {
  const updateEvent = useUpdateEvent();

  const handleUpdate = async (data: Partial<Event>) => {
    await updateEvent.mutateAsync({ id: eventId, data });
  };

  return (
    <button 
      onClick={() => handleUpdate({ title: 'New Title' })}
      disabled={updateEvent.isPending}
    >
      Update Event
    </button>
  );
}
```

#### Delete Event
```tsx
import { useDeleteEvent } from '@/hooks';

function DeleteEventButton({ eventId }: { eventId: string }) {
  const deleteEvent = useDeleteEvent();

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      await deleteEvent.mutateAsync(eventId);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={deleteEvent.isPending}
    >
      {deleteEvent.isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

### Tickets

#### Get Tickets by Event
```tsx
import { useTickets } from '@/hooks';

function TicketsList({ eventId }: { eventId: string }) {
  const { data: tickets, isLoading } = useTickets(eventId);

  if (isLoading) return <div>Loading tickets...</div>;

  return (
    <div>
      {tickets?.map(ticket => (
        <div key={ticket.id}>
          <h3>{ticket.name}</h3>
          <p>Price: Rp {ticket.price.toLocaleString()}</p>
          <p>Available: {ticket.maxQuantity - ticket.soldQuantity}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Create Ticket
```tsx
import { useCreateTicket } from '@/hooks';

function CreateTicketForm({ eventId }: { eventId: string }) {
  const createTicket = useCreateTicket();

  const handleSubmit = async (data: CreateTicketRequest) => {
    await createTicket.mutateAsync({
      ...data,
      eventId
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### Update Ticket
```tsx
import { useUpdateTicket } from '@/hooks';

function EditTicketForm({ ticketId }: { ticketId: string }) {
  const updateTicket = useUpdateTicket();

  const handleUpdate = async (data: Partial<Ticket>) => {
    await updateTicket.mutateAsync({ id: ticketId, data });
  };

  return (
    <button onClick={() => handleUpdate({ price: 100000 })}>
      Update Price
    </button>
  );
}
```

#### Delete Ticket
```tsx
import { useDeleteTicket } from '@/hooks';

function DeleteTicketButton({ ticketId }: { ticketId: string }) {
  const deleteTicket = useDeleteTicket();

  return (
    <button onClick={() => deleteTicket.mutate(ticketId)}>
      Delete Ticket
    </button>
  );
}
```

### Purchases

#### Get User Purchases
```tsx
import { usePurchases } from '@/hooks';

function MyPurchases() {
  const { data, isLoading } = usePurchases({ page: 1, limit: 10 });

  const purchases = data?.data || [];

  return (
    <div>
      {purchases.map(purchase => (
        <div key={purchase.id}>
          <p>Order #{purchase.id}</p>
          <p>Total: Rp {purchase.totalPrice.toLocaleString()}</p>
          <p>Status: {purchase.status}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Create Purchase
```tsx
import { useCreatePurchase } from '@/hooks';

function BuyTicketButton({ ticketId }: { ticketId: string }) {
  const createPurchase = useCreatePurchase();

  const handlePurchase = async () => {
    await createPurchase.mutateAsync({
      ticketId,
      quantity: 1,
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '081234567890'
    });
  };

  return (
    <button 
      onClick={handlePurchase}
      disabled={createPurchase.isPending}
    >
      {createPurchase.isPending ? 'Processing...' : 'Buy Ticket'}
    </button>
  );
}
```

## 🔧 Advanced Usage

### Manual Cache Invalidation
```tsx
import { useQueryClient } from '@tanstack/react-query';
import { eventKeys } from '@/hooks';

function RefreshButton() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    // Invalidate all events
    queryClient.invalidateQueries({ queryKey: eventKeys.all });
    
    // Invalidate specific event
    queryClient.invalidateQueries({ queryKey: eventKeys.detail('event-id') });
    
    // Invalidate my events
    queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });
  };

  return <button onClick={handleRefresh}>Refresh</button>;
}
```

### Optimistic Updates
```tsx
import { useUpdateEvent } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { eventKeys } from '@/hooks';

function OptimisticUpdate({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const updateEvent = useUpdateEvent();

  const handleUpdate = async (newTitle: string) => {
    // Optimistically update the UI
    queryClient.setQueryData(
      eventKeys.detail(eventId),
      (old: Event) => ({ ...old, title: newTitle })
    );

    try {
      await updateEvent.mutateAsync({ 
        id: eventId, 
        data: { title: newTitle } 
      });
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    }
  };

  return <button onClick={() => handleUpdate('New Title')}>Update</button>;
}
```

### Conditional Fetching
```tsx
import { useEvent } from '@/hooks';

function ConditionalFetch({ eventId, shouldFetch }: { 
  eventId: string; 
  shouldFetch: boolean;
}) {
  // Only fetch when shouldFetch is true
  const { data, isLoading } = useEvent(eventId, shouldFetch);

  if (!shouldFetch) return <div>Not fetching</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>{data?.title}</div>;
}
```

### Dependent Queries
```tsx
import { useEvent, useTickets } from '@/hooks';

function EventWithTickets({ eventId }: { eventId: string }) {
  // Fetch event first
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  
  // Fetch tickets only after event is loaded
  const { data: tickets, isLoading: ticketsLoading } = useTickets(
    eventId,
    !!event // Only fetch if event exists
  );

  if (eventLoading) return <div>Loading event...</div>;
  if (ticketsLoading) return <div>Loading tickets...</div>;

  return (
    <div>
      <h1>{event?.title}</h1>
      <div>
        {tickets?.map(ticket => (
          <div key={ticket.id}>{ticket.name}</div>
        ))}
      </div>
    </div>
  );
}
```

## ⚙️ Cache Configuration

### Stale Time
- **Events (public)**: 5 minutes
- **My Events**: 2 minutes
- **Event Detail**: 5 minutes
- **Tickets**: 3 minutes
- **Purchases**: 2 minutes

### Garbage Collection Time
- All queries: 10 minutes

### Why These Times?
- **Public events** change less frequently → longer stale time
- **My events** may be edited often → shorter stale time
- **Tickets** availability changes with purchases → medium stale time
- **Purchases** are user-specific and important → shorter stale time

## 🎨 Best Practices

### 1. Always Handle Loading & Error States
```tsx
const { data, isLoading, error } = useEvents();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <EventsList events={data.data} />;
```

### 2. Use Mutations with Try-Catch
```tsx
const createEvent = useCreateEvent();

const handleCreate = async (data: CreateEventRequest) => {
  try {
    await createEvent.mutateAsync(data);
    toast.success('Success!');
    router.push('/events');
  } catch (error) {
    toast.error('Failed to create event');
    console.error(error);
  }
};
```

### 3. Disable Buttons During Mutations
```tsx
<button 
  onClick={handleDelete}
  disabled={deleteEvent.isPending}
>
  {deleteEvent.isPending ? 'Deleting...' : 'Delete'}
</button>
```

### 4. Use Query Keys for Manual Invalidation
```tsx
import { eventKeys } from '@/hooks';

// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });
```

### 5. Leverage Automatic Refetching
```tsx
// React Query automatically refetches on:
// - Window focus
// - Network reconnection
// - Stale time expiration
// - Manual invalidation

// You can customize this behavior:
const { data } = useEvents({}, {
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  staleTime: 10 * 60 * 1000, // 10 minutes
});
```

## 🔍 Debugging

### Enable DevTools
```tsx
// In your app layout or main component
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

### Log Query States
```tsx
const query = useEvents();

console.log({
  isLoading: query.isLoading,
  isFetching: query.isFetching,
  isError: query.isError,
  isSuccess: query.isSuccess,
  data: query.data,
  error: query.error,
});
```

## 📝 Type Definitions

All hooks are fully typed with TypeScript. Import types from `@/types`:

```tsx
import type { 
  Event, 
  Ticket, 
  TicketPurchase,
  CreateEventRequest,
  CreateTicketRequest,
  PurchaseTicketRequest,
  PaginatedResponse,
  ApiResponse
} from '@/types';
```

## 🚀 Performance Tips

1. **Use pagination** - Don't fetch all data at once
2. **Enable stale-while-revalidate** - Show cached data while fetching fresh data
3. **Prefetch data** - Load data before user needs it
4. **Use suspense** - Better loading UX (React 18+)
5. **Optimize re-renders** - Use React.memo and useMemo when needed

## 📦 Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `axios` - HTTP client (via apiService)

## 🤝 Contributing

When adding new hooks:
1. Follow the existing pattern
2. Add proper TypeScript types
3. Include JSDoc comments
4. Update this README
5. Add cache invalidation logic
6. Export from `index.ts`

---

**Happy coding!** 🎉
