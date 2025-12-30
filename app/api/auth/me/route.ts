import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
    if (!payload || typeof payload !== 'object' || !('id' in payload) || typeof (payload as any).id !== 'number') {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: (payload as any).id },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions.map(up => ({
          permissionName: up.permission?.name,
          granted: up.granted
        }))
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('GET /api/auth/me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
