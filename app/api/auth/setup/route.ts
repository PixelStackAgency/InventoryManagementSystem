import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

/**
 * POST /api/auth/setup
 * Setup the first admin user - SECURE: Only works if NO users exist
 * This is for initial setup only
 */
export async function POST(req: NextRequest) {
  try {
    // Check if any users exist
    const userCount = await prisma.user.count()
    if (userCount > 0) {
      return NextResponse.json(
        { error: 'Setup already completed. Users already exist in the system.' },
        { status: 403 }
      )
    }

    let body: any
    try {
      body = await req.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { username, password, businessName } = body

    // Validate input
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json(
        { error: 'Username is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password is required and must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = hashPassword(password)

    // Create super admin user
    const adminUser = await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true
      }
    })

    // Assign all permissions to admin
    const allPermissions = await prisma.permission.findMany()
    for (const perm of allPermissions) {
      await prisma.userPermission.create({
        data: {
          userId: adminUser.id,
          permissionId: perm.id,
          granted: true
        }
      })
    }

    // Update business name if provided
    if (businessName && typeof businessName === 'string') {
      await prisma.systemSettings.update({
        where: { id: 1 },
        data: { businessName: businessName.trim() }
      })
    }

    return NextResponse.json({
      ok: true,
      message: 'Admin user created successfully',
      user: adminUser
    }, { status: 201 })
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup admin user' },
      { status: 500 }
    )
  }
}
