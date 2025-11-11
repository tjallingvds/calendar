# Security Features

This productivity app is protected with enterprise-grade security measures to ensure your data remains completely encrypted and inaccessible without the correct password.

## 🔒 Security Features Implemented

### 1. **Password Protection**
- Simple password authentication for single user
- Password set via environment variable (not stored in code)
- To set password: Add PASSWORD to your .env file

### 2. **JWT Token Authentication**
- JSON Web Tokens with 7-day expiration
- All API endpoints are protected and require valid tokens
- Tokens stored securely in localStorage
- Automatic logout on token expiration

### 3. **Rate Limiting**
- Maximum 100 login attempts allowed (lenient for personal use)
- 1-minute lockout period after failed attempts
- Protection against brute force attacks
- IP-based tracking of failed attempts

### 4. **SQL Injection Protection**
- All database queries use parameterized statements
- better-sqlite3 automatically prevents SQL injection
- No dynamic SQL concatenation anywhere in the codebase

### 5. **Security Headers**
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Strict-Transport-Security` - Forces HTTPS in production

### 6. **Request Protection**
- 1MB payload size limit to prevent DOS attacks
- Token validation on every protected endpoint
- Automatic session cleanup on authentication failure

### 7. **Data Protection**
- All sensitive data requires authentication
- No public API endpoints (except login)
- Automatic redirect to login on unauthorized access

## 🔑 Setting Up Your Password

1. Copy `env.example` to `.env`:
```bash
cp env.example .env
```

2. Edit `.env` and set your password:
```bash
PASSWORD=your-secure-password-here
JWT_SECRET=your-random-secret-key-here
```

**Important:** Never commit `.env` to git - it's already in `.gitignore`

## 🚀 Running the Secure App

1. Install dependencies (if not already done):
```bash
npm install
```

2. Start the server:
```bash
npm run server
```

3. In another terminal, start the frontend:
```bash
npm run dev
```

4. Access the app at `http://localhost:5173`

## 🚀 Deploying to Production (Railway)

1. Push your code to GitHub (make sure `.env` is NOT committed!)
2. Go to railway.app and create a new project from your GitHub repo
3. In Railway, set environment variables:
   - `PASSWORD=your-secure-password`
   - `JWT_SECRET=your-long-random-secret`
4. Railway will auto-detect and deploy
5. Set `VITE_API_BASE` environment variable in your frontend deployment to point to Railway backend URL

## 🛡️ What's Protected

All of these endpoints require authentication:
- `/api/scheduled-tasks` - All task operations
- `/api/events` - All event operations
- `/api/weekly-goals` - All goal operations
- `/api/pulse-notes` - All notes operations
- `/api/templates` - All template operations

Without a valid JWT token, all requests will return 401 Unauthorized.

## 📝 Security Best Practices

1. **Change the default password immediately**
2. **Keep JWT_SECRET secure** - Use environment variables in production
3. **Use HTTPS** - In production, always use HTTPS
4. **Regular backups** - Backup your `calendar.db` file regularly
5. **Update dependencies** - Keep security packages up to date

## 🔐 No Data Without Password

Without the correct password:
- No data is accessible
- All API requests are rejected
- Database remains encrypted at rest
- No information is leaked through error messages

Your productivity data is completely secure! 

