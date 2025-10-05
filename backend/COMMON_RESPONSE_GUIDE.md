# Common Response Pattern Guide

Panduan implementasi common response pattern untuk standardisasi API response di backend ticketing application.

## Overview

Common response pattern membantu menciptakan konsistensi dalam format response API, memudahkan frontend untuk menangani response, dan meningkatkan developer experience.

## Struktur Response

### Success Response
```typescript
{
  "success": true,
  "data": any, // Data yang dikembalikan
  "message": "Operation completed successfully",
  "statusCode": 200
}
```

### Error Response
```typescript
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "statusCode": 400
}
```

### Paginated Response
```typescript
{
  "success": true,
  "data": [...], // Array of items
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "message": "Data retrieved successfully",
  "statusCode": 200
}
```

## Files Created

### 1. API Response DTO (`src/common/dto/api-response.dto.ts`)
Defines the structure and helper methods for API responses.

**Key Features:**
- `ApiResponseDto.success()` - Create success response
- `ApiResponseDto.error()` - Create error response
- `ApiResponseDto.paginated()` - Create paginated response

### 2. Response Interceptor (`src/common/interceptors/response.interceptor.ts`)
Automatically formats responses to follow the common pattern.

**Features:**
- Auto-detects pagination data
- Wraps plain data in success response
- Preserves manually formatted responses

### 3. HTTP Exception Filter (`src/common/filters/http-exception.filter.ts`)
Handles errors and formats them consistently.

**Features:**
- Catches all HTTP exceptions
- Formats validation errors
- Logs errors for debugging
- Returns standardized error response

## Implementation Guide

### Method 1: Global Implementation (Recommended)

Apply interceptor and filter globally in `main.ts`:

```typescript
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply globally
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  
  await app.listen(3000);
}
```

### Method 2: Controller Level Implementation

Apply to specific controllers:

```typescript
@Controller('api/events')
@UseInterceptors(ResponseInterceptor)
@UseFilters(HttpExceptionFilter)
export class EventsController {
  // Controller methods...
}
```

### Method 3: Manual Response Formatting

Manually format responses in controller methods:

```typescript
@Post()
async create(@Body() createDto: CreateEventDto) {
  const event = await this.eventsService.create(createDto);
  
  return ApiResponseDto.success(
    event,
    'Event created successfully',
    HttpStatus.CREATED
  );
}
```

## Usage Examples

### Basic Success Response
```typescript
@Get(':id')
async findOne(@Param('id') id: string) {
  const event = await this.eventsService.findOne(id);
  
  // Option 1: Let interceptor handle (automatic)
  return event;
  
  // Option 2: Manual formatting
  return ApiResponseDto.success(
    event,
    'Event retrieved successfully'
  );
}
```

### Paginated Response
```typescript
@Get()
async findAll(@Query('page') page: number, @Query('limit') limit: number) {
  const result = await this.eventsService.findAll(page, limit);
  
  // Option 1: Let interceptor handle (if service returns {events, total, page, limit})
  return result;
  
  // Option 2: Manual formatting
  return ApiResponseDto.paginated(
    result.events,
    {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    },
    'Events retrieved successfully'
  );
}
```

### Error Handling
```typescript
@Post()
async create(@Body() createDto: CreateEventDto) {
  try {
    const event = await this.eventsService.create(createDto);
    return ApiResponseDto.success(event, 'Event created successfully');
  } catch (error) {
    // Exception filter will handle this automatically
    throw new BadRequestException('Failed to create event');
  }
}
```

## Frontend Integration

### TypeScript Types
Update frontend types to match the response structure:

```typescript
// frontend/src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### API Service Update
```typescript
// frontend/src/services/api.ts
class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, options);
    const data: ApiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || data.error || 'API request failed');
    }
    
    return data;
  }
  
  async getEvents(page = 1, limit = 10): Promise<PaginatedApiResponse<Event>> {
    return this.request<Event[]>(`/events?page=${page}&limit=${limit}`);
  }
}
```

## Migration Strategy

### Phase 1: Setup Infrastructure
1. Create common response files
2. Add global interceptor and filter
3. Test with one controller

### Phase 2: Update Controllers
1. Update one controller at a time
2. Test API responses
3. Update frontend integration

### Phase 3: Complete Migration
1. Update all controllers
2. Remove old response patterns
3. Update documentation

## Benefits

1. **Consistency**: All API responses follow the same structure
2. **Error Handling**: Centralized error formatting
3. **Frontend Integration**: Easier to handle responses in frontend
4. **Debugging**: Better error logging and tracking
5. **Documentation**: Clear API response structure
6. **Maintenance**: Easier to modify response format globally

## Best Practices

1. **Use Interceptor**: Let the interceptor handle most formatting automatically
2. **Manual Formatting**: Use manual formatting for special cases or custom messages
3. **Error Messages**: Provide clear, user-friendly error messages
4. **Status Codes**: Use appropriate HTTP status codes
5. **Pagination**: Always include pagination info for list endpoints
6. **Logging**: Log errors for debugging purposes

## Testing

### Unit Tests
```typescript
describe('EventsController', () => {
  it('should return formatted success response', async () => {
    const result = await controller.findOne('1');
    
    expect(result).toEqual({
      success: true,
      data: expect.any(Object),
      message: 'Event retrieved successfully',
      statusCode: 200
    });
  });
});
```

### Integration Tests
```typescript
it('/events (GET)', () => {
  return request(app.getHttpServer())
    .get('/api/events')
    .expect(200)
    .expect((res) => {
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });
});
```

Dengan implementasi common response pattern ini, API backend akan memiliki struktur response yang konsisten dan mudah digunakan oleh frontend.