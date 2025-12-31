import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'
import { hashPassword } from '@/lib/auth'

/**
 * GET /api/users/[id]
 * Get a specific user with their permissions
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authorize()
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const userId = Number(id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'User ID must be a valid number' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/users/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/users/[id]
 * Update user permissions or password
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authorize('MANAGE_STAFF')
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const userId = Number(id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'User ID must be a valid number' },
        { status: 400 }
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

    const { permissions, password } = body

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update password if provided
    if (password) {
      if (typeof password !== 'string' || password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }

      const hashedPassword = hashPassword(password)
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      })
    }

    // Update permissions if provided
    if (permissions && Array.isArray(permissions)) {
      // Clear existing permissions
      await prisma.userPermission.deleteMany({
        where: { userId }
      })

      // Add new permissions
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
                userId,
                permissionId: permIdNum,
                granted: true
              }
            })
          }
        }
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          select: {
            permission: {
              select: { id: true, name: true }
            },
            granted: true
          }
        }
      }
    })

    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error: any) {
    console.error('PUT /api/users/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a user (cannot delete SUPER_ADMIN)
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authorize('MANAGE_STAFF')
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const userId = Number(id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'User ID must be a valid number' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deleting superadmin
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete SUPER_ADMIN user' },
        { status: 403 }
      )
    }

    // Delete user permissions first
    await prisma.userPermission.deleteMany({
      where: { userId }
    })

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json(
      { ok: true, message: 'User deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('DELETE /api/users/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
