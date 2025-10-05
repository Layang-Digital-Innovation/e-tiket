# Common Response Examples

Contoh-contoh response yang akan dihasilkan setelah mengimplementasikan common response pattern.

## Success Responses

### 1. Single Item Response
**Endpoint:** `GET /api/events/123`

```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Web Development Workshop",
    "description": "Learn modern web development",
    "startDate": "2024-02-15T09:00:00Z",
    "endDate": "2024-02-15T17:00:00Z",
    "location": "Jakarta Convention Center",
    "maxCapacity": 100,
    "basePrice": 150000,
    "status": "published",
    "hasSubEvents": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Event retrieved successfully",
  "statusCode": 200
}
```

### 2. Create Response
**Endpoint:** `POST /api/events`

```json
{
  "success": true,
  "data": {
    "id": "124",
    "title": "React Advanced Workshop",
    "description": "Advanced React concepts and patterns",
    "startDate": "2024-03-01T09:00:00Z",
    "endDate": "2024-03-01T17:00:00Z",
    "location": "Bandung Tech Hub",
    "maxCapacity": 50,
    "basePrice": 200000,
    "status": "draft",
    "hasSubEvents": false,
    "createdAt": "2024-01-20T14:15:00Z",
    "updatedAt": "2024-01-20T14:15:00Z"
  },
  "message": "Event created successfully",
  "statusCode": 201
}
```

### 3. Paginated List Response
**Endpoint:** `GET /api/events?page=1&limit=10`

```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "title": "Web Development Workshop",
      "description": "Learn modern web development",
      "startDate": "2024-02-15T09:00:00Z",
      "endDate": "2024-02-15T17:00:00Z",
      "location": "Jakarta Convention Center",
      "status": "published"
    },
    {
      "id": "124",
      "title": "React Advanced Workshop",
      "description": "Advanced React concepts",
      "startDate": "2024-03-01T09:00:00Z",
      "endDate": "2024-03-01T17:00:00Z",
      "location": "Bandung Tech Hub",
      "status": "draft"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "message": "Events retrieved successfully",
  "statusCode": 200
}
```

### 4. Update Response
**Endpoint:** `PATCH /api/events/123`

```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Web Development Workshop - Updated",
    "description": "Learn modern web development with latest tools",
    "startDate": "2024-02-15T09:00:00Z",
    "endDate": "2024-02-15T17:00:00Z",
    "location": "Jakarta Convention Center",
    "maxCapacity": 120,
    "basePrice": 175000,
    "status": "published",
    "updatedAt": "2024-01-20T16:45:00Z"
  },
  "message": "Event updated successfully",
  "statusCode": 200
}
```

### 5. Delete Response
**Endpoint:** `DELETE /api/events/123`

```json
{
  "success": true,
  "data": null,
  "message": "Event deleted successfully",
  "statusCode": 204
}
```

### 6. Authentication Response
**Endpoint:** `POST /api/auth/login`

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "event_organizer",
      "status": "active"
    }
  },
  "message": "Login successful",
  "statusCode": 200
}
```

## Error Responses

### 1. Validation Error
**Endpoint:** `POST /api/events` (with invalid data)

```json
{
  "success": false,
  "error": "Validation Error",
  "message": "title should not be empty, startDate must be a valid ISO 8601 date string, endDate must be a valid ISO 8601 date string",
  "statusCode": 400
}
```

### 2. Not Found Error
**Endpoint:** `GET /api/events/999`

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Event with ID 999 not found",
  "statusCode": 404
}
```

### 3. Unauthorized Error
**Endpoint:** `POST /api/events` (without token)

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Access token is required",
  "statusCode": 401
}
```

### 4. Forbidden Error
**Endpoint:** `DELETE /api/events/123` (insufficient permissions)

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You don't have permission to delete this event",
  "statusCode": 403
}
```

### 5. Business Logic Error
**Endpoint:** `POST /api/events` (end date before start date)

```json
{
  "success": false,
  "error": "Bad Request",
  "message": "End date must be after start date",
  "statusCode": 400
}
```

### 6. Conflict Error
**Endpoint:** `POST /api/auth/register` (email already exists)

```json
{
  "success": false,
  "error": "Conflict",
  "message": "User with this email already exists",
  "statusCode": 409
}
```

### 7. Internal Server Error
**Endpoint:** Any endpoint (when unexpected error occurs)

```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please try again later.",
  "statusCode": 500
}
```

## Sub-Events Responses

### 1. Event with Sub-Events
**Endpoint:** `GET /api/events/123` (event with sub-events)

```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Web Development Bootcamp",
    "description": "Complete web development training",
    "startDate": "2024-02-15T09:00:00Z",
    "endDate": "2024-02-17T17:00:00Z",
    "location": "Jakarta Tech Center",
    "hasSubEvents": true,
    "enableMainEventTicketing": false,
    "subEvents": [
      {
        "id": "sub-1",
        "title": "HTML & CSS Fundamentals",
        "description": "Learn the basics of web markup and styling",
        "startDate": "2024-02-15T09:00:00Z",
        "endDate": "2024-02-15T17:00:00Z",
        "location": "Room A",
        "maxCapacity": 30,
        "basePrice": 100000,
        "sortOrder": 1
      },
      {
        "id": "sub-2",
        "title": "JavaScript Essentials",
        "description": "Master JavaScript programming",
        "startDate": "2024-02-16T09:00:00Z",
        "endDate": "2024-02-16T17:00:00Z",
        "location": "Room B",
        "maxCapacity": 25,
        "basePrice": 150000,
        "sortOrder": 2
      }
    ]
  },
  "message": "Event with sub-events retrieved successfully",
  "statusCode": 200
}
```

### 2. Create Event with Sub-Events
**Endpoint:** `POST /api/events/with-sub-events`

```json
{
  "success": true,
  "data": {
    "mainEvent": {
      "id": "125",
      "title": "Mobile App Development Workshop",
      "hasSubEvents": true,
      "enableMainEventTicketing": false,
      "createdAt": "2024-01-20T15:30:00Z"
    },
    "subEvents": [
      {
        "id": "sub-3",
        "title": "React Native Basics",
        "parentEventId": "125",
        "sortOrder": 1,
        "createdAt": "2024-01-20T15:30:00Z"
      },
      {
        "id": "sub-4",
        "title": "Flutter Development",
        "parentEventId": "125",
        "sortOrder": 2,
        "createdAt": "2024-01-20T15:30:00Z"
      }
    ]
  },
  "message": "Event with sub-events created successfully",
  "statusCode": 201
}
```

## Frontend Usage Examples

### 1. Handling Success Response
```typescript
// Frontend API call
try {
  const response = await apiService.getEvent('123');
  
  if (response.success) {
    console.log('Event data:', response.data);
    showSuccessMessage(response.message);
  }
} catch (error) {
  console.error('API Error:', error.message);
}
```

### 2. Handling Paginated Response
```typescript
// Frontend pagination
try {
  const response = await apiService.getEvents(1, 10);
  
  if (response.success) {
    setEvents(response.data);
    setPagination(response.pagination);
  }
} catch (error) {
  showErrorMessage(error.message);
}
```

### 3. Handling Error Response
```typescript
// Frontend error handling
try {
  const response = await apiService.createEvent(eventData);
  
  if (response.success) {
    showSuccessMessage(response.message);
    router.push('/events');
  }
} catch (error) {
  // Error response will be in this format:
  // { success: false, error: "Validation Error", message: "...", statusCode: 400 }
  showErrorMessage(error.message);
}
```

Dengan struktur response yang konsisten ini, frontend dapat dengan mudah menangani semua jenis response dari API backend.