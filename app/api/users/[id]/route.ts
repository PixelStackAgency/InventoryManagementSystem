import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'
import { hash } from 'bcryptjs'

// GET: Get specific staff user
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authorize('MANAGE_STAFF')
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
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

    if (!user) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

// PUT: Update staff user permissions
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authorize('MANAGE_STAFF')
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  try {
    const { permissions } = await req.json()

    // Clear existing permissions
    await prisma.userPermission.deleteMany({
      where: { userId: parseInt(id) }
    })

    // Add new permissions
    if (permissions && Array.isArray(permissions)) {
      for (const permissionId of permissions) {
        await prisma.userPermission.create({
          data: {
            userId: parseInt(id),
            permissionId,
            granted: true
          }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating staff:', error)
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 })
  }
}

// DELETE: Deactivate staff user (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authorize('MANAGE_STAFF')
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  try {
    // Note: Implement soft delete by setting a deleted_at flag if you want to preserve records
    // For now, we'll just remove permissions
    await prisma.userPermission.deleteMany({
      where: { userId: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deactivating staff:', error)
    return NextResponse.json({ error: 'Failed to deactivate staff' }, { status: 500 })
  }
}
