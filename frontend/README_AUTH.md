# Quick Start - Authentication System

## 🎯 Yang Sudah Dibuat

Sistem autentikasi lengkap dengan fitur-fitur berikut:

### ✅ State Management (Zustand)
- **File**: `src/store/auth.store.ts`
- Persistent state di localStorage
- Auto token expiry tracking
- Error & loading states

### ✅ Auth Context
- **File**: `src/contexts/AuthContext.tsx`
- React Context wrapper untuk Zustand
- Hook `useAuth()` untuk akses mudah

### ✅ Auth Middleware
- **File**: `src/lib/auth-middleware.ts`
- Session timeout management
- Warning 5 menit sebelum expire
- Auto logout saat expire

### ✅ UI Components (Shadcn)
- Button (`src/components/ui/button.tsx`)
- Input (`src/components/ui/input.tsx`)
- Label (`src/components/ui/label.tsx`)
- Card (`src/components/ui/card.tsx`)
- Alert (`src/components/ui/alert.tsx`)

### ✅ Pages
- **Login**: `src/app/login/page.tsx`
- **Register**: `src/app/register/page.tsx`

### ✅ Protected Routes
- **File**: `src/components/auth/ProtectedRoute.tsx`
- Role-based access control
- Loading & unauthorized states

### ✅ Auth Wrapper
- **File**: `src/components/auth/AuthWrapper.tsx`
- Session management
- Auto logout handling

## 🚀 Cara Menggunakan

### 1. Login User

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginComponent() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: 'user@example.com',
        password: 'password123'
      });
      // Success - auto redirect
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Login'}
    </button>
  );
}
```

### 2. Register User

```tsx
import { useAuth } from '@/contexts/AuthContext';

function RegisterComponent() {
  const { register } = useAuth();

  const handleRegister = async () => {
    await register({
      email: 'user@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+62812345678'
    });
    // Auto login after register
  };

  return <button onClick={handleRegister}>Register</button>;
}
```

### 3. Cek Status Login

```tsx
import { useAuth } from '@/contexts/AuthContext';

function UserProfile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### 4. Protected Route

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function MyPage() {
  return (
    <ProtectedRoute>
      <YourProtectedContent />
    </ProtectedRoute>
  );
}
```

### 5. Role-Based Access

```tsx
import { AdminRoute, OrganizerRoute } from '@/components/auth/ProtectedRoute';

// Only for admin
<AdminRoute>
  <AdminPanel />
</AdminRoute>

// For admin & organizer
<OrganizerRoute>
  <EventManagement />
</OrganizerRoute>

// Custom roles
<ProtectedRoute requiredRoles={['admin', 'organizer']}>
  <CustomComponent />
</ProtectedRoute>
```

### 6. Permission Check

```tsx
import { usePermissions } from '@/components/auth/ProtectedRoute';

function MyComponent() {
  const { isAdmin, canManageEvents, hasRole } = usePermissions();

  return (
    <div>
      {isAdmin() && <AdminButton />}
      {canManageEvents() && <CreateEventButton />}
      {hasRole('organizer') && <OrganizerTools />}
    </div>
  );
}
```

## 📋 Integration Checklist

Sistem sudah terintegrasi dengan:

- [x] Root layout (`src/app/layout.tsx`)
- [x] Login page dengan shadcn UI
- [x] Register page dengan shadcn UI
- [x] Zustand store dengan persistensi
- [x] Session management middleware
- [x] Protected routes components
- [x] Error handling
- [x] Loading states
- [x] Google OAuth buttons

## 🎨 Styling

Semua komponen menggunakan **shadcn/ui** dengan Tailwind CSS:

- Modern dan responsive design
- Dark mode support
- Accessible (ARIA labels)
- Consistent styling

## 🔧 Konfigurasi

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Root Layout

AuthProvider sudah ditambahkan di `src/app/layout.tsx`:

```tsx
<AuthProvider>
  <Header />
  {children}
</AuthProvider>
```

## 📖 Dokumentasi Lengkap

Lihat `AUTHENTICATION.md` untuk dokumentasi lengkap dengan:
- Arsitektur detail
- State management flow
- Best practices
- Troubleshooting
- Testing guidelines

## 🎯 Next Steps

Untuk menggunakan sistem auth ini:

1. **Pastikan backend API sudah running**
   - Endpoint: `/api/auth/login`
   - Endpoint: `/api/auth/register`
   - Endpoint: `/api/auth/logout`
   - Endpoint: `/api/auth/profile`

2. **Update existing pages**
   - Ganti `import { useAuth } from '@/hooks/useAuth'`
   - Dengan `import { useAuth } from '@/contexts/AuthContext'`

3. **Protect sensitive routes**
   ```tsx
   <ProtectedRoute requiredRoles={['admin']}>
     <YourPage />
   </ProtectedRoute>
   ```

4. **Test flow**
   - Register → Auto login → Redirect
   - Login → Get profile → Redirect
   - Logout → Clear state → Redirect

## 🐛 Common Issues

### Issue: `useAuth` not found
**Solution**: Import from `@/contexts/AuthContext`, not `@/hooks/useAuth`

### Issue: State not persisting
**Solution**: Check localStorage for `auth-storage` key

### Issue: Not redirecting after login
**Solution**: Check if AuthProvider is wrapped in root layout

## 💡 Tips

1. **Error handling**: Use `error` dan `clearError` dari useAuth
2. **Loading states**: Use `isLoading` untuk UX yang lebih baik
3. **Type safety**: Semua menggunakan TypeScript dengan proper types
4. **Persistence**: State otomatis tersimpan di localStorage

## 🚀 Ready to Use!

Sistem autentikasi sudah siap digunakan. Cukup import `useAuth` dan mulai coding! 🎉
