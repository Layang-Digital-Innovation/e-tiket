# Middleware - Role-Based Routing Guide

## 📖 Overview

Middleware ini mengatur **authentication** dan **role-based routing** di aplikasi. Setiap user akan diarahkan ke halaman yang sesuai dengan role mereka.

## 🎯 Role-Based Default Routes

| Role | Default Route | Akses |
|------|--------------|-------|
| **Admin** | `/admin` | Semua route (admin, organizer, dashboard) |
| **Organizer** | `/organizer/events` | Hanya /organizer/* |
| **User** | `/dashboard` | Hanya /dashboard/* |

## 🔄 Flow Middleware

### 1. **User Belum Login (No Token)**

```
User akses /dashboard
    ↓
Middleware check: No token
    ↓
Redirect ke /login?redirect=/dashboard
```

### 2. **User Sudah Login - Akses Auth Pages**

```
Admin login → Akses /login
    ↓
Middleware check: Token exists, role = admin
    ↓
Redirect ke /admin (default route admin)
```

```
Organizer login → Akses /register
    ↓
Middleware check: Token exists, role = organizer
    ↓
Redirect ke /organizer/events
```

### 3. **User Sudah Login - Akses Home**

```
User login → Akses /
    ↓
Middleware check: Token exists, role = user
    ↓
Redirect ke /dashboard
```

### 4. **Role-Based Access Control**

#### Admin
```
Admin akses /admin → ✅ Allow
Admin akses /organizer/events → ✅ Allow
Admin akses /dashboard → ✅ Allow
```

#### Organizer
```
Organizer akses /organizer/events → ✅ Allow
Organizer akses /admin → ❌ Redirect ke /organizer/events
Organizer akses /dashboard → ❌ Redirect ke /organizer/events
```

#### User
```
User akses /dashboard → ✅ Allow
User akses /admin → ❌ Redirect ke /dashboard
User akses /organizer → ❌ Redirect ke /dashboard
```

## 🔧 Cara Kerja

### 1. **Get User Role**

Middleware mendapatkan role user dari:

1. **JWT Token** (decode payload)
2. **Fallback**: Cookie `user_role` (jika JWT decode gagal)

```typescript
function getUserRole(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    return decoded.role || null;
  } catch {
    return null;
  }
}
```

### 2. **Check & Redirect**

```typescript
// Scenario: Organizer trying to access /admin
if (userRole === 'organizer' && pathname.startsWith('/admin')) {
  // Unauthorized!
  const defaultRoute = '/organizer/events';
  return NextResponse.redirect(new URL(defaultRoute, req.url));
}
```

## 📋 Protected Routes

Routes yang memerlukan authentication:
- `/dashboard/*` - User route
- `/organizer/*` - Organizer route
- `/admin/*` - Admin route

## 🎨 Customization

### Tambah Role Baru

Edit `roleDefaultRoutes`:

```typescript
const roleDefaultRoutes: Record<string, string> = {
  'admin': '/admin',
  'organizer': '/organizer/events',
  'event_organizer': '/organizer/events',
  'user': '/dashboard',
  'moderator': '/moderator/panel', // ← Role baru
};
```

### Tambah Access Control

Edit bagian role-based access control:

```typescript
// Moderator can access moderator panel
if (userRole === 'moderator' && pathname.startsWith('/moderator')) {
  console.log('✅ ACCESS GRANTED - Moderator access');
  return NextResponse.next();
}
```

### Tambah Protected Route

Edit matcher config:

```typescript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/organizer/:path*',
    '/admin/:path*',
    '/moderator/:path*', // ← Route baru
    '/login',
    '/register',
    '/',
  ],
};
```

## 🧪 Testing Scenarios

### Test 1: Login Flow
```bash
# 1. User belum login, akses dashboard
GET /dashboard
Expected: Redirect to /login?redirect=/dashboard

# 2. Login sebagai admin
POST /api/auth/login { role: 'admin' }
Expected: Set cookie with token

# 3. Akses home
GET /
Expected: Redirect to /admin

# 4. Akses login lagi
GET /login
Expected: Redirect to /admin (already logged in)
```

### Test 2: Role Access
```bash
# Login sebagai organizer
POST /api/auth/login { role: 'organizer' }

# Akses organizer route
GET /organizer/events
Expected: ✅ Allow (200)

# Akses admin route
GET /admin
Expected: Redirect to /organizer/events (unauthorized)
```

### Test 3: Mixed Roles
```bash
# Admin accessing all routes
GET /admin → ✅ Allow
GET /organizer/events → ✅ Allow
GET /dashboard → ✅ Allow

# Regular user
GET /dashboard → ✅ Allow
GET /admin → ❌ Redirect to /dashboard
```

## 🐛 Debugging

Enable debug logging di development:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Middleware Check');
  console.log('📍 Path:', pathname);
  console.log('🔒 Protected:', isProtectedPath);
  console.log('🍪 Token:', token ? 'EXISTS' : 'MISSING');
  console.log('👤 Role:', userRole || 'UNKNOWN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
```

Output example:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Middleware Check
📍 Path: /organizer/events
🔒 Protected: true
🍪 Token: EXISTS
👤 Role: organizer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ACCESS GRANTED - Organizer access to organizer routes
```

## ⚠️ Important Notes

### 1. **JWT Token Format**

Backend harus mengirim JWT token dengan payload yang berisi `role`:

```json
{
  "userId": "123",
  "email": "user@example.com",
  "role": "organizer",  // ← PENTING!
  "exp": 1234567890
}
```

### 2. **Cookie Setup**

Backend harus set cookie dengan nama `access_token`:

```javascript
// Backend example (Express.js)
res.cookie('access_token', jwtToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 3600000 // 1 hour
});
```

### 3. **Fallback Cookie**

Jika JWT decode gagal, middleware akan cari cookie `user_role`:

```javascript
// Backend alternative
res.cookie('user_role', 'organizer', {
  httpOnly: false, // Bisa diakses client
  secure: process.env.NODE_ENV === 'production',
});
```

### 4. **Admin Override**

Admin punya akses ke **semua route**. Tidak ada redirect untuk admin kecuali dari auth pages.

## 🔐 Security

1. **HttpOnly Cookies** - Token tidak bisa diakses via JavaScript
2. **Role Verification** - Setiap route di-verify role-nya
3. **JWT Decode** - Token di-decode untuk ambil role
4. **Secure Flag** - Cookie secure di production

## 📊 Middleware Execution Order

```
1. Check token existence
2. Get user role from token/cookie
3. Check if path is protected
4. Check if path is auth page
5. Apply redirect logic:
   a. No token + protected → Login
   b. Has token + auth page → Role route
   c. Has token + home → Role route
   d. Has token + protected → Check role access
6. Allow or deny access
```

## 💡 Tips

1. **Disable debug logs di production** untuk performance
2. **Test semua role** setelah perubahan routing
3. **Monitor redirect loops** - pastikan tidak ada circular redirect
4. **Cache middleware results** jika perlu (Next.js handles this)
5. **Update matcher** setiap tambah route baru

## 🚀 Quick Reference

```typescript
// Get current user role
const userRole = getUserRole(token);

// Check if admin
if (userRole === 'admin') { /* admin logic */ }

// Get default route for role
const defaultRoute = roleDefaultRoutes[userRole];

// Redirect to role route
return NextResponse.redirect(new URL(defaultRoute, req.url));

// Allow access
return NextResponse.next();
```

## 📝 Changelog

- ✅ Added role-based redirect from auth pages
- ✅ Added role-based redirect from home page
- ✅ Added role-based access control
- ✅ Added admin override (access all routes)
- ✅ Added JWT decode for role extraction
- ✅ Added fallback cookie for role
- ✅ Optimized matcher for performance

---

**Middleware sudah siap digunakan!** 🎉
