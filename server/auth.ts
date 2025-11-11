import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Generate a secure secret key (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-' + Date.now();

// Password from environment variable (REQUIRED)
const PASSWORD = process.env.PASSWORD;

if (!PASSWORD) {
  console.error('ERROR: PASSWORD environment variable is not set!');
  console.error('Please set PASSWORD in your .env file or environment variables.');
  process.exit(1);
}

export interface AuthRequest extends Request {
  userId?: string;
}

// Verify password
export function verifyPassword(password: string): boolean {
  return password === PASSWORD;
}

// Generate JWT token
export function generateToken(): string {
  return jwt.sign(
    { userId: 'admin', timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

// Authentication middleware
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = (decoded as any).userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// Rate limiting for login attempts (simple in-memory store)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 100; // Very lenient for personal use
const LOCKOUT_TIME = 1 * 60 * 1000; // 1 minute

export function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Reset if lockout time has passed
  if (now - attempts.lastAttempt > LOCKOUT_TIME) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Check if max attempts exceeded
  if (attempts.count >= MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((LOCKOUT_TIME - (now - attempts.lastAttempt)) / 60000);
    return {
      allowed: false,
      message: `Too many failed attempts. Please try again in ${remainingTime} minutes.`
    };
  }

  attempts.count++;
  attempts.lastAttempt = now;
  return { allowed: true };
}

export function resetRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

// Input sanitization helper
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove any potential SQL injection characters and XSS attempts
    return input
      .replace(/[^\w\s\-.,!?@#()]/gi, '') // Remove special chars except common ones
      .trim()
      .substring(0, 10000); // Max length
  }
  return input;
}

