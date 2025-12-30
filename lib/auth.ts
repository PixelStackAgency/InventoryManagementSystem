import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// Use strong secret from environment or throw error in production
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production')
  }
  return 'dev-secret-replace-in-production'
})()

const BCRYPT_ROUNDS = 12
const TOKEN_EXPIRY = '7d'

export function hashPassword(password: string): string {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }
  return bcrypt.hashSync(password, BCRYPT_ROUNDS)
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash)
  } catch (e) {
    return false
  }
}

export function signToken(payload: Record<string, any>): string {
  if (!payload || Object.keys(payload).length === 0) {
    throw new Error('Invalid token payload')
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token: string): Record<string, any> | null {
  try {
    if (!token || typeof token !== 'string') return null
    return jwt.verify(token, JWT_SECRET) as Record<string, any>
  } catch (e) {
    return null
  }
}

export async function setAuthCookie(token: string) {
  if (!token) throw new Error('Token is required')
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
