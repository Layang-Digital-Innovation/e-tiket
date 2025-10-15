# Quick Start - Authentication & Token Management

## 🎯 Apa yang Sudah Diimplementasikan?

### ✅ 1. Real-time Token Expiry Checking
- **File:** `components/auth/TokenExpiryChecker.tsx`
- **Fungsi:** Mengecek token expiry setiap 30 detik
- **Behavior:** Auto-logout jika token expired

### ✅ 2. Middleware Protection
- **File:** `middleware.ts`
- **Fungsi:** Validasi token di server-side untuk setiap request
- **Behavior:** 
  - Redirect ke `/login` jika token expired/invalid
  - Clear cookies otomatis jika token invalid
  - Role-based access control

### ✅ 3. Logout dengan Cookie Cleanup
- **File:** `store/auth.store.ts`
- **Fungsi:** Logout menghapus semua data auth
- **Behavior:**
  - Hapus cookies (`access_token`, `user_role`)
  - Hapus localStorage
  - Reset Zustand state

### ✅ 4. Protected Routes
- `/dashboard/*` → User role
- `/organizer/*` → Event Organizer role
- `/admin/*` → Admin role

## 🚀 Cara Kerja

### Flow 1: User Login
```
1. User login → Backend set cookies (access_token)
2. Frontend save user data ke Zustand store
3. AuthInitializer mount → Start TokenExpiryChecker
4. TokenExpiryChecker check token setiap 30 detik
```

### Flow 2: Token Expired (Server-Side)
```
1. User akses protected route
2. Middleware decode JWT → Check exp claim
3. Token expired → Clear cookies + Redirect ke /login
4. User lihat pesan "Sesi Anda telah berakhir"
```

### Flow 3: Token Expired (Client-Side)
```
1. TokenExpiryChecker running setiap 30 detik
2. Decode token dari cookies → Check exp
3. Token expired → Call logout() + Redirect ke /login?reason=session_expired
4. User lihat pesan "Sesi Anda telah berakhir"
```

### Flow 4: Manual Logout
```
1. User klik tombol logout (di sidebar)
2. Call logout() function
3. Hapus cookies + localStorage
4. Redirect ke /login
5. Middleware block akses ke protected routes
```

## 📝 Testing Guide

### Test 1: Token Expiry Protection
```bash
# 1. Login ke aplikasi
# 2. Buka DevTools → Application → Cookies
# 3. Edit access_token → Ubah exp claim jadi waktu yang sudah lewat
# 4. Refresh page atau navigasi ke protected route
# Expected: Auto redirect ke /login dengan pesan session expired
```

### Test 2: Logout Cleanup
```bash
# 1. Login ke aplikasi
# 2. Buka DevTools → Application
# 3. Check Cookies & LocalStorage (ada access_token & auth-storage)
# 4. Klik tombol Logout
# 5. Check lagi Cookies & LocalStorage
# Expected: Semua data auth terhapus
```

### Test 3: Protected Route Access After Logout
```bash
# 1. Login sebagai organizer
# 2. Akses /organizer/events (berhasil)
# 3. Logout
# 4. Manual akses /organizer/events via URL
# Expected: Redirect ke /login
```

### Test 4: Role-Based Access Control
```bash
# 1. Login sebagai user (bukan organizer)
# 2. Manual akses /organizer/events via URL
# Expected: Redirect ke /dashboard (default route untuk user)
```

## 🔧 Configuration

### Token Expiry Check Interval
```typescript
// File: components/auth/TokenExpiryChecker.tsx
// Line: ~92
intervalRef.current = setInterval(checkTokenExpiry, 30000); // 30 detik

// Untuk mengubah interval:
intervalRef.current = setInterval(checkTokenExpiry, 60000); // 60 detik
```

### Warning Threshold
```typescript
// File: components/auth/TokenExpiryChecker.tsx
// Line: ~66
if (timeUntilExpiry <= 300) { // 5 menit
  console.log(`⚠️ Token expires in ${timeUntilExpiry} seconds`);
}

// Untuk mengubah threshold:
if (timeUntilExpiry <= 600) { // 10 menit
```

## 🐛 Troubleshooting

### Problem: Token tidak ter-clear setelah logout
**Solusi:**
1. Check apakah backend mengirim cookies dengan path yang benar
2. Pastikan domain cookies sama dengan frontend domain
3. Clear browser cache & cookies secara manual

### Problem: Middleware tidak mendeteksi expired token
**Solusi:**
1. Pastikan JWT dari backend memiliki `exp` claim
2. Check format exp claim (harus Unix timestamp dalam seconds, bukan milliseconds)
3. Check console log di middleware untuk debug

### Problem: User masih bisa akses protected route setelah logout
**Solusi:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check apakah cookies benar-benar terhapus di DevTools
3. Pastikan middleware matcher mencakup route tersebut

### Problem: TokenExpiryChecker tidak berjalan
**Solusi:**
1. Check apakah `AuthInitializer` sudah di-mount di root layout
2. Check console untuk error messages
3. Pastikan `isAuthenticated` state benar

## 📊 Monitoring & Logging

### Development Mode Logs
```typescript
// Middleware logs (server-side)
🔍 Middleware Check
📍 Path: /organizer/events
🔒 Protected: true
🍪 Token: EXISTS
✅ Valid: true
👤 Role: event_organizer

// TokenExpiryChecker logs (client-side)
⚠️ Token expires in 250 seconds
🔴 Token expired - logging out
```

### Production Recommendations
- Disable verbose logging
- Implement error tracking (Sentry, LogRocket)
- Monitor failed auth attempts
- Track token expiry patterns

## 🔐 Security Checklist

- [x] JWT validation di server-side (middleware)
- [x] Token expiry checking (server & client)
- [x] Automatic cookie cleanup on logout
- [x] Role-based access control
- [x] Protected routes enforcement
- [ ] HTTPS in production (backend responsibility)
- [ ] HttpOnly cookies (backend responsibility)
- [ ] Secure cookie flags (backend responsibility)
- [ ] Rate limiting for login (backend responsibility)
- [ ] Refresh token mechanism (future enhancement)

## 📚 Related Files

```
frontend/src/
├── middleware.ts                          # Server-side protection
├── components/
│   └── auth/
│       ├── AuthInitializer.tsx           # Auth initialization
│       └── TokenExpiryChecker.tsx        # Real-time checker
├── store/
│   └── auth.store.ts                     # Auth state + logout
├── app/
│   ├── login/page.tsx                    # Login with expiry message
│   └── layout.tsx                        # Root layout
└── components/
    └── sidebar/
        └── OrganizerSidebar.tsx          # Logout button
```

## 🎓 Best Practices

1. **Always check authentication status on protected pages**
2. **Use middleware for server-side protection**
3. **Implement client-side checks for better UX**
4. **Clear all auth data on logout**
5. **Show user-friendly messages for session expiry**
6. **Log security events for monitoring**

## 🚦 Next Steps

1. **Test semua flow** menggunakan Testing Guide di atas
2. **Monitor logs** untuk memastikan semuanya berjalan
3. **Adjust intervals** sesuai kebutuhan
4. **Implement refresh token** untuk auto-renew session
5. **Add session warning modal** sebelum token expired
