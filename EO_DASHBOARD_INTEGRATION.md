# Event Organizer Dashboard Integration

Dashboard EO telah diintegrasikan dengan backend API.

## Files Created/Updated

### 1. **Hook** (`/frontend/src/hooks/useDashboard.ts`)
Custom React Query hooks untuk dashboard data:
- `useDashboardStats()` - Get statistics (total events, tickets sold, revenue, active events)
- `useRecentEvents(limit)` - Get recent events list
- `useSalesChart(days)` - Get sales chart data
- `useDashboard()` - Combined hook untuk semua data

### 2. **Dashboard Page** (`/frontend/src/app/organizer/dashboard/page-new.tsx`)
Dashboard page dengan:
- ✅ Real-time stats cards
- ✅ Recent events list dengan link ke detail
- ✅ Loading states
- ✅ Empty states
- ✅ Currency formatting (IDR)
- ✅ Date formatting
- ✅ Quick actions dengan links

### 3. **API Service** (`/frontend/src/services/api.ts`)
Tambahan methods:
- `getDashboardStats()` - GET `/api/dashboard/stats`
- `getSalesChart(days)` - GET `/api/dashboard/sales?days={days}`

## Backend API Endpoints Required

Dashboard membutuhkan endpoint berikut di backend:

### 1. GET `/api/dashboard/stats`
**Response:**
```json
{
  "totalEvents": 8,
  "ticketsSold": 435,
  "totalRevenue": 87500000,
  "activeEvents": 3
}
```

### 2. GET `/api/dashboard/sales?days=7`
**Response:**
```json
[
  {
    "date": "2024-01-15",
    "sales": 45,
    "revenue": 2250000
  },
  {
    "date": "2024-01-16",
    "sales": 32,
    "revenue": 1600000
  }
]
```

### 3. GET `/api/event/my-events?limit=5`
**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Konser Musik Jazz",
      "slug": "konser-musik-jazz",
      "startDate": "2024-02-15T19:00:00Z",
      "endDate": "2024-02-15T23:00:00Z",
      "status": "published",
      "ticketsSold": 350,
      "maxCapacity": 500,
      "isActive": true
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 5
}
```

## Installation Steps

### 1. Replace Dashboard Page
```bash
# Backup old file
mv frontend/src/app/organizer/dashboard/page.tsx frontend/src/app/organizer/dashboard/page-old.tsx

# Use new file
mv frontend/src/app/organizer/dashboard/page-new.tsx frontend/src/app/organizer/dashboard/page.tsx
```

### 2. Backend Implementation
Buat controller dan service untuk dashboard endpoints:

```typescript
// backend/src/dashboard/dashboard.controller.ts
@Controller('api/dashboard')
export class DashboardController {
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getStats(@Request() req) {
    return this.dashboardService.getStats(req.user.id);
  }

  @Get('sales')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getSalesChart(@Query('days') days: number = 7) {
    return this.dashboardService.getSalesChart(req.user.id, days);
  }
}
```

## Features

### Stats Cards
- **Total Events**: Jumlah semua event yang dibuat
- **Tiket Terjual**: Total tiket yang sudah terjual
- **Total Pendapatan**: Revenue dalam format IDR
- **Event Aktif**: Jumlah event yang sedang aktif

### Recent Events
- List 5 event terbaru
- Link ke detail event
- Status badge (Aktif/Tidak Aktif)
- Tickets sold progress
- Date formatting

### Quick Actions
- **Buat Event Baru** → `/organizer/events/create`
- **Kelola Tiket** → `/organizer/events`
- **Redeem & Check-in** → `/redeem`

## Data Flow

```
Dashboard Page
    ↓
useDashboardStats() / useRecentEvents()
    ↓
apiService.getDashboardStats() / apiService.getMyEvents()
    ↓
Backend API
    ↓
Database Query
    ↓
Response (JSON)
    ↓
React Query Cache
    ↓
UI Update
```

## Error Handling

- ✅ Loading states dengan spinner
- ✅ Empty states dengan icon & message
- ✅ Console logging untuk debugging
- ✅ Type safety dengan TypeScript
- ✅ Fallback values (0, [], etc.)

## Next Steps

1. **Backend**: Implement dashboard endpoints
2. **Testing**: Test dengan real data
3. **Chart**: Integrate recharts library untuk sales chart
4. **Optimization**: Add caching strategy
5. **Real-time**: Consider WebSocket untuk real-time updates

## Notes

- Dashboard menggunakan React Query untuk caching
- Data di-refresh otomatis setiap 5 menit (default)
- Manual refresh dengan invalidate queries
- Type-safe dengan TypeScript interfaces
