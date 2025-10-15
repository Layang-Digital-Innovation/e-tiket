# Cookie-Based Authentication Setup

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Cookie Configuration
NODE_ENV=development  # Set to 'production' in production
COOKIE_MAX_AGE=604800000  # 7 days in milliseconds (7 * 24 * 60 * 60 * 1000)

# Frontend URL for CORS and OAuth redirects
FRONTEND_URL=http://localhost:3000
```

## Cookie Settings

### Development Environment
- **httpOnly**: `true` - Prevents JavaScript access to cookies
- **secure**: `false` - Allows HTTP (set to `true` in production for HTTPS only)
- **sameSite**: `lax` - Allows cookies on same-site requests
- **maxAge**: 7 days (configurable via `COOKIE_MAX_AGE`)
- **path**: `/` - Cookie available for all routes

### Production Environment
- **httpOnly**: `true` - Prevents XSS attacks
- **secure**: `true` - HTTPS only
- **sameSite**: `strict` - Strict CSRF protection
- **maxAge**: 7 days (configurable via `COOKIE_MAX_AGE`)
- **path**: `/` - Cookie available for all routes

## Migration from Authorization Headers

The authentication system now supports **both** cookie-based and header-based authentication:

1. **Cookie-based** (Primary): JWT token stored in HTTP-only cookie named `access_token`
2. **Authorization header** (Fallback): Bearer token in `Authorization` header for backward compatibility

### Frontend Integration

#### Login Request
```typescript
// No changes needed - just ensure credentials are included
const response = await fetch('http://localhost:3002/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({ email, password }),
});

// Token is automatically set in cookie
const data = await response.json();
console.log(data.user); // User data returned (no access_token in response)
```

#### Authenticated Requests
```typescript
// Cookie is automatically sent with requests
const response = await fetch('http://localhost:3002/api/auth/profile', {
  method: 'GET',
  credentials: 'include', // Important: Include cookies
});
```

#### Logout Request
```typescript
const response = await fetch('http://localhost:3002/api/auth/logout', {
  method: 'POST',
  credentials: 'include', // Important: Include cookies
});

// Cookie is automatically cleared
```

## Security Benefits

1. **XSS Protection**: HTTP-only cookies cannot be accessed by JavaScript
2. **CSRF Protection**: SameSite cookie attribute prevents CSRF attacks
3. **Secure Transport**: Cookies marked as secure in production (HTTPS only)
4. **Automatic Expiry**: Cookies expire after configured duration
5. **Path Restriction**: Cookies scoped to specific paths

## Testing

### Test Login
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt
```

### Test Authenticated Request
```bash
curl -X GET http://localhost:3002/api/auth/profile \
  -b cookies.txt
```

### Test Logout
```bash
curl -X POST http://localhost:3002/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

## Troubleshooting

### Cookies Not Being Set
- Ensure `credentials: 'include'` is set in fetch requests
- Check CORS configuration allows credentials
- Verify `cookie-parser` middleware is installed and configured

### Cookies Not Being Sent
- Ensure `credentials: 'include'` is set in fetch requests
- Check that frontend and backend are on same domain or CORS is properly configured
- Verify cookie hasn't expired

### CORS Issues
- Ensure `origin` in CORS configuration matches your frontend URL
- Set `credentials: true` in CORS configuration
- In production, use specific origins instead of wildcards

## Backward Compatibility

The system maintains backward compatibility with Authorization headers:

```typescript
// Still works - Authorization header
const response = await fetch('http://localhost:3002/api/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

This allows gradual migration from header-based to cookie-based authentication.
