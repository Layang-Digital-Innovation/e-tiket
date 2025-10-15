# Implementasi Authentication & Token Management

## Overview
Sistem autentikasi dengan pengecekan realtime untuk token expiry dan proteksi route menggunakan middleware Next.js.

## Fitur Utama

### 1. **Middleware Token Validation** (`middleware.ts`)
- ✅ Validasi JWT token di setiap request ke protected routes
- ✅ Pengecekan token expiry dari JWT payload
- ✅ Auto-redirect ke login jika token expired atau tidak valid
- ✅ Clear cookies otomatis saat token invalid
- ✅ Role-based access control (RBAC)

**Protected Routes:**
- `/dashboard/*` - untuk user role
- `/organizer/*` - untuk event_organizer role
- `/admin/*` - untuk admin role

### 2. **Client-Side Token Expiry Checker** (`TokenExpiryChecker.tsx`)
- ✅ Pengecekan realtime setiap 30 detik
- ✅ Auto-logout saat token expired
- ✅ Warning log jika token akan expired dalam 5 menit
- ✅ Redirect ke login dengan pesan session expired

### 3. **Auth Store dengan Cookie Management** (`auth.store.ts`)
- ✅ Logout menghapus cookies (`access_token`, `user_role`)
- ✅ Clear localStorage saat logout
- ✅ Persistent state menggunakan Zustand

### 4. **Auth Initializer** (`AuthInitializer.tsx`)
- ✅ Check auth status saat app mount
- ✅ Integrasi dengan TokenExpiryChecker

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Request                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Middleware (Server-Side)                        │
│  1. Decode JWT token                                         │
│  2. Check token expiry (exp claim)                           │
│  3. Validate role                                            │
│  4. If expired → Clear cookies + Redirect to /login          │
│  5. If valid → Continue to route                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           TokenExpiryChecker (Client-Side)                   │
│  - Runs every 30 seconds                                     │
│  - Check token from cookies                                  │
│  - Decode & validate expiry                                  │
│  - If expired → logout() + redirect                          │
└─────────────────────────────────────────────────────────────┘
```

## Implementasi Detail

### 1. Middleware Token Validation

```typescript
// middleware.ts
function decodeAndValidateToken(token: string): { role: string | null; isValid: boolean } {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    // Check expiry
    if (decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        return { role: null, isValid: false };
      }
    }
    
    return { role: decoded.role || null, isValid: true };
  } catch (error) {
    return { role: null, isValid: false };
  }
}
```

**Behavior:**
- Token expired → Clear cookies + Redirect ke `/login?redirect=<current_path>`
- No token pada protected route → Redirect ke `/login`
- Valid token pada auth pages (`/login`, `/register`) → Redirect ke role-based route

### 2. Client-Side Token Checker

```typescript
// TokenExpiryChecker.tsx
- Check interval: 30 seconds
- Warning threshold: 5 minutes before expiry
- Auto-logout: When token expired
- Redirect: /login?reason=session_expired
```

### 3. Logout Flow

```typescript
// auth.store.ts
logout: async () => {
  // 1. Call backend logout API
  await apiService.logout();
  
  // 2. Clear cookies (client-side)
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  
  // 3. Clear localStorage
  localStorage.removeItem('auth-storage');
  
  // 4. Reset Zustand state
  set({ user: null, isAuthenticated: false, ... });
}
```

## Testing Checklist

### ✅ Token Expiry
- [ ] Token expired → Auto redirect ke login
- [ ] Pesan "Sesi Anda telah berakhir" muncul di login page
- [ ] Tidak bisa akses protected route dengan expired token

### ✅ Logout
- [ ] Logout menghapus semua cookies
- [ ] Logout menghapus localStorage
- [ ] Setelah logout tidak bisa akses protected route
- [ ] Redirect ke login setelah logout

### ✅ Protected Routes
- [ ] User dengan role `user` tidak bisa akses `/organizer/*`
- [ ] User dengan role `event_organizer` tidak bisa akses `/admin/*`
- [ ] Admin bisa akses semua routes
- [ ] Tanpa token tidak bisa akses protected routes

### ✅ Real-time Checking
- [ ] TokenExpiryChecker berjalan setiap 30 detik
- [ ] Warning log muncul 5 menit sebelum expiry
- [ ] Auto-logout saat token expired

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## Backend Requirements

Backend harus mengirim JWT token dengan struktur:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "event_organizer",
  "iat": 1234567890,
  "exp": 1234571490  // ⚠️ REQUIRED untuk expiry checking
}
```

Cookie yang harus di-set oleh backend:
- `access_token` (HttpOnly, Secure, SameSite=Lax)
- `user_role` (optional fallback)

## Troubleshooting

### Token tidak ter-clear setelah logout
**Solusi:** Pastikan domain dan path cookies sama dengan yang di-set backend.

### Middleware tidak mendeteksi expired token
**Solusi:** Pastikan JWT payload memiliki `exp` claim dalam format Unix timestamp (seconds).

### TokenExpiryChecker tidak berjalan
**Solusi:** Pastikan `AuthInitializer` sudah di-mount di root layout.

### User masih bisa akses protected route setelah logout
**Solusi:** 
1. Check apakah cookies ter-clear dengan benar
2. Pastikan middleware matcher mencakup route tersebut
3. Clear browser cache & cookies

## File Structure

```
frontend/src/
├── middleware.ts                          # Server-side token validation
├── components/
│   └── auth/
│       ├── AuthInitializer.tsx           # Auth initialization
│       └── TokenExpiryChecker.tsx        # Real-time token checker
├── store/
│   └── auth.store.ts                     # Auth state management
├── lib/
│   └── auth-middleware.ts                # Helper functions
└── app/
    ├── login/page.tsx                    # Login page with expiry message
    └── layout.tsx                        # Root layout with AuthInitializer
```

## Security Best Practices

✅ **Implemented:**
- JWT validation di server-side (middleware)
- Token expiry checking
- HttpOnly cookies (backend responsibility)
- Automatic token cleanup on logout
- Role-based access control

⚠️ **Recommendations:**
- Enable HTTPS in production
- Set secure cookie flags in production
- Implement refresh token mechanism
- Add rate limiting for login attempts
- Log security events (failed auth, expired tokens)

## Next Steps

1. **Refresh Token Implementation** - Auto-refresh token sebelum expired
2. **Session Warning Modal** - Tampilkan modal warning sebelum session expired
3. **Activity Tracking** - Reset expiry timer saat user aktif
4. **Multi-tab Sync** - Sync logout across browser tabs
