import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'
import { hashPassword } from '@/lib/auth'

/**
 * GET /api/users
 * List all staff users with their permissions
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authorize()
    if (authResult instanceof NextResponse) return authResult

    const users = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          select: {
            permission: {
              select: { id: true, name: true, description: true }
            },
            granted: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 1000
    })

    return NextResponse.json(users, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users
 * Create a new staff user
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authorize('MANAGE_STAFF')
    if (authResult instanceof NextResponse) return authResult

    let body: any
    try {
      body = await req.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { username, password, permissions } = body

    // Validate input
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json(
        { error: 'Username is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password is required and must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existing = await prisma.user.findUnique({
      where: { username: username.trim() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
        role: 'STAFF'
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true
      }
    })

    // Assign permissions if provided
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      for (const permissionId of permissions) {
        const permIdNum = Number(permissionId)
        if (!isNaN(permIdNum)) {
          // Check if permission exists
          const perm = await prisma.permission.findUnique({
            where: { id: permIdNum }
          })
          if (perm) {
            await prisma.userPermission.create({
              data: {
                userId: user.id,
                permissionId: permIdNum,
                granted: true
              }
            })
          }
        }
      }
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/users error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
