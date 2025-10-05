# 🔐 Panduan Menggunakan Google OAuth

Aplikasi ticketing ini sudah dilengkapi dengan sistem autentikasi Google OAuth yang memungkinkan pengguna untuk login menggunakan akun Google mereka.

## 📋 Prasyarat

1. **Server Backend** harus berjalan di `http://localhost:5000`
2. **Frontend** harus berjalan di `http://localhost:3000`
3. **Konfigurasi Google OAuth** sudah diatur di `.env`

## 🚀 Cara Menggunakan Google OAuth

### 1. **Memulai Proses OAuth**

Untuk memulai proses login dengan Google, arahkan pengguna ke endpoint:

```
GET http://localhost:5000/api/auth/google
```

**Contoh implementasi di frontend:**

```javascript
// Redirect ke Google OAuth
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};

// Atau menggunakan link
<a href="http://localhost:5000/api/auth/google">
  Login dengan Google
</a>
```

### 2. **Flow Autentikasi**

Berikut adalah alur lengkap proses Google OAuth:

```
1. User klik "Login dengan Google"
   ↓
2. Redirect ke: http://localhost:5000/api/auth/google
   ↓
3. Server redirect ke Google OAuth
   ↓
4. User login di Google & memberikan izin
   ↓
5. Google redirect ke: http://localhost:5000/api/auth/google/callback
   ↓
6. Server memproses data user dari Google
   ↓
7. Server redirect ke frontend dengan token: 
   http://localhost:3000/auth/callback?token=JWT_TOKEN
```

### 3. **Menangani Response di Frontend**

Setelah proses OAuth selesai, user akan diarahkan ke frontend dengan token JWT:

```javascript
// Di halaman /auth/callback
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Simpan token ke localStorage atau state management
    localStorage.setItem('authToken', token);
    
    // Redirect ke dashboard atau halaman utama
    router.push('/dashboard');
  } else {
    // Handle error
    router.push('/login?error=oauth_failed');
  }
}, []);
```

### 4. **Menggunakan Token untuk API Calls**

Setelah mendapat token, gunakan untuk mengakses API yang memerlukan autentikasi:

```javascript
// Contoh API call dengan token
const fetchUserData = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('http://localhost:5000/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

## 🔧 Konfigurasi Environment

Pastikan file `.env` memiliki konfigurasi berikut:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=9719575231-kjf09hi7ukmbsctgonvn4g6lgca2c706.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL untuk redirect setelah OAuth
FRONTEND_URL=http://localhost:3000
```

## 📱 Implementasi UI Component

Berikut contoh komponen React untuk tombol Google OAuth:

```jsx
import React from 'react';

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    // Redirect ke Google OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        {/* Google Icon SVG */}
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Login dengan Google
    </button>
  );
};

export default GoogleLoginButton;
```

## 🔍 Data User yang Diterima

Setelah berhasil login dengan Google, sistem akan menerima data berikut:

```javascript
{
  "id": "user_uuid",
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "profileImage": "https://lh3.googleusercontent.com/...",
  "oauthProvider": "google",
  "oauthProviderId": "google_user_id",
  "emailVerified": true,
  "role": "user",
  "status": "active"
}
```

## 🛡️ Keamanan

1. **Token JWT** memiliki masa berlaku sesuai konfigurasi `JWT_EXPIRES_IN`
2. **Email sudah terverifikasi** otomatis untuk user Google OAuth
3. **Tidak ada password** yang disimpan untuk user OAuth
4. **Linking account** - jika email sudah terdaftar, akun Google akan di-link ke akun existing

## 🚨 Troubleshooting

### Error: "OAuth2Strategy requires a clientID option"
- Pastikan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` sudah diset di `.env`
- Restart server setelah mengubah environment variables

### Error: "redirect_uri_mismatch"
- Periksa `GOOGLE_CALLBACK_URL` di `.env`
- Pastikan URL callback sama dengan yang didaftarkan di Google Console

### Token tidak diterima di frontend
- Periksa `FRONTEND_URL` di `.env`
- Pastikan frontend berjalan di URL yang benar

## 📚 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/auth/google` | Memulai proses Google OAuth |
| `GET` | `/api/auth/google/callback` | Callback dari Google OAuth |
| `POST` | `/api/auth/login` | Login dengan email/password |
| `POST` | `/api/auth/register` | Register akun baru |
| `GET` | `/api/users/profile` | Mendapatkan profil user (perlu token) |

## 🎯 Testing

Untuk testing Google OAuth:

1. Pastikan server backend berjalan
2. Buka browser dan akses: `http://localhost:5000/api/auth/google`
3. Login dengan akun Google
4. Periksa apakah redirect ke frontend berhasil dengan token

---

**💡 Tips:** Untuk development, gunakan akun Google pribadi. Untuk production, pastikan domain sudah didaftarkan di Google Console dan gunakan HTTPS.