import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { prisma } from './prisma'

export interface AuthorizedUser {
  id: number
  username: string
  role: string
  permissions?: any[]
}

export async function authorize(requiredPermission?: string): Promise<AuthorizedUser | NextResponse> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || !payload.id || typeof payload.id !== 'number') {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    // Fetch user with permissions
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - User not found' },
        { status: 401 }
      )
    }

    // If SUPER_ADMIN, bypass permission checks
    if (user.role === 'SUPER_ADMIN') {
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions
      }
    }

    // Check specific permission if required
    if (requiredPermission) {
      const hasPermission = user.permissions.some(
        up => up.permission?.name === requiredPermission && up.granted
      )

      if (!hasPermission) {
        return NextResponse.json(
          { error: `Forbidden - Missing permission: ${requiredPermission}` },
          { status: 403 }
        )
      }
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions
    }
  } catch (error: any) {
    console.error('Authorization error:', error)
    return NextResponse.json(
      { error: 'Internal server error during authorization' },
      { status: 500 }
    )
  }
}

export async function getCurrentUser(): Promise<AuthorizedUser | null> {
  const result = await authorize()
  if (result instanceof NextResponse) return null
  return result
}
