import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

/**
 * GET /api/suppliers/[id]
 * Fetch a specific supplier
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authorize()
    if (auth instanceof NextResponse) return auth

    const { id } = await params

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid supplier ID' },
        { status: 400 }
      )
    }

    const supplierId = Number(id)
    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: 'Supplier ID must be a valid number' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId }
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(supplier, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/suppliers/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/suppliers/[id]
 * Update a supplier
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await authorize('MANAGE_SUPPLIERS')
    if (auth instanceof NextResponse) return auth

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid supplier ID' },
        { status: 400 }
      )
    }

    const supplierId = Number(id)
    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: 'Supplier ID must be a valid number' },
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

    // Validate update data
    const updateData: any = {}

    if ('name' in body) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Supplier name must be a non-empty string' },
          { status: 400 }
        )
      }
      updateData.name = body.name.trim()
    }

    if ('contact' in body) {
      updateData.contact = body.contact ? String(body.contact).trim() : null
    }

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: supplierId }
    })

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Update supplier
    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: updateData
    })

    return NextResponse.json(supplier, { status: 200 })
  } catch (error: any) {
    console.error('PUT /api/suppliers/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/suppliers/[id]
 * Delete a supplier
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await authorize('MANAGE_SUPPLIERS')
    if (auth instanceof NextResponse) return auth

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid supplier ID' },
        { status: 400 }
      )
    }

    const supplierId = Number(id)
    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: 'Supplier ID must be a valid number' },
        { status: 400 }
      )
    }

    // Check if supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId }
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Delete supplier
    await prisma.supplier.delete({
      where: { id: supplierId }
    })

    return NextResponse.json(
      { ok: true, message: 'Supplier deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('DELETE /api/suppliers/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    )
  }
}
