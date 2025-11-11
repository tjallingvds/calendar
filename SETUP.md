# Setup Instructions

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
# Copy the example file
cp env.example .env

# Edit .env and add your password
# Example:
# PASSWORD=your-secure-password-here
# JWT_SECRET=some-long-random-string-here
```

### 3. Run the Application
```bash
# Terminal 1 - Start the backend server
npm run server

# Terminal 2 - Start the frontend
npm run dev
```

### 4. Access the App
Open http://localhost:5173 and login with your password from `.env`

## Important Notes

⚠️ **Never commit `.env` to git** - it contains your password!

✅ `.env` is already in `.gitignore`

✅ Only commit `env.example` (without real secrets)

## Deployment

See [SECURITY.md](./SECURITY.md) for deployment instructions to Railway.

