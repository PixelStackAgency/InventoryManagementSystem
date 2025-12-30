import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'
import { hash } from 'bcryptjs'

// GET: List all staff users
export async function GET(req: NextRequest) {
  const authResult = await authorize('MANAGE_STAFF')
  if (authResult instanceof NextResponse) return authResult

  try {
    const users = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        permissions: {
          select: {
            permission: {
              select: { id: true, name: true, description: true }
            },
            granted: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

// POST: Create new staff user
export async function POST(req: NextRequest) {
  const authResult = await authorize('MANAGE_STAFF')
  if (authResult instanceof NextResponse) return authResult

  try {
    const { username, password, permissions } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    // Create user
    const hashedPassword = await hash(password, 10)
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'STAFF'
      }
    })

    // Assign permissions if provided
    if (permissions && Array.isArray(permissions)) {
      for (const permissionId of permissions) {
        await prisma.userPermission.create({
          data: {
            userId: user.id,
            permissionId,
            granted: true
          }
        })
      }
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
  }
}
