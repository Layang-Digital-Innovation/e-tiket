# 🗺️ Feature Mapping & Rendering Strategy

## 📋 Complete Feature Map

### 🎯 User Roles & Access

```
┌─────────────────────────────────────────────────────────────┐
│                        USER ROLES                            │
├─────────────────────────────────────────────────────────────┤
│ 1. Public (Guest)        - Browse & purchase tickets        │
│ 2. User (Authenticated)  - Manage purchases & profile       │
│ 3. Event Organizer       - Create & manage events           │
│ 4. Admin                 - Full system management           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 PUBLIC FEATURES (Guest Users)

### 1. **Landing Page** (`/`)
**Current Status**: ✅ Exists  
**Rendering Strategy**: **Static Site Generation (SSG)**

```typescript
// app/page.tsx
export default function Home() {
  // Static content, no user-specific data
  return <PublicLayout>...</PublicLayout>
}
```

**Why SSG?**
- ✅ Content rarely changes
- ✅ Best SEO performance
- ✅ Fastest page load
- ✅ Can be cached at CDN level

**Implementation**:
```typescript
// No changes needed - already static by default
export const revalidate = 3600; // Revalidate every hour (optional)
```

---

### 2. **Event Listing Page** (`/events`)
**Current Status**: ❌ Not Created  
**Rendering Strategy**: **Server-Side Rendering (SSR) with Client Hydration**

```typescript
// app/events/page.tsx
import { EventList } from '@/components/events/EventList';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string; search?: string };
}) {
  // Server-side data fetching
  const initialData = await fetch(`${API_URL}/events?${params}`).then(r => r.json());
  
  return (
    <PublicLayout>
      <EventList initialData={initialData} />
    </PublicLayout>
  );
}
```

**Why SSR?**
- ✅ SEO-friendly (search engines see content)
- ✅ Fast initial load with data
- ✅ Dynamic filtering/search
- ✅ Can show real-time availability

**Client Component** (for interactivity):
```typescript
'use client';

export function EventList({ initialData }) {
  const { data, isLoading } = useEvents({
    initialData, // Use server data first
    refetchOnMount: false, // Don't refetch immediately
  });
  
  return <div>...</div>;
}
```

---

### 3. **Event Detail Page** (`/events/[id]`)
**Current Status**: ✅ Exists (`/event/[slug]`)  
**Rendering Strategy**: **SSR + ISR (Incremental Static Regeneration)**

```typescript
// app/events/[id]/page.tsx
export const revalidate = 300; // Revalidate every 5 minutes

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await fetch(`${API_URL}/events/${params.id}`).then(r => r.json());
  
  return (
    <PublicLayout>
      <EventDetail event={event} />
      <TicketSelector eventId={params.id} /> {/* Client component */}
    </PublicLayout>
  );
}

// Generate static paths for popular events
export async function generateStaticParams() {
  const events = await fetch(`${API_URL}/events?limit=100`).then(r => r.json());
  return events.data.map((event) => ({ id: event.id }));
}
```

**Why SSR + ISR?**
- ✅ SEO-friendly
- ✅ Fast initial load
- ✅ Auto-regenerates when stale
- ✅ Popular events are pre-rendered

---

### 4. **Ticket Purchase Flow** (`/events/[id]/purchase`)
**Current Status**: ❌ Not Created  
**Rendering Strategy**: **Client-Side Rendering (CSR)**

```typescript
'use client';

export default function PurchasePage({ params }: { params: { id: string } }) {
  const { data: event } = useEvent(params.id);
  const { data: tickets } = useTickets(params.id);
  const createPurchase = useCreatePurchase();
  
  return (
    <CheckoutForm 
      event={event}
      tickets={tickets}
      onSubmit={createPurchase.mutateAsync}
    />
  );
}
```

**Why CSR?**
- ✅ Highly interactive
- ✅ Real-time validation
- ✅ Payment processing
- ✅ No SEO needed (checkout page)

---

## 👤 AUTHENTICATED USER FEATURES

### 5. **Login Page** (`/login`)
**Current Status**: ✅ Exists  
**Rendering Strategy**: **CSR**

```typescript
'use client';

export default function LoginPage() {
  const login = useAuthStore(state => state.login);
  
  return <LoginForm onSubmit={login} />;
}
```

**Why CSR?**
- ✅ Form interactivity
- ✅ OAuth redirects
- ✅ No SEO needed

---

### 6. **Register Page** (`/register`)
**Current Status**: ✅ Exists  
**Rendering Strategy**: **CSR**

---

### 7. **User Dashboard** (`/dashboard`)
**Current Status**: ❌ Not Created  
**Rendering Strategy**: **CSR with Authentication**

```typescript
'use client';

export default function UserDashboard() {
  const user = useAuthStore(state => state.user);
  const { data: purchases } = usePurchases();
  const { data: upcomingEvents } = useUserUpcomingEvents();
  
  if (!user) return <Navigate to="/login" />;
  
  return (
    <DashboardLayout>
      <PurchaseHistory purchases={purchases} />
      <UpcomingEvents events={upcomingEvents} />
    </DashboardLayout>
  );
}
```

**Why CSR?**
- ✅ User-specific data
- ✅ Real-time updates
- ✅ Protected route
- ✅ No SEO needed

---

### 8. **My Tickets** (`/my-tickets`)
**Current Status**: ❌ Not Created  
**Rendering Strategy**: **CSR**

```typescript
'use client';

export default function MyTicketsPage() {
  const { data: tickets } = useMyTickets();
  
  return (
    <UserLayout>
      <TicketList tickets={tickets} />
      <QRCodeDisplay />
    </UserLayout>
  );
}
```

---

### 9. **Order History** (`/orders`)
**Current Status**: ❌ Not Created  
**Rendering Strategy**: **CSR**

---

## 🎪 EVENT ORGANIZER FEATURES

### 10. **Organizer Dashboard** (`/organizer/dashboard`)
**Current Status**: ✅ Exists  
**Rendering Strategy**: **CSR with Role-Based Access**

```typescript
'use client';

export default function OrganizerDashboard() {
  const { data: stats } = useOrganizerStats();
  const { data: recentOrders } = useRecentOrders();
  
  return (
    <OrganizerLayout>
      <StatsCards stats={stats} />
      <RecentOrdersTable orders={recentOrders} />
      <RevenueChart />
    </OrganizerLayout>
  );
}
```

**Why CSR?**
- ✅ Real-time analytics
- ✅ Protected route
- ✅ Role-based access
- ✅ Frequent updates

---

### 11. **My Events** (`/organizer/events`)
**Current Status**: ✅ Exists (Refactored with React Query)  
**Rendering Strategy**: **CSR with Optimistic Updates**

```typescript
'use client';

export default function MyEventsPage() {
  const { data, isLoading } = useMyEvents({ page: 1, limit: 20 });
  const deleteEvent = useDeleteEvent();
  
  return (
    <OrganizerLayout>
      <EventList 
        events={data?.data}
        onDelete={deleteEvent.mutateAsync}
      />
    </OrganizerLayout>
  );
}
```

**Current Implementation**: ✅ Already optimal!

---

### 12. **Create Event** (`/organizer/events/create`)
**Current Status**: ✅ Exists  
**Rendering Strategy**: **CSR**

```typescript
'use client';

export default function CreateEventPage() {
  const createEvent = useCreateEvent();
  const router = useRouter();
  
  const handleSubmit = async (data: CreateEventRequest) => {
    const result = await createEvent.mutateAsync(data);
    router.push(`/organizer/events/${result.data.id}`);
  };
  
  return (
    <OrganizerLayout>
      <EventForm onSubmit={handleSubmit} />
    </OrganizerLayout>
  );
}
```

---

### 13. **Edit Event** (`/organizer/events/[id]/edit`)
**Current Status**: ❌ Not Created  
**Rendering Strategy**: **CSR with Prefetch**

```typescript
'use client';

export default function EditEventPage({ params }: { params: { id: string } }) {
  const { data: event, isLoading } = useEvent(params.id);
  const updateEvent = useUpdateEvent();
  
  if (isLoading) return <LoadingSkeleton />;
  
  return (
    <OrganizerLayout>
      <EventForm 
        initialData={event}
        onSubmit={(data) => updateEvent.mutateAsync({ id: params.id, data })}
      />
    </OrganizerLayout>
  );
}
```

---

### 14. **Event Detail** (`/organizer/events/[id]`)
**Current Status**: ✅ Exists  
**Rendering Strategy**: **CSR**

---

### 15. **Manage Tickets** (`/organizer/events/[id]/tickets`)
**Current Status**: ✅ Exists  
**Rendering Strategy**: **CSR**

```typescript
'use client';

export default function ManageTicketsPage({ params }: { params: { id: string } }) {
  const { data: tickets } = useTickets(params.id);
  const createTicket = useCreateTicket();
  const deleteTicket = useDeleteTicket();
  
  return (
    <OrganizerLayout>
      <TicketList 
        tickets={tickets}
        onCreate={createTicket.mutateAsync}
        onDelete={deleteTicket.mutateAsync}
      />
    </OrganizerLayout>
  );
}
```

---

### 16. **Event Analytics** (`/organizer/events/[id]/analytics`)
**Current Status**: ❌ Not Created  
**Rendering Strategy**: **CSR with Real-time Updates**

```typescript
'use client';

export default function EventAnalyticsPage({ params }: { params: { id: string } }) {
  const { data: analytics } = useEventAnalytics(params.id, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  return (
    <OrganizerLayout>
      <SalesChart data={analytics?.sales} />
      <AttendeeStats data={analytics?.attendees} />
      <RevenueBreakdown data={analytics?.revenue} />
    </OrganizerLayout>
  );
}
```

---

### 17. **Check-in Management** (`/organizer/events/[id]/checkin`)
**Current Status**: ❌ Not Created  
**Rendering Strategy**: **CSR with WebSocket (Real-time)**

```typescript
'use client';

export default function CheckInPage({ params }: { params: { id: string } }) {
  const { data: attendees } = useEventAttendees(params.id);
  const checkIn = useCheckInAttendee();
  
  // WebSocket for real-time updates
  useWebSocket(`/events/${params.id}/checkin`, {
    onMessage: (data) => {
      queryClient.invalidateQueries(['attendees', params.id]);
    },
  });
  
  return (
    <OrganizerLayout>
      <QRScanner onScan={checkIn.mutateAsync} />
      <AttendeeList attendees={attendees} />
    </OrganizerLayout>
  );
}
```

---

## 👑 ADMIN FEATURES

### 18. **Admin Dashboard** (`/admin/dashboard`)
**Current Status**: ✅ Exists  
**Rendering Strategy**: **CSR**

---

### 19. **Manage All Events** (`/admin/events`)
**Current Status**: ✅ Exists  
**Rendering Strategy**: **CSR**

---

### 20. **Manage Organizers** (`/admin/organizers`)
**Current Status**: ✅ Exists  
**Rendering Strategy**: **CSR**

---

### 21. **System Settings** (`/admin/settings`)
**Current Status**: ❌ Not Created  
**Rendering Strategy**: **CSR**

---

## 📊 RENDERING STRATEGY SUMMARY

### 🎨 Rendering Patterns

| Pattern | Use Case | Pages | Benefits |
|---------|----------|-------|----------|
| **SSG** | Static content | Landing page, About, Terms | Fastest, Best SEO, CDN cache |
| **SSR** | Dynamic public content | Event listing | SEO + Fresh data |
| **ISR** | Semi-static content | Event details | SEO + Auto-refresh |
| **CSR** | User-specific/Interactive | Dashboards, Forms | Real-time, Protected |

### 📈 Performance Strategy

```typescript
┌─────────────────────────────────────────────────────────────┐
│                    PERFORMANCE LAYERS                        │
├─────────────────────────────────────────────────────────────┤
│ 1. CDN Layer          - Static assets, SSG pages           │
│ 2. Server Cache       - API responses (Redis)              │
│ 3. Client Cache       - React Query (5-10 min)             │
│ 4. Component Cache    - React.memo, useMemo                │
│ 5. Image Optimization - Next.js Image component            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Core Public Features (Week 1-2)
```typescript
Priority: HIGH
- [ ] Event Listing Page (SSR)
- [ ] Event Detail Page (ISR)
- [ ] Ticket Purchase Flow (CSR)
- [ ] Payment Integration
```

### Phase 2: User Features (Week 3)
```typescript
Priority: MEDIUM
- [ ] User Dashboard (CSR)
- [ ] My Tickets Page (CSR)
- [ ] Order History (CSR)
- [ ] Profile Management (CSR)
```

### Phase 3: Organizer Features (Week 4-5)
```typescript
Priority: HIGH
- [x] My Events (CSR) ✅ Done
- [ ] Edit Event (CSR)
- [ ] Event Analytics (CSR)
- [ ] Check-in Management (CSR + WebSocket)
- [ ] Attendee Management (CSR)
```

### Phase 4: Advanced Features (Week 6+)
```typescript
Priority: LOW
- [ ] Real-time notifications (WebSocket)
- [ ] Email campaigns
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Mobile app (React Native)
```

---

## 🎯 RECOMMENDED HOOKS TO CREATE

### 1. **User Hooks** (`useUser.ts`)
```typescript
export function useMyTickets() { ... }
export function useMyOrders() { ... }
export function useUserProfile() { ... }
export function useUpdateProfile() { ... }
```

### 2. **Analytics Hooks** (`useAnalytics.ts`)
```typescript
export function useEventAnalytics(eventId: string) { ... }
export function useOrganizerStats() { ... }
export function useRevenueData(eventId: string) { ... }
export function useSalesChart(eventId: string) { ... }
```

### 3. **Check-in Hooks** (`useCheckIn.ts`)
```typescript
export function useEventAttendees(eventId: string) { ... }
export function useCheckInAttendee() { ... }
export function useCheckInStats(eventId: string) { ... }
```

### 4. **Payment Hooks** (`usePayment.ts`)
```typescript
export function useCreatePayment() { ... }
export function usePaymentStatus(orderId: string) { ... }
export function useRefundPayment() { ... }
```

### 5. **Admin Hooks** (`useAdmin.ts`)
```typescript
export function useAllEvents() { ... }
export function useAllOrganizers() { ... }
export function useSystemStats() { ... }
export function useApproveOrganizer() { ... }
```

---

## 🔧 OPTIMIZATION TECHNIQUES

### 1. **Code Splitting**
```typescript
// Lazy load heavy components
const EventAnalytics = dynamic(() => import('@/components/EventAnalytics'), {
  loading: () => <LoadingSkeleton />,
  ssr: false,
});
```

### 2. **Prefetching**
```typescript
// Prefetch on hover
<Link 
  href={`/events/${event.id}`}
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: eventKeys.detail(event.id),
      queryFn: () => apiService.getEvent(event.id),
    });
  }}
>
  View Event
</Link>
```

### 3. **Parallel Data Fetching**
```typescript
// Fetch multiple queries in parallel
export default async function EventDetailPage({ params }) {
  const [event, tickets, reviews] = await Promise.all([
    fetch(`/api/events/${params.id}`),
    fetch(`/api/events/${params.id}/tickets`),
    fetch(`/api/events/${params.id}/reviews`),
  ]);
  
  return <EventDetail event={event} tickets={tickets} reviews={reviews} />;
}
```

### 4. **Optimistic Updates**
```typescript
const updateEvent = useUpdateEvent({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: eventKeys.detail(newData.id) });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(eventKeys.detail(newData.id));
    
    // Optimistically update
    queryClient.setQueryData(eventKeys.detail(newData.id), newData);
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(eventKeys.detail(newData.id), context.previous);
  },
});
```

### 5. **Infinite Scroll**
```typescript
export function useInfiniteEvents() {
  return useInfiniteQuery({
    queryKey: eventKeys.lists(),
    queryFn: ({ pageParam = 1 }) => apiService.getEvents({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
```

---

## 📱 RESPONSIVE STRATEGY

### Mobile-First Approach
```typescript
// Tailwind breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

### Adaptive Loading
```typescript
// Load less data on mobile
const limit = useMediaQuery('(min-width: 768px)') ? 20 : 10;
const { data } = useEvents({ page: 1, limit });
```

---

## 🔐 SECURITY CONSIDERATIONS

### 1. **Route Protection**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/organizer') && !hasRole(token, 'event_organizer')) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
}
```

### 2. **API Security**
```typescript
// All API calls use httpOnly cookies
// No tokens in localStorage
// CSRF protection enabled
```

### 3. **Data Validation**
```typescript
// Use Zod for form validation
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string().min(3).max(100),
  price: z.number().min(0),
  capacity: z.number().min(1),
});
```

---

## 📊 MONITORING & ANALYTICS

### 1. **Performance Monitoring**
```typescript
// Add Web Vitals tracking
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);
  // Send to analytics service
}
```

### 2. **Error Tracking**
```typescript
// Add Sentry or similar
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

### 3. **User Analytics**
```typescript
// Track user behavior
import { analytics } from '@/lib/analytics';

analytics.track('event_viewed', {
  eventId: event.id,
  eventTitle: event.title,
});
```

---

## ✅ CHECKLIST

### Current Status
- [x] React Query hooks for Events
- [x] React Query hooks for Tickets
- [x] React Query hooks for Purchases
- [x] Organizer Events page (refactored)
- [x] EventCard component
- [x] Type-safe API calls

### To Do
- [ ] Create Event Listing page (SSR)
- [ ] Create Event Detail page (ISR)
- [ ] Create Ticket Purchase flow (CSR)
- [ ] Create User Dashboard (CSR)
- [ ] Create My Tickets page (CSR)
- [ ] Create Edit Event page (CSR)
- [ ] Create Event Analytics (CSR)
- [ ] Create Check-in Management (CSR + WebSocket)
- [ ] Add hooks for User features
- [ ] Add hooks for Analytics
- [ ] Add hooks for Check-in
- [ ] Add hooks for Payment
- [ ] Add hooks for Admin
- [ ] Implement code splitting
- [ ] Implement prefetching
- [ ] Add error boundaries
- [ ] Add loading skeletons
- [ ] Add SEO optimization
- [ ] Add performance monitoring

---

**Next Steps**: Prioritize Phase 1 (Core Public Features) untuk memberikan value maksimal kepada end users! 🚀
