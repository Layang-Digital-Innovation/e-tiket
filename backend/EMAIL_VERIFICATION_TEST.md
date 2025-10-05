# Email Verification Testing Guide

Panduan lengkap untuk menguji sistem verifikasi email pada aplikasi ticketing.

## Overview

Sistem email verification terdiri dari beberapa komponen:
1. **Registration** - User mendaftar dan mendapat email verification token
2. **Email Sending** - System mengirim email dengan link verifikasi
3. **Email Verification** - User klik link untuk verifikasi email
4. **Resend Verification** - User bisa minta kirim ulang email verifikasi

## Endpoints yang Terlibat

### 1. POST /auth/register
```json
{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```
**Response:**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "user",
    "status": "active",
    "emailVerified": false
  }
}
```

### 2. GET /auth/verify-email?token=TOKEN
**Response (Success):**
```json
{
  "message": "Email verified successfully",
  "access_token": "jwt.token.here",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "user",
    "status": "active",
    "emailVerified": true
  }
}
```

**Response (Error):**
```json
{
  "statusCode": 400,
  "message": "Invalid or expired verification token",
  "error": "Bad Request"
}
```

### 3. POST /auth/resend-verification
```json
{
  "email": "test@example.com"
}
```
**Response:**
```json
{
  "message": "Verification email sent successfully"
}
```

## Cara Testing

### Method 1: Menggunakan Script Test Otomatis

1. **Pastikan server backend berjalan:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Jalankan script test:**
   ```bash
   node test-email-verification.js
   ```

3. **Script akan melakukan:**
   - Register user baru
   - Test endpoint verify-email dengan token sample (akan error)
   - Test resend verification email

### Method 2: Testing Manual dengan Postman/curl

#### Step 1: Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Step 2: Ambil Token dari Database
```sql
SELECT "emailVerificationToken", "emailVerificationExpires", "emailVerified"
FROM "user"
WHERE email = 'test@example.com';
```

#### Step 3: Test Verification
```bash
curl -X GET "http://localhost:3000/auth/verify-email?token=YOUR_TOKEN_HERE"
```

#### Step 4: Test Resend Verification
```bash
curl -X POST http://localhost:3000/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Method 3: Testing dengan Token Spesifik

Jika Anda sudah punya token dari database:
```bash
node test-email-verification.js verify YOUR_TOKEN_HERE
```

### Method 4: Mendapatkan Instruksi Token dari Database
```bash
node test-email-verification.js token
```

## Skenario Testing

### ✅ Test Cases yang Harus Berhasil

1. **Register user baru**
   - Email belum terdaftar
   - Password minimal 6 karakter
   - Semua field required terisi

2. **Verify email dengan token valid**
   - Token ada di database
   - Token belum expired (< 24 jam)
   - Email belum verified sebelumnya

3. **Resend verification email**
   - Email sudah terdaftar
   - Email belum verified

### ❌ Test Cases yang Harus Error

1. **Register dengan email yang sudah ada**
   ```json
   {
     "statusCode": 409,
     "message": "User with this email already exists"
   }
   ```

2. **Verify dengan token invalid**
   ```json
   {
     "statusCode": 400,
     "message": "Invalid or expired verification token"
   }
   ```

3. **Verify dengan token expired**
   ```json
   {
     "statusCode": 400,
     "message": "Verification token has expired"
   }
   ```

4. **Verify email yang sudah verified**
   ```json
   {
     "statusCode": 400,
     "message": "Email is already verified"
   }
   ```

5. **Resend verification untuk email yang tidak ada**
   ```json
   {
     "statusCode": 404,
     "message": "User not found"
   }
   ```

6. **Resend verification untuk email yang sudah verified**
   ```json
   {
     "statusCode": 400,
     "message": "Email is already verified"
   }
   ```

## Email Template Testing

Email verification menggunakan template di `src/email/templates/email-verification.html`.

**Template variables:**
- `{{firstName}}` - Nama depan user
- `{{verificationUrl}}` - URL verifikasi lengkap

**URL format:**
```
${FRONTEND_URL}/verify-email?token=${token}
```

## Database Schema

Field yang terkait dengan email verification:

```sql
CREATE TABLE "user" (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  "emailVerified" BOOLEAN DEFAULT FALSE,
  "emailVerificationToken" VARCHAR,
  "emailVerificationExpires" TIMESTAMP,
  -- other fields...
);
```

## Environment Variables

Pastikan environment variables berikut sudah diset:

```env
# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@ticketing-app.com

# Frontend URL for email links
FRONTEND_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ticketing_db
```

## Troubleshooting

### Email tidak terkirim
1. Cek SMTP credentials
2. Pastikan Gmail App Password benar
3. Cek firewall/antivirus
4. Lihat logs aplikasi

### Token tidak ditemukan
1. Pastikan user sudah register
2. Cek database apakah token tersimpan
3. Pastikan token belum expired

### Frontend tidak menerima redirect
1. Cek FRONTEND_URL di environment
2. Pastikan frontend server berjalan
3. Cek CORS settings

## Tips Testing

1. **Gunakan email testing service** seperti Mailtrap untuk development
2. **Buat multiple test users** dengan email berbeda
3. **Test dengan berbagai browser** untuk memastikan kompatibilitas
4. **Monitor database** untuk melihat perubahan status verification
5. **Test edge cases** seperti token expired, email sudah verified, dll.

## Security Considerations

1. **Token harus random** dan sulit ditebak
2. **Token harus expired** setelah 24 jam
3. **Rate limiting** untuk prevent spam
4. **Validate email format** sebelum kirim
5. **Log security events** untuk monitoring