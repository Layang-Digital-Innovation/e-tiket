# Authentication System Documentation

## Overview

Sistem autentikasi aplikasi ini menggunakan **Zustand** untuk state management dan **shadcn/ui** untuk komponen UI. Sistem ini menyediakan fitur lengkap termasuk login, register, session management, dan protected routes.

## Arsitektur

### 1. **Zustand Store** (`src/store/auth.store.ts`)
State management menggunakan Zustand dengan persistensi di localStorage:

```typescript
import { useAuthStore } from '@/store/auth.store';

// Mengakses state
const { user, isAuthenticated, isLoading, error } = useAuthStore();

// Mengakses actions
const { login, logout, register, refreshProfile } = useAuthStore();
```

**Fitur:**
- ✅ Persistent state (localStorage)
- ✅ Automatic token expiry tracking
- ✅ Error handling
- ✅ Loading states

### 2. **Auth Context** (`src/contexts/AuthContext.tsx`)
React Context wrapper di atas Zustand store untuk kemudahan penggunaan:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // ... komponen Anda
}
```

### 3. **Auth Middleware** (`src/lib/auth-middleware.ts`)
Mengelola session timeout dan warning sebelum token expire:

```typescript
import { AuthMiddleware } from '@/lib/auth-middleware';

const middleware = new AuthMiddleware({
  onLogout: () => logout(),
  onWarning: (timeLeft) => showWarning(timeLeft),
  warningTime: 5 * 60 * 1000, // 5 menit sebelum expire
});

middleware.start();
```

## Komponen UI

### Login Page (`src/app/login/page.tsx`)
Halaman login dengan validasi form dan integrasi Google OAuth:

**Fitur:**
- ✅ Email & password validation
- ✅ Show/hide password
- ✅ Remember me checkbox
- ✅ Google OAuth integration
- ✅ Error handling dengan Alert component
- ✅ Loading states

### Register Page (`src/app/register/page.tsx`)
Halaman registrasi dengan validasi lengkap:

**Fitur:**
- ✅ Multi-field validation (nama, email, phone, password)
- ✅ Password confirmation
- ✅ Terms & conditions checkbox
- ✅ Success state dengan redirect otomatis
- ✅ Google OAuth integration

### Protected Routes (`src/components/auth/ProtectedRoute.tsx`)
Komponen untuk melindungi route yang membutuhkan autentikasi:

```typescript
import { ProtectedRoute, AdminRoute, OrganizerRoute } from '@/components/auth/ProtectedRoute';

// Basic protection
<ProtectedRoute>
  <MyComponent />
</ProtectedRoute>

// Role-based protection
<AdminRoute>
  <AdminPanel />
</AdminRoute>

<OrganizerRoute>
  <EventManagement />
</OrganizerRoute>

// Custom roles
<ProtectedRoute requiredRoles={['admin', 'organizer']}>
  <MyComponent />
</ProtectedRoute>
```

### Auth Wrapper (`src/components/auth/AuthWrapper.tsx`)
Wrapper untuk menambahkan session management ke aplikasi:

```typescript
import { AuthWrapper } from '@/components/auth/AuthWrapper';

function App() {
  return (
    <AuthWrapper>
      {/* Your app */}
    </AuthWrapper>
  );
}
```

## Penggunaan

### 1. Login

```typescript
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({
        email: 'user@example.com',
        password: 'password123',
      });
      // Redirect akan otomatis dilakukan
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### 2. Register

```typescript
import { useAuth } from '@/contexts/AuthContext';

function RegisterForm() {
  const { register, isLoading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+62812345678',
      });
      // Auto login setelah register
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### 3. Logout

```typescript
import { useAuth } from '@/contexts/AuthContext';

function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Redirect ke home atau login
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### 4. Cek Status Autentikasi

```typescript
import { useAuth } from '@/contexts/AuthContext';

function UserProfile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>Silakan login terlebih dahulu</p>;
  }

  return (
    <div>
      <h1>Selamat datang, {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### 5. Permission Checking

```typescript
import { usePermissions } from '@/components/auth/ProtectedRoute';

function MyComponent() {
  const { isAdmin, isOrganizer, canManageEvents } = usePermissions();

  return (
    <div>
      {isAdmin() && <AdminButton />}
      {canManageEvents() && <CreateEventButton />}
    </div>
  );
}
```

## Komponen Shadcn UI

Sistem ini menggunakan komponen shadcn/ui:

- **Button** - Tombol dengan berbagai variant
- **Input** - Input field dengan validasi
- **Label** - Label untuk form fields
- **Card** - Container untuk form
- **Alert** - Menampilkan error/success message

### Contoh Penggunaan:

```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

function MyForm() {
  return (
    <div className="space-y-4">
      {/* Alert untuk error */}
      <Alert variant="destructive">
        <AlertDescription>Login gagal!</AlertDescription>
      </Alert>

      {/* Form field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="nama@example.com"
        />
      </div>

      {/* Button dengan loading state */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Memuat...' : 'Login'}
      </Button>
    </div>
  );
}
```

## State Management Flow

```
User Action (Login/Register)
        ↓
useAuth Hook (dari Context)
        ↓
Zustand Store Action
        ↓
API Service Call
        ↓
Update Store State
        ↓
Persist to localStorage
        ↓
Update UI (via React Context)
```

## Session Management

1. **Token Expiry Tracking**
   - Token expiry disimpan di store
   - Middleware memonitor expiry time
   - Warning ditampilkan 5 menit sebelum expire

2. **Auto Logout**
   - User di-logout otomatis ketika token expire
   - Session cleared dari localStorage

3. **Session Extension**
   - User bisa extend session dengan refresh token
   - Implementasi di `AuthWrapper` component

## Best Practices

1. **Selalu gunakan `useAuth` dari `@/contexts/AuthContext`**
   ```typescript
   // ✅ Benar
   import { useAuth } from '@/contexts/AuthContext';
   
   // ❌ Salah (deprecated)
   import { useAuth } from '@/hooks/useAuth';
   ```

2. **Protect sensitive routes**
   ```typescript
   <ProtectedRoute requiredRoles={['admin']}>
     <AdminPanel />
   </ProtectedRoute>
   ```

3. **Handle errors dengan graceful degradation**
   ```typescript
   const { error, clearError } = useAuth();
   
   useEffect(() => {
     if (error) {
       toast.error(error);
       clearError();
     }
   }, [error]);
   ```

4. **Loading states untuk UX yang lebih baik**
   ```typescript
   const { isLoading } = useAuth();
   
   if (isLoading) {
     return <LoadingSpinner />;
   }
   ```

## Environment Variables

Pastikan untuk set environment variable berikut:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## Troubleshooting

### Issue: User tidak redirect setelah login
**Solusi:** Pastikan `AuthProvider` sudah di-wrap di root layout

### Issue: Token expire tapi user tidak logout
**Solusi:** Pastikan `AuthWrapper` sudah digunakan dan middleware berjalan

### Issue: State tidak persist setelah refresh
**Solusi:** Check localStorage browser, pastikan `auth-storage` key ada

## Upgrade dari Sistem Lama

Jika Anda menggunakan sistem auth lama:

1. Update imports:
   ```typescript
   // Ganti
   import { useAuth } from '@/hooks/useAuth';
   
   // Dengan
   import { useAuth } from '@/contexts/AuthContext';
   ```

2. API signature tetap sama, tidak perlu perubahan logic

3. Add `AuthProvider` di root layout jika belum

## Testing

Untuk testing komponen yang menggunakan auth:

```typescript
import { AuthProvider } from '@/contexts/AuthContext';
import { render } from '@testing-library/react';

const wrapper = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

test('my component', () => {
  render(<MyComponent />, { wrapper });
  // assertions
});
```
