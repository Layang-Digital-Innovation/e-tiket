# Resend Email Service Setup Guide

## Overview
Resend adalah layanan email API modern yang menggantikan SMTP tradisional. Solusi ini mengatasi masalah port SMTP yang diblokir oleh provider.

## Installation

### 1. Install Resend Package
```bash
npm install resend
# atau
yarn add resend
```

### 2. Environment Variables (.env)

**Development:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
SMTP_FROM=onboarding@resend.dev
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Production:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
SMTP_FROM=noreply@naikkellas.com
FRONTEND_URL=https://naikkellas.com
NODE_ENV=production
```

### 3. Setup Resend Account

1. Daftar di https://resend.com
2. Dapatkan API Key dari dashboard
3. Untuk production, verifikasi domain Anda (naikkellas.com)

## Usage

### Switch to Resend Service

**Option 1: Direct Import (Production)**
```typescript
// auth.service.ts
import { EmailService } from '../email/email.service.resend';
```

**Option 2: Conditional Import (Development & Production)**
```typescript
// auth.service.ts
import { EmailService } from process.env.NODE_ENV === 'production' 
  ? '../email/email.service.resend' 
  : '../email/email.service';
```

### Available Methods

1. **sendVerificationEmail(email, token, name)**
   - Mengirim email verifikasi
   - Menggunakan template: `email-verification.html`

2. **sendPasswordResetEmail(email, token, name)**
   - Mengirim email reset password
   - Menggunakan template: `password-reset.html`

3. **sendWelcomeEmail(email, name)**
   - Mengirim email sambutan
   - Menggunakan template: `welcome.html`

4. **sendTicketEmail(params)**
   - Mengirim tiket dengan QR code
   - QR code embedded sebagai base64 (tidak perlu attachment)

5. **sendOrderSummary(params)**
   - Mengirim ringkasan pesanan
   - Includes attendee information

6. **sendWebinarAccessEmail(params)**
   - Mengirim akses webinar
   - Includes join link dan timezone support

## Key Features

✅ **QR Code Embedded** - QR code di-embed sebagai base64 dalam HTML, tidak perlu attachment
✅ **Error Handling** - Comprehensive logging dan error handling
✅ **Template Support** - Menggunakan Handlebars untuk template processing
✅ **Async/Await** - Modern async pattern
✅ **No Port Issues** - Tidak ada masalah port blocking
✅ **Reliable** - 99.9% uptime guarantee

## Comparison: Nodemailer vs Resend

| Feature | Nodemailer | Resend |
|---------|-----------|--------|
| Setup | SMTP config | API key |
| Port Blocking | ❌ Blocked | ✅ No issues |
| QR Code | Attachment (CID) | Base64 embedded |
| Error Handling | Try-catch | Response.error check |
| Rate Limit | Unlimited | 100/day (free), $0.0001/email (pro) |
| Reliability | Depends on SMTP | 99.9% uptime |
| Latency | Variable | Consistent |

## Testing

### Development (Test Email)
```bash
# Use onboarding@resend.dev as sender
# Test emails go to console
RESEND_API_KEY=re_test_key
SMTP_FROM=onboarding@resend.dev
```

### Production (Real Email)
```bash
# Use verified domain email
# Real emails sent to recipients
RESEND_API_KEY=re_production_key
SMTP_FROM=noreply@naikkellas.com
```

## Pricing

- **Free**: 100 emails/day
- **Pro**: $20/month + $0.0001 per email
- **Enterprise**: Custom pricing

## Troubleshooting

### Issue: "RESEND_API_KEY not configured"
**Solution:** Add RESEND_API_KEY to .env file

### Issue: "Email sending failed"
**Solution:** Check API key validity and rate limits

### Issue: "Invalid sender email"
**Solution:** Use verified domain email for production

## Rollback to Nodemailer

Jika perlu kembali ke Nodemailer:

1. Update import di `auth.service.ts`:
```typescript
import { EmailService } from '../email/email.service';
```

2. Pastikan environment variables SMTP sudah dikonfigurasi:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Files

- **`email.service.resend.ts`** - Resend implementation
- **`email.service.ts`** - Nodemailer implementation (fallback)
- **`email.module.ts`** - Email module configuration

## Next Steps

1. ✅ Install `resend` package
2. ✅ Add `RESEND_API_KEY` to .env
3. ✅ Update import di `auth.service.ts`
4. ✅ Test all email methods
5. ✅ Deploy ke production
6. ✅ Verifikasi domain di Resend dashboard
