import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// Get JWT Secret from environment
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production')
    }
    console.warn('⚠️ WARNING: Using default JWT_SECRET in development. Set JWT_SECRET in environment for production.')
    return 'dev-secret-replace-in-production'
  }
  return secret
})()

const BCRYPT_ROUNDS = 12
const TOKEN_EXPIRY = '7d'

/**
 * Hash password using bcrypt
 * @param password Raw password string (minimum 6 characters)
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }
  return bcrypt.hashSync(password.trim(), BCRYPT_ROUNDS)
}

/**
 * Verify password against hash
 * @param password Raw password to verify
 * @param hash Hashed password from database
 * @returns True if password matches
 */
export function verifyPassword(password: string, hash: string): boolean {
  try {
    if (!password || typeof password !== 'string' || !hash || typeof hash !== 'string') {
      return false
    }
    return bcrypt.compareSync(password, hash)
  } catch (e) {
    console.error('Password verification error:', e)
    return false
  }
}

/**
 * Sign JWT token with user data
 * @param payload User data to encode in token
 * @returns Signed JWT token
 */
export function signToken(payload: Record<string, any>): string {
  if (!payload || Object.keys(payload).length === 0) {
    throw new Error('Invalid token payload')
  }
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: TOKEN_EXPIRY,
    algorithm: 'HS256'
  })
}

/**
 * Verify and decode JWT token
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): Record<string, any> | null {
  try {
    if (!token || typeof token !== 'string') return null
    return jwt.verify(token, JWT_SECRET) as Record<string, any>
  } catch (e) {
    return null
  }
}

/**
 * Set secure HTTP-only cookie with authentication token
 * @param token JWT token to set in cookie
 */
export async function setAuthCookie(token: string) {
  if (!token || typeof token !== 'string') {
    throw new Error('Valid token is required')
  }
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.set('token', '', { maxAge: 0 })
}
