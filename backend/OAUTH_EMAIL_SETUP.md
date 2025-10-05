# OAuth and Email Service Setup Guide

This guide will help you set up OAuth authentication (Google and GitHub) and email service for the ticketing application.

## Prerequisites

1. Node.js and npm installed
2. PostgreSQL database running
3. Gmail account (for SMTP) or other email service
4. Google Developer Console account
5. GitHub Developer account

## Environment Variables Setup

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

## Email Service Setup (Gmail SMTP)

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication

### 2. Generate App Password
- Go to Google Account > Security > 2-Step Verification
- Scroll down to "App passwords"
- Generate a new app password for "Mail"
- Use this password in `SMTP_PASS` environment variable

### 3. Configure Environment Variables
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_FROM=noreply@ticketing-app.com
```

## Google OAuth Setup

### 1. Create Google Cloud Project
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing one

### 2. Enable Google+ API
- Go to APIs & Services > Library
- Search for "Google+ API" and enable it

### 3. Create OAuth 2.0 Credentials
- Go to APIs & Services > Credentials
- Click "Create Credentials" > "OAuth 2.0 Client IDs"
- Choose "Web application"
- Add authorized redirect URIs:
  - `http://localhost:3001/auth/google/callback` (development)
  - `https://yourdomain.com/auth/google/callback` (production)

### 4. Configure Environment Variables
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## GitHub OAuth Setup

### 1. Create GitHub OAuth App
- Go to GitHub Settings > Developer settings > OAuth Apps
- Click "New OAuth App"
- Fill in the application details:
  - Application name: "Ticketing App"
  - Homepage URL: `http://localhost:3000` (development)
  - Authorization callback URL: `http://localhost:3001/auth/github/callback`

### 2. Configure Environment Variables
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Database Migration

Run the following command to update your database schema:

```bash
npm run migration:run
```

## Testing the Setup

### 1. Start the Backend Server
```bash
npm run start:dev
```

### 2. Test Email Service
You can test the email service by registering a new user. The system will send a verification email.

### 3. Test OAuth
Navigate to:
- Google OAuth: `http://localhost:3001/auth/google`
- GitHub OAuth: `http://localhost:3001/auth/github`

## API Endpoints

### Authentication
- `POST /auth/register` - Register with email verification
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/github` - Initiate GitHub OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/github/callback` - GitHub OAuth callback

### Email Verification
- `GET /auth/verify-email?token=TOKEN` - Verify email address
- `POST /auth/resend-verification` - Resend verification email

### Password Reset
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

## Frontend Integration

The OAuth callbacks will redirect to the frontend with an access token:
- Success: `${FRONTEND_URL}/auth/success?token=JWT_TOKEN`
- Error: `${FRONTEND_URL}/auth/error?message=ERROR_MESSAGE`

## Security Considerations

1. **Environment Variables**: Never commit `.env` file to version control
2. **HTTPS**: Use HTTPS in production for OAuth callbacks
3. **Token Expiration**: Configure appropriate JWT expiration times
4. **Rate Limiting**: Implement rate limiting for auth endpoints
5. **Email Templates**: Ensure email templates are secure and don't expose sensitive information

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SMTP credentials
   - Verify app password is correct
   - Check firewall settings

2. **OAuth redirect mismatch**
   - Verify callback URLs in OAuth provider settings
   - Check environment variables

3. **Database errors**
   - Ensure database is running
   - Run migrations
   - Check database connection settings

### Logs
Check application logs for detailed error messages:
```bash
npm run start:dev
```

## Production Deployment

1. Update OAuth callback URLs to production domains
2. Use environment-specific configuration
3. Enable HTTPS
4. Configure proper CORS settings
5. Set up monitoring and logging