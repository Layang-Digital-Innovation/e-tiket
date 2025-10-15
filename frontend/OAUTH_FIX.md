# OAuth Login Fix - Token Hilang Setelah Redirect

## 🔴 Masalah yang Terjadi

Setelah login dengan Google OAuth:
1. ✅ Redirect ke dashboard berhasil
2. ❌ Token tiba-tiba hilang
3. ❌ User terlempar kembali ke halaman login

## 🔍 Root Cause Analysis

### 1. **Cookie Name Mismatch**
```
OAuth Callback set: authToken
Middleware expect:    access_token
TokenExpiryChecker:   access_token

Result: Middleware tidak menemukan token → Redirect ke login
```

### 2. **Zustand Store Tidak Ter-update**
```
OAuth Success → Set cookies ✅
             → Update Zustand ❌

TokenExpiryChecker check isAuthenticated dari Zustand
Result: State tidak sync → Checker tidak jalan dengan benar
```

### 3. **Token Expiry Check Terlalu Cepat**
```
OAuth Success → Redirect → TokenExpiryChecker langsung check
                        → Token belum ter-set dengan sempurna
                        → Auto logout

Result: Race condition antara cookie setting dan checker
```

## ✅ Solusi yang Diimplementasikan

### 1. **Standardize Cookie Names** (`auth/callback/route.ts`)

**Before:**
```typescript
redirectResponse.cookies.set('authToken', token, {...});
```

**After:**
```typescript
// Use 'access_token' to match middleware expectations
redirectResponse.cookies.set('access_token', token, {...});

// Add user_role cookie for middleware fallback
redirectResponse.cookies.set('user_role', userData.role, {...});
```

### 2. **Update Zustand Store on OAuth Success** (`auth/success/page.tsx`)

**Before:**
```typescript
// Only set cookies, no Zustand update
const userData = JSON.parse(decodeURIComponent(userDataStr));
// Redirect immediately
```

**After:**
```typescript
const userData = JSON.parse(decodeURIComponent(userDataStr));

// Update Zustand store
const authStore = useAuthStore.getState();
authStore.user = userData;
authStore.isAuthenticated = true;
authStore.tokenExpiry = Date.now() + (60 * 60 * 24 * 7 * 1000);

console.log('✅ OAuth Success - User authenticated:', userData.email);
```

### 3. **Add Grace Period to TokenExpiryChecker** (`TokenExpiryChecker.tsx`)

**Changes:**
```typescript
// 1. Delay initial check by 2 seconds
const initialTimeout = setTimeout(() => {
  checkTokenExpiry();
}, 2000);

// 2. Don't logout on first check if no token
if (!token) {
  if (initialCheckDoneRef.current) {
    // Only logout if this is not the initial check
    await logout();
  } else {
    console.log('⏳ Initial check - no token yet, waiting...');
  }
  return;
}

// 3. Mark initial check as done once we have a token
initialCheckDoneRef.current = true;
```

## 🧪 Testing Steps

### Test 1: OAuth Login Flow
```bash
1. Clear all cookies & localStorage
2. Go to /login
3. Click "Masuk dengan Google"
4. Complete Google OAuth
5. Check console logs:
   - "OAuth Success - Token: EXISTS"
   - "✅ OAuth Success - User authenticated"
6. Should redirect to dashboard
7. Check cookies in DevTools:
   - access_token: [JWT token]
   - user_role: event_organizer
   - userData: [JSON]
8. Should stay on dashboard (no redirect back to login)
```

### Test 2: Token Persistence
```bash
1. Login via OAuth
2. Wait 5 seconds
3. Navigate to different pages
4. Check console - should see:
   - "⏳ Initial check - no token yet, waiting..." (first 2 seconds)
   - Then no more logout messages
5. Refresh page
6. Should stay authenticated
```

### Test 3: Middleware Protection
```bash
1. Login via OAuth as event_organizer
2. Check middleware logs:
   - 🍪 Token: EXISTS
   - ✅ Valid: true
   - 👤 Role: event_organizer
3. Access /organizer/events
4. Should be allowed (no redirect)
```

## 📊 Debug Logs

### Successful OAuth Flow
```
# OAuth Callback
Setting cookies: access_token, user_role, userData

# Auth Success Page
OAuth Success - Token: EXISTS
OAuth Success - UserData: {"id":"...","email":"...","role":"event_organizer"}
✅ OAuth Success - User authenticated: user@example.com Role: event_organizer

# Middleware
🔍 Middleware Check
📍 Path: /organizer/dashboard
🍪 Token: EXISTS
✅ Valid: true
👤 Role: event_organizer
✅ ACCESS GRANTED

# TokenExpiryChecker
⏳ Initial check - no token yet, waiting...
(after 2 seconds)
Token found, expiry check passed
```

### Failed Flow (Before Fix)
```
# OAuth Callback
Setting cookies: authToken (WRONG NAME)

# Middleware
🔍 Middleware Check
🍪 Token: MISSING (looking for 'access_token')
❌ REDIRECTING TO LOGIN

# TokenExpiryChecker
🔴 No access_token found - logging out
```

## 🔧 Configuration

### Cookie Settings
```typescript
// auth/callback/route.ts
{
  httpOnly: false,    // Allow client-side access
  secure: isProduction, // HTTPS only in production
  sameSite: 'lax',    // CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',          // Available on all routes
}
```

### Token Expiry Grace Period
```typescript
// TokenExpiryChecker.tsx
const initialTimeout = setTimeout(() => {
  checkTokenExpiry();
}, 2000); // 2 seconds delay

// Adjust if needed:
}, 3000); // 3 seconds for slower connections
```

## 🐛 Troubleshooting

### Issue: Still redirecting to login after OAuth

**Check 1: Cookie Names**
```javascript
// Open DevTools → Application → Cookies
// Should see:
access_token: [JWT]
user_role: event_organizer
userData: [JSON]

// NOT:
authToken: [JWT] ❌
```

**Check 2: Zustand State**
```javascript
// Open DevTools → Console
useAuthStore.getState()
// Should show:
{
  user: {...},
  isAuthenticated: true,
  tokenExpiry: [timestamp]
}
```

**Check 3: Middleware Logs**
```
Look for:
🍪 Token: EXISTS ✅
✅ Valid: true ✅

NOT:
🍪 Token: MISSING ❌
```

### Issue: Token expires immediately

**Check JWT exp claim:**
```javascript
// Decode token in console
const token = document.cookie.split('access_token=')[1].split(';')[0];
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token exp:', new Date(payload.exp * 1000));
console.log('Now:', new Date());
```

Backend must set `exp` claim correctly (Unix timestamp in seconds).

### Issue: Race condition still occurs

**Increase grace period:**
```typescript
// TokenExpiryChecker.tsx
const initialTimeout = setTimeout(() => {
  checkTokenExpiry();
}, 5000); // Increase to 5 seconds
```

## 📝 Backend Requirements

Backend OAuth callback must return JWT with:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "event_organizer",
  "iat": 1234567890,
  "exp": 1235177490  // ⚠️ MUST be in future (Unix timestamp seconds)
}
```

## ✅ Verification Checklist

After implementing fixes:
- [ ] OAuth login completes successfully
- [ ] User stays on dashboard (no redirect loop)
- [ ] Cookies are set with correct names
- [ ] Zustand store is updated
- [ ] Middleware allows access to protected routes
- [ ] TokenExpiryChecker doesn't trigger false logout
- [ ] Console logs show successful authentication
- [ ] Page refresh maintains authentication
- [ ] Navigation between pages works
- [ ] Manual logout still works correctly

## 🚀 Next Steps

1. Test OAuth flow thoroughly
2. Monitor console logs for any errors
3. Verify cookie persistence across page refreshes
4. Test with different user roles
5. Consider implementing refresh token mechanism
